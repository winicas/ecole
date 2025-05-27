'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import HeaderComptable from '@/components/HeaderComptable';
import SidebarComptable from '@/components/SidebarComptable';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';
import { Download } from 'lucide-react';

interface Paiement {
  id: number;
  eleve: number;
  nom: string;
  postnom: string;
  prenom: string;
  matricule: string;
  montant_payer: string;
  date: string;
  motif_paiement: string;
  classe: string;
  option: string;
  ecole: string; // 👈 ajouté
}

interface Ecole {
  id: number;
  nom: string;
  adresse: string;
  telephone: string | null;
}

const ListePaiementsDeuxJours = () => {
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [modifications, setModifications] = useState<Record<number, Partial<Paiement>>>({});
 const [ecole, setEcole] = useState<Ecole | null>(null);
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    const fetchPaiements = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      try {
        const response = await fetch('http://localhost:8000/api/paiements-hier-aujourdhui/', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Erreur API');
        const data = await response.json();
        setPaiements(data);
      } catch (err) {
        console.error('Erreur chargement paiements:', err);
        toast.error('Impossible de charger les paiements.');
      }
    };

    fetchPaiements();
  }, []);

  const handleChange = (id: number, field: keyof Paiement, value: string) => {
    setModifications((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleUpdate = async (id: number) => {
  const dataToSend = modifications[id];
  const token = localStorage.getItem('accessToken');
  if (!dataToSend || !token) return;

  const confirm = window.confirm('Voulez-vous vraiment modifier ce paiement ?');
  if (!confirm) return; // Annule si l'utilisateur clique sur "Annuler"

  try {
    const response = await fetch(`http://localhost:8000/api/paiement/${id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dataToSend),
    });

    if (!response.ok) throw new Error('Erreur lors de la mise à jour');

    setPaiements((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...dataToSend } : p))
    );

    setModifications((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });

    toast.success('✅ Modification effectuée avec succès !');
  } catch (err) {
    console.error('Erreur mise à jour:', err);
    toast.error('❌ Erreur lors de la mise à jour du paiement.');
  }
};


  const generateReceiptPDF = async (
    eleve: {
      nom: string;
      postnom: string;
      prenom: string;
      matricule: string;
      classe: string;
      option: string;
    },
    paiement: {
      receipt_number: string;
      montant: string;
      total: number;
      reste: number;
      motif: string;
      date: string;
    },
    nomEcole: string
  ) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [80, 150] });
    const qrData = await QRCode.toDataURL(`Reçu n° ${paiement.receipt_number}`);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(nomEcole.toUpperCase(), 40, 10, { align: 'center' });

    doc.setFontSize(10);
    doc.text(`REÇU DE FRAIS SCOLAIRE N° ${paiement.receipt_number}`, 40, 16, { align: 'center' });

    doc.setLineWidth(0.3);
    doc.line(5, 19, 75, 19);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    let y = 25;
    doc.text(`Nom de l'élève : ${eleve.nom} ${eleve.postnom} ${eleve.prenom}`, 5, y);
    y += 6;
    doc.text(`Matricule      : ${eleve.matricule}`, 5, y);
    y += 5;
    doc.text(`Option         : ${eleve.option}`, 5, y);
    y += 5;
    doc.text(`Classe         : ${eleve.classe}`, 5, y);
    y += 1;
    doc.setLineDashPattern([1, 1], 0);
    doc.line(5, y, 75, y);
    y += 5;

    const labelX = 5;
    const valueX = 48;

    doc.text('Montant payé ce jour ', labelX, y);
    doc.text(`${paiement.montant} $`, valueX, y);
    y += 5;

    doc.text('Montant total payé   ', labelX, y);
    doc.text(`${paiement.total - paiement.reste} $`, valueX, y);
    y += 5;

    doc.text('Montant restant      ', labelX, y);
    doc.text(`${paiement.reste} $`, valueX, y);
    y += 5;

    doc.text('Montant total à payer', labelX, y);
    doc.text(`${paiement.total} $`, valueX, y);
    y += 1;
    doc.line(5, y, 75, y);
    y += 5;

    doc.setFont('helvetica', 'italic');
    doc.text(`Date: ${paiement.date}`, 5, y);
    y += 5;

    if (qrData) {
      doc.addImage(qrData, 'PNG', 25, y, 30, 30);
      y += 35;
    }

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Merci pour votre paiement', 40, y, { align: 'center' });

    doc.save(`Recu_${eleve.nom}_${paiement.receipt_number}.pdf`);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const dateNow = new Date().toLocaleDateString('fr-FR');
    doc.text("Reçus des paiements (Hier et Aujourd'hui)", 14, 16);

    const tableData = paiements.map((p) => [
      `${p.nom} ${p.postnom} ${p.prenom}`,
      p.matricule,
      `${Number(p.montant_payer).toLocaleString()} FC`,
      p.motif_paiement,
      p.date,
    ]);

    autoTable(doc, {
      head: [['Élève', 'Matricule', 'Montant payé', 'Motif', 'Date']],
      body: tableData,
      startY: 20,
    });

    doc.save(`reçus_paiements_${dateNow.replace(/\//g, '-')}.pdf`);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SidebarComptable />
      <div className="flex-1">
      <HeaderComptable ecole={ecole} user={user} />
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">📋 Paiements des deux derniers jours</h1>
            <Button onClick={handleDownloadPDF} className="flex items-center gap-2">
              <Download className="w-4 h-4" /> Télécharger PDF
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {paiements.map((paiement) => (
              <Card key={paiement.id} className="shadow-lg bg-white rounded-xl">
                <CardContent className="space-y-3 p-4">
                  <div className="font-semibold text-lg text-gray-800">
                    👤 {paiement.nom} {paiement.postnom} {paiement.prenom}
                  </div>
                  <div className="text-sm text-gray-600">🎓 Matricule : {paiement.matricule}</div>
                  <div className="text-sm text-gray-500">📅 Date : {paiement.date}</div>

                  <Input
                    type="text"
                    value={modifications[paiement.id]?.montant_payer ?? paiement.montant_payer}
                    onChange={(e) => handleChange(paiement.id, 'montant_payer', e.target.value)}
                    placeholder="Montant payé"
                  />

                  <Input
                    type="text"
                    value={modifications[paiement.id]?.motif_paiement ?? paiement.motif_paiement}
                    onChange={(e) => handleChange(paiement.id, 'motif_paiement', e.target.value)}
                    placeholder="Motif"
                  />

                  <div className="flex gap-2">
                    <Button onClick={() => handleUpdate(paiement.id)}>💾 Enregistrer</Button>
                   <Button
                        variant="outline"
                        onClick={() =>
                            generateReceiptPDF(
                            {
                                nom: paiement.nom,
                                postnom: paiement.postnom,
                                prenom: paiement.prenom,
                                matricule: paiement.matricule,
                                classe: paiement.classe || 'Non défini',
                                option: paiement.option || 'Non défini',
                            },
                            {
                                receipt_number: `P-${paiement.id}`,
                                montant: paiement.montant_payer,
                                total: 100, // ← mets le vrai total si tu l’as
                                reste: 0,   // ← idem pour le reste
                                motif: paiement.motif_paiement,
                                date: paiement.date,
                            },
                            paiement.ecole // 👈 ici
                            )
                        }
                        >
                        📄 Reçu
                        </Button>

                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {paiements.length === 0 && (
            <div className="text-center text-gray-500 mt-10">
              Aucun paiement trouvé pour hier et aujourd'hui.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListePaiementsDeuxJours;
