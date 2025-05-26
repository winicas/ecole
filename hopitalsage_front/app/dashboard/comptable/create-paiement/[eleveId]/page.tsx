"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import axios from "axios";

interface Eleve {
  id: number;
  nom_elev: string;
  postnom_elev: string;
  prenom_elev: string;
  montant_total_a_payer: number;
  montant_total_payer: number;
}

export default function CreatePaiementPage() {
  const { eleveId } = useParams<{ eleveId: string }>();
  const router = useRouter();

  const [eleve, setEleve] = useState<Eleve | null>(null);
  const [loading, setLoading] = useState(true);
  const [montantPaye, setMontantPaye] = useState("");
  const [motifPaiement, setMotifPaiement] = useState("");

  // Charger l'élève au montage
  useEffect(() => {
    const fetchEleve = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(`http://localhost:8000/api/eleves/${eleveId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEleve(response.data);
      } catch (error) {
        console.error("Erreur de chargement élève:", error);
        toast.error("Impossible de trouver l'élève.");
        router.push("/dashboard/comptable"); // Rediriger si erreur
      } finally {
        setLoading(false);
      }
    };

    if (eleveId) {
      fetchEleve();
    }
  }, [eleveId, router]);

  const handlePaiement = async () => {
    if (!eleve) return;

    const montant = parseFloat(montantPaye);

    if (montant <= 0) {
      toast.error("Le montant doit être supérieur à 0 !");
      return;
    }

    if (montant > (eleve.montant_total_a_payer - eleve.montant_total_payer)) {
      toast.error("Le montant payé dépasse le montant restant !");
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      await axios.post("http://localhost:8000/api/paiements/", {
        eleve_id: eleve.id,
        montant_payer: montant,
        motif_paiement: motifPaiement,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Paiement enregistré avec succès !");
      router.push("/dashboard/comptable"); // Retour après paiement
    } catch (error) {
      console.error("Erreur d'enregistrement paiement:", error);
      toast.error("Erreur lors de l'enregistrement du paiement.");
    }
  };

  if (loading) return <p className="text-center">Chargement...</p>;
  if (!eleve) return <p className="text-center">Élève introuvable.</p>;

  const montantRestant = eleve.montant_total_a_payer - eleve.montant_total_payer;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-blue-900">
        Paiement de {eleve.nom_elev} {eleve.postnom_elev} {eleve.prenom_elev}
      </h1>

      <div className="space-y-4 text-blue-800">
        <p><strong>Montant Total à Payer :</strong> {eleve.montant_total_a_payer} FC</p>
        <p><strong>Montant Déjà Payé :</strong> {eleve.montant_total_payer} FC</p>
        <p><strong>Montant Restant :</strong> {montantRestant} FC</p>

        <Input
          type="number"
          placeholder="Nouveau montant payé"
          value={montantPaye}
          onChange={(e) => setMontantPaye(e.target.value)}
        />

        <Textarea
          placeholder="Motif du paiement"
          value={motifPaiement}
          onChange={(e) => setMotifPaiement(e.target.value)}
        />

        <Button
          className="mt-4"
          onClick={handlePaiement}
          disabled={!montantPaye || !motifPaiement}
        >
          Enregistrer Paiement
        </Button>
      </div>
    </div>
  );
}
