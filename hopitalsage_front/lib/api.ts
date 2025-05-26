// lib/api.ts

export async function getEcole(id: number, accessToken: string) {
  const res = await fetch(`http://localhost:8000/api/ecoles/${id}/`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
    next: { revalidate: 0 }, // Pour forcer une requête côté client si nécessaire (Next.js 13+)
  });

  if (!res.ok) {
    throw new Error('Échec de récupération de l’école');
  }

  return await res.json();
}
