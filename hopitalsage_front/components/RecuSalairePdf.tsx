'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#fff',
    padding: 30,
  },
  header: {
    marginBottom: 10,
  },
  ecoleInfo: {
    textAlign: 'left',
    fontSize: 20,
    marginBottom: 2,
  },
  title: {
    fontSize: 26,
    textAlign: 'center',
    marginVertical: 8,
    fontWeight: 'bold',
    textDecoration: 'underline',
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    marginVertical: 8,
  },
  section: {
    marginBottom: 5,
    fontSize: 18,
  },
  label: {
    marginBottom: 3,
  },
  qrWrapper: {
    marginTop: 30,
    alignItems: 'center',
    justifyContent: 'center',
    display: 'flex',
  },
  qrImage: {
    width: 100,
    height: 100,
  },
});

const RecuSalairePdf = ({ agent, ecole, montant, periode, motif, datePaiement, qrCodeDataUrl }: any) => {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* En-tête École */}
        <View style={styles.header}>
          <Text style={styles.ecoleInfo}>École : {ecole.nom}</Text>
          <Text style={styles.ecoleInfo}>Adresse : {ecole.adresse}</Text>
        </View>

        {/* Titre */}
        <Text style={styles.title}>Reçu de paiement de salaire</Text>

        {/* Ligne séparatrice */}
        <View style={styles.separator} />

        {/* Infos de paiement */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Nom de l'agent : {agent.nom_agent} {agent.postnom_agent} {agent.prenom_agent}
          </Text>
          <Text style={styles.label}>Matricule : {agent.matricule_agent}</Text>
          <Text style={styles.label}>Montant payé : {montant} FC</Text>
          <Text style={styles.label}>Période : {periode}</Text>
          <Text style={styles.label}>Motif : {motif || 'N/A'}</Text>
          <Text style={styles.label}>Date de paiement : {datePaiement}</Text>
        </View>

        {/* QR code au centre en bas */}
        <View style={styles.qrWrapper}>
          <Image style={styles.qrImage} src={qrCodeDataUrl} />
        </View>
      </Page>
    </Document>
  );
};

export default RecuSalairePdf;
