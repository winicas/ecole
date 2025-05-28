"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function MonProfilPage() {
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    profile_picture: null,
  });

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get("https://ecole-1-26o4.onrender.com/api/me/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
      setFormData({
        first_name: res.data.first_name,
        last_name: res.data.last_name,
        email: res.data.email,
        profile_picture: null,
      });
    };
    fetchUser();
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const token = localStorage.getItem("accessToken");
    const form = new FormData();
    form.append("first_name", formData.first_name);
    form.append("last_name", formData.last_name);
    form.append("email", formData.email);
    if (formData.profile_picture) {
      form.append("profile_picture", formData.profile_picture);
    }

    await axios.put("https://ecole-1-26o4.onrender.com/api/me/update/", form, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
    });

    alert("Profil mis à jour !");
  };

 return (
  <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-4 p-4 bg-white rounded-xl shadow">
    <h2 className="text-2xl font-bold text-blue-800">Mon profil</h2>

    <input
      type="text"
      value={formData.first_name}
      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
      placeholder="Prénom"
      className="w-full p-2 border rounded"
    />
    <input
      type="text"
      value={formData.last_name}
      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
      placeholder="Postnom"
      className="w-full p-2 border rounded"
    />
    <input
      type="email"
      value={formData.email}
      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      placeholder="Email"
      className="w-full p-2 border rounded"
    />
    <input
      type="file"
      onChange={(e) => setFormData({ ...formData, profile_picture: e.target.files?.[0] || null })}
      className="w-full p-2"
    />

    <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded">
      Mettre à jour
    </button>

    <button
      type="button"
      onClick={() => (window.location.href = "/dashboard/comptable/profile/changemotpasse")}
      className="px-6 py-2 bg-gray-500 text-white rounded"
    >
      Modifier le mot de passe
    </button>
  </form>
);
}