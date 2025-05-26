"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";

interface Eleve {
  id: number;
  nom_elev: string;
  postnom_elev: string;
  prenom_elev: string;
}

export default function EditElevePage() {
  const { eleveId } = useParams<{ eleveId: string }>();
  const router = useRouter();

  const [eleve, setEleve] = useState<Eleve | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEleve = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(`http://localhost:8000/api/eleves/${eleveId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEleve(response.data);
      } catch (error) {
        toast.error("Erreur de chargement de l'élève.");
        router.push("/dashboard/comptable");
      } finally {
        setLoading(false);
      }
    };

    if (eleveId) {
      fetchEleve();
    }
  }, [eleveId, router]);

  const handleUpdate = async () => {
    if (!eleve) return;

    try {
      const token = localStorage.getItem("accessToken");
      await axios.patch(`http://localhost:8000/api/eleves/${eleve.id}/identite/`, {
        nom_elev: eleve.nom_elev,
        postnom_elev: eleve.postnom_elev,
        prenom_elev: eleve.prenom_elev,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Identité de l'élève mise à jour !");
      router.push("/dashboard/comptable");
    } catch (error) {
      toast.error("Échec de la mise à jour !");
      console.error(error);
    }
  };

  if (loading) return <p className="text-center">Chargement...</p>;
  if (!eleve) return <p className="text-center">Élève introuvable.</p>;

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4 text-blue-800">
      <h1 className="text-2xl font-bold text-blue-900 mb-4">Modifier l'identité de l'élève</h1>

      <Input
        value={eleve.nom_elev}
        onChange={(e) => setEleve({ ...eleve, nom_elev: e.target.value })}
        placeholder="Nom"
      />
      <Input
        value={eleve.postnom_elev}
        onChange={(e) => setEleve({ ...eleve, postnom_elev: e.target.value })}
        placeholder="Postnom"
      />
      <Input
        value={eleve.prenom_elev}
        onChange={(e) => setEleve({ ...eleve, prenom_elev: e.target.value })}
        placeholder="Prénom"
      />

      <Button onClick={handleUpdate} className="mt-4">Mettre à jour</Button>
    </div>
  );
}
