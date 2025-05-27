'use client';

import { useState, useEffect } from 'react';
import SidebarComptable from '@/components/SidebarComptable';
import HeaderComptable from '@/components/HeaderComptable';

interface Ecole {
  id: number;
  nom: string;
  adresse: string;
  telephone: string | null;
}

export default function AjouterAgentPage() {
  const [formData, setFormData] = useState({
    user: '', // L'utilisateur sélectionné
    nom_agent: '',
    postnom_agent: '',
    prenom_agent: '',
    sexe_agent: 'M',
    date_naissance_agent: '',
    fonction_agent: '',
    adresse_agent: '',
    salaire_total: '',
    telephone_agent1: '',
    telephone_agent2: '',
    cours_dispenser: '',
  });

  const [users, setUsers] = useState([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [ecole, setEcole] = useState<Ecole | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('http://localhost:8000/api/utilisateurs-ecole/', { // Assure-toi de créer cette API
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setUsers(data.users); // Liste des utilisateurs de l'écolee
      } else {
        console.error('Erreur lors du chargement des utilisateurs');
      }

      setLoading(false);
    };

    fetchUsers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch('http://localhost:8000/api/agents/ajouter/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      alert('Agent enregistré avec succès');
    } else {
      alert('Erreur lors de l’enregistrement');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SidebarComptable />
      <div className="flex flex-col flex-1">
        <HeaderComptable ecole={ecole} user={user}  />
        <main className="p-8">
          <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl p-8">
            <h2 className="text-2xl font-semibold mb-6 text-blue-700">Ajouter un nouvel agent</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <select
                name="user"
                onChange={handleChange}
                className="input"
                required
              >
                <option value="">Sélectionner un utilisateur</option>
                {loading ? (
                  <option>Chargement...</option>
                ) : (
                  users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.username}
                    </option>
                  ))
                )}
              </select>

              <input
                name="nom_agent"
                onChange={handleChange}
                placeholder="Nom"
                className="input"
                required
              />
              <input
                name="postnom_agent"
                onChange={handleChange}
                placeholder="Postnom"
                className="input"
                required
              />
              <input
                name="prenom_agent"
                onChange={handleChange}
                placeholder="Prénom"
                className="input"
                required
              />
              <select
                name="sexe_agent"
                onChange={handleChange}
                className="input"
              >
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </select>
              <input
                type="date"
                name="date_naissance_agent"
                onChange={handleChange}
                className="input"
                required
              />
              <input
                name="fonction_agent"
                onChange={handleChange}
                placeholder="Fonction"
                className="input"
                required
              />
              <input
                name="adresse_agent"
                onChange={handleChange}
                placeholder="Adresse"
                className="input"
                required
              />
              <input
                name="salaire_total"
                onChange={handleChange}
                placeholder="Salaire"
                type="number"
                className="input"
                required
              />
              <input
                name="telephone_agent1"
                onChange={handleChange}
                placeholder="Téléphone 1"
                className="input"
                required
              />
              <input
                name="telephone_agent2"
                onChange={handleChange}
                placeholder="Téléphone 2 (optionnel)"
                className="input"
              />
              <input
                name="cours_dispenser"
                onChange={handleChange}
                placeholder="Cours dispensés (optionnel)"
                className="input"
              />
              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-xl transition"
                >
                  Ajouter l'agent
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
