import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPrescription, updatePrescription, Prescription } from '../../../services/prscrires_api';
import { getAllAvailableConsultations, Consultation } from '../../../services/concultations_api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AjoutPrescrire = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    idPrescrire: 0,
    idConsult: 0,
    typePrescrire: '',
    posologie: '',
    datePrescrire: new Date().toISOString().split('T')[0]
  });
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const pad = (num: number) => num.toString().padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    } catch {
      return '';
    }
  };

 
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Récupère toutes les consultations disponibles (y compris celle déjà prescrite)
        let availableConsultations = await getAllAvailableConsultations();

        if (availableConsultations.length === 0) {
          toast.warn(
            isEditMode 
              ? "Aucune autre consultation disponible" 
              : "Aucune consultation disponible sans prescription",
            { autoClose: 5000 }
          );
        }
  
        if (location.state?.prescription) {
          const { prescription } = location.state;
          setIsEditMode(true);
  
          setFormData({
            idPrescrire: prescription.idPrescrire,
            idConsult: prescription.idConsult, // Conserve la consultation actuelle
            typePrescrire: prescription.typePrescrire,
            posologie: prescription.posologie,
            datePrescrire: formatDateForInput(prescription.datePrescrire)
          });
  
          // 2. Ajoute la consultation actuelle si elle n'est pas déjà dans la liste
          if (!availableConsultations.some(c => c.idConsult === prescription.idConsult)) {
            availableConsultations = [{
              idConsult: prescription.idConsult,
              dateConsult: prescription.dateConsult,
              dateHeure: '',
              idRdv: 0,
              compteRendu: '',
              prenomPatient: prescription.prenomPatient, // Ajouté
              prenomPraticien: prescription.prenomPraticien // Ajouté
            }, 
            ...availableConsultations]
          };
        }
  
        setConsultations(availableConsultations);
        
      } catch (error) {
        console.error('Erreur:', error);
        toast.error('Erreur lors du chargement des consultations');
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [location.state]);



  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'idConsult' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.idConsult || !formData.typePrescrire || !formData.posologie || !formData.datePrescrire) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
  
    try {
      const prescriptionData: Prescription = {
        idPrescrire: formData.idPrescrire || 0, // 0 pour les nouvelles prescriptions
        idConsult: formData.idConsult,
        typePrescrire: formData.typePrescrire,
        posologie: formData.posologie,
        datePrescrire: formData.datePrescrire
      };
  
      if (isEditMode && formData.idPrescrire) {
        await updatePrescription(formData.idPrescrire, prescriptionData);
        toast.success('Prescription modifiée avec succès');
      } else {
        await createPrescription(prescriptionData);
        toast.success('Prescription créée avec succès');
      }
      
      setTimeout(() => navigate('/listPrescrire'), 1500);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(`${isEditMode ? 'La date de prescription ne peut pas être antérieure à la date de consultation' : 'La date de prescription ne peut pas être antérieure à la date de consultation'}`);
    }
  };

  const handleCancel = () => {
    navigate('/listPrescrire');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Chargement des consultations disponibles...</p>
      </div>
    );
  }

  return (
    <section id="content">
      <main>
        <div className="head-title">
          <div className="left">
            <h1>{isEditMode ? 'Modifier une prescription' : 'Nouvelle prescription'}</h1>
            <ul className="breadcrumb">
              <li><a href="#">Prescrire</a></li>
              <li><i className='bx bx-chevron-right'></i></li>
              <li><a className="active" href="/listPrescrire">Liste des prescriptions</a></li>
              <li><i className='bx bx-chevron-right'></i></li>
              <li><a className="active" href="/ajoutPrescrire">
                {isEditMode ? 'Modification' : 'Nouvelle prescription'}
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
                    <span className="title">{isEditMode ? 'Modifier la prescription' : 'Ajouter une nouvelle prescription'}</span>

                    {isEditMode && (
                      <input type="hidden"
                       name="idPrescrire" 
                       readOnly
                       value={formData.idPrescrire} />
                    )}

                    <div className="input-field-div">
                      <label>Consultation <span className="required">*</span></label>
                      <select
                        name="idConsult"
                        value={formData.idConsult || ''}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            idConsult: Number(e.target.value)
                          });
                        }}
                        required
                        className="select-consultation"
                        disabled={consultations.length === 0} // Toujours modifiable sauf si aucune consultation disponible
                      >
                        {consultations.length === 0 ? (
                          <option value="">Aucune consultation disponible</option>
                        ) : (
                          <>
                            <option value="">Sélectionnez une consultation</option>
                            {consultations.map(consult => {
                              const dateFormatee = consult.dateConsult 
                                ? new Date(consult.dateConsult).toLocaleString('fr-FR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })
                                : 'Date inconnue';
                              
                                const patientNom = consult.prenomPatient;
                                const praticienNom = consult.prenomPraticien;

                              return (
                                <option 
                                  key={`consult-${consult.idConsult}`}
                                  value={consult.idConsult}
                                >
                                  Consultation du &nbsp; {`${patientNom} avec  Dr. ${praticienNom} le  ${dateFormatee}`}
                                </option>
                              );
                            })}
                          </>
                        )}
                      </select>
                    </div>

                    <div className="input-field-div">
                      <label>Type de prescription <span className="required">*</span></label>
                      <input
                        name="typePrescrire"
                        type="text"
                        value={formData.typePrescrire}
                        onChange={handleChange}
                        placeholder="Ex: Médicament, Examen, etc."
                        required
                      />
                    </div>

                    <div className="input-field-div">
                      <label>Posologie <span className="required">*</span></label>
                      <textarea
                        name="posologie"
                        value={formData.posologie}
                        onChange={handleChange}
                        placeholder="Détails de la posologie"
                        required
                        rows={3}
                      />
                    </div>

                    <div className="input-field-div">
                      <label>Date de prescription <span className="required">*</span></label>
                      <input
                        name="datePrescrire"
                        type="datetime-local"
                        value={formData.datePrescrire}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            datePrescrire: e.target.value 
                          });
                        }}
                        required
                      />
                    </div>

                    <div className="fields">
                      <button 
                        type="submit"  
                        className={`nextBtn ${isEditMode ? 'modif-btn' : 'add-btn'}`}
                      >
                        <i className={`bx ${isEditMode ? 'bxs-download' : 'bx-send'}`}></i>
                        <span>{isEditMode ? 'ENREGISTRER' : 'ENVOYER'}</span>
                      </button>
                      <button 
                        type="button" 
                        className="nextBtn" 
                        onClick={handleCancel}
                        id='btnAnnuler'
                      >
                        <i className='bx bxs-x-circle'></i>
                        <span>ANNULER</span>
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

export default AjoutPrescrire;