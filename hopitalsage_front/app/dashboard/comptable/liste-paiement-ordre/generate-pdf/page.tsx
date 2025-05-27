'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import axios from 'axios';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: 'Times-Roman',
  },
  title: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 12,
    textTransform: 'uppercase',
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
    color: '#34495e',
  },
  table: {
  
    width: 'auto',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderStyle: 'solid',
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '16.66%',
    backgroundColor: '#3498db',
    color: 'white',
    padding: 5,
    fontWeight: 'bold',
  },
  tableCol: {
    width: '16.66%',
    borderStyle: 'solid',
    borderWidth: 0.5,
    borderColor: '#ccc',
    padding: 5,
  },
});

interface EleveData {
  nom_elev: string;
  postnom_elev: string;
  prenom_elev: string;
  montant_total_payer: number;
  montant_restant: number;
}

const PDFDocument = ({
  data,
  option,
  classe,
  date,
}: {
  data: EleveData[];
  option: string;
  classe: string;
  date: string;
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Liste des élèves en ordre</Text>
      <Text style={styles.subtitle}>
        Option : {option} | Classe : {classe} | Date : {date}
      </Text>

      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={styles.tableColHeader}>#</Text>
          <Text style={styles.tableColHeader}>Nom</Text>
          <Text style={styles.tableColHeader}>Postnom</Text>
          <Text style={styles.tableColHeader}>Prénom</Text>
          <Text style={styles.tableColHeader}>Total Payé</Text>
          <Text style={styles.tableColHeader}>Reste</Text>
        </View>
        {data.map((eleve, index) => (
          <View style={styles.tableRow} key={index}>
            <Text style={styles.tableCol}>{index + 1}</Text>
            <Text style={styles.tableCol}>{eleve.nom_elev}</Text>
            <Text style={styles.tableCol}>{eleve.postnom_elev}</Text>
            <Text style={styles.tableCol}>{eleve.prenom_elev}</Text>
            <Text style={styles.tableCol}>
              {eleve.montant_total_payer?.toLocaleString('fr-FR')} $
            </Text>
            <Text style={styles.tableCol}>
              {eleve.montant_restant?.toLocaleString('fr-FR')} $
            </Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

export default function GeneratePDFPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const option = searchParams.get('option') || '';
  const classe = searchParams.get('classe') || '';
  const quota = searchParams.get('quota') || '';
  const [data, setData] = useState<EleveData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/eleves-en-ordre', {
          params: { option, classe, quota },
        });

        setData(response.data);
        console.log('Données reçues :', response.data); // ✅ ICI
      } catch (error) {
        console.error('Erreur de chargement :', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [option, classe, quota]);

  const currentDate = new Date().toLocaleDateString();

  return (
    <div className="p-8 space-y-4 text-center">
      {loading ? (
        <p className="text-gray-600">Chargement des données...</p>
      ) : (
        <>
          {typeof window !== 'undefined' && (
            <PDFDownloadLink
              document={<PDFDocument data={data} option={option} classe={classe} date={currentDate} />}
              fileName={`eleves-en-ordre-${option}-${classe}.pdf`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded shadow-md transition"
            >
              {({ loading }) => (loading ? 'Génération du PDF...' : '📄 Télécharger le PDF')}
            </PDFDownloadLink>
          )}

          <button
            onClick={() => router.push('/dashboard/comptable')}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded shadow"
          >
            Retour à l’accueil
          </button>
        </>
      )}
    </div>
  );
}
