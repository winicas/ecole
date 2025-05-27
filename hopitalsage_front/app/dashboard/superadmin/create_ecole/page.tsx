'use client';

import { useState } from 'react';
import axios from 'axios';
import SidebarAdmin from '@/components/SidebarAdmin';
import HeaderAdmin from '@/components/HeaderAdmin';
import { motion } from 'framer-motion'; // Pour les animations

interface Ecole {
  id?: number;
  nom: string;
  adresse: string;
  email: string;
  telephone: string;
  logo?: File | null; // Gérer les fichiers (logo)
  ville: string;
}

const AjouterÉcole = ({ ecoleInitiale }: { ecoleInitiale?: Ecole }) => {
  const [ecole, setEcole] = useState<Ecole>({
    nom: ecoleInitiale?.nom || '',
    adresse: ecoleInitiale?.adresse || '',
    email: ecoleInitiale?.email || '',
    telephone: ecoleInitiale?.telephone || '',
    ville: ecoleInitiale?.ville || 'Kinshasa',
    logo: null,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    if (name === 'logo' && files) {
      setEcole({ ...ecole, logo: files[0] });
    } else {
      setEcole({ ...ecole, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('nom', ecole.nom);
    formData.append('adresse', ecole.adresse);
    formData.append('email', ecole.email);
    formData.append('telephone', ecole.telephone);
    formData.append('ville', ecole.ville);
    if (ecole.logo) {
      formData.append('logo', ecole.logo);
    }

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.error('Pas de token trouvé !');
        return;
      }

      let response;
      if (ecoleInitiale?.id) {
        // Mise à jour d'une école existante
        response = await axios.put(
          `http://localhost:8000/api/ecoles/${ecoleInitiale.id}/`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        // Création d'une nouvelle école
        response = await axios.post('http://localhost:8000/api/ecoles/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        });
      }

      alert('École sauvegardée avec succès !');
      console.log(response.data);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'école :', error);
      alert('Une erreur est survenue lors de la sauvegarde.');
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
            
          >
            {ecoleInitiale ? 'Modifier École' : 'Ajouter École'}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
         
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom :</label>
                <input
                  type="text"
                  name="nom"
                  value={ecole.nom}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Adresse :</label>
                <input
                  type="text"
                  name="adresse"
                  value={ecole.adresse}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email :</label>
                <input
                  type="email"
                  name="email"
                  value={ecole.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Téléphone :</label>
                <input
                  type="text"
                  name="telephone"
                  value={ecole.telephone}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Logo :</label>
                <input
                  type="file"
                  name="logo"
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ville :</label>
                <input
                  type="text"
                  name="ville"
                  value={ecole.ville}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div className="text-center">
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {ecoleInitiale ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AjouterÉcole;