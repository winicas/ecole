"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ModalInscriptionEleve from "@/components/ModalInscriptionEleve";

interface Eleve {
  id: number;
  nom: string;
  postnom: string;
  prenom: string;
}

export default function Page() {
  const { eleveid } = useParams();
  const router = useRouter();
  const [eleve, setEleve] = useState<Eleve | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchEleve = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");

        const res = await fetch(`http://localhost:8000/api/eleves/${eleveid}/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (res.ok) {
          const data = await res.json();
          setEleve(data);
          setShowModal(true);
        } else {
          console.error("Erreur API:", res.statusText);
        }
      } catch (err) {
        console.error("Erreur lors du chargement de l'élève:", err);
      }
    };

    if (eleveid) {
      fetchEleve();
    }
  }, [eleveid]);

  const handleClose = () => {
    setShowModal(false);
    router.push("/dashboard/comptable");
  };

  return (
    <div>
      {showModal && eleve && (
        <ModalInscriptionEleve
          eleve={eleve}
          onClose={handleClose}
          refreshInscriptions={() => {}}
        />
      )}
    </div>
  );
}
