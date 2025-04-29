import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPrescription, updatePrescription, Prescription } from '../../../services/prscrires_api';
import { getAllConsultations, Consultation } from '../../../services/concultations_api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AjoutPrescrire = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<Omit<Prescription, 'idPrescrire'> & { idPrescrire?: number }>({
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
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    } catch {
      return '';
    }
  };

  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        const data = await getAllConsultations();
        setConsultations(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des consultations:', error);
        toast.error('Erreur lors du chargement des consultations');
      } finally {
        setLoading(false);
      }
    };

    fetchConsultations();

    // Vérifie si on est en mode édition
    if (location.state?.prescription) {
      setIsEditMode(true);
      setFormData({
        idPrescrire: location.state.prescription.idPrescrire,
        idConsult: location.state.prescription.idConsult,
        typePrescrire: location.state.prescription.typePrescrire,
        posologie: location.state.prescription.posologie,
        datePrescrire: formatDateForInput(location.state.prescription.datePrescrire)
      });
    }
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
      if (isEditMode && formData.idPrescrire) {
        await updatePrescription(formData.idPrescrire, formData);
        toast.success('Prescription modifiée avec succès');
      } else {
        await createPrescription(formData);
        toast.success('Prescription créée avec succès');
      }
      
      setTimeout(() => navigate('/listPrescrire'), 1500);
    } catch (error) {
      console.error('Erreur:', error);
      if (error instanceof Error) {
        toast.error(error.message || `Erreur lors de ${isEditMode ? 'la modification' : 'la création'} de la prescription`);
      } else {
        toast.error(`Erreur inattendue lors de ${isEditMode ? 'la modification' : 'la création'} de la prescription`);
      }
    }
  };

  const handleCancel = () => {
    if (isEditMode) {
      navigate('/listPrescrire');
    } else {
      setFormData({
        idConsult: 0,
        typePrescrire: '',
        posologie: '',
        datePrescrire: ''
      });
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Chargement des consultations...</p>
      </div>
    );
  }

  return (
    <section id="content">
      <main>
        <div className="head-title">
          <div className="left">
            <h1 className='h1' style={{ color: '#bdb9b9' }}>{isEditMode ? 'Modifier une prescription' : 'Nouvelle prescription'}</h1>
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
                      <div className="input-field-div">
                        <input
                          name="idPrescrire"
                          type="hidden"
                          value={formData.idPrescrire}
                          readOnly
                        />
                      </div>
                    )}

                    <div className="input-field-div">
                      <label>Consultation</label>
                      <select
                        name="idConsult"
                        value={formData.idConsult}
                        onChange={handleChange}
                        required
                        className="select-consultation"
                      >
                        <option value="">Sélectionnez une consultation</option>
                        {consultations.map(consult => {
                          const dateFormatee = consult.dateConsult 
                            ? new Date(consult.dateConsult).toLocaleDateString('fr-FR') 
                            : 'Date inconnue';
                          
                          const patientInfo = consult.nomPatient || `Patient ${consult.cinPatient}`;

                          return (
                            <option key={consult.idConsult} value={consult.idConsult}>
                              Consultation du {patientInfo} le {dateFormatee}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div className="input-field-div">
                      <label>Type de prescription</label>
                      <input
                        name="typePrescrire"
                        type="text"
                        value={formData.typePrescrire}
                        onChange={handleChange}
                        placeholder="Type de prescription"
                        required
                      />
                    </div>

                    <div className="input-field-div">
                      <label>Posologie</label>
                      <input
                        name="posologie"
                        type="text"
                        value={formData.posologie}
                        onChange={handleChange}
                        placeholder="Posologie"
                        required
                      />
                    </div>

                    <div className="input-field-div">
                      <label>Date de prescription</label>
                      <input
                        name="datePrescrire"
                        type="date"
                        value={formData.datePrescrire}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="fields">
                     <button type="submit"  className={`nextBtn ${isEditMode ? 'edit-btn' : 'add-btn'}`}>
                     <i className={`bx ${isEditMode ? 'bxs-download' : 'bx-send'}`}></i> &nbsp; &nbsp;
                     <span className="btnText">{isEditMode ? 'ENREGISTRER' : 'ENVOYER'}</span>
                      </button>
                      <button 
                        type="button" 
                        className="nextBtn" 
                        onClick={handleCancel}
                        id='btnAnnuler'
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

export default AjoutPrescrire;