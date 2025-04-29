import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createRendezVous, updateRendezVous } from '../../../services/rendezVous_api';
import { getAllPatients } from '../../../services/patients_api';
import { getAllPraticiens} from '../../../services/praticiens_api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../Container/ContainerRendezVous/ContainerRdv.css';

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
  idRdvParent?: string;
  statut: 'en_attente' | 'confirme' | 'annule';
  patientInfo?: {
    nom: string;
    prenom: string;
  };
  praticienInfo?: {
    nom: string;
    prenom: string;
  };
}

const AjoutRdv = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<RendezVous>({
    cinPatient: '',
    cinPraticien: '',
    dateHeure: '',
    idRdvParent: '',
    statut: 'en_attente'
  });
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [allPraticiens, setAllPraticiens] = useState<Praticien[]>([]);
  const [patientSearch, setPatientSearch] = useState('');
  const [patientResults, setPatientResults] = useState<Patient[]>([]);
  const [showPatientResults, setShowPatientResults] = useState(false);
  const [praticienSearch, setPraticienSearch] = useState('');
  const [praticienResults, setPraticienResults] = useState<Praticien[]>([]);
  const [showPraticienResults, setShowPraticienResults] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [patients, praticiens] = await Promise.all([
          getAllPatients(),
          getAllPraticiens()
        ]);
        setAllPatients(patients);
        setAllPraticiens(praticiens);
      } catch (error) {
        console.error("Erreur chargement données", error);
        toast.error("Erreur lors du chargement des données");
      }
    };
    loadData();

    if (location.state?.rdv) {
      setIsEditMode(true);
      const rdv = location.state.rdv as RendezVous;
      setFormData({
        cinPatient: rdv.cinPatient,
        cinPraticien: rdv.cinPraticien,
        dateHeure: rdv.dateHeure,
        idRdvParent: rdv.idRdvParent || '',
        statut: rdv.statut || 'en_attente'
      });
      if (rdv.patientInfo) {
        setPatientSearch(`${rdv.patientInfo.nom} ${rdv.patientInfo.prenom}`);
      }
      if (rdv.praticienInfo) {
        setPraticienSearch(`${rdv.praticienInfo.nom} ${rdv.praticienInfo.prenom}`);
      }
    }
  }, [location.state]);

  // Recherche locale des patients
  useEffect(() => {
    if (patientSearch.length > 1) {
      const results = allPatients.filter(patient =>
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
  }, [patientSearch, allPatients]);

  // Recherche locale des praticiens
  useEffect(() => {
    if (praticienSearch.length > 1) {
      const results = allPraticiens.filter(praticien =>
        praticien.nom.toLowerCase().includes(praticienSearch.toLowerCase()) ||
        praticien.prenom.toLowerCase().includes(praticienSearch.toLowerCase()) ||
        praticien.cinPraticien.toLowerCase().includes(praticienSearch.toLowerCase()) ||
        (praticien.specialite && praticien.specialite.toLowerCase().includes(praticienSearch.toLowerCase()))
      ).slice(0, 10);
      setPraticienResults(results);
      setShowPraticienResults(results.length > 0);
    } else {
      setPraticienResults([]);
      setShowPraticienResults(false);
    }
  }, [praticienSearch, allPraticiens]);

  const handlePatientSelect = (patient: Patient) => {
    setFormData(prev => ({
      ...prev,
      cinPatient: patient.cinPatient
    }));
    setPatientSearch(`${patient.nom} ${patient.prenom}`);
    setShowPatientResults(false);
  };

  const handlePraticienSelect = (praticien: Praticien) => {
    setFormData(prev => ({
      ...prev,
      cinPraticien: praticien.cinPraticien
    }));
    setPraticienSearch(`${praticien.nom} ${praticien.prenom}`);
    setShowPraticienResults(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
        idRdvParent: formData.idRdvParent || null
      };

      if (isEditMode && location.state?.rdv?.idRdv) {
        await updateRendezVous(location.state.rdv.idRdv, rdvData);
        toast.success('Rendez-vous modifié avec succès');
      } else {
        await createRendezVous(rdvData);
        toast.success('Rendez-vous créé avec succès');
      }
      
      setTimeout(() => navigate('/listRdv'), 1500);
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
    navigate(isEditMode ? '/listRdv' : '/ajoutRdv'); 
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
              <li><a className="active" href="/listRdv">Liste des rendez-vous</a></li>
              <li><i className='bx bx-chevron-right'></i></li>
              <li><a className="active" href="/ajoutRdv">
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
                        <label>Rechercher Patient</label>
                        <div className="patient-search-container">
                        <input
                            type="text"
                            value={patientSearch}
                            onChange={(e) => {
                            setPatientSearch(e.target.value);
                            // Si l'utilisateur efface le champ, réinitialiser le CIN
                            if (e.target.value === '') {
                                setFormData(prev => ({ ...prev, cinPatient: '' }));
                            }
                            }}
                            placeholder="Nom, prénom ou CIN du patient"
                            className="patient-search-input"
                        />
                        
                        {/* Champ caché pour la soumission */}
                        <input
                            name="cinPatient"
                            type="hidden"
                            value={formData.cinPatient}
                            required
                        />

                        {showPatientResults && patientResults.length > 0 && (
                            <div className="patient-results-dropdown">
                            {patientResults.map((patient) => (
                                <div
                                key={patient.cinPatient}
                                className="patient-result-item"
                                onClick={() => handlePatientSelect(patient)}
                                >
                                <span className="patient-cin">{patient.cinPatient}</span>
                                <span className="patient-name">{patient.nom} {patient.prenom}</span>
                                </div>
                            ))}
                            </div>
                        )}
                        </div>
                    </div>
                    <div className="input-field-div">
                        <label>Rechercher Praticien</label>
                        <div className="praticien-search-container">
                        <input
                            type="text"
                            value={praticienSearch}
                            onChange={(e) => {
                            setPraticienSearch(e.target.value);
                            // Si l'utilisateur efface le champ, réinitialiser le CIN
                            if (e.target.value === '') {
                                setFormData(prev => ({ ...prev, cinPraticien: '' }));
                            }
                            }}
                            placeholder="Nom, prénom, CIN ou spécialité"
                            className="praticien-search-input"
                        />
                        
                        {/* Champ caché pour la soumission */}
                        <input
                            name="cinPraticien"
                            type="hidden"
                            value={formData.cinPraticien}
                            required
                        />

                        {showPraticienResults && praticienResults.length > 0 && (
                            <div className="praticien-results-dropdown">
                            {praticienResults.map((praticien) => (
                                <div
                                key={praticien.cinPraticien}
                                className="praticien-result-item"
                                onClick={() => handlePraticienSelect(praticien)}
                                >
                                <span className="praticien-cin">{praticien.cinPraticien}</span>
                                <span className="praticien-name">{praticien.nom} {praticien.prenom}</span>
                                {praticien.specialite && (
                                    <span className="praticien-specialite">{praticien.specialite}</span>
                                )}
                                </div>
                            ))}
                            </div>
                        )}
                        </div>
                    </div>
                 </div>

                    <div className="fields">
                      <div className="input-field-div">
                        <label>Date et heure</label>                                                
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

                    <div className="fields">
                      <div className="input-field-div">
                        <label>Rendez-vous parent (optionnel)</label>
                        <input 
                          name="idRdvParent" 
                          type="text" 
                          placeholder="ID du rendez-vous parent" 
                          value={formData.idRdvParent}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="fields">
                      <button 
                        type="submit" 
                        className={`nextBtn ${isEditMode ? 'edit-btn' : 'add-btn'}`}
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

export default AjoutRdv;