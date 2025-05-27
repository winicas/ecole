'use client';

import { LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface Ecole {
  id: number;
  nom: string;
  adresse: string;
  telephone: string | null;
}

interface HeaderDirecteurProps {
  ecole: Ecole;
}

const HeaderDirecteur = ({ ecole }: HeaderDirecteurProps) => {
  const [openMenu, setOpenMenu] = useState<null | 'main' | 'finance'>(null);
  const menuRefs = {
    main: useRef<HTMLDivElement>(null),
    finance: useRef<HTMLDivElement>(null),
  };

  const mainMenuItems = [
    { href: "/dashboard/directeur", label: "Tableau de Bord", icon: <i className="fas fa-tachometer-alt"></i> },
    { href: "/directeur/rapport", label: "Rapport & Analyse", icon: <i className="fas fa-chart-line"></i> },
    { href: "/historique-mouvements", label: "Historique Complet", icon: <i className="fas fa-history"></i> },
    { href: "/directeur/archives", label: "Archivage des Mouvements Financiers", icon: <i className="fas fa-archive"></i> },
    { href: "/dashboard/directeur/create-type-frais", label: "Fixer le frais scolaire pour cette année", icon: <i className="fas fa-money-check-alt"></i> },
    { href: "/dashboard/directeur/create-autre-frais", label: "Fixer Autres types de frais scolaire pour cette année", icon: <i className="fas fa-money-check-alt"></i> },
    { href: "/dashboard/rapport-journalier", label: "Rapport Journalier", icon: <i className="fas fa-calendar-day"></i> },
    { href: "/dashboard/directeur/create-annee-scolaire", label: "CREATION D'UNE NOUVELLE ANNEE SCOLAIRE", icon: <i className="fas fa-calendar-day"></i> },
    
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        (menuRefs.main.current && !menuRefs.main.current.contains(event.target as Node)) &&
        (menuRefs.finance.current && !menuRefs.finance.current.contains(event.target as Node))
      ) {
        setOpenMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const renderMenu = (items: { href: string; label: string; icon: React.ReactNode }[], refKey: 'main' | 'finance') => (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="absolute left-0 mt-2 w-80 bg-white dark:bg-zinc-800 rounded-xl shadow-xl z-50 overflow-hidden"
      ref={menuRefs[refKey]}
    >
      {items.map((item, index) => (
        <Link href={item.href} key={index} onClick={() => setOpenMenu(null)}>
          <div className="flex items-center gap-3 px-4 py-3 hover:bg-blue-100 dark:hover:bg-zinc-700 transition-all text-gray-800 dark:text-gray-100 text-sm font-medium cursor-pointer group">
            <span className="text-lg group-hover:scale-110 transition-transform">{item.icon}</span> 
            <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{item.label}</span>
          </div>
        </Link>
      ))}
    </motion.div>
  );

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7 }}
      className="flex justify-between items-center px-8 py-5 m-4 rounded-3xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 dark:from-zinc-800 dark:via-zinc-700 dark:to-zinc-600 shadow-2xl backdrop-blur-md relative"
    >
      <div className="flex items-center gap-4 relative">
        {/* Menu Principal */}
        <div className="relative">
          <button
            onClick={() => setOpenMenu(openMenu === 'main' ? null : 'main')}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all text-sm"
          >
            📋 Menu
          </button>
          <AnimatePresence>
            {openMenu === 'main' && renderMenu(mainMenuItems, 'main')}
          </AnimatePresence>
        </div>
      </div>

      {/* Nom école */}
      {ecole && <h1 className="text-3xl font-extrabold text-white tracking-wide">{ecole.nom}</h1>}
      

      {/* Profil + Déconnexion */}
      <div className="flex items-center space-x-4">
        <img
          src="/profile.jpg"
          alt="Profil utilisateur"
          className="w-12 h-12 rounded-full ring-4 ring-white dark:ring-zinc-700 object-cover shadow-lg"
        />
        <span className="text-lg font-semibold text-white hidden md:inline">Directeur</span>
        <button className="p-2 hover:bg-red-500/20 rounded-full transition">
          <LogOut className="text-white hover:text-red-300" size={28} />
        </button>
      </div>
    </motion.header>
  );
};

export default HeaderDirecteur;
