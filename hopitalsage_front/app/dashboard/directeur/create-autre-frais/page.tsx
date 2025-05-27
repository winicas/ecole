'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import SidebarDirecteur from '@/components/SidebarDirecteur'
import HeaderComptable from '@/components/HeaderComptable'


interface Ecole {
  id: number;
  nom: string;
  adresse: string;
  telephone: string | null;
}
export default function AutresFraisPage() {
  const [formData, setFormData] = useState({ nom: '', montant_total_a_payer: '' })
  const [autresFrais, setAutresFrais] = useState([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [ecole, setEcole] = useState<Ecole | null>(null);
    const [user, setUser] = useState<any>(null);
  
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const fetchAutresFrais = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const res = await axios.get('http://localhost:8000/api/autres-frais/', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setAutresFrais(res.data)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchAutresFrais()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccessMessage('')

    try {
      const token = localStorage.getItem('accessToken')
      const url = editingId
        ? `http://localhost:8000/api/autres-frais/${editingId}/`
        : 'http://localhost:8000/api/autres-frais/'
      const method = editingId ? 'put' : 'post'

      await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      })

      setSuccessMessage(editingId ? '✅ Frais modifié avec succès !' : '✅ Frais ajouté avec succès !')
      setFormData({ nom: '', montant_total_a_payer: '' })
      setEditingId(null)
      fetchAutresFrais()
    } catch (error) {
      console.error(error)
      alert('❌ Erreur lors de l’enregistrement.')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (frais: any) => {
    setFormData({ nom: frais.nom, montant_total_a_payer: frais.montant_total_a_payer })
    setEditingId(frais.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <SidebarDirecteur />
      <div className="flex-1 flex flex-col">
        <HeaderComptable ecole={ecole} user={user} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-6 space-y-6">
            <h1 className="text-2xl font-bold text-blue-900">
              {editingId ? 'Modifier le type de frais' : 'Ajouter un autre type de frais'}
            </h1>

            {successMessage && (
              <div className="p-4 bg-green-100 text-blue-900 rounded-xl text-sm font-medium">
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-blue-900">
              <div>
                <label className="block text-sm font-medium">Nom du frais</label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: Frais d'inscription"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Montant total</label>
                <input
                  type="number"
                  name="montant_total_a_payer"
                  value={formData.montant_total_a_payer}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: 10000"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 px-4 rounded-xl text-white font-semibold shadow ${
                  loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? 'Enregistrement...' : editingId ? 'Mettre à jour' : 'Valider'}
              </button>
            </form>
          </div>

          {/* Tableau responsive */}
          <div className="mt-10 max-w-4xl mx-auto bg-white shadow rounded-2xl overflow-x-auto">
            <table className="min-w-full table-auto text-sm text-blue-900">
              <thead className="bg-blue-100 text-left">
                <tr>
                  <th className="px-4 py-2">#</th>
                  <th className="px-4 py-2">Nom</th>
                  <th className="px-4 py-2">Montant</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {autresFrais.map((frais: any, index) => (
                  <tr key={frais.id} className="border-b">
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2">{frais.nom}</td>
                    <td className="px-4 py-2">{frais.montant_total_a_payer.toLocaleString()} FC</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleEdit(frais)}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Modifier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  )
}
