"use client";

import { useState } from "react";
import { toast } from "sonner";

interface Eleve {
  id: number;
  nom_elev: string;
  postnom_elev: string;
  prenom_elev: string;
}

interface EditEleveModalProps {
  eleve: Eleve;
  onClose: () => void;
  refreshList: () => void;
}

const EditEleveModal = ({ eleve, onClose, refreshList }: EditEleveModalProps) => {
  const [form, setForm] = useState({ ...eleve });

  const handleUpdate = async () => {
    const token = localStorage.getItem("accessToken");
    try {
      const response = await fetch(`http://localhost:8000/api/eleves/${eleve.id}/identite/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nom_elev: form.nom_elev,
          postnom_elev: form.postnom_elev,
          prenom_elev: form.prenom_elev,
        }),
      });

      if (!response.ok) throw new Error("Erreur de mise à jour");

      toast.success("Identité de l'élève mise à jour !");
      refreshList();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Échec de la mise à jour !");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md space-y-4">
        <h2 className="text-xl font-bold text-blue-800">Modifier l'identité</h2>

        <input
          type="text"
          value={form.nom_elev}
          onChange={(e) => setForm({ ...form, nom_elev: e.target.value })}
          className="w-full p-2 border rounded"
          placeholder="Nom"
        />
        <input
          type="text"
          value={form.postnom_elev}
          onChange={(e) => setForm({ ...form, postnom_elev: e.target.value })}
          className="w-full p-2 border rounded"
          placeholder="Postnom"
        />
        <input
          type="text"
          value={form.prenom_elev}
          onChange={(e) => setForm({ ...form, prenom_elev: e.target.value })}
          className="w-full p-2 border rounded"
          placeholder="Prénom"
        />

        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-600">
            Annuler
          </button>
          <button onClick={handleUpdate} className="px-4 py-2 bg-blue-800 text-white rounded hover:bg-blue-900">
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditEleveModal;
