// app/dashboard/comptable/liste-paiement-autres-frais/generate-pdf/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import axios from 'axios';

// Définition des styles pour le PDF
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
    display: 'table',
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

// L'interface représente chaque enregistrement tel que renvoyé par l'API.
interface EleveData {
  nom_elev: string;
  postnom_elev: string;
  prenom_elev: string;
  total_montant_payer_af: number;
  montant_restant_af: number;
}

// Composant PDF qui reçoit les données et les affiche dans un tableau.
const PDFDocument = ({
  data,
  option,
  classe,
  typeFrais,
  date,
}: {
  data: EleveData[];
  option: string;
  classe: string;
  typeFrais: string;
  date: string;
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Liste des élèves en ordre ave Autre frais</Text>
      <Text style={styles.subtitle}>
        Option : {option} | Classe : {classe} | Type de Frais : {typeFrais} | Date : {date}
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
        {data.length === 0 ? (
          <View style={styles.tableRow}>
            <Text style={styles.tableCol} colSpan={6}>Aucun élève trouvé</Text>
          </View>
        ) : (
          data.map((eleve, index) => (
            <View style={styles.tableRow} key={index}>
              <Text style={styles.tableCol}>{index + 1}</Text>
              <Text style={styles.tableCol}>{eleve.nom_elev}</Text>
              <Text style={styles.tableCol}>{eleve.postnom_elev}</Text>
              <Text style={styles.tableCol}>{eleve.prenom_elev}</Text>
              <Text style={styles.tableCol}>
                {eleve.total_montant_payer_af?.toLocaleString('fr-FR')} €
              </Text>
              <Text style={styles.tableCol}>
                {eleve.montant_restant_af?.toLocaleString('fr-FR')} €
              </Text>
            </View>
          ))
        )}
      </View>
    </Page>
  </Document>
);

// Composant principal qui charge les données et génère le PDF
const GeneratePDFPage = () => {
  const [data, setData] = useState<EleveData[]>([]);
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();
  const router = useRouter();

  // Récupération des paramètres depuis l'URL
  const option = searchParams.get('option') || '';
  const classe = searchParams.get('classe') || '';
  // ATTENTION : ici on utilise "type_frais" en minuscule pour correspondre à l'API Django
  const typeFrais = searchParams.get('type_frais') || '';
  const quota = searchParams.get('quota') || '0'; // si aucun quota n'est fourni, on utilise 0
  const currentDate = new Date().toLocaleDateString();
  const [typeFraisNom, setTypeFraisNom] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/liste-autres-frais/', {
          params: { option, classe, type_frais: typeFrais, quota },
        });
        console.log('Données reçues :', response.data);
        setData(response.data);
  
        if (response.data.length > 0) {
          setTypeFraisNom(response.data[0].type_de_frais_nom || '');
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données :', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [option, classe, typeFrais, quota]);
  
  if (loading) return <div>Chargement en cours...</div>;

  return (
    <div className="p-4 text-center">
      <h1 className="text-lg font-bold mb-4">Télécharger le fichier PDF</h1>
      <PDFDownloadLink
        document={<PDFDocument data={data} option={option} classe={classe} typeFrais={typeFraisNom} date={currentDate} />}
        fileName={`liste_paiements_autres_frais_${option}_${classe}.pdf`}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {({ loading }) => (loading ? 'Préparation du document...' : '📄 Télécharger le PDF')}
      </PDFDownloadLink>
      <button
        onClick={() => router.push('/dashboard/comptable')}
        className="mt-4 bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded shadow"
      >
        Retour à l’accueil
      </button>
    </div>
  );
};

export default GeneratePDFPage;
