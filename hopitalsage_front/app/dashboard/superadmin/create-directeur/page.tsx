'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import SidebarAdmin from '@/components/SidebarAdmin';
import HeaderAdmin from '@/components/HeaderAdmin';
import { motion } from 'framer-motion'; // Pour les animations

interface Directeur {
  username: string;
  email: string;
  password1: string; // Mot de passe principal
  password2: string; // Confirmation du mot de passe
  ecoleId: number; // ID de l'école associée
}

const AjouterDirecteur = () => {
  const [directeur, setDirecteur] = useState<Directeur>({
    username: '',
    email: '',
    password1: '',
    password2: '',
    ecoleId: 0, // Par défaut, aucune école sélectionnée
  });

  const [ecoles, setEcoles] = useState<any[]>([]); // Liste des écoles
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<any>({}); // Gérer les erreurs renvoyées par le backend

  useEffect(() => {
    const fetchEcoles = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.error('Pas de token trouvé !');
        return;
      }

      try {
        const response = await axios.get('https://ecole-1-26o4.onrender.com/api/dashboard/admin/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('Données reçues depuis l\'API :', response.data);

        if (response.data && Array.isArray(response.data.ecoles)) {
          setEcoles(response.data.ecoles);
        } else {
          console.error('La réponse API ne contient pas de données valides pour les écoles.');
          setEcoles([]);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des écoles :', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEcoles();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#007BFF]"
        ></motion.div>
      </div>
    );
  }

  if (!Array.isArray(ecoles)) {
    console.error('Les données des écoles ne sont pas un tableau valide.');
    return <p>Une erreur est survenue lors du chargement des écoles.</p>;
  }

  if (ecoles.length === 0) {
    return <p>Aucune école disponible pour créer un directeur.</p>;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDirecteur({ ...directeur, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({}); // Réinitialise les erreurs avant l'envoi

    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.error('Pas de token trouvé !');
      return;
    }

    try {
      const response = await axios.post(
        'https://ecole-1-26o4.onrender.com/api/directeur/create/',
        {
          username: directeur.username,
          email: directeur.email,
          password1: directeur.password1,
          password2: directeur.password2,
          ecole_id: directeur.ecoleId, // Envoyer 'ecole_id' au lieu de 'ecole'
          role: 'directeur',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert('Directeur créé avec succès !');
      console.log(response.data);
    } catch (error: any) {
      if (error.response && error.response.data) {
        console.error('Réponse d\'erreur du backend :', error.response.data);
        setErrors(error.response.data); // Affichez les erreurs renvoyées par le backend
        alert('Erreur de validation : Vérifiez vos données.');
      } else {
        console.error('Erreur réseau ou autre :', error.message);
        alert('Une erreur est survenue lors de la création.');
      }
    }
  };

  return (
    <div className="flex flex-col sm:flex-row min-h-screen bg-gray-100 dark:bg-zinc-950">
      {/* Sidebar */}
      <SidebarAdmin userRole="superuser" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <HeaderAdmin
          userFullName="Super Admin"
          profilePictureUrl="/profile.jpg"
          role="Superuser"
        />

        {/* Contenu Principal */}
        <main className="p-4 sm:p-6 space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-center text-[#007BFF] mb-6"
          >
            Ajouter un Directeur
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6 max-w-4xl mx-auto"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Champ Nom d'utilisateur */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom d'utilisateur :</label>
                <input
                  type="text"
                  name="username"
                  value={directeur.username}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                    errors.username ? 'border-red-500' : ''
                  }`}
                  required
                />
                {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
              </div>

              {/* Champ Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email :</label>
                <input
                  type="email"
                  name="email"
                  value={directeur.email}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                    errors.email ? 'border-red-500' : ''
                  }`}
                  required
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
              </div>

              {/* Champ Mot de Passe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mot de passe :</label>
                <input
                  type="password"
                  name="password1"
                  value={directeur.password1}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                    errors.password1 ? 'border-red-500' : ''
                  }`}
                  required
                />
                {errors.password1 && <p className="text-red-500 text-sm">{errors.password1}</p>}
              </div>

              {/* Champ Confirmation du Mot de Passe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirmez le mot de passe :</label>
                <input
                  type="password"
                  name="password2"
                  value={directeur.password2}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                    errors.password2 ? 'border-red-500' : ''
                  }`}
                  required
                />
                {errors.password2 && <p className="text-red-500 text-sm">{errors.password2}</p>}
              </div>

              {/* Champ École */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">École :</label>
                <select
                  name="ecoleId"
                  value={directeur.ecoleId}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                    errors.ecole_id ? 'border-red-500' : ''
                  }`}
                  required
                >
                  <option value="" disabled hidden>
                    Sélectionnez une école
                  </option>
                  {ecoles.map((ecole) => (
                    <option key={ecole.id} value={ecole.id}>
                      {ecole.nom || 'Nom manquant'}
                    </option>
                  ))}
                </select>
                {errors.ecole_id && <p className="text-red-500 text-sm">{errors.ecole_id}</p>}
              </div>

              {/* Bouton Soumettre */}
              <div className="text-center">
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Ajouter Directeur
                </button>
              </div>
            </form>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AjouterDirecteur;