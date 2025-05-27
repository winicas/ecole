'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import SidebarComptable from '@/components/SidebarComptable';
import HeaderComptable from '@/components/HeaderComptable';

interface Agent {
  id: number;
  nom_agent: string;
  postnom_agent: string;
  prenom_agent: string;
  matricule_agent: string;
}


interface Ecole {
  id: number;
  nom: string;
  adresse: string;
  telephone: string | null;
}

const ListeAgents: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [user, setUser] = useState<any>(null);
  const [ecole, setEcole] = useState<Ecole | null>(null);

  useEffect(() => {
    axios
      .get('http://localhost:8000/api/agents/', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      })
      .then(res => setAgents(res.data))
      .catch(err => console.error("Erreur lors du chargement des agents :", err));
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SidebarComptable />

      <div className="flex flex-col flex-1">
         <HeaderComptable ecole={ecole} user={user}  />

        <main className="p-6">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h1 className="text-2xl font-semibold text-gray-700 mb-4">Liste des Enseignants</h1>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Nom</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Postnom</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Prénom</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Matricule</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {agents.map(agent => (
                    <tr key={agent.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{agent.nom_agent}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{agent.postnom_agent}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{agent.prenom_agent}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{agent.matricule_agent}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link href={`/dashboard/Agent/paie/${agent.id}`}>
                          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm">
                            Payer
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {agents.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-gray-500">
                        Aucun enseignant trouvé.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ListeAgents;
