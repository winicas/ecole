'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

const SidebarDirecteur = () => {
  const [suggestion, setSuggestion] = useState('');

  const handleSuggestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Suggestion envoyée:', suggestion);
    setSuggestion('');
  };

  return (
    <aside className="sticky top-4 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 dark:from-zinc-800 dark:via-zinc-700 dark:to-zinc-600 h-[95vh] m-2 p-5 rounded-3xl shadow-2xl flex flex-col justify-between font-sans backdrop-blur-md w-64">
      
      {/* Top Logo */}
      <div className="flex flex-col items-center">
        <img
          src="/profile.jpg" // Mets ici ton vrai logo si tu veux
          alt="Logo Nicatech"
          className="w-20 h-20 rounded-full object-cover shadow-lg ring-4 ring-white dark:ring-zinc-700 mb-6"
        />

        {/* Vitrine Message */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/20 text-white p-4 rounded-2xl text-center text-sm shadow-md mb-6 backdrop-blur-md"
        >
          <p className="font-semibold mb-2">📢 Message du SuperAdmin :</p>
          <p>Bienvenue chez <strong>Nicatech</strong> 🚀</p>
          <a
            href="https://www.nica.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-200 underline text-xs mt-2 inline-block"
          >
            Voir notre site
          </a>
        </motion.div>

        {/* Formulaire Suggestion */}
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

      {/* Footer Infos */}
      <div className="text-center text-white text-xs mt-8">
        <p className="font-bold">© Nicatech</p>
        <p className="mt-1">Concepteur : William LOSEKA King</p>
      </div>
    </aside>
  );
};

export default SidebarDirecteur;
