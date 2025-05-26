'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import SidebarComptable from '@/components/SidebarComptable';
import HeaderComptable from '@/components/HeaderComptable';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'sonner'; // Pour les toasts
import { Progress } from "@/components/ui/progress"; // Barre de progression

interface Ecole {
  id: number;
  nom: string;
  adresse: string;
  telephone: string | null;
}

interface EleveFormData {
  nom_elev: string;
  postnom_elev: string;
  prenom_elev: string;
  sexe: string;
  adresses: string;
  date_naissance_elev: string;
  lieu_naissance_elev: string; 
  option_elev: string;
  classe_elev: string;
  numero_parent1: string;
  numero_parent2?: string;
}

const CreateElevePage = () => {
  const [formData, setFormData] = useState<EleveFormData>({
    nom_elev: '',
    postnom_elev: '',
    prenom_elev: '',
    sexe: '',
    adresses: '',
    date_naissance_elev: '',
    lieu_naissance_elev: '', 
    option_elev: 'maternelle',
    classe_elev: '1',
    numero_parent1: '',
  });

  const [ecole, setEcole] = useState<Ecole | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchEcole = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      try {
        const response = await axios.get('https://ecole-h4ja.onrender.com/api/dashboard/comptable/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEcole(response.data.ecole);
      } catch (error) {
        console.error('Erreur lors de la récupération de l’école:', error);
      }
    };
    fetchEcole();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setProgress(30);
  
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('Token manquant');
  
      const response = await axios.post(
        'https://ecole-h4ja.onrender.com/api/comptable/create-eleve/',
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      setProgress(70);
  
      if (response.status === 201) {
        toast.success("Élève ajouté avec succès !");
        setFormData({
          nom_elev: '',
          postnom_elev: '',
          prenom_elev: '',
          sexe: '',
          adresses: '',
          date_naissance_elev: '',
          lieu_naissance_elev: '', 
          option_elev: 'maternelle',
          classe_elev: '1',
          numero_parent1: '',
        });
      }
    } catch (err: any) {
    console.error('Erreur complète:', err.response?.data); // Affiche tout l'objet d'erreur du backend
    if (err.response?.data) {
      const errorData = err.response.data;

      // S'il s'agit d'un objet avec des erreurs par champ (souvent le cas avec DRF)
      if (typeof errorData === 'object') {
        const messages = Object.entries(errorData)
          .map(([field, errors]) => `${field}: ${(errors as string[]).join(', ')}`)
          .join(' | ');
        toast.error(messages);
      } else {
        toast.error(errorData.detail || 'Une erreur est survenue.');
      }
    } else {
      toast.error('Une erreur est survenue.');
    }
  }

  };
  

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-zinc-950 font-sans">
      <SidebarComptable userFullName="Comptable" />
      <div className="flex flex-col flex-1">
        <HeaderComptable ecole={ecole ?? { id: 0, nom: 'Chargement...', adresse: '', telephone: '' }} />
        <Toaster richColors position="top-center" />

        {loading && <Progress value={progress} className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />}

        <main className="flex items-center justify-center flex-1 p-8 m-4 bg-white dark:bg-zinc-800 rounded-3xl shadow-2xl overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="p-10 rounded-2xl w-full max-w-5xl"
          >
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 text-left">
              Ajouter un nouvel élève
            </h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Champ Nom */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom :</label>
                <input
                  type="text"
                  name="nom_elev"
                  value={formData.nom_elev}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-lg bg-gray-100 dark:bg-zinc-700 text-gray-900 dark:text-white p-2.5"
                />
              </div>

              {/* Champ Postnom */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Postnom :</label>
                <input
                  type="text"
                  name="postnom_elev"
                  value={formData.postnom_elev}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-lg bg-gray-100 dark:bg-zinc-700 text-gray-900 dark:text-white p-2.5"
                />
              </div>

              {/* Champ Prénom */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Prénom :</label>
                <input
                  type="text"
                  name="prenom_elev"
                  value={formData.prenom_elev}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-lg bg-gray-100 dark:bg-zinc-700 text-gray-900 dark:text-white p-2.5"
                />
              </div>
              {/* Champ sexe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sexe :</label>
                <select
                  name="sexe"
                  value={formData.sexe}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-lg bg-gray-100 dark:bg-zinc-700 text-gray-900 dark:text-white p-2.5"
                >
                  <option value="M">SELECTION</option>
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                </select>
              </div>
             
              {/* Champ adresse */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Adresse :</label>
                <input
                  type="text"
                  name="adresses"
                  value={formData.adresses}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-lg bg-gray-100 dark:bg-zinc-700 text-gray-900 dark:text-white p-2.5"
                />
              </div>

              {/* Champ Date de naissance */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date de naissance :</label>
                <input
                  type="date"
                  name="date_naissance_elev"
                  value={formData.date_naissance_elev}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-lg bg-gray-100 dark:bg-zinc-700 text-gray-900 dark:text-white p-2.5"
                />
              </div>
                {/* lieu de naissance*/}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Lieu de Naissance :</label>
                <input
                  type="text"
                  name="lieu_naissance_elev"
                  value={formData.lieu_naissance_elev}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-lg bg-gray-100 dark:bg-zinc-700 text-gray-900 dark:text-white p-2.5"
                />
              </div>
              {/* Champ Option */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Option :</label>
                <select
                  name="option_elev"
                  value={formData.option_elev}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-lg bg-gray-100 dark:bg-zinc-700 text-gray-900 dark:text-white p-2.5"
                >
                    <optgroup label="Base">
                    <option value="maternelle">Maternelle</option>
                    <option value="primaire">Primaire</option>
                    <option value="education_de_base">Éducation de Base</option>
                    </optgroup>
                    <optgroup label="Humanités">
                        <option value="pedagogie">Pédagogie</option>
                        <option value="litteraire">Littéraire</option>
                        <option value="commerciale_gestion">Commerciale et Gestion</option>
                        <option value="sciences">Sciences</option>
                        <option value="coupe_couture">Coupe et Couture</option>
                        <option value="mecanique">Mécanique</option>
                        <option value="hotellerie_restauration">Hôtellerie et Restauration</option>
                    </optgroup>
                    
                    <optgroup label="Techniques">
                        <option value="electronique">Électronique</option>
                        <option value="electricite">Électricité</option>
                        <option value="mecanique">Mécanique</option>
                    </optgroup>

                </select>
              </div>

              {/* Champ Classe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Classe :</label>
                <select
                  name="classe_elev"
                  value={formData.classe_elev}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-lg bg-gray-100 dark:bg-zinc-700 text-gray-900 dark:text-white p-2.5"
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                  <option value="6">6</option>
                  <option value="7">7</option>
                  <option value="8">8</option>
                </select>
              </div>

              {/* Champ Numéro parent 1 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Téléphone parent 1 :</label>
                <input
                  type="text"
                  name="numero_parent1"
                  value={formData.numero_parent1}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-lg bg-gray-100 dark:bg-zinc-700 text-gray-900 dark:text-white p-2.5"
                />
              </div>

              {/* Champ Numéro parent 2 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Téléphone parent 2 :</label>
                <input
                  type="text"
                  name="numero_parent2"
                  value={formData.numero_parent2 || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg bg-gray-100 dark:bg-zinc-700 text-gray-900 dark:text-white p-2.5"
                />
              </div>
            </form>

            {/* Bouton Soumettre */}
            <div className="mt-8 text-center">
              <button
                onClick={handleSubmit}
                className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-bold py-2 px-6 rounded-full transition ease-in-out duration-300"
              >
                Ajouter l'élève
              </button>
            </div>

          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default CreateElevePage;
