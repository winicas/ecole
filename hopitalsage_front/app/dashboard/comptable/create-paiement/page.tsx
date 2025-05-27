"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";

interface PaiementModalProps {
  isOpen: boolean;
  onClose: () => void;
  eleve?: {
    id: number;
    nom_elev: string;
    postnom_elev: string;
    prenom_elev: string;
    montant_total_a_payer: number;
    montant_total_payer: number;
  } | null;
  refreshEleves: () => void;
}

export default function PaiementModal({ isOpen, onClose, eleve, refreshEleves }: PaiementModalProps) {
  const [montantPaye, setMontantPaye] = useState("");
  const [motifPaiement, setMotifPaiement] = useState("");
  const [loading, setLoading] = useState(false);

  if (!eleve) return null; // Sécurité : ne rien afficher si pas d'élève

  const montantRestant = eleve.montant_total_a_payer - eleve.montant_total_payer;

  const handlePaiement = async () => {
    if (!eleve?.id) {
      toast.error("Erreur : Élève non valide !");
      return;
    }

    const montant = parseFloat(montantPaye);

    if (montant <= 0) {
      toast.error("Le montant payé doit être supérieur à 0 !");
      return;
    }
    if (montant > montantRestant) {
      toast.error("Le montant payé dépasse le montant restant !");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      await axios.post("http://localhost:8000/api/paiements/", {
        eleve_id: eleve.id,
        montant_payer: montant,
        motif_paiement: motifPaiement,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success("Paiement enregistré avec succès !");
      refreshEleves();
      onClose();
      setMontantPaye(""); // Réinitialiser les champs après succès
      setMotifPaiement("");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'enregistrement du paiement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!loading) {
        onClose();
      }
    }}>
      <DialogContent className="backdrop-blur-md">
        <DialogHeader>
          <DialogTitle>Enregistrer un Paiement</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-blue-900">
          <p><strong>Élève :</strong> {eleve.nom_elev} {eleve.postnom_elev} {eleve.prenom_elev}</p>
          <p><strong>Montant Total à Payer :</strong> {eleve.montant_total_a_payer} FC</p>
          <p><strong>Montant Déjà Payé :</strong> {eleve.montant_total_payer} FC</p>
          <p><strong>Montant Restant :</strong> {montantRestant} FC</p>

          <Input
            type="number"
            placeholder="Nouveau montant payé"
            value={montantPaye}
            onChange={(e) => setMontantPaye(e.target.value)}
            disabled={loading}
          />

          <Textarea
            placeholder="Motif du paiement"
            value={motifPaiement}
            onChange={(e) => setMotifPaiement(e.target.value)}
            disabled={loading}
          />
        </div>

        <DialogFooter>
          <Button
            onClick={handlePaiement}
            disabled={!montantPaye || !motifPaiement || loading}
          >
            {loading ? "Enregistrement..." : "Confirmer Paiement"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
