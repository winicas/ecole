"use client";
import { useState } from "react";

export default function CreateAnneeScolaireForm() {
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");

  const handleSubmit = async () => {
    if (!dateDebut || !dateFin) return alert("Remplis toutes les dates");

    const token = localStorage.getItem("accessToken");

    const res = await fetch("${process.env.NEXT_PUBLIC_API_URL}/api/annees-scolaires/create/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ date_debut: dateDebut, date_fin: dateFin }),
    });

    if (!res.ok) {
      const err = await res.json();
      alert("Erreur : " + JSON.stringify(err));
    } else {
      alert("Année scolaire créée !");
      setDateDebut("");
      setDateFin("");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded shadow">
      <h2 className="text-xl font-bold text-blue-800 mb-4">Créer une année scolaire</h2>

      <label className="block mb-2 text-blue-700">Date de début</label>
      <input
        type="date"
        value={dateDebut}
        onChange={(e) => setDateDebut(e.target.value)}
        className="w-full p-2 border mb-4 rounded"
      />

      <label className="block mb-2 text-blue-700">Date de fin</label>
      <input
        type="date"
        value={dateFin}
        onChange={(e) => setDateFin(e.target.value)}
        className="w-full p-2 border mb-4 rounded"
      />

      <button
        onClick={handleSubmit}
        className="px-4 py-2 bg-blue-800 text-white rounded hover:bg-blue-900"
      >
        Créer
      </button>
    </div>
  );
}
