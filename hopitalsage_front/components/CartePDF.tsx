'use client';
import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from '@react-pdf/renderer';

interface Eleve {
  nom_elev: string;
  postnom_elev: string;
  prenom_elev: string;
  option_elev: string;
  classe_elev: string;
  matricule_elev: string;
  adresses: string;
  sexe: string;
  lieu_naissance_elev: string;      
  date_naissance_elev: string;      
}

interface Ecole {
  nom: string;
  adresse: string;
  telephone?: string | null;
  logo?: string | null;
}

interface Props {
  eleve: Eleve;
  ecole: Ecole;
  photoUrl: string;
  qrCodeUrl: string;
}

const styles = StyleSheet.create({
  page: {
    width: 340,
    height: 210,
    padding: 12,
    backgroundColor: 'white',
    fontSize: 10,
    fontFamily: 'Helvetica',
    borderRadius: 12,
    border: '1 solid #ddd',
    position: 'relative',
  },
  logoBackground: {
    position: 'absolute',
    top: 30,
    left: 90,
    width: 160,
    height: 160,
    opacity: 0.1,
    zIndex: -1,
  },
  header: {
    textAlign: 'center',
    fontSize: 8,
    fontWeight: 'bold',
    marginBottom: 2,
    textTransform: 'uppercase',
    color: '#1e293b',
  },
  ministry: {
    textAlign: 'center',
    fontSize: 6.5,
    color: '#334155',
    marginBottom: 2,
  },
  title: {
    textAlign: 'center',
    fontSize: 10,
    fontWeight: 'bold',
    backgroundColor: '#1e3a8a',
    color: 'white',
    padding: 3,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  schoolYear: {
    textAlign: 'center',
    fontSize: 8,
    fontWeight: 600,
    marginBottom: 6,
    color: '#1e293b',
  },
  section: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  photo: {
    width: 70,
    height: 80,
    border: '1 solid #000',
  },
  info: {
    flex: 1,
    marginLeft: 10,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  label: {
    width: 60,
    fontWeight: 'bold',
    color: '#1e293b',
    fontSize: 8,
  },
  value: {
    fontSize: 8,
    color: '#1e293b',
  },
  qr: {
    width: 40,
    height: 40,
    position: 'absolute',
    bottom: 12,
    right: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    fontSize: 7,
    color: '#334155',
  },
  // Styles verso
  versoHeader: {
    textAlign: 'center',
    fontSize: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#1e293b',
    marginBottom: 4,
  },
  versoMinistry: {
    textAlign: 'center',
    fontSize: 6.5,
    color: '#334155',
    marginBottom: 10,
  },
  versoSchoolName: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  versoLaissezPasser: {
    textAlign: 'center',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#1e293b',
    marginBottom: 10,
  },
  versoFooter: {
    position: 'absolute',
    bottom: 10,
    fontSize: 6,
    textAlign: 'center',
    width: '100%',
    textTransform: 'lowercase',
    color: '#334155',
  },
  logoBackgroundVerso: {
  position: 'absolute',
  top: 30,
  left: 90,
  width: 160,
  height: 160,
  opacity: 0.7, // <-- Ici tu mets 70% de visibilité
  zIndex: -1,
},
logoRdc: {
  position: 'absolute',
  top: 5,
  left: 20,
  width: 40,
  height: 40,
},

});
import { PDFViewer } from '@react-pdf/renderer';


const CartePdf: React.FC<Props> = ({ eleve, ecole, photoUrl, qrCodeUrl }) => (
  <Document>
    {/* Page 1 : Recto */}
    <Page size={[340, 210]} style={styles.page}>
      
      {ecole.logo && <Image src={ecole.logo} style={styles.logoBackground} />}
      <Text style={styles.header}>RÉPUBLIQUE DÉMOCRATIQUE DU CONGO</Text>
      <Text style={styles.ministry}>
        MINISTÈRE DE L’ENSEIGNEMENT PRIMAIRE, SECONDAIRE ET PROFESSIONNEL
      </Text>
      <Text style={styles.title}>{ecole.nom}</Text>
      <Text style={styles.schoolYear}>ANNÉE SCOLAIRE 2024-2025</Text>

      <View style={styles.section}>
        <Image src={photoUrl} style={styles.photo} />
        <View style={styles.info}>
          <View style={styles.row}>
            <Text style={styles.label}>NOM</Text>
            <Text style={styles.value}>: {eleve.nom_elev}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>POSTNOM</Text>
            <Text style={styles.value}>: {eleve.postnom_elev}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>PRÉNOM</Text>
            <Text style={styles.value}>: {eleve.prenom_elev}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>NAISSANCE</Text>
            <Text style={styles.value}>: {eleve.lieu_naissance_elev}, {eleve.date_naissance_elev}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>ADRESSE</Text>
            <Text style={styles.value}>: {eleve.adresses}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>SEXE</Text>
            <Text style={styles.value}>: {eleve.sexe}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>OPTION</Text>
            <Text style={styles.value}>: {eleve.option_elev}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>CLASSE</Text>
            <Text style={styles.value}>: {eleve.classe_elev}</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text>{ecole.nom}</Text>
        <Text>{ecole.adresse}</Text>
        {ecole.telephone && <Text>Tél: {ecole.telephone}</Text>}
      </View>
      <Image src={qrCodeUrl} style={styles.qr} />
    </Page>

    {/* Page 2 : Verso */}
    <Page size={[340, 210]} style={styles.page}>
      <Image src="/rdc.png" style={styles.logoRdc} />
      {ecole.logo && <Image src={ecole.logo} style={styles.logoBackgroundVerso} />}
      <Text style={styles.versoHeader}>RÉPUBLIQUE DÉMOCRATIQUE DU CONGO</Text>
      <Text style={styles.versoMinistry}>
        MINISTÈRE DE L’ENSEIGNEMENT PRIMAIRE, SECONDAIRE ET TECHNIQUE
      </Text>
      <Text style={styles.versoSchoolName}>{ecole.nom}</Text>
      <Text style={styles.versoLaissezPasser}>laissez-passer</Text>
      <Text style={styles.versoFooter}>
        le géant formateur au service de la nation congolaise
      </Text>
    </Page>
  </Document>
);

export default CartePdf;
