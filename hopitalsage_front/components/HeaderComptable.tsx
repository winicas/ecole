'use client';

import { LogOut, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import axios from 'axios';
import { ReactNode } from 'react';

interface Ecole {
  id: number;
  nom: string;
  adresse: string;
  telephone: string | null;
}

interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  photo: string | null; // ✅ correspond au champ renvoyé par l'API
  role: string;
  ecole: number;
}

interface HeaderComptableProps {
  ecole: Ecole;
  user: User;
}

interface MenuItem {
  href?: string;
  label: string;
  icon: ReactNode;
  isTitle?: boolean;
  submenu?: { href: string; label: string; icon: ReactNode }[];
}

const HeaderComptable = ({ ecole, user }: HeaderComptableProps) => {
  const [openMenu, setOpenMenu] = useState<null | 'main' | 'finance'>(null);
  const [openSubmenu, setOpenSubmenu] = useState<null | 'eleves' | 'rapports'>(null);
  const router = useRouter();

  const menuRefs = {
    main: useRef<HTMLDivElement>(null),
    finance: useRef<HTMLDivElement>(null),
  };

  const handleLogout = async () => {
  const refreshToken = localStorage.getItem("refreshToken");

  try {
    // Appel API logout (vers Django)
    await axios.post("http://localhost:8000/api/logout/", {
      refresh: refreshToken,
    });
  } catch (error) {
    console.error("Erreur lors du logout :", error);
  }

  // Suppression des tokens côté client
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");

  // Redirection vers login
  router.push("/login");
};


  const mainMenuItems: MenuItem[] = [
    { href: "/dashboard/comptable/create-eleve", label: "Inscrire Nouveau Élève", icon: "👨‍🎓" },
    { href: "/paiement/rechercher", label: "Vérifier paiement élève", icon: "🔍" },
    { href: "/dashboard/comptable/modifier-frais", label: "Modifié le Paiement frais scolaire", icon: "🔍" },
    { href: "/dashboard/comptable/modifier-autre-frais", label: "Modifié les Autres Frais", icon: "🔍" },
    {
      label: "Listes des Élèves à Jour de Paiement",
      icon: "📄",
      isTitle: true,
      submenu: [
        { href: "/dashboard/comptable/liste-paiement-ordre", label: "Frais Scolaires", icon: "🏫" },
        { href: "/dashboard/comptable/liste-paiement-autres-frais", label: "Frais Techniques ou Autres Frais", icon: "🛠️" },
      ],
    },
    { href: "/ELEVE/generate-carte", label: "CREATION D'UNE NOUVELLE CARTE D'ELEVE", icon: <i className="fas fa-calendar-day" /> },
  ];

  const financeMenuItems: MenuItem[] = [
    {
      label: "Agent",
      icon: "👤",
      isTitle: true,
      submenu: [
        { href: '/dashboard/Agent/enseignant', label: 'Ajouter Utilisateur Prof', icon: '🧑‍🏫' },
        { href: '/dashboard/Agent/ajouter-agent', label: 'Ajouter Agent', icon: '👨‍💼' },
        { href: '/dashboard/Agent/liste-paiement', label: 'Paie Agent', icon: '💰' },
      ],
    },
    {
      label: "Fournisseur & Dépense",
      icon: "🧾",
      isTitle: true,
      submenu: [
        { href: '/dashboard/comptable/Depenses/ajouter-fournisseur', label: 'Ajout Fournisseur', icon: '🏬' },
        { href: '/dashboard/comptable/Depenses/faire-depense', label: 'Achat Fourniture', icon: '🛒' },
      ],
    },
     { href: "/dashboard/rapport-journalier", label: "Rapport Journalier", icon: <i className="fas fa-calendar-day"></i> },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        (menuRefs.main.current && !menuRefs.main.current.contains(event.target as Node)) &&
        (menuRefs.finance.current && !menuRefs.finance.current.contains(event.target as Node))
      ) {
        setOpenMenu(null);
        setOpenSubmenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const renderSubmenu = (
    submenu: { href: string; label: string; icon: ReactNode }[],
    parentKey: 'eleves' | 'rapports'
  ) => (
    <AnimatePresence>
      {openSubmenu === parentKey && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
      
        >
          {submenu.map((item, index) => (
            <Link href={item.href} key={index} onClick={() => { setOpenMenu(null); setOpenSubmenu(null); }}>
              <div className="flex items-center gap-3 px-6 py-2 hover:bg-blue-100 dark:hover:bg-zinc-700 text-sm text-gray-700 dark:text-gray-100 transition cursor-pointer">
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            </Link>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderMenu = (items: MenuItem[], refKey: 'main' | 'finance') => (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      ref={menuRefs[refKey]}
    >
      {items.map((item, index) => (
        <div key={index}>
          {!item.isTitle ? (
            <Link href={item.href!} onClick={() => setOpenMenu(null)}>
              <div className="flex items-center gap-3 px-4 py-3 hover:bg-blue-100 dark:hover:bg-zinc-700 text-sm font-medium cursor-pointer group">
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            </Link>
          ) : (
            <div>
              <div
                className="flex items-center justify-between px-4 py-3 font-semibold cursor-pointer bg-gray-100 dark:bg-zinc-700 text-gray-800 dark:text-white"
                onClick={() =>
                  setOpenSubmenu(openSubmenu === (refKey === 'main' ? 'eleves' : 'rapports') ? null : (refKey === 'main' ? 'eleves' : 'rapports'))
                }
              >
                <div className="flex items-center gap-2">
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {openSubmenu === (refKey === 'main' ? 'eleves' : 'rapports') ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </div>
              {item.submenu && renderSubmenu(item.submenu, refKey === 'main' ? 'eleves' : 'rapports')}
            </div>
          )}
        </div>
      ))}
    </motion.div>
  );

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7 }}
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

        {/* Rapports Financiers */}
        <div className="relative">
          <button
            onClick={() => setOpenMenu(openMenu === 'finance' ? null : 'finance')}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all text-sm"
          >
            💰 Rapports Financiers
          </button>
          <AnimatePresence>
            {openMenu === 'finance' && renderMenu(financeMenuItems, 'finance')}
          </AnimatePresence>
        </div>
      </div>

      {/* Nom école */}
      {ecole && <h1 className="text-3xl font-extrabold text-white tracking-wide">{ecole.nom}</h1>}

      {/* Profil + Déconnexion */}
      <div className="flex items-center space-x-4">
      {user && (
  <>
    <Link href="/dashboard/comptable/profile">
      <Image
        src={user.photo || '/default-user.png'}
        alt="Profil utilisateur"
        width={48}
        height={48}
        className="rounded-full ring-4 ring-white dark:ring-zinc-700 object-cover shadow-lg cursor-pointer"
      />
    </Link>
    <span className="text-lg font-semibold text-white hidden md:inline">
      {user.username}
    </span>
  </>
)}

        <button onClick={handleLogout} className="p-2 hover:bg-red-500/20 rounded-full transition">
          <LogOut className="text-white hover:text-red-300" size={28} />
        </button>
      </div>
    </motion.header>
  );
};

export default HeaderComptable;
