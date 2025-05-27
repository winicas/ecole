'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import SidebarComptable from '@/components/SidebarComptable';
import HeaderComptable from '@/components/HeaderComptable';
import { pdf } from '@react-pdf/renderer';
import RecuSalairePdf from '@/components/RecuSalairePdf';
import { generateQrDataUri } from '@/lib/qrcode';


interface Ecole {
  id: number;
  nom: string;
  adresse: string;
  telephone?: string;
}

interface Agent {
  id: number;
  nom_agent: string;
  postnom_agent: string;
  prenom_agent: string;
  matricule_agent: string;
  ecole_id?: number;
  ecole: number;
}

const PaiementAgent: React.FC = () => {
  const { id } = useParams();
  const router = useRouter();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [ecole, setEcole] = useState<Ecole | null>(null);
  const [loading, setLoading] = useState(true); 
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/api/agents/${id}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })
      .then((res) => {
        setAgent(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur lors du chargement de l'agent :", err.response?.data || err.message);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (agent?.ecole) {
      axios
        .get(`${process.env.NEXT_PUBLIC_API_URL}/api/ecoles/${agent.ecole}/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        })
        .then((res) => {
          setEcole(res.data);
        })
        .catch((err) => {
          console.error("Erreur lors du chargement de l'école :", err.response?.data || err.message);
        });
    }
  }, [agent]);

  const handlePaiement = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const montant = parseFloat(formData.get('montant') as string);
    const periode = formData.get('periode') as string;
    const motif = formData.get('motif') as string;

    if (isNaN(montant) || montant <= 0) {
      alert('Le montant doit être un nombre valide et supérieur à zéro.');
      return;
    }

    if (!periode.trim()) {
      alert('La période est obligatoire.');
      return;
    }

    if (!ecole?.id || !agent) {
      alert("Impossible de traiter le paiement. Informations manquantes.");
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(
        '${process.env.NEXT_PUBLIC_API_URL}/api/paiements-salaire/',
        {
          agent: id,
          montant_paye: montant,
          periode: periode,
          motif_paiement: motif,
          ecole: ecole.id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const datePaiement = new Date().toLocaleDateString();

      const qrData = `Paiement - ${agent.nom_agent} ${agent.postnom_agent} - ${montant} FC - ${periode}`;
      const qrCodeDataUrl = await generateQrDataUri(qrData);


  const blob = await pdf(
    <RecuSalairePdf
      agent={agent}
      ecole={ecole}
      montant={montant}
      periode={periode}
      motif={motif}
      datePaiement={datePaiement}
      qrCodeDataUrl={qrCodeDataUrl}
    />
  ).toBlob();

  const url = URL.createObjectURL(blob);
  window.open(url);

      router.push('/dashboard/comptable');
    } catch (error: any) {
      alert('Erreur lors du paiement.');
      console.error('Erreur lors du paiement :', error.response?.data || error.message);
    }
  };
  
  if (loading) {
    return <div className="p-10 text-center">Chargement en cours...</div>;
  }

  if (!agent) {
    return <div className="p-10 text-center text-red-600">Agent introuvable.</div>;
  }
  
  return (
    <div className="flex min-h-screen bg-gray-100">
      <SidebarComptable />

      <div className="flex flex-col flex-1">
        

        <main className="p-6">
          <div className="bg-white shadow-md rounded-lg p-6 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">
              Paiement pour {agent.nom_agent} {agent.postnom_agent}
            </h1>

            <form onSubmit={handlePaiement} className="space-y-4">
              <div>
                <label className="block font-medium">Montant payé</label>
                <input
                  type="number"
                  name="montant"
                  required
                  className="w-full border p-2 rounded"
                  placeholder="ex: 200000"
                />
              </div>
              <div>
                <label className="block font-medium">Période</label>
                <input
                  type="text"
                  name="periode"
                  required
                  className="w-full border p-2 rounded"
                  placeholder="ex: Mai 2025"
                />
              </div>
              <div>
                <label className="block font-medium">Motif (optionnel)</label>
                <input
                  type="text"
                  name="motif"
                  className="w-full border p-2 rounded"
                  placeholder="Paiement du mois"
                />
              </div>
              <div className="flex space-x-4 mt-4">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Confirmer Paiement
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="text-gray-600 hover:underline"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PaiementAgent;