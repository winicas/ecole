'use client';

import { useEffect, useState } from 'react';
import SidebarAdmin from '@/components/SidebarAdmin';
import HeaderAdmin from '@/components/HeaderAdmin';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { motion } from 'framer-motion'; // Pour les animations

interface School {
  id: number;
  nom: string;
  adresse: string;
  telephone: string;
  email: string;
  date_creation: string;
  ville: string;
  logo?: string;
}

const AdminDashboard = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ fullName: string; profilePictureUrl?: string; role: string } | null>(
    null
  );

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser({
        fullName: `${parsedUser.first_name} ${parsedUser.last_name}`,
        profilePictureUrl: parsedUser.profile_picture,
        role: parsedUser.role,
      });
    }

    const fetchSchools = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        console.error('Pas de token trouvé !');
        return;
      }

      try {
        const response = await fetch('http://localhost:8000/api/dashboard/admin/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (response.status === 401) {
          console.error('Non autorisé : token invalide ou expiré');
        }

        const data = await response.json();
        
        console.log(data); // ← Ajoute ceci
        setSchools(data.ecoles);
        
      } catch (error) {
        console.error('Erreur de chargement des données :', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchools();
  }, []);

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}

        ></motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row min-h-screen bg-gray-100 dark:bg-zinc-950">
      {/* Sidebar */}
      <SidebarAdmin userRole={user.role} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <HeaderAdmin
          userFullName={user.fullName}
          profilePictureUrl={user.profilePictureUrl}
          role={user.role}
        />

        {/* Contenu Principal */}
        <main className="p-4 sm:p-6 space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            
          >
            Tableau de Bord Admin
          </motion.h1>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
           
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              
            >
              <h5 className="card-title text-xl font-bold text-[#007BFF]">Ajouter École</h5>
              <p className="card-text text-gray-600 dark:text-gray-300">
                Ajoutez une nouvelle école à votre système.
              </p>
              <a
                href="/dashboard/superadmin/create_ecole"
                className="btn btn-primary block mt-4 py-2 px-4 rounded-md bg-[#007BFF] text-white hover:bg-[#0056b3] transition-colors"
              >
                Ajouter École
              </a>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              
            >
              <h5 className="card-title text-xl font-bold text-[#28A745]">Ajouter Paiement</h5>
              <p className="card-text text-gray-600 dark:text-gray-300">
                Enregistrez un nouveau paiement.
              </p>
              <a
                href="/admin/ajouter-paiement"
                className="btn btn-success block mt-4 py-2 px-4 rounded-md bg-[#28A745] text-white hover:bg-[#1e7e34] transition-colors"
              >
                Ajouter Paiement
              </a>
            </motion.div>
          </motion.div>

          {/* List of Schools */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
           
          >
            <h2 className="text-2xl font-bold text-[#007BFF] mb-4">Liste des Écoles Enregistrées</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Logo</TableHead>
                  <TableHead>Nom de l'école</TableHead>
                  <TableHead>Adresse</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Date de Création</TableHead>
                  <TableHead>Ville</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schools.map((school) => (
                  <TableRow key={school.id}>
                    <TableCell>
                      {school.logo ? (
                        <img
                          src={school.logo}
                          alt={`Logo de ${school.nom}`}
                          width={50}
                          className="rounded-full"
                        />
                      ) : (
                        <span className="text-gray-400">Aucun logo</span>
                      )}
                    </TableCell>
                    <TableCell>{school.nom}</TableCell>
                    <TableCell>{school.adresse}</TableCell>
                    <TableCell>{school.telephone || 'Non renseigné'}</TableCell>
                    <TableCell>{school.email || 'Non renseigné'}</TableCell>
                    <TableCell>{school.date_creation}</TableCell>
                    <TableCell>{school.ville || 'Kinshasa'}</TableCell>
                    <TableCell>
                      <a
                        href={`/admin/modifier-ecole/${school.id}`}
                        className="btn btn-warning mr-2 py-1 px-2 rounded-md bg-[#FFC107] text-white hover:bg-[#e0a800] transition-colors"
                      >
                        Modifier
                      </a>
                      <button
                        onClick={() => confirm(`Êtes-vous sûr de vouloir supprimer cette école ?`)}
                        className="btn btn-danger py-1 px-2 rounded-md bg-[#DC3545] text-white hover:bg-[#bd2130] transition-colors"
                      >
                        Supprimer
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;