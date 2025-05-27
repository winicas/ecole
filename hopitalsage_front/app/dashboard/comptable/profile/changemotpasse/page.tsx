"use client";

import { useState } from "react";
import axios from "axios";

export default function ChangerMotDePassePage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleSubmit = async (e: any) => {
  e.preventDefault();
  const token = localStorage.getItem("accessToken");

  try {
    await axios.post(
      "http://localhost:8000/api/me/change-password/",
      {
        current_password: currentPassword,
        new_password: newPassword,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    alert("Mot de passe modifié. Vous allez être déconnecté.");

    // ✅ Supprimer le token
    localStorage.removeItem("accessToken");

    // ✅ Rediriger vers la page de connexion
    window.location.href = "/login";
  } catch (error: any) {
    alert(error.response?.data?.error || "Erreur lors de la modification du mot de passe.");
  }
};


  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-4 p-4 bg-white rounded-xl shadow">
      <h2 className="text-2xl font-bold text-blue-800">Changer mot de passe</h2>

      <input
        type="password"
        placeholder="Mot de passe actuel"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        className="w-full p-2 border rounded"
      />
      <input
        type="password"
        placeholder="Nouveau mot de passe"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        className="w-full p-2 border rounded"
      />
      <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded">
        Mettre à jour
      </button>
    </form>
  );
}
