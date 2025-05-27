// DirecteurDashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import SidebarDirecteur from '@/components/SidebarDirecteur';
import HeaderComptable from '@/components/HeaderComptable';
import { motion } from 'framer-motion';

interface Option {
  option_elev: string;
  total: number;
}

interface DashboardData {
  message?: string;
  nombre_ecoles: number;
  nombre_etudiants: number;
  nombre_agents: number;
  options: Option[];
}
interface Ecole {
  id: number;
  nom: string;
  adresse: string;
  telephone: string | null;
}

const DirecteurDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [ecole, setEcole] = useState<Ecole | null>(null);
    const [user, setUser] = useState<any>(null);
  

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('Veuillez vous connecter.');
        return;
      }

      try {
        const response = await axios.get('http://localhost:8000/api/dashboard/directeur/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(response.data);
      } catch (error: any) {
        const detail = error.response?.data?.detail || '';
        const message = error.response?.data?.message || '';

        if (error.response?.status === 403 && detail.includes("accès")) {
          alert('Accès refusé : Vous devez être un directeur.');
        } else if (message.includes("Aucune école")) {
          alert('Aucune école associée. Veuillez contacter l\'administrateur.');
        } else {
          alert('Une erreur est survenue.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-zinc-950">
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
        />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-zinc-950">
        <p className="text-red-500 font-medium">Une erreur est survenue lors du chargement des données.</p>
      </div>
    );
  }

  if (data.message === "Aucune école associée à ce directeur.") {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-zinc-950">
        <p className="text-xl font-semibold text-red-500">{data.message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row min-h-screen bg-gray-100 dark:bg-zinc-950">
      <SidebarDirecteur  />

      <div className="flex-1 flex flex-col">
      <HeaderComptable ecole={ecole} user={user} />

        <main className="p-4 sm:p-6 space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-2xl sm:text-3xl font-bold text-center text-blue-600"
          >
            Tableau de Bord - Directeur
          </motion.h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: "Nombre d'Écoles", value: data.nombre_ecoles },
              { label: "Nombre d'Élèves", value: data.nombre_etudiants },
              { label: "Nombre d'Agents", value: data.nombre_agents },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                className="bg-white dark:bg-zinc-800 rounded-2xl shadow p-5"
              >
                <h5 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                  {item.label}
                </h5>
                <p className="text-3xl font-bold text-blue-500 mt-2">{item.value}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-zinc-800 rounded-2xl shadow p-6"
          >
            <h5 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Répartition des Élèves par Option
            </h5>

            {data.options.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-300 dark:border-zinc-600">
                      <th className="px-4 py-2 font-medium text-gray-700 dark:text-gray-300">Option</th>
                      <th className="px-4 py-2 font-medium text-gray-700 dark:text-gray-300">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.options.map((option) => (
                      <tr key={option.option_elev} className="border-t border-gray-100 dark:border-zinc-700">
                        <td className="px-4 py-2 text-gray-800 dark:text-gray-100">{option.option_elev}</td>
                        <td className="px-4 py-2 text-blue-600 font-semibold">{option.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">Aucune donnée disponible.</p>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default DirecteurDashboard;
