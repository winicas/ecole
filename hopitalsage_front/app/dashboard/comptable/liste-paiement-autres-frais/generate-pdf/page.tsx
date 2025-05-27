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
    width: '100%',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderStyle: 'solid',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '0.5px solid #ccc',
  },
  tableColHeader: {
    flex: 1,
    backgroundColor: '#3498db',
    color: 'white',
    padding: 5,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableCol: {
    flex: 1,
    padding: 5,
    textAlign: 'center',
    borderRight: '0.5px solid #ccc',
    borderLeft: '0.5px solid #ccc',
  },
  fullWidthCell: {
    flex: 6, // Prend toute la largeur (6 colonnes)
    textAlign: 'center',
    padding: 5,
    border: '0.5px solid #ccc',
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
      <Text style={styles.title}>Liste des élèves en ordre avec Autre frais</Text>
      <Text style={styles.subtitle}>
        Option : {option} | Classe : {classe} | Type de Frais : {typeFrais} | Date : {date}
      </Text>

      <View style={styles.table}>
        {/* En-tête du tableau */}
        <View style={styles.tableRow}>
          <Text style={styles.tableColHeader}>#</Text>
          <Text style={styles.tableColHeader}>Nom</Text>
          <Text style={styles.tableColHeader}>Postnom</Text>
          <Text style={styles.tableColHeader}>Prénom</Text>
          <Text style={styles.tableColHeader}>Total Payé</Text>
          <Text style={styles.tableColHeader}>Reste</Text>
        </View>

        {/* Contenu du tableau */}
        {data.length === 0 ? (
          <View style={[styles.tableRow, { borderBottom: 'none' }]}>
            <Text style={styles.fullWidthCell}>
              Aucun élève trouvé
            </Text>
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
  // ... (le reste du code reste inchangé)
};

export default GeneratePDFPage;