'use client';

import { useState } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import axios from 'axios';
import { RapportJournalierPDF } from '@/components/RapportJournalierPDF';
import { RapportJournalier } from '@/types';

const RapportJournalierPage = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [rapport, setRapport] = useState<RapportJournalier | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchRapport = async (force: boolean = false) => {
  if (!selectedDate) return;

  const token = localStorage.getItem("accessToken");
  if (!token) {
    console.warn("Aucun token trouvé");
    return;
  }

  setLoading(true);
  try {
    const url = `http://localhost:8000/api/rapport-journalier/?date=${selectedDate}${force ? '&force=true' : ''}`;
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setRapport(response.data);
  } catch (error) {
    console.error('Erreur lors de la récupération du rapport', error);
    setRapport(null);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Télécharger le Rapport Journalier</h1>
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        className="p-2 border rounded mb-4 w-full"
      />
      <button
  onClick={() => fetchRapport()}  // bouton existant
  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
>
  {loading ? 'Chargement...' : 'Charger le Rapport'}
</button>

{rapport && (
  <div className="mt-4 flex gap-4">
    <PDFDownloadLink
      document={<RapportJournalierPDF rapport={rapport} />}
      fileName={`rapport-${rapport.date}.pdf`}
      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
    >
      {({ loading }) => loading ? 'Préparation du PDF...' : '📄 Télécharger le PDF'}
    </PDFDownloadLink>

    <button
      onClick={() => fetchRapport(true)}  // nouveau bouton avec "force"
      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
    >
      🔁 Régénérer le Rapport
    </button>
  </div>
)}


      {rapport && (
        <div className="mt-6">
          <PDFDownloadLink
            document={<RapportJournalierPDF rapport={rapport} />}
            fileName={`rapport-${rapport.date}.pdf`}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 inline-block mt-4"
          >
            {({ loading }) => loading ? 'Préparation du PDF...' : '📄 Télécharger le PDF'}
          </PDFDownloadLink>
        </div>
      )}
    </div>
  );
};

export default RapportJournalierPage;
