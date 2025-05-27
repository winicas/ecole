// app/dashboard/comptable/create-paiement/page.tsx
"use client";

import { useState } from "react";
import PaiementModal from "@/components/PaiementModal"; // ton composant modal

interface Eleve {
  id: number;
  nom_elev: string;
  postnom_elev: string;
  prenom_elev: string;
  matricule_elev: string;
  option_elev: string;
  classe_elev: string;
}

export default function CreatePaiementPage() {
  const [selectedEleve, setSelectedEleve] = useState<Eleve | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const refreshEleves = () => {
    // logiques de rafraîchissement ici
  };

  const nomEcole = "Institut Lumière"; // Exemple

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold text-blue-800 mb-4">Créer un Paiement</h1>
      {/* Exemple de bouton pour déclencher la modale */}
      <button
        onClick={() => {
          setSelectedEleve({
            id: 1,
            nom_elev: "Doe",
            postnom_elev: "Jean",
            prenom_elev: "Pierre",
            matricule_elev: "MAT1234",
            option_elev: "Scientifique",
            classe_elev: "6ème",
          });
          setModalOpen(true);
        }}
        className="bg-blue-800 text-white px-4 py-2 rounded"
      >
        Ajouter Paiement
      </button>

      {modalOpen && selectedEleve && (
        <PaiementModal
          eleve={selectedEleve}
          onClose={() => setModalOpen(false)}
          refreshEleves={refreshEleves}
          nomEcole={nomEcole}
        />
      )}
    </div>
  );
}
