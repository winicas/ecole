'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface Ecole {
  nom: string;
  logo: string | null;
}

const SidebarComptable = () => {
  const [suggestion, setSuggestion] = useState('');
  const [ecole, setEcole] = useState<Ecole | null>(null);
  const router = useRouter();

useEffect(() => {
  const token = localStorage.getItem('accessToken'); // Ou autre méthode selon ton auth

  fetch('http://localhost:8000/api/mon-ecole/', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      console.log('École de l’utilisateur:', data);
      setEcole(data);
    })
    .catch((err) => console.error('Erreur chargement école:', err));
}, []);



  const handleSuggestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Suggestion envoyée:', suggestion);
    setSuggestion('');
  };

  const handleGoHome = () => {
    router.push('/dashboard/comptable');
  };

  return (
    <aside className="sticky top-4 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 dark:from-zinc-800 dark:via-zinc-700 dark:to-zinc-600 h-[95vh] m-2 p-5 rounded-3xl shadow-2xl flex flex-col justify-between font-sans backdrop-blur-md w-64">
      <div className="flex flex-col items-center">
        {ecole?.logo ? (
         <img
          src={`http://localhost:8000${ecole.logo}`}
          alt={`Logo de ${ecole.nom}`}
          className="w-20 h-20 rounded-full object-cover shadow-lg ring-4 ring-white dark:ring-zinc-700 mb-4"
        />

        ) : (
          <div className="w-20 h-20 bg-white/30 rounded-full flex items-center justify-center text-white mb-4">
            Pas de logo
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🏠 Accueil
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="font-semibold mb-2">📢 Message du SuperAdmin :</p>
          <p>Bienvenue chez <strong>Nicatech</strong> 🚀</p>
          <a
            href="https://wwww.nica.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-200 underline text-xs mt-2 inline-block"
          >
            Voir notre site
          </a>
        </motion.div>

        <form onSubmit={handleSuggestionSubmit} className="w-full flex flex-col gap-3">
          <input
            type="text"
            placeholder="Votre suggestion..."
            value={suggestion}
            onChange={(e) => setSuggestion(e.target.value)}
            className="p-2 rounded-xl text-sm focus:outline-none bg-white/20 placeholder-white text-white backdrop-blur-md"
          />
          <button
            type="submit"
            className="bg-white/30 text-white font-semibold py-2 rounded-xl hover:bg-white/40 transition"
          >
            Envoyer
          </button>
        </form>
      </div>

      <div className="text-center text-white text-xs mt-8">
        <p className="font-bold">© Nicatech</p>
        <p className="mt-1">Concepteur : William LOSEKA King</p>
      </div>
    </aside>
  );
};

export default SidebarComptable;
