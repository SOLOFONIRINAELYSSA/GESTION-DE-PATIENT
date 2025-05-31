import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createRendezVous, updateRendezVous, RendezVousAvecExamens, getRendezVousAvecExamens } from '../../../services/rendezVous_api';
import { getAllPatients } from '../../../services/patients_api';
import { getAllPraticiens } from '../../../services/praticiens_api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../Container/ContainerRendezVous/ContainerRdv.css';
import './ajoutRdvExamen.css';

interface Patient {
  cinPatient: string;
  nom: string;
  prenom: string;
}

interface Praticien {
  cinPraticien: string;
  nom: string;
  prenom: string;
  specialite?: string;
}

interface RendezVous {
  idRdv?: number;
  cinPatient: string;
  cinPraticien: string;
  dateHeure: string;
  idRdvParent: string | null;
  statut: 'en_attente' | 'confirme' | 'annule';
  patientInfo?: {
    nom: string;
    prenom: string;
  };
  praticienInfo?: {
    nom: string;
    prenom: string;
    specialite?: string;
  };
   praticienParentInfo?: { 
    nom: string;
    prenom: string;
    specialite?: string;
  };
}

const AjoutRdvExamen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<RendezVous>({
    cinPatient: '',
    cinPraticien: '',
    dateHeure: '',
    idRdvParent: null,
    statut: 'en_attente',
  });
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [allPraticiens, setAllPraticiens] = useState<Praticien[]>([]);
  const [patientSearch, setPatientSearch] = useState('');
  const [patientResults, setPatientResults] = useState<Patient[]>([]);
  const [showPatientResults, setShowPatientResults] = useState(false);
  const [praticienSearch, setPraticienSearch] = useState('');
  const [praticienParentSearch, setPraticienParentSearch] = useState('');
  const [praticienParentResults, setPraticienParentResults] = useState<Praticien[]>([]);
  const [showPraticienParentResults, setShowPraticienParentResults] = useState(false);
   const [rdvAvecExamens, setRdvAvecExamens] = useState<RendezVousAvecExamens[]>([]);
  const [selectedPatientRdv, setSelectedPatientRdv] = useState<RendezVousAvecExamens[]>([]);

  const getFullName = (entity: Patient | Praticien | null | undefined): string => {
    if (!entity) return '';
    return `${entity.nom} ${entity.prenom}`;
  };

  useEffect(() => {
    const loadRdvExamens = async () => {
      try {
        const data = await getRendezVousAvecExamens();
        setRdvAvecExamens(data);
      } catch (error) {
        console.error("Erreur chargement rdv examens", error);
      }
    };
    loadRdvExamens();
  }, []);

  useEffect(() => {
  const loadData = async () => {
    try {
      const [patients, praticiens] = await Promise.all([
        getAllPatients(),
        getAllPraticiens()
      ]);
      setAllPatients(patients);
      setAllPraticiens(praticiens);

      if (location.state?.rdv) {
        const rdv = location.state.rdv as RendezVous;
        setIsEditMode(true);
        
        // Initialiser formData avec toutes les infos
        setFormData({
          idRdv: rdv.idRdv,
          cinPatient: rdv.cinPatient,
          cinPraticien: rdv.cinPraticien,
          dateHeure: rdv.dateHeure,
          idRdvParent: rdv.idRdvParent || null,
          statut: rdv.statut || 'en_attente',
          patientInfo: rdv.patientInfo,
          praticienInfo: rdv.praticienInfo,
          praticienParentInfo: rdv.praticienParentInfo // Ajoutez cette ligne
        });

        // Initialiser les champs de recherche
        const currentPatient = patients.find(p => p.cinPatient === rdv.cinPatient);
        const currentPraticien = praticiens.find(p => p.cinPraticien === rdv.cinPraticien);
        const currentPraticienParent = rdv.idRdvParent 
          ? praticiens.find(p => p.cinPraticien === rdv.idRdvParent)
          : null;

        setPatientSearch(getFullName(currentPatient));
        setPraticienSearch(getFullName(currentPraticien));
        setPraticienParentSearch(getFullName(currentPraticienParent));
      }
    } catch (error) {
      console.error("Erreur chargement données", error);
      toast.error("Erreur lors du chargement des données");
    }
  };
  loadData();
}, [location.state]);
  
 useEffect(() => {
  if (patientSearch.length > 1) {
    // Filtrer les patients qui ont des examens dans rdvAvecExamens
    const patientsAvecExamens = allPatients.filter(patient => 
      rdvAvecExamens.some(rdv => rdv.cinPatient === patient.cinPatient)
    );

    // Ensuite filtrer parmi ces patients selon la recherche
    const results = patientsAvecExamens.filter(patient =>
      patient.nom.toLowerCase().includes(patientSearch.toLowerCase()) ||
      patient.prenom.toLowerCase().includes(patientSearch.toLowerCase()) ||
      patient.cinPatient.toLowerCase().includes(patientSearch.toLowerCase())
    ).slice(0, 10);
    
    setPatientResults(results);
    setShowPatientResults(results.length > 0);
  } else {
    setPatientResults([]);
    setShowPatientResults(false);
  }
}, [patientSearch, allPatients, rdvAvecExamens]);

  // Recherche des praticiens référents
  const searchPraticienParents = (searchTerm: string) => {
    if (searchTerm.length < 1) {
      setPraticienParentResults([]);
      setShowPraticienParentResults(false);
      return;
    }

    const results = allPraticiens.filter(praticien =>
      (praticien.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
       praticien.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
       praticien.cinPraticien.toLowerCase().includes(searchTerm.toLowerCase())) &&
      praticien.cinPraticien !== formData.cinPraticien
    ).slice(0, 10);

    setPraticienParentResults(results);
    setShowPraticienParentResults(results.length > 0);
  };

 const handlePatientSelect = (patient: Patient) => {
    // Trouver tous les rendez-vous avec examens pour ce patient
    const rdvsPatient = rdvAvecExamens.filter(rdv => rdv.cinPatient === patient.cinPatient);
    setSelectedPatientRdv(rdvsPatient);

    // Trouver le praticien le plus récent
    const dernierRdv = [...rdvsPatient].sort((a, b) => 
      new Date(b.dateHeure).getTime() - new Date(a.dateHeure).getTime()
    )[0];

    setFormData(prev => ({
      ...prev,
      cinPatient: patient.cinPatient,
      cinPraticien: dernierRdv?.cinPraticien || '',
      patientInfo: {
        nom: patient.nom,
        prenom: patient.prenom
      },
      praticienInfo: dernierRdv ? {
        nom: dernierRdv.prenomPraticien || '',
        prenom: dernierRdv.prenomPraticien || ''
      } : undefined
    }));

    setPatientSearch(`${patient.nom} ${patient.prenom}`);
    setShowPatientResults(false);

    // Mettre à jour la recherche du praticien si un praticien est trouvé
    if (dernierRdv) {
      const praticien = allPraticiens.find(p => p.cinPraticien === dernierRdv.cinPraticien);
      if (praticien) {
        setPraticienSearch(`${praticien.nom} ${praticien.prenom}`);
      }
    }
  };



 const handlePraticienParentSelect = (praticien: Praticien) => {
  if (praticien.cinPraticien === formData.cinPraticien) {
    toast.warning("Un praticien ne peut pas être son propre référent");
    return;
  }

  setFormData(prev => ({
    ...prev,
    idRdvParent: praticien.cinPraticien,
    praticienParentInfo: {  // Ajoutez ces informations
      nom: praticien.nom,
      prenom: praticien.prenom,
      ...(praticien.specialite && { specialite: praticien.specialite })
    }
  }));
  setPraticienParentSearch(`${praticien.nom} ${praticien.prenom}`);
  setShowPraticienParentResults(false);
};

  const handleDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    setFormData(prev => ({
      ...prev,
      dateHeure: date.toISOString()
    }));
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!formData.cinPatient || !formData.cinPraticien || !formData.dateHeure) {
    toast.error('Veuillez remplir tous les champs obligatoires');
    return;
  }

  try {
    const rdvData = {
      ...formData,
      idRdvParent: formData.idRdvParent || null,
      // N'incluez pas praticienParentInfo dans les données envoyées au backend
      praticienParentInfo: undefined
    };

    if (isEditMode && formData.idRdv) {
      await updateRendezVous(formData.idRdv, rdvData);
      toast.success('Rendez-vous modifié avec succès');
    } else {
      await createRendezVous(rdvData);
      toast.success('Rendez-vous créé avec succès');
    }
    
    setTimeout(() => navigate('/listRdvExamen'), 1500);
  } catch (error) {
    console.error('Erreur:', error);
    if (error instanceof Error) {
      toast.error(error.message || 
        `Erreur lors de ${isEditMode ? 'la modification' : 'la création'} du rendez-vous`);
    } else {
      toast.error(`Erreur inattendue lors de ${isEditMode ? 'la modification' : 'la création'} du rendez-vous`);
    }
  }
};

  const handleCancel = () => {
    navigate(isEditMode ? '/listRdvExamen' : '/ajoutRdvExamen'); 
  };

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  return (
    <section id="content">
      <main>
        <div className="head-title">
          <div className="left">
            <h1 className='h1' style={{ color: '#bdb9b9' }}>Prendre un rendez-vous! <i className='bx bx-happy'></i> </h1>
            <ul className="breadcrumb">
              <li><a href="#">Rendez-vous</a></li>
              <li><i className='bx bx-chevron-right'></i></li>
              <li><a className="active" href="/listRdvExamen">Liste des rendez-vous</a></li>
              <li><i className='bx bx-chevron-right'></i></li>
              <li><a className="active" href="/ajoutRdvExamen">
                {isEditMode ? 'Modification de rendez-vous' : 'Nouveau rendez-vous'}
              </a></li>
            </ul>
          </div>
        </div>

        <div className="table-date">
          <div className="orber">
            <div className="form-conge">
              <form onSubmit={handleSubmit}>
                <div className="form first">
                  <div className="details personal">
                    <span className="title">{isEditMode ? 'Modifier un rendez-vous' : 'Prendre un rendez-vous'}</span>

                    <div className="fields">
                      <div className="input-field-div">
                        <label>Rechercher Patient <span className="required">*</span></label>
                        
                         <div className="patient-search-container">
                            <input
                            type="text"
                            value={patientSearch}
                            onChange={(e) => {
                                setPatientSearch(e.target.value);
                                if (e.target.value === '') {
                                setFormData(prev => ({ ...prev, cinPatient: '' }));
                                setSelectedPatientRdv([]);
                                }
                            }}
                            placeholder="Nom, prénom ou CIN du patient"
                            className="patient-search-input"
                            required
                            />

                            {showPatientResults && patientResults.length > 0 && (
                            <div className="patient-results-dropdown">
                                {patientResults.map((patient) => {
                                const rdvsPatient = rdvAvecExamens.filter(rdv => rdv.cinPatient === patient.cinPatient);
                                return (
                                    <div
                                    key={patient.cinPatient}
                                    className="patient-result-item"
                                    onClick={() => handlePatientSelect(patient)}
                                    >
                                    <span className="patient-cin">{patient.cinPatient}</span>
                                    <span className="patient-name">{patient.nom} {patient.prenom}</span>
                                    {rdvsPatient.length > 0 && (
                                        <div className="patient-examens-info">
                                        <span>{rdvsPatient.length} examen(s)</span>
                                        <span>Dernier: {rdvsPatient[0]?.typeExamen}</span>
                                        </div>
                                    )}
                                    </div>
                                );
                                })}
                            </div>
                            )}
                         </div>
                      </div>
                       <div className="input-field-div">
                        <label>Praticien <span className="required">*</span></label>
                        <input
                        type="text"
                        value={praticienSearch}
                        readOnly
                        className="praticien-search-input readonly"
                        placeholder="Sélectionnez d'abord un patient"
                        required
                        />
                        {formData.cinPraticien && (
                        <div className="praticien-details">
                            <span>Spécialité: {formData.praticienInfo?.specialite || 'Non spécifiée'}</span>
                        </div>
                        )}
                        </div>
                    </div>

                    <div className="fields">
                      <div className="input-field-div">
                        <label>Date et heure <span className="required">*</span></label>                                                
                        <input 
                          name="dateHeure" 
                          type="datetime-local" 
                          value={formatDateForInput(formData.dateHeure)}
                          onChange={handleDateTimeChange}
                          required 
                        />
                      </div>
                      <div className="input-field-div">
                        <label>Statut</label>
                          <input 
                            type="text"
                            value="En attente"
                            readOnly
                            className="status-input pending"
                          />
                      </div>
                    </div>

                    {/* <div className="input-field-div">
                      <label>Praticien référent (optionnel)</label>
                      <div className="praticien-search-container">
                        <input
                          type="text"
                          value={praticienParentSearch}
                          onChange={(e) => {
                            setPraticienParentSearch(e.target.value);
                            searchPraticienParents(e.target.value);
                          }}
                          placeholder="Rechercher par CIN, nom ou spécialité"
                          className="praticien-parent-search-input"
                        />

                        {showPraticienParentResults && praticienParentResults.length > 0 && (
                          <div className="praticien-results-dropdown">
                            {praticienParentResults.map((praticien) => (
                              <div
                                key={praticien.cinPraticien}
                                className="praticien-result-item"
                                onClick={() => handlePraticienParentSelect(praticien)}
                              >
                                <div className="praticien-info-line">
                                <span className="praticien-cin">{praticien.cinPraticien}</span> &nbsp;
                                <span className="praticien-name">
                                  {praticien.nom} &nbsp; {praticien.prenom} &nbsp;
                                </span>
                                {praticien.specialite && (
                                  <span className="praticien-specialite">
                                    {praticien.specialite}
                                  </span>
                                )}
                              </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div> */}
                        <div className="input-field-div">
                        <label>Praticien référent (optionnel)</label>
                        <div className="praticien-search-container">
                            <input
                            type="text"
                            value={praticienParentSearch}
                            onChange={(e) => {
                                setPraticienParentSearch(e.target.value);
                                searchPraticienParents(e.target.value);
                            }}
                            placeholder="Rechercher par CIN, nom ou spécialité"
                            className="praticien-parent-search-input"
                            />

                            {showPraticienParentResults && praticienParentResults.length > 0 && (
                            <div className="praticien-results-dropdown">
                                {praticienParentResults.map((praticien) => (
                                <div
                                    key={praticien.cinPraticien}
                                    className="praticien-result-item"
                                    onClick={() => handlePraticienParentSelect(praticien)}
                                >
                                    <div className="praticien-info-line">
                                    <span className="praticien-cin">{praticien.cinPraticien}</span> &nbsp;
                                    <span className="praticien-name">
                                        {praticien.nom} &nbsp; {praticien.prenom} &nbsp;
                                    </span>
                                    {praticien.specialite && (
                                        <span className="praticien-specialite">
                                        {praticien.specialite}
                                        </span>
                                    )}
                                    </div>
                                </div>
                                ))}
                            </div>
                            )}
                        </div>
                        {formData.praticienParentInfo && (
                            <div className="praticien-details">
                            <span>Spécialité: {formData.praticienParentInfo.specialite || 'Non spécifiée'}</span>
                            </div>
                        )}
                        </div>
                    <div className="fields">
                      <button 
                        type="submit" 
                        className={`nextBtn ${isEditMode ? 'modif-btn' : 'add-btn'}`}
                      >
                         <i className={`bx ${isEditMode ? 'bxs-download' : 'bx-send'}`}></i> &nbsp; &nbsp;
                         <span className="btnText">{isEditMode ? 'ENREGISTRER' : 'ENVOYER'}</span>
                      </button>
                      <button 
                        type="button" 
                        className="nextBtn" 
                        id='btnAnnuler'
                        onClick={handleCancel}
                      >
                        <i className='bx bxs-x-circle'></i> &nbsp; &nbsp;
                        <span className="btnText">ANNULER</span>
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </section>
  );
};

export default AjoutRdvExamen;