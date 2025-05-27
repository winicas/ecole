"use client";

import { useState } from "react";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";

interface Eleve {
  id: number;
  nom_elev: string;
  postnom_elev: string;
  prenom_elev: string;
  matricule_elev: string;
  option_elev:string;
  classe_elev:string;
}

interface PaiementModalProps {
  eleve: Eleve;
  onClose: () => void;
  refreshEleves: () => void;
  nomEcole: string; // ← Ajout ici
}

const PaiementModal = ({ eleve, onClose, refreshEleves, nomEcole }: PaiementModalProps) => {
  const [montant, setMontant] = useState<string>("");
  const [motif, setMotif] = useState<string>("");

  console.log("Élève reçu dans le modal:", eleve); // ← AJOUT ICI

  const generateReceiptPDF = async (
  data: {
    receipt_number: string;
    montant: string;
    total: number;
    reste: number;
    motif: string;
    date: string;
  },
  nomEcole: string
) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [80, 150],
  });

  const qrData = await QRCode.toDataURL(`Reçu n° ${data.receipt_number}`);

  // === EN-TÊTE ===
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(nomEcole.toUpperCase(), 40, 10, { align: "center" });

  doc.setFontSize(10);
  doc.text(`REÇU DE FRAIS SCOLAIRE N° ${data.receipt_number}`, 40, 16, { align: "center" });

  // === LIGNE DE SÉPARATION ===
  doc.setLineWidth(0.3);
  doc.line(5, 19, 75, 19);

  // === INFOS ÉLÈVE ===
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  let y = 25;
  doc.text(`Nom de l'élève : ${eleve.nom_elev} ${eleve.postnom_elev} ${eleve.prenom_elev}`, 5, y);
  y += 6;
  doc.text(`Matricule      : ${eleve.matricule_elev}`, 5, y);
  y += 5;
  doc.text(`Option         : ${eleve.option_elev}`, 5, y);
  y += 5;
  doc.text(`Classe         : ${eleve.classe_elev}`, 5, y);
  y += 1;
  doc.setLineDashPattern([1, 1], 0); // pointillé
  doc.line(5, y, 75, y);
  y += 5;

  // === INFOS PAIEMENT ===
  const labelX = 5;
  const valueX = 48;

  doc.text("Montant payé ce jour ", labelX, y);
  doc.text(`${data.montant} $`, valueX, y);
  y += 5;

  doc.text("Montant total payé   ", labelX, y);
  doc.text(`${data.total - data.reste} $`, valueX, y);
  y += 5;

  doc.text("Montant restant      ", labelX, y);
  doc.text(`${data.reste} $`, valueX, y);
  y += 5;

  doc.text("Montant total à payer", labelX, y);
  doc.text(`${data.total} $`, valueX, y);
  y += 1;
  doc.line(5, y, 75, y); // souligné pointillé
  y += 5;

  // === DATE AVANT QR CODE ===
  doc.setFont("helvetica", "italic");
  doc.text(`Date: ${data.date}`, 5, y);
  y += 5;

  // === QR CODE ===
  if (qrData) {
    doc.addImage(qrData, "PNG", 25, y, 30, 30); // Centré
    y += 35;
  }

  // === PIED DE PAGE ===
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Merci pour votre paiement", 40, y, { align: "center" });

  doc.save(`Recu_${eleve.nom_elev}_${data.receipt_number}.pdf`);
};

  
  
  

  const handlePaiement = async () => {
    if (!montant || isNaN(Number(montant))) {
      alert("Montant invalide !");
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("Token manquant !");
        return;
      }

      const payload = {
        eleve_id: eleve.id,
        montant_payer: Number(montant),
        motif_paiement: motif,
      };

      console.log("Données envoyées au backend:", payload); // ← AJOUT ICI

      const response = await fetch("http://localhost:8000/api/paiements/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      
      const contentType = response.headers.get("content-type");
      
      let result: any;
      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
      } else {
        const text = await response.text();
        console.error("Réponse non-JSON:", text);
        alert("Erreur inattendue du serveur (réponse non JSON)");
        return;
      }
      
      if (!response.ok) {
        console.error("Erreur Backend:", result);
        alert(`Erreur: ${JSON.stringify(result)}`);
        return;
      }
      

      await generateReceiptPDF({
        receipt_number: result.receipt_number,
        montant,
        total: result.montant_total_a_payer,
        reste: result.montant_restant,
        motif: result.motif_paiement,
        date: result.date,
      },  result.nom_ecole
    );

      refreshEleves();
      onClose();
    } catch (error) {
      console.error("Erreur attrapée:", error);
      alert("Paiement impossible !");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-blue-800">
          Paiement pour {eleve.nom_elev} {eleve.postnom_elev} {eleve.prenom_elev}
        </h2>

        <input
          type="text"
          placeholder="Montant à payer"
          value={montant}
          onChange={(e) => setMontant(e.target.value)}
          className="w-full mb-4 p-2 border rounded text-blue-800"
        />

        <input
          type="text"
          placeholder="Motif du paiement"
          value={motif}
          onChange={(e) => setMotif(e.target.value)}
          className="w-full mb-4 p-2 border rounded text-blue-800"
        />

        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
          >
            Annuler
          </button>
          <button
            onClick={handlePaiement}
            className="px-4 py-2 bg-blue-800 text-white rounded hover:bg-blue-900"
          >
            Valider Paiement
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaiementModal;
