'use client';

import { useEffect, useRef, useState } from 'react';
import SidebarComptable from '@/components/SidebarComptable';
import HeaderComptable from '@/components/HeaderComptable';
import { pdf } from '@react-pdf/renderer';
import CartePdf from '@/components/CartePDF';
import { convertImageToBase64 } from '@/utils/convertToBase64';

import axios from 'axios';
import QRCode from 'qrcode';

interface Eleve {
  id: number;
  nom_elev: string;
  postnom_elev: string;
  prenom_elev: string;
  option_elev: string;
  classe_elev: string;
  matricule_elev: string;
  lieu_naissance_elev: string; 
  date_naissance_elev: string; 
  adresses: string;
  sexe: string;
}


interface Ecole {
  id: number;
  nom: string;
  adresse: string;
  telephone: string | null;
  logo?: string | null;
}

export default function GenerateCartePage() {
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [filteredEleves, setFilteredEleves] = useState<Eleve[]>([]);
  const [selectedEleve, setSelectedEleve] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [uploadedLogo, setUploadedLogo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [ecole, setEcole] = useState<Ecole | null>(null);

  const [selectedOption, setSelectedOption] = useState('');
  const [selectedClasse, setSelectedClasse] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const selectedEleveData = eleves.find(el => el.id.toString() === selectedEleve);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    axios.get('https://ecole-h4ja.onrender.com/api/eleves/all/', {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => {
      setEleves(res.data);
      setFilteredEleves(res.data);
    }).catch(err => console.error('Erreur chargement élèves:', err));

    axios.get('https://ecole-h4ja.onrender.com/api/dashboard/comptable/', {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => {
      setEcole(res.data.ecole);
      if (res.data.ecole.logo) {
        setLogoUrl(`https://ecole-h4ja.onrender.com${res.data.ecole.logo}`);
      }
    }).catch(err => console.error('Erreur chargement école:', err));
  }, []);

  useEffect(() => {
    let result = eleves;
    if (selectedOption) {
      result = result.filter(e => e.option_elev === selectedOption);
    }
    if (selectedClasse) {
      result = result.filter(e => e.classe_elev === selectedClasse);
    }
    setFilteredEleves(result);
  }, [selectedOption, selectedClasse, eleves]);

  const generatePDF = async () => {
    if (!selectedEleveData || !ecole || !photo) return;

    setLoading(true);

    const photoUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(photo);
    });

    const qrCodeUrl = await QRCode.toDataURL(String(selectedEleveData.matricule_elev));

    let base64Logo: string | null = null;
    if (uploadedLogo) {
      base64Logo = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(uploadedLogo);
      });
    } else if (ecole.logo) {
      base64Logo = await convertImageToBase64(`https://ecole-h4ja.onrender.com${ecole.logo}`);
    }

    const blob = await pdf(
      <CartePdf
        eleve={selectedEleveData}
        ecole={{ ...ecole, logo: base64Logo }}
        photoUrl={photoUrl}
        qrCodeUrl={qrCodeUrl}
      />
    ).toBlob();

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Carte_${selectedEleveData.nom_elev}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    setLoading(false);
  };

  const handleSubmit = () => {
    if (!selectedEleve || !photo) {
      alert("Veuillez sélectionner un élève et importer une photo.");
      return;
    }
    generatePDF();
  };

  const optionsUniques = Array.from(
    new Set(eleves.map(e => e.option_elev?.trim()).filter(Boolean))
  );
  const classesUniques = Array.from(
    new Set(eleves.map(e => e.classe_elev?.trim()).filter(Boolean))
  );

  const previewLogoUrl = uploadedLogo
    ? URL.createObjectURL(uploadedLogo)
    : logoUrl;

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-zinc-950">
      <SidebarComptable userFullName="Comptable" />
      <div className="flex flex-col flex-1">
        <HeaderComptable ecole={ecole} />
        <main className="flex-1 p-6 space-y-6">
          <h2 className="text-3xl font-extrabold text-blue-800 dark:text-blue-400">
            🎓 Génération de carte scolaire
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-xl border border-blue-100 dark:border-zinc-700">
              <h3 className="text-xl font-semibold text-blue-700 dark:text-blue-300 mb-4">
                Remplir les informations
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      Option
                    </label>
                    <select
                      value={selectedOption}
                      onChange={e => setSelectedOption(e.target.value)}
                      className="w-full p-3 rounded-xl border dark:bg-zinc-700"
                    >
                      <option value="">Toutes les options</option>
                      {optionsUniques.map((opt, index) => (
                        <option key={index} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      Classe
                    </label>
                    <select
                      value={selectedClasse}
                      onChange={e => setSelectedClasse(e.target.value)}
                      className="w-full p-3 rounded-xl border dark:bg-zinc-700"
                    >
                      <option value="">Toutes les classes</option>
                      {classesUniques.map((cls, index) => (
                        <option key={index} value={cls}>{cls}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Sélection de l’élève
                  </label>
                  <select
                    onChange={e => setSelectedEleve(e.target.value)}
                    value={selectedEleve}
                    className="w-full p-3 rounded-xl border dark:bg-zinc-700"
                  >
                    <option value="">-- Choisir un élève --</option>
                    {filteredEleves.map(el => (
                      <option key={el.id} value={el.id}>
                        {el.nom_elev} {el.postnom_elev} {el.prenom_elev}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Importer une photo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => setPhoto(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-500 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-50 file:text-blue-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Importer le logo de l’école
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => setUploadedLogo(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-500 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-50 file:text-blue-700"
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`w-full py-3 mt-2 rounded-xl text-white font-bold transition ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  {loading ? 'Génération...' : '📄 Générer la carte (PDF)'}
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-800 p-4 rounded-2xl shadow-xl border border-blue-100 dark:border-zinc-700">
              <h3 className="text-xl font-semibold text-blue-700 dark:text-blue-300 mb-4">🪪 Aperçu carte</h3>
              {selectedEleveData ? (
                <div
                  ref={cardRef}
                  className="w-[340px] h-[210px] rounded-xl bg-white text-black font-sans text-[10px] overflow-hidden relative shadow-md border border-gray-300"
                >
                  {previewLogoUrl && (
                    <img
                      src={previewLogoUrl}
                      alt="Logo école"
                      className="absolute top-2 right-2 w-12 h-12 opacity-20"
                    />
                  )}
                  <div className="text-center text-[8px] font-bold leading-tight p-1 bg-gray-100 border-b border-gray-300">
                    <p>RÉPUBLIQUE DÉMOCRATIQUE DU CONGO</p>
                    <p>MINISTÈRE DE L’ENSEIGNEMENT PRIMAIRE, SECONDAIRE ET TECHNIQUE</p>
                  </div>
                  <div className="text-center font-bold text-[9px] bg-blue-600 text-white py-1">
                    {ecole?.nom || 'CARTE SCOLAIRE'}
                  </div>
                  <p className="text-center text-[8px] font-semibold text-blue-700 mt-1">
                    Carte Élève 2025-2026
                  </p>
                  <div className="flex px-2 pt-1">
                    <div className="w-20 h-24 border border-gray-400 overflow-hidden">
                      <img
                        src={photo ? URL.createObjectURL(photo) : '/placeholder.jpg'}
                        alt="Élève"
                        className="object-cover w-full h-full"
                      />
                    </div>
                   <div className="ml-2 flex-1 space-y-[1px]">
                    <p><strong>Nom:</strong> {selectedEleveData.nom_elev}</p>
                    <p><strong>Postnom:</strong> {selectedEleveData.postnom_elev}</p>
                    <p><strong>Prénom:</strong> {selectedEleveData.prenom_elev}</p>
                    <p><strong>Naissance:</strong> {selectedEleveData.lieu_naissance_elev}, {selectedEleveData.date_naissance_elev}</p>
                    <p><strong>Sexe:</strong> {selectedEleveData.sexe}</p>
                    <p><strong>Adresse:</strong> {selectedEleveData.adresses}</p>
                    <p><strong>Classe:</strong> {selectedEleveData.classe_elev}</p>
                    <p><strong>Option:</strong> {selectedEleveData.option_elev}</p>
                  </div>

                  </div>
                  <div className="absolute bottom-1 left-2 text-[7px] font-semibold text-gray-700">
                    <p>{ecole?.nom}</p>
                    <p>{ecole?.adresse}</p>
                    {ecole?.telephone && <p>📞 {ecole.telephone}</p>}
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 dark:text-gray-500 italic">Sélectionnez un élève...</p>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
