// pages/dashboard/comptable/affiche-eleve-detail.tsx
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import SidebarComptable from '@/components/SidebarComptable';
import HeaderComptable from '@/components/HeaderComptable';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'sonner';

interface Eleve {
  id: number;
  nom_elev: string;
  postnom_elev: string;
  prenom_elev: string;
  classe_elev: string;
  option_elev: string;
  matricule_elev: string;
}

interface Props {
  searchParams: { matricule: string }; // Paramètre de recherche (matricule)
}

export default function AfficheEleveDetailPage({ searchParams }: Props) {
  const [eleve, setEleve] = useState<Eleve | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchEleveDetails = async () => {
      try {
        const response = await axios.get(`/api/eleve/${searchParams.matricule}/`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        });
        setEleve(response.data);
      } catch (error: any) {
        toast.error(error.response?.data.detail || 'Erreur lors de la récupération des détails de l\'élève.');
      } finally {
        setLoading(false);
      }
    };

    if (searchParams.matricule) {
      fetchEleveDetails();
    }
  }, [searchParams.matricule]);

  if (loading) {
    return <p>Chargement...</p>;
  }

  if (!eleve) {
    return <p>Aucun élève trouvé.</p>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-zinc-950 font-sans">
      <SidebarComptable />
      <div className="flex flex-col flex-1">
        <HeaderComptable ecole={{ id: 0, nom: "Nom École", adresse: "", telephone: "" }} user={user} />
        <Toaster richColors position="top-center" />

        <main className="flex items-center justify-center flex-1 p-8 m-4 bg-white dark:bg-zinc-800 rounded-3xl shadow-2xl overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="p-10 rounded-2xl w-full max-w-5xl"
          >
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 text-left">
              Détails de l'élève :
            </h2>
            <div className="space-y-2">
              <p>
                <strong>Matricule :</strong> {eleve.matricule_elev}
              </p>
              <p>
                <strong>Nom complet :</strong>{' '}
                {`${eleve.nom_elev} ${eleve.postnom_elev} ${eleve.prenom_elev}`}
              </p>
              <p>
                <strong>Classe :</strong> {eleve.classe_elev}
              </p>
              <p>
                <strong>Option :</strong> {eleve.option_elev}
              </p>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}