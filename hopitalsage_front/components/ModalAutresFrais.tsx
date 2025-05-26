"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { jsPDF } from "jspdf";

interface Eleve {
  id: number;
  nom_elev: string;
  postnom_elev: string;
  prenom_elev: string;
  matricule_elev: string;
  option_elev: string;
  classe_elev: string;
}

interface TypeFrais {
  id: number;
  nom: string;
}

export default function PaiementAutresFraisPage() {
  const { eleveId } = useParams<{ eleveId: string }>();
  const router = useRouter();

  const [eleve, setEleve] = useState<Eleve | null>(null);
  const [typesFrais, setTypesFrais] = useState<TypeFrais[]>([]);
  const [typeFraisId, setTypeFraisId] = useState("");
  const [montant, setMontant] = useState("");
  const [receiptData, setReceiptData] = useState<any | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("accessToken");
      try {
        const [eleveRes, fraisRes] = await Promise.all([
          axios.get(`http://localhost:8000/api/eleves/${eleveId}/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:8000/api/autres-frais/", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setEleve(eleveRes.data);
        setTypesFrais(fraisRes.data);
      } catch (error) {
        toast.error("Erreur de chargement des données");
        router.push("/dashboard/comptable");
      }
    };

    if (eleveId) fetchData();
  }, [eleveId, router]);

  const generatePDF = (data: any) => {
    if (!eleve) return;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [80, 150],
    });

    let y = 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(data.nom_ecole.toUpperCase(), 40, y, { align: "center" });
    y += 6;

    doc.setFontSize(10);
    doc.text(`REÇU AUTRES FRAIS N° ${data.receipt_number}`, 40, y, { align: "center" });
    y += 4;
    doc.line(5, y, 75, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Nom élève : ${eleve.nom_elev} ${eleve.postnom_elev} ${eleve.prenom_elev}`, 5, y);
    y += 5;
    doc.text(`Matricule : ${eleve.matricule_elev}`, 5, y);
    y += 5;
    doc.text(`Classe    : ${eleve.classe_elev}`, 5, y);
    y += 5;
    doc.text(`Option    : ${eleve.option_elev}`, 5, y);
    y += 5;

    doc.line(5, y, 75, y);
    y += 6;

    doc.text(`Type de frais     : ${data.type_de_frais_nom}`, 5, y);
    y += 5;
    doc.text(`Montant payé      : ${montant} $`, 5, y);
    y += 5;
    doc.text(`Montant restant   : ${data.montant_restant_af} $`, 5, y);
    y += 5;
    doc.text(`Total à payer     : ${data.montant_total_a_payer} $`, 5, y);
    y += 6;

    doc.setFont("helvetica", "italic");
    doc.text(`Date: ${data.date}`, 5, y);
    y += 10;

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("Merci pour votre paiement", 40, y, { align: "center" });

    doc.save(`Recu_AutresFrais_${eleve.nom_elev}_${data.receipt_number}.pdf`);
  };

  const handleSubmit = async () => {
    if (!eleve || !typeFraisId || !montant) {
      toast.error("Tous les champs sont requis");
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.post(
        "http://localhost:8000/api/paiement-autres-frais/",
        {
          eleve_id: eleve.id,
          type_frais_id: parseInt(typeFraisId),
          montant_payer_af: parseFloat(montant),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Paiement enregistré !");
      setReceiptData(response.data); // Stocke les données pour une impression manuelle
    } catch (error) {
      console.error("Erreur d'enregistrement:", error);
      toast.error("Erreur de paiement");
    }
  };

  if (!eleve) return <p>Chargement...</p>;

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-xl rounded-xl">
      <h2 className="text-xl font-bold text-blue-900 mb-4">
        Paiement d'autres frais pour {eleve.nom_elev} {eleve.postnom_elev}
      </h2>

      <select
        className="w-full p-2 border rounded mb-4"
        value={typeFraisId}
        onChange={(e) => setTypeFraisId(e.target.value)}
      >
        <option value="">-- Sélectionner le type de frais --</option>
        {typesFrais.map((type) => (
          <option key={type.id} value={type.id}>
            {type.nom}
          </option>
        ))}
      </select>

      <Input
        type="number"
        placeholder="Montant payé"
        value={montant}
        onChange={(e) => setMontant(e.target.value)}
      />

      <Button className="mt-4" onClick={handleSubmit}>
        Enregistrer paiement
      </Button>

      {receiptData && (
        <Button
          variant="outline"
          className="mt-2"
          onClick={() => generatePDF(receiptData)}
        >
          Imprimer le reçu
        </Button>
      )}
    </div>
  );
}
