'use client';

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { RapportJournalier } from '@/types';

const styles = StyleSheet.create({
  page: { padding: 30 },
  title: { fontSize: 20, marginBottom: 20, textAlign: 'center' },
  section: { marginBottom: 10 },
  label: { fontWeight: 'bold' },
});

export const RapportJournalierPDF = ({ rapport }: { rapport: RapportJournalier }) => {
  console.log('rapport', rapport);
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Rapport Journalier - {rapport.date}</Text>
        <View style={styles.section}>
          <Text>Total Paiement Frais Scolaires: {rapport.total_paiement_frais_scolaires ?? 'no data'}</Text>
          <Text>Total Autres Frais: {rapport.total_autres_frais ?? 'no data'}</Text>
          <Text>Total Salaires: {rapport.total_salaires ?? 'no data'}</Text>
          <Text>Total Achats: {rapport.total_achats ?? 'no data'}</Text>
          <Text>Solde: {rapport.solde ?? 'no data'}</Text>
        </View>
      </Page>
    </Document>
  );
};
