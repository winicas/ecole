import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://localhost:8000/api/anneescolaires/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Erreur lors du chargement des années scolaires" },
        { status: res.status }
      );
    }

    const data = await res.json();
    const activeAnnee = data.find((a: any) => a.active === true);

    if (!activeAnnee) {
      return NextResponse.json(
        { error: "Aucune année scolaire active trouvée." },
        { status: 404 }
      );
    }

    return NextResponse.json({ nom: activeAnnee.nom });
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json({ error: "Erreur réseau." }, { status: 500 });
  }
}
