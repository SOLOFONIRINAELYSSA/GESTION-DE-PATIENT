import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createConsultation, updateConsultation } from '../../../services/concultations_api';
import { getAllAvailableRendezVous, RendezVous } from '../../../services/rendezVous_api';
import { Consultation } from '../../../services/concultations_api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../ContainerConsultation/ContainerConsultation.css';

const AjoutConsultation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    idConsult: 0,
    idRdv: 0,
    dateConsult: '', 
    compteRendu: ''
  });
  const [rendezVousList, setRendezVousList] = useState<RendezVous[]>([]);
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

  // useEffect(() => {
  //   const fetchRendezVous = async () => {
  //     try {
  //       const data = await getAllRendezVous();
  //       setRendezVousList(data);
  //     } catch (error) {
  //       console.error('Erreur lors de la récupération des rendez-vous:', error);
  //       toast.error('Erreur lors du chargement des rendez-vous');
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  
  //   fetchRendezVous();
  
  //   if (location.state?.consultation) {
  //     setIsEditMode(true);
  //     const consultation = location.state.consultation;
  //     setFormData({
  //       idConsult: consultation.idConsult || 0,
  //       idRdv: consultation.idRdv || 0,
  //       dateConsult: formatDateForInput(consultation.dateConsult), 
  //       compteRendu: consultation.compteRendu || ''
  //     });
  //   }
  // }, [location.state]);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let availableRendezVous = await getAllAvailableRendezVous();

        if (availableRendezVous.length === 0) {
          toast.warn(
            isEditMode 
              ? "Ce rendez-vous a déjà une consultation" 
              : "Tous les rendez-vous ont une consultation associée",
            { autoClose: 5000 }
          );
        }
  
        if (location.state?.consultation) {
          const { consultation } = location.state;
          setIsEditMode(true);
  
          setFormData({
            idConsult: consultation.idConsult || 0,
            idRdv: consultation.idRdv || 0,
            dateConsult: consultation.dateConsult 
              ? formatDateForInput(consultation.dateConsult) 
              : '',
            compteRendu: consultation.compteRendu || ''
          });
  
          // Ajout du RDV actuel si manquant (pour le select seulement)
          if (consultation.idRdv && !availableRendezVous.some(rdv => rdv.idRdv === consultation.idRdv)) {
            availableRendezVous = [
              {
                idRdv: consultation.idRdv,
                dateHeure: consultation.dateHeure || '',
                prenomPraticien: consultation.prenomPraticien || 'Dr. Inconnu',
                // Champs obligatoires minimaux
                cinPatient: '',
                cinPraticien: '',
                idRdvParent: null,
                statut: 'confirme' as const
              },
              ...availableRendezVous
            ];
          }
        }
  
        setRendezVousList(availableRendezVous);
      } catch (error) {
        console.error('Erreur:', error);
        toast.error('Erreur lors du chargement des rendez-vous');
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
      [name]: name === 'idRdv' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.idRdv || !formData.dateConsult) {
      toast.error('Veuillez sélectionner un rendez-vous et spécifier une date');
      return;
    }

    try {
      const consultationData: Consultation = {
        ...formData,
        idConsult: formData.idConsult,
      idRdv: formData.idRdv,
      dateConsult: formData.dateConsult,
      compteRendu: formData.compteRendu,
      dateHeure: '', 
      cinPatient: '',
      cinPraticien: ''
      };

      if (isEditMode) {
        await updateConsultation(formData.idConsult, consultationData);
        toast.success('Consultation modifiée avec succès');
      } else {
        await createConsultation(consultationData);
        toast.success('Consultation créée avec succès');
      }
      
      setTimeout(() => navigate('/listConsultation'), 1500);
    } catch (error) {
      console.error('Erreur:', error);
      if (error instanceof Error) {
        toast.error(error.message || 
          `Erreur lors de ${isEditMode ? 'la modification' : 'la création'} de la consultation`);
      } else {
        toast.error(`Erreur inattendue lors de ${isEditMode ? 'la modification' : 'la création'} de la consultation`);
      }
    }
  };

  const handleCancel = () => {
    navigate(isEditMode ? '/listConsultation' : '/ajoutConsultation'); 
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Chargement des rendez-vous...</p>
      </div>
    );
  }

  return (
    <section id="content">
      <main>
        <div className="head-title">
          <div className="left">
            <h1 className='h1' style={{ color: '#bdb9b9' }}>{isEditMode ? 'Modification de la consultation' : 'Formulaire de la nouvelle consultation'}</h1>
            <ul className="breadcrumb">
              <li><a href="#">Consultation</a></li>
              <li><i className='bx bx-chevron-right'></i></li>
              <li><a className="active" href="/listConsultation">Liste des consultations</a></li>
              <li><i className='bx bx-chevron-right'></i></li>
              <li><a className="active" href="/ajoutConsultation">
                {isEditMode ? 'Modification ' : 'Nouvelle consultation'}
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
                  <span className="title">{isEditMode ? 'Modifier une consultation' : 'Ajouter une nouvelle consultation'}</span>

                    {isEditMode && (
                      <div className="input-field-div">
                        <input
                          name="idConsult"
                          type="hidden"
                          value={formData.idConsult}
                          readOnly
                          placeholder="ID de la consultation"
                          required
                        />
                      </div>
                    )}

                    <div className="input-field-div">
                      <label>Rendez-vous <span className="required">*</span></label>
                      <select
                          name="idRdv"
                          value={formData.idRdv || ''}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              idRdv: Number(e.target.value)
                            });
                          }}
                          required
                          className="select-rdv"
                          disabled={rendezVousList.length === 0}
                        >
                          {rendezVousList.length === 0 ? (
                            <option value="">Aucun rendez-vous disponible</option>
                          ) : (
                            <>
                              <option value="">Sélectionnez un rendez-vous</option>
                              {rendezVousList.map(rdv => {
                                // Vérification des données avant affichage
                                const praticienNom = rdv.prenomPraticien || rdv.praticienInfo?.prenom;
                                const dateRdv = rdv.dateHeure 
                                  ? new Date(rdv.dateHeure).toLocaleString('fr-FR', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })
                                  : '';
                                    
                                return (
                                  <option 
                                    key={`rdv-${rdv.idRdv}`}
                                    value={rdv.idRdv}
                                  >
                                    {`Rendez-vous avec Dr. ${praticienNom} le ${dateRdv}`}
                                  </option>
                                );
                              })}
                            </>
                          )}
                        </select>
                    </div>
                 
                    <div className="input-field-div">
                      <label>Date de la consultation</label>
                      <input
                        name="dateConsult"
                        type="datetime-local"
                        value={formData.dateConsult}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            dateConsult: e.target.value 
                          });
                        }}
                        placeholder="Date et heure de la consultation"
                        required
                      />
                    </div>

                    <div className="input-field-div">
                      <label>Compte rendu</label>
                      <textarea
                        name="compteRendu"
                        placeholder="Détails de la consultation..."
                        value={formData.compteRendu}
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

export default AjoutConsultation;