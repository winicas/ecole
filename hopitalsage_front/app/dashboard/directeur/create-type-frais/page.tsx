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

 

  const [ecole, setEcole] = useState<Ecole | null>(null);
  const [user, setUser] = useState<any>(null);

export default function CreateFraisPage() {
  const [formData, setFormData] = useState({
    option: '',
    classe: '',
    montant: '',
    description: '',
  })
  const [fraisList, setFraisList] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)

  const OPTIONS = [
    ['maternelle', 'Maternelle'],
    ['primaire', 'Primaire'],
    ['education_de_base', 'Éducation de Base'],
    ['humanite_pedagogie', 'Humanité Pédagogie'],
    ['humanite_litteraire', 'Humanité Littéraire'],
    ['humanite_commerciale_gestion', 'Humanité Commerciale et Gestion'],
    ['humanite_sciences', 'Humanité Sciences'],
    ['humanite_coupe_couture', 'Humanité Coupe et Couture'],
    ['humanite_mecanique', 'Humanité Mécanique'],
    ['humanite_hotellerie_restauration', 'Humanité Hôtellerie et Restauration'],
    ['humanite_electricite', 'Humanité Électricité'],
    ['electronique', 'Électronique'],
    ['mecanique', 'Mécanique'],
  ]

  const CLASSES = [
    ['1', '1'],
    ['2', '2'],
    ['3', '3'],
    ['4', '4'],
    ['5', '5'],
    ['6', '6'],
    ['7', '7'],
    ['8', '8'],
  ]

  const fetchFraisList = async () => {
    const token = localStorage.getItem('accessToken')
    const res = await axios.get('http://localhost:8000/api/type-frais-scolaire/', {
      headers: { Authorization: `Bearer ${token}` },
    })
    setFraisList(res.data)
  }

  useEffect(() => {
    fetchFraisList()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleEdit = (frais: any) => {
    setFormData({
      option: frais.option,
      classe: frais.classe,
      montant: frais.montant,
      description: frais.description,
    })
    setEditingId(frais.id)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccessMessage('')
    const token = localStorage.getItem('accessToken')

    try {
      if (!token) throw new Error('Token manquant')

      if (editingId) {
        await axios.put(`http://localhost:8000/api/type-frais-scolaire/${editingId}/`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
        setSuccessMessage('✅ Frais scolaire modifié avec succès !')
      } else {
        await axios.post('http://localhost:8000/api/type-frais-scolaire/', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
        setSuccessMessage('✅ Frais scolaire défini avec succès !')
      }

      setFormData({ option: '', classe: '', montant: '', description: '' })
      setEditingId(null)
      fetchFraisList()
    } catch (error: any) {
      console.error(error)
      alert('❌ Erreur lors de la soumission du formulaire.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <SidebarDirecteur />
      <div className="flex-1 flex flex-col">
        <HeaderComptable ecole={ecole} user={user} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white rounded-2xl shadow p-6">
              <h1 className="text-2xl font-bold text-blue-900 mb-4">
                {editingId ? 'Modifier un frais scolaire' : 'Définir les frais scolaires'}
              </h1>

              {successMessage && (
                <div className="p-4 bg-green-100 text-blue-900 rounded-xl text-sm font-medium mb-4">
                  {successMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-blue-900">
                <div>
                  <label className="block text-sm font-medium">Option</label>
                  <select
                    name="option"
                    value={formData.option}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">-- Sélectionner une option --</option>
                    {OPTIONS.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium">Classe</label>
                  <select
                    name="classe"
                    value={formData.classe}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">-- Sélectionner une classe --</option>
                    {CLASSES.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium">Montant</label>
                  <input
                    type="number"
                    name="montant"
                    value={formData.montant}
                    onChange={handleChange}
                    placeholder="Ex: 250000"
                    className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Ex: Frais annuels pour la classe X"
                    className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2 px-4 rounded-xl text-white font-semibold shadow ${
                      loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {loading ? 'Enregistrement...' : editingId ? 'Modifier' : 'Valider'}
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white rounded-2xl shadow p-6 mt-6">
              <h2 className="text-xl font-bold text-blue-900 mb-4">Frais définis</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto text-sm text-left text-blue-900">
                  <thead className="bg-blue-100">
                    <tr>
                      <th className="p-2">Option</th>
                      <th className="p-2">Classe</th>
                      <th className="p-2">Montant</th>
                      <th className="p-2">Description</th>
                      <th className="p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fraisList.map((frais) => (
                      <tr key={frais.id} className="border-t hover:bg-gray-50">
                        <td className="p-2">{frais.option}</td>
                        <td className="p-2">{frais.classe}</td>
                        <td className="p-2">{frais.montant}</td>
                        <td className="p-2">{frais.description}</td>
                        <td className="p-2">
                          <button
                            onClick={() => handleEdit(frais)}
                            className="text-blue-600 hover:underline font-medium"
                          >
                            Modifier
                          </button>
                        </td>
                      </tr>
                    ))}
                    {fraisList.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-gray-500">
                          Aucun frais défini pour l’instant.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
