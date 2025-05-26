"use client";

import { useState, useEffect } from "react";
import SidebarComptable from "@/components/SidebarComptable";
import HeaderComptable from "@/components/HeaderComptable";
import DropdownMenu from "@/components/DropdownMenu";
import PaiementModal from "@/components/PaiementModal";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface Eleve {
  id: number;
  nom_elev: string;
  postnom_elev: string;
  prenom_elev: string;
  option_elev: string;
  classe_elev: string;
  matricule_elev: string;
}

interface Ecole {
  id: number;
  nom: string;
  adresse: string;
  telephone: string | null;
}

export default function ComptableDashboard() {
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [ecole, setEcole] = useState<Ecole | null>(null);
  const [user, setUser] = useState<any>(null);


  const [selectedEleve, setSelectedEleve] = useState<Eleve | null>(null);
  const [isPaiementModalOpen, setIsPaiementModalOpen] = useState(false);

  useEffect(() => {
    const fetchEcole = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      try {
        const response = await axios.get("http://localhost:8000/api/dashboard/comptable/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEcole(response.data.ecole);
      } catch (error) {
        console.error(error);
      }
    };
    fetchEcole();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      try {
        const response = await axios.get("http://localhost:8000/api/me/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("USER RESPONSE:", response.data); 
        setUser(response.data);
      } catch (error) {
        console.error("Erreur récupération user :", error);
      }
    };
    fetchUser();
  }, []);
  

  useEffect(() => {
    fetchEleves(true);
  }, [searchTerm]);

  const fetchEleves = async (reset = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const currentPage = reset ? 1 : page;
      const response = await axios.get(`http://localhost:8000/api/eleves/`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { search: searchTerm, page: currentPage },
      });

      const newEleves = response.data.results;
      if (reset) {
        setEleves(newEleves);
        setPage(2);
      } else {
        setEleves((prev) => [...prev, ...newEleves]);
        setPage((prev) => prev + 1);
      }

      setHasMore(response.data.next !== null);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const openPaiementModal = (eleve: Eleve) => {
    setSelectedEleve(eleve);
    setIsPaiementModalOpen(true);
  };

  const closePaiementModal = () => {
    setSelectedEleve(null);
    setIsPaiementModalOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-zinc-950">
      <SidebarComptable userFullName="Comptable" />
      <div className="flex flex-col flex-1">
      <HeaderComptable ecole={ecole} user={user} />

        <main className="flex-1 p-6 space-y-6">
          <h2 className="text-3xl font-bold text-blue-800 dark:text-blue-400">
            Bienvenue, cher Comptable !
          </h2>

          <div className="flex justify-between items-center">
            <input
              type="text"
              placeholder="Rechercher par nom, postnom, prénom, matricule..."
              className="p-3 rounded-xl border w-full max-w-md dark:bg-zinc-700 dark:border-zinc-600 text-blue-800 dark:text-blue-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-lg mt-6">
            {loading && (
              <div className="flex justify-center items-center mb-4">
                <div className="w-8 h-8 border-4 border-blue-500 border-dotted rounded-full animate-spin"></div>
              </div>
            )}

            <table className="w-full text-left">
              <thead>
                <tr className="text-blue-800 dark:text-blue-400">
                  <th className="pb-3">Nom</th>
                  <th className="pb-3">Postnom</th>
                  <th className="pb-3">Prénom</th>
                  <th className="pb-3">Option</th>
                  <th className="pb-3">Classe</th>
                  <th className="pb-3">Matricule</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {!loading && eleves.length === 0 ? (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <td colSpan={7} className="text-center py-6 text-gray-500 dark:text-gray-400">
                        Aucun élève trouvé.
                      </td>
                    </motion.tr>
                  ) : (
                    eleves.map((eleve, index) => (
                      <motion.tr
                        key={eleve.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        className="border-t dark:border-zinc-700 text-blue-800 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-zinc-700 even:bg-gray-50 dark:even:bg-zinc-800/50 transition-colors"
                      >
                        <td className="py-2">{eleve.nom_elev}</td>
                        <td className="py-2">{eleve.postnom_elev}</td>
                        <td className="py-2">{eleve.prenom_elev}</td>
                        <td className="py-2">{eleve.option_elev}</td>
                        <td className="py-2">{eleve.classe_elev}</td>
                        <td className="py-2">{eleve.matricule_elev}</td>
                        <td className="py-2">
                       
                    <DropdownMenu key={eleve.id} eleve={eleve} openPaiementModal={openPaiementModal} />

                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>

            {hasMore && eleves.length > 0 && (
              <div className="flex justify-center mt-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => fetchEleves()}
                  className="flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                >
                  Voir Plus
                  <motion.span
                    animate={{ y: [0, 4, 0] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    <ChevronDown size={20} />
                  </motion.span>
                </motion.button>
              </div>
            )}
          </div>
        </main>
      </div>

      {isPaiementModalOpen && selectedEleve !== null && (
        <PaiementModal
          isOpen={isPaiementModalOpen}
          onClose={closePaiementModal}
          eleve={selectedEleve}
          refreshEleves={() => fetchEleves(true)}
        />
      )}
    </div>
  );
}
