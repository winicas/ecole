'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import SidebarComptable from '@/components/SidebarComptable'
import HeaderComptable from '@/components/HeaderComptable'

interface Ecole {
  id: number;
  nom: string;
  adresse: string;
  telephone: string | null;
}

interface Fournisseur {
  id: number
  nom: string
  contact?: string
  adresse?: string
  ecole?: number
}

export default function FournisseurPage() {
  const [formFournisseur, setFormFournisseur] = useState<Fournisseur>({
    id: 0,
    nom: '',
    contact: '',
    adresse: '',
    ecole: undefined,
  })
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([])
  const [ecoleId, setEcoleId] = useState<number>(1)
  const [ecole, setEcole] = useState<Ecole | null>(null);
    const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchFournisseurs()
  }, [])

  const fetchFournisseurs = async () => {
    const token = localStorage.getItem("accessToken")
    try {
      const response = await axios.get('${process.env.NEXT_PUBLIC_API_URL}/api/fournisseurs/', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setFournisseurs(response.data)
    } catch (error) {
      console.error("Erreur lors du chargement des fournisseurs :", error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormFournisseur(prev => ({ ...prev, [name]: value }))
  }

  const submitFournisseur = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem("accessToken")
    if (!token) {
      console.error("Token d'authentification manquant.")
      return
    }

    try {
      await axios.post(
        'http://localhost:8000/api/fournisseurs/',
        {
          ...formFournisseur,
          ecole: ecoleId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )
      fetchFournisseurs()
      setFormFournisseur({ id: 0, nom: '', contact: '', adresse: '', ecole: undefined })
    } catch (error: any) {
      console.error("Erreur lors de l’enregistrement du fournisseur :", error.response?.data || error.message)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SidebarComptable />
      <div className="flex flex-col flex-grow">
        <HeaderComptable ecole={ecole} user={user} />

        <main className="p-8">
          <div className="bg-white shadow-lg rounded-xl p-6 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-blue-600 mb-6 text-center">Ajouter un Fournisseur</h1>
            <form onSubmit={submitFournisseur} className="space-y-4">
              <input
                type="text"
                name="nom"
                placeholder="Nom"
                value={formFournisseur.nom}
                onChange={handleChange}
                className="border border-blue-400 rounded-lg px-4 py-2 w-full text-blue-600 placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
              <input
                type="text"
                name="contact"
                placeholder="Contact"
                value={formFournisseur.contact}
                onChange={handleChange}
                className="border border-blue-400 rounded-lg px-4 py-2 w-full text-blue-600 placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="text"
                name="adresse"
                placeholder="Adresse"
                value={formFournisseur.adresse}
                onChange={handleChange}
                className="border border-blue-400 rounded-lg px-4 py-2 w-full text-blue-600 placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition duration-200"
              >
                Enregistrer le Fournisseur
              </button>
            </form>
          </div>

          <div className="mt-10 max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold text-blue-700 mb-4">Fournisseurs enregistrés</h2>
            <ul className="space-y-2">
              {fournisseurs.map(f => (
                <li key={f.id} className="bg-white rounded-lg shadow p-4">
                  <p className="text-blue-600 font-bold">{f.nom}</p>
                  <p className="text-sm text-blue-500">Contact : {f.contact || 'Non renseigné'}</p>
                  <p className="text-sm text-blue-500">Adresse : {f.adresse || 'Non renseignée'}</p>
                </li>
              ))}
            </ul>
          </div>
        </main>
      </div>
    </div>
  )
}
