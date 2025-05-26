'use client';

import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import SidebarComptable from '@/components/SidebarComptable';
import HeaderComptable from '@/components/HeaderComptable';

type Mouvement = {
  id: number;
  type_mouvement: string;
  montant: string;
  date: string;
  description: string;
};
interface Ecole {
  id: number;
  nom: string;
  adresse: string;
  telephone: string | null;
}
export default function HistoriqueMouvementsPage() {
  const [mouvements, setMouvements] = useState<Mouvement[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [ecole, setEcole] = useState<Ecole | null>(null);
  const [user, setUser] = useState<any>(null);
  

  const fetchMouvements = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.error('Aucun token trouvé');
        setMouvements([]);
        return;
      }

      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const res = await fetch(`http://localhost:8000/api/historique-mouvements/?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.error('Erreur HTTP', res.status);
        const errorData = await res.json();
        console.error('Détail:', errorData);
        setMouvements([]);
        return;
      }

      const data = await res.json();

      if (Array.isArray(data)) {
        setMouvements(data);
      } else {
        console.warn('Données inattendues:', data);
        setMouvements([]);
      }

    } catch (error) {
      console.error('Erreur de chargement des mouvements:', error);
      setMouvements([]);
    }
  };

  useEffect(() => {
    fetchMouvements();
  }, []);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <SidebarComptable />

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <HeaderComptable  ecole={ecole} user={user} />

        <main className="p-6 overflow-auto">
          <h1 className="text-2xl font-bold mb-4">Historique des mouvements financiers</h1>

          {/* Filtres de date */}
          <div className="flex items-end gap-4 mb-6">
            <div>
              <label className="text-sm font-medium">Date de début</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Date de fin</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <Button onClick={fetchMouvements}>Rechercher</Button>
          </div>

          {/* Tableau des mouvements */}
          <Card>
            <CardContent className="overflow-x-auto p-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">Type</th>
                    <th className="py-2 px-3">Montant</th>
                    <th className="py-2 px-3">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {mouvements.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-4 text-gray-500">
                        Aucun mouvement trouvé
                      </td>
                    </tr>
                  ) : (
                    mouvements.map((mouvement) => (
                      <tr key={mouvement.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-3">{format(new Date(mouvement.date), 'dd/MM/yyyy')}</td>
                        <td className="py-2 px-3">{mouvement.type_mouvement}</td>
                        <td className="py-2 px-3">{mouvement.montant} FCFA</td>
                        <td className="py-2 px-3">{mouvement.description}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
