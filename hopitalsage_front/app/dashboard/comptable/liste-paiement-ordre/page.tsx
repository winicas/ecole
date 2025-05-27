
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SidebarComptable from '@/components/SidebarComptable';
import HeaderComptable from '@/components/HeaderComptable';


interface Ecole {
  id: number;
  nom: string;
  adresse: string;
  telephone: string | null;
}

 

  const [ecole, setEcole] = useState<Ecole | null>(null);
  const [user, setUser] = useState<any>(null);



const options = [
  { value: 'maternelle', label: 'Maternelle' },
  { value: 'primaire', label: 'Primaire' },
  { value: 'education_de_base', label: 'Éducation de Base' },
  { value: 'pedagogie', label: 'Pédagogie' },
  { value: 'litteraire', label: 'Littéraire' },
  { value: 'commerciale_gestion', label: 'Commerciale et Gestion' },
  { value: 'humanite_sciences', label: 'Humanité Sciences' },
  { value: 'coupe_couture', label: 'Coupe et Couture' },
  { value: 'mecanique', label: 'Mécanique' },
  { value: 'hotellerie_restauration', label: 'Hôtellerie et Restauration' },
  { value: 'electricite', label: 'Électricité' },
  { value: 'electronique', label: 'Électronique' },
];

const classes = Array.from({ length: 8 }, (_, i) => ({
  value: `${i + 1}`,
  label: `${i + 1}`,
}));

export default function ListePaiementOrdrePage() {
  const [selectedOption, setSelectedOption] = useState('');
  const [selectedClasse, setSelectedClasse] = useState('');
  const [quota, setQuota] = useState('');
  const router = useRouter();

  const handleGeneratePDF = () => {
    if (!selectedOption || !selectedClasse || !quota) {
      alert('Veuillez remplir tous les champs.');
      return;
    }

    const query = new URLSearchParams({
      option: selectedOption,
      classe: selectedClasse,
      quota,
    }).toString();

    router.push(`/dashboard/comptable/liste-paiement-ordre/generate-pdf?${query}`);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SidebarComptable />
      <div className="flex-1 flex flex-col">
        <HeaderComptable ecole={ecole} user={user} />
        <main className="flex-1 p-6">
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
            <h1 className="text-2xl font-bold mb-6 text-center text-blue-700">
              Générer la liste des élèves en ordre de paiement
            </h1>

            <div className="space-y-4">
              <div>
                <label className="block font-medium mb-1">Option :</label>
                <select
                  value={selectedOption}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Sélectionnez une option --</option>
                  {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1">Classe :</label>
                <select
                  value={selectedClasse}
                  onChange={(e) => setSelectedClasse(e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Sélectionnez une classe --</option>
                  {classes.map((cls) => (
                    <option key={cls.value} value={cls.value}>
                      {cls.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1">Montant du quota (CDF) :</label>
                <input
                  type="number"
                  value={quota}
                  onChange={(e) => setQuota(e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Exemple : 3000"
                />
              </div>

              <div className="text-center mt-6">
                <button
                  onClick={handleGeneratePDF}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Générer le PDF
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
