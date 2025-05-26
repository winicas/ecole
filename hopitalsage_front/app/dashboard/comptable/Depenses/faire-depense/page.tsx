'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import SidebarComptable from '@/components/SidebarComptable'
import HeaderComptable from '@/components/HeaderComptable'

interface Fournisseur {
  id: number
  nom: string
}

interface AchatFourniture {
  fourniture: string
  quantite: number
  date_achat: string
  fournisseur: number
  numero_facture?: string
  commentaire?: string
  montant_achat: string
}

export default function AchatFourniturePage() {
  const [formData, setFormData] = useState<AchatFourniture>({
    fourniture: '',
    quantite: 0,
    date_achat: '',
    fournisseur: 0,
    numero_facture: '',
    commentaire: '',
    montant_achat: '',
  })
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([])
  const [ecoleId, setEcoleId] = useState<number>(1) // à ajuster si besoin

  useEffect(() => {
    fetchFournisseurs()
  }, [])

  const fetchFournisseurs = async () => {
    const token = localStorage.getItem("accessToken")
    try {
      const response = await axios.get('http://localhost:8000/api/fournisseurs/', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setFournisseurs(response.data)
    } catch (error) {
      console.error("Erreur lors du chargement des fournisseurs :", error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem("accessToken")
    try {
      await axios.post(
        'http://localhost:8000/api/achats-fournitures/',
        {
          ...formData,
          ecole: ecoleId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )
      alert("Achat enregistré avec succès !")
      setFormData({
        fourniture: '',
        quantite: 0,
        date_achat: '',
        fournisseur: 0,
        numero_facture: '',
        commentaire: '',
        montant_achat: '',
      })
    } catch (error: any) {
      console.error("Erreur lors de l’enregistrement de l'achat :", error.response?.data || error.message)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SidebarComptable />
      <div className="flex flex-col flex-grow">
        <HeaderComptable />
        <main className="p-8">
          <div className="bg-white shadow-lg rounded-xl p-6 max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-blue-600 mb-6 text-center">Nouvel Achat de Fourniture</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="fourniture"
                placeholder="Nom de la fourniture"
                value={formData.fourniture}
                onChange={handleChange}
                required
                className="border border-blue-400 rounded-lg px-4 py-2 w-full text-blue-700 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"

              />
              <input
                type="number"
                name="quantite"
                placeholder="Quantité"
                value={formData.quantite}
                onChange={handleChange}
                required
                className="border border-blue-400 rounded-lg px-4 py-2 w-full text-blue-700 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                name="date_achat"
                value={formData.date_achat}
                onChange={handleChange}
                required
                className="border border-blue-400 rounded-lg px-4 py-2 w-full text-blue-700 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"

              />
              <select
                name="fournisseur"
                value={formData.fournisseur}
                onChange={handleChange}
                required
                className="border border-blue-400 rounded-lg px-4 py-2 w-full text-blue-700 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"

              >
                <option value="">-- Sélectionner un fournisseur --</option>
                {fournisseurs.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.nom}
                  </option>
                ))}
              </select>
              <input
                type="text"
                name="numero_facture"
                placeholder="Numéro de facture (facultatif)"
                value={formData.numero_facture}
                onChange={handleChange}
                className="border border-blue-400 rounded-lg px-4 py-2 w-full text-blue-700 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"

              />
              <textarea
                name="commentaire"
                placeholder="Commentaire (facultatif)"
                value={formData.commentaire}
                onChange={handleChange}
                className="border border-blue-400 rounded-lg px-4 py-2 w-full text-blue-700 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"

              />
              <input
                type="number"
                step="0.01"
                name="montant_achat"
                placeholder="Montant de l'achat"
                value={formData.montant_achat}
                onChange={handleChange}
                required
                className="border border-blue-400 rounded-lg px-4 py-2 w-full text-blue-700 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"

              />
              <button
                type="submit"
                className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition duration-200"
              >
                Enregistrer l'achat
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}
