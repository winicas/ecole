"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { MoreVertical } from "lucide-react";

interface Eleve {
  id: number;
  nom_elev: string;
  postnom_elev: string;
  prenom_elev: string;
  option_elev: string;
  classe_elev: string;
  matricule_elev: string;
}

interface Props {
  eleve: Eleve;
  openPaiementModal: (eleve: Eleve) => void;
}

export default function DropdownMenu({ eleve, openPaiementModal }: Props) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleFairePaiementClick = () => {
    openPaiementModal(eleve);
    setOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <motion.button
        onClick={() => setOpen((prev) => !prev)}
        className="p-2 rounded-full bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 transition"
        aria-expanded={open}
        whileTap={{ rotate: 90 }}
        whileHover={{ scale: 1.1 }}
      >
        <MoreVertical className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-3 w-60 rounded-2xl shadow-2xl bg-white dark:bg-zinc-800 z-20 overflow-hidden border border-gray-100 dark:border-zinc-700"
          >
            <ul className="py-2 text-sm text-gray-700 dark:text-gray-300">
              <li>
                <button
                  onClick={handleFairePaiementClick}
                  className="w-full text-left block px-4 py-3 hover:bg-gray-100 dark:hover:bg-zinc-700 transition font-medium"
                >
                  Faire paiement frais scolaires
                </button>
              </li>
              <li>
                <a
                  href={`/dashboard/comptable/paiement-autres-frais/${eleve.id}`}
                  className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-zinc-700 transition font-medium"
                >
                  Paiement autres frais
                </a>
              </li>
              <li>
                <a
                  href={`/dashboard/comptable/modifie-eleve/${eleve.id}`}
                  className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-zinc-700 transition font-medium"
                >
                  Modifié noms élève
                </a>
              </li>
              <li>
                <a
                  href={`/dashboard/comptable/create-inscription/${eleve.id}`}
                  className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-zinc-700 transition font-medium"
                >
                  Mise à jour élève
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
