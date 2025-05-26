"use client";

import { useEffect, useState } from "react";

interface Eleve {
  id: number;
  nom: string;
  postnom: string;
  prenom: string;
}

interface AnneeScolaire {
  id: number;
  nom: string;
}

interface ModalInscriptionEleveProps {
  eleve: Eleve;
  onClose: () => void;
  refreshInscriptions: () => void;
}

const CLASSES = [
  { value: "8", label: "8" },
  { value: "7", label: "7" },
  { value: "6", label: "6" },
  { value: "5", label: "5" },
  { value: "4", label: "4" },
  { value: "3", label: "3" },
  { value: "2", label: "2" },
  { value: "1", label: "1" },
 
 
];
const OPTIONS = [
  { value: "maternelle", label: "Maternelle" },
  { value: "primaire", label: "Primaire" },
  { value: "education_de_base", label: "Éducation de Base" },
  { value: "pedagogie", label: "Pédagogie" },
  { value: "litteraire", label: "Littéraire" },
  { value: "commerciale_gestion", label: "Commerciale et Gestion" },
  { value: "sciences", label: "Sciences" },
  { value: "coupe_couture", label: "Coupe et Couture" },
  { value: "mecanique", label: "Mécanique" },
  { value: "hotellerie_restauration", label: "Hôtellerie et Restauration" },
  { value: "electricite", label: "Électricité" },
  { value: "electronique", label: "Électronique" },
];

const ModalInscriptionEleve = ({ eleve, onClose, refreshInscriptions }: ModalInscriptionEleveProps) => {
  const [annees, setAnnees] = useState<AnneeScolaire[]>([]);
  const [anneeId, setAnneeId] = useState<number | null>(null);
  const [classe, setClasse] = useState<string>("");
  const [option, setOption] = useState<string>("");
  const [montant, setMontant] = useState<string>("");

  useEffect(() => {
    const fetchAnnees = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch("http://localhost:8000/api/annees-scolaires/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setAnnees(data);
      } catch (err) {
        console.error("Erreur lors du chargement des années:", err);
      }
    };
    fetchAnnees();
  }, []);

  const handleSubmit = async () => {
    if (!anneeId || !classe || !option || !montant) {
      alert("Tous les champs sont requis !");
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("http://localhost:8000/api/inscriptions/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          eleve: eleve.id,
          annee_scolaire: anneeId,
          classe,
          option,
          montant_inscription: parseFloat(montant),
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        console.error("Erreur d'inscription:", error);
        alert("Erreur: " + JSON.stringify(error));
        return;
      }

      alert("Inscription réussie !");
      refreshInscriptions();
      onClose();
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      alert("Erreur lors de l'inscription !");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-blue-800">
          Inscription de {eleve.nom} {eleve.postnom} {eleve.prenom}
        </h2>

        <label className="block mb-2 text-sm text-blue-800">Année scolaire</label>
        <select
          value={anneeId || ""}
          onChange={(e) => setAnneeId(Number(e.target.value))}
          className="w-full mb-4 p-2 border rounded"
        >
          <option value="">Sélectionner une année</option>
          {annees.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nom}
            </option>
          ))}
        </select>

        <label className="block mb-2 text-sm text-blue-800">Montant de l'inscription</label>
        <input
          type="number"
          value={montant}
          onChange={(e) => setMontant(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
          placeholder="Ex: 50000"
        />

        <label className="block mb-2 text-sm text-blue-800">Classe</label>
        <select
          value={classe}
          onChange={(e) => setClasse(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
        >
          <option value="">Sélectionner une classe</option>
          {CLASSES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>

        <label className="block mb-2 text-sm text-blue-800">Option</label>
        <select
          value={option}
          onChange={(e) => setOption(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
        >
          <option value="">Sélectionner une option</option>
          {OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <div className="flex justify-end space-x-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500">
            Annuler
          </button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-blue-800 text-white rounded hover:bg-blue-900">
            Valider
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalInscriptionEleve;
