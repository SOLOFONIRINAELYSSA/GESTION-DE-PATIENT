import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createExamen, updateExamen, getExamenById, getUsedPrescriptionIds} from '../../../services/examens_api';
import { getAllPrescriptions, Prescription } from '../../../services/prscrires_api';
import { Examen } from '../../../services/examens_api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AjoutExamen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<Omit<Examen, 'idExamen' | 'createdAt' | 'updatedAt'> & { imageFile?: File }>({
    idPrescrire: 0,
    typeExamen: '',
    dateRealisation: '',
    statut: 'prescrit',
    resultat: '',
    laboratoire: ''
  });
  const [prescriptionsList, setPrescriptionsList] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [usedPrescriptionIds, setUsedPrescriptionIds] = useState<number[]>([]);
  // *****************************

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
  //   const fetchData = async () => {
  //     setLoading(true);
  //     try {
  //       const prescriptions = await getAllPrescriptions();
  //       setPrescriptionsList(prescriptions);

  //       if (location.state?.examen) {
  //         const { examen } = location.state;
  //         setIsEditMode(true);
          
  //         const examenDetails = await getExamenById(examen.idExamen);
          
  //         setFormData({
  //           idPrescrire: examenDetails.idPrescrire,
  //           typeExamen: examenDetails.typeExamen,
  //           dateRealisation: examenDetails.dateRealisation 
  //             ? formatDateForInput(examenDetails.dateRealisation) 
  //             : '',
  //           statut: examenDetails.statut,
  //           resultat: examenDetails.resultat || '',
  //           laboratoire: examenDetails.laboratoire || ''
  //         });

  //         if (examenDetails.imageUrl) {
  //           setPreviewImage(examenDetails.imageUrl);
  //         }
  //       }
  //     } catch (error) {
  //       console.error('Erreur:', error);
  //       toast.error('Erreur lors du chargement des données');
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchData();
  // }, [location.state]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({
        ...prev,
        imageFile: file
      }));

      // Créer une preview de l'image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

//  const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!formData.idPrescrire || !formData.typeExamen) {
//         toast.error('Veuillez sélectionner une prescription et spécifier le type d\'examen');
//         return;
//     }

//     try {
//         const formDataToSend = new FormData();
        
//         // Champs obligatoires
//         formDataToSend.append('idPrescrire', formData.idPrescrire.toString());
//         formDataToSend.append('typeExamen', formData.typeExamen);
        
//         // Champs optionnels
//         if (formData.dateRealisation) {
//             formDataToSend.append('dateRealisation', formData.dateRealisation);
//         }
//         formDataToSend.append('statut', formData.statut || 'prescrit');
//         if (formData.resultat) {
//             formDataToSend.append('resultat', formData.resultat);
//         }
//         if (formData.laboratoire) {
//             formDataToSend.append('laboratoire', formData.laboratoire);
//         }
//         if (formData.imageFile) {
//             formDataToSend.append('image', formData.imageFile);
//         }

//         if (isEditMode && location.state?.examen) {
//             await updateExamen(location.state.examen.idExamen, formDataToSend);
//             toast.success('Examen modifié avec succès');
//         } else {
//             await createExamen(formDataToSend);
//             toast.success('Examen créé avec succès');
//         }
        
//         setTimeout(() => navigate('/listExamen'), 1500);
//     } catch (error) {
//         console.error('Erreur:', error);
//         if (error instanceof Error) {
//             toast.error(error.message || 
//                 `Erreur lors de ${isEditMode ? 'la modification' : 'la création'} de l'examen`);
//         } else {
//             toast.error(`Erreur inattendue lors de ${isEditMode ? 'la modification' : 'la création'} de l'examen`);
//         }
//     }
// };

  const handleCancel = () => {
    navigate(isEditMode ? '/listExamen' : '/ajoutExamen'); 
  };



useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      // Chargement en parallèle des prescriptions et des IDs utilisés
      const [prescriptions, usedIds] = await Promise.all([
        getAllPrescriptions(),
        getUsedPrescriptionIds() // Ceci est déjà appelé ici
      ]);

      setPrescriptionsList(prescriptions);
      setUsedPrescriptionIds(usedIds);

       console.log('Debug - Toutes prescriptions:', prescriptions);
      console.log('Debug - IDs utilisés:', usedIds);
      
      const filtered = prescriptions.filter(p => {
        const isExamen = p.typePrescrire?.toLowerCase() === 'examen';
        const isUsed = usedIds.includes(p.idPrescrire);
        return isExamen && !isUsed;
      });
      console.log('Debug - Prescriptions filtrées (disponibles):', filtered);

      // Gestion du mode édition
      if (location.state?.examen) {
        const { examen } = location.state;
        setIsEditMode(true);
        
        const examenDetails = await getExamenById(examen.idExamen);
        
        setFormData({
          idPrescrire: examenDetails.idPrescrire,
          typeExamen: examenDetails.typeExamen,
          dateRealisation: examenDetails.dateRealisation 
            ? formatDateForInput(examenDetails.dateRealisation) 
            : '',
          statut: examenDetails.statut,
          resultat: examenDetails.resultat || '',
          laboratoire: examenDetails.laboratoire || ''
        });

        if (examenDetails.imageUrl) {
          setPreviewImage(examenDetails.imageUrl);
        } else if (examenDetails.image) {
          setPreviewImage(`data:image/jpeg;base64,${examenDetails.image}`);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [location.state]);


const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!formData.idPrescrire || !formData.typeExamen) {
    toast.error('Champs obligatoires manquants');
    return;
  }

  try {
    const formDataToSend = new FormData();
    
    // Ajout des champs obligatoires
    formDataToSend.append('idPrescrire', formData.idPrescrire.toString());
    formDataToSend.append('typeExamen', formData.typeExamen);

    // Ajout des champs optionnels
    if (formData.dateRealisation) {
      formDataToSend.append('dateRealisation', formData.dateRealisation);
    }
    formDataToSend.append('statut', formData.statut || 'prescrit');
    
    if (formData.resultat) {
      formDataToSend.append('resultat', formData.resultat);
    }
    
    if (formData.laboratoire) {
      formDataToSend.append('laboratoire', formData.laboratoire);
    }
    
    // Gestion de l'image
    if (formData.imageFile) {
      formDataToSend.append('image', formData.imageFile);
    } else if (isEditMode && !previewImage) {
      formDataToSend.append('removeImage', 'true');
    }

    console.log('Envoi des données:', {
      idPrescrire: formData.idPrescrire,
      typeExamen: formData.typeExamen,
      hasImage: !!formData.imageFile,
      removeImage: isEditMode && !previewImage
    });

    if (isEditMode && location.state?.examen) {
      await updateExamen(location.state.examen.idExamen, formDataToSend);
      toast.success('Modification réussie');
    } else {
      await createExamen(formDataToSend);
      toast.success('Création réussie');
    }
    
    setTimeout(() => navigate('/listExamen'), 1500);
  } catch (error) {
    console.error('Erreur complète:', error);
    toast.error(error instanceof Error ? error.message : 'Erreur inconnue');
  }
};

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Chargement des données...</p>
      </div>
    );
  }

  return (
    <section id="content">
      <main>
        <div className="head-title">
          <div className="left">
            <h1 className='h1' style={{ color: '#bdb9b9' }}>{isEditMode ? 'Modification de l\'examen' : 'Nouvel examen médical'}</h1>
            <ul className="breadcrumb">
              <li><a href="#">Examen</a></li>
              <li><i className='bx bx-chevron-right'></i></li>
              <li><a className="active" href="/listExamen">Liste des examens</a></li>
              <li><i className='bx bx-chevron-right'></i></li>
              <li><a className="active" href="/ajoutExamen">
                {isEditMode ? 'Modification ' : 'Nouvel examen'}
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
                    <span className="title">{isEditMode ? 'Modifier un examen' : 'Ajouter un nouvel examen'}</span>

                    <div className="input-field-div">
                      <label>Prescription associée <span className="required">*</span></label>

                      <select
                        name="idPrescrire"
                        value={formData.idPrescrire || ''}
                        onChange={handleChange}
                        required
                        className="select-prescription"
                        disabled={
                          isEditMode && 
                          usedPrescriptionIds.length === prescriptionsList.filter(p => 
                            p.typePrescrire?.toLowerCase() === 'examen' || 'Examen'
                          ).length
                        }
                      >
                        <option value="">Sélectionnez une prescription</option>
                        
                        {isEditMode && formData.idPrescrire && (
                          <option 
                            value={formData.idPrescrire}
                            key={`current-${formData.idPrescrire}`}
                            disabled
                          >
                            {`Prescription avec Dr. ${
                              prescriptionsList.find(p => p.idPrescrire === formData.idPrescrire)?.prenomPraticien || 'Inconnu'
                            } le ${
                              new Date(
                                prescriptionsList.find(p => p.idPrescrire === formData.idPrescrire)?.datePrescrire || ''
                              ).toLocaleDateString('fr-FR')
                            }`}
                          </option>
                        )}

                        {prescriptionsList
                          .filter(prescription => {
                            const isExamen = prescription.typePrescrire?.toLowerCase() === 'examen';
                            const isUsed = usedPrescriptionIds.includes(prescription.idPrescrire);
                            return isExamen && !isUsed;
                          })
                          .map(prescription => (
                            <option 
                              key={`prescription-${prescription.idPrescrire}`}
                              value={prescription.idPrescrire}
                            >
                              {`Prescription avec Dr. ${prescription.prenomPraticien || 'Inconnu'} le ${
                                new Date(prescription.datePrescrire).toLocaleDateString('fr-FR')
                              }`}
                            </option>
                          ))
                        }

                        {prescriptionsList.filter(p => 
                          p.typePrescrire?.toLowerCase() === 'examen' && 
                          !usedPrescriptionIds.includes(p.idPrescrire)
                        ).length === 0 && (
                          <option disabled value="">
                            {isEditMode 
                              ? "Aucune autre prescription examen disponible" 
                              : "Toutes les prescriptions examen ont été utilisées"}
                          </option>
                        )}
                      </select>

                    </div>

                    <div className="input-field-div">
                      <label>Type d'examen <span className="required">*</span></label>
                      <input
                        name="typeExamen"
                        type="text"
                        value={formData.typeExamen}
                        onChange={handleChange}
                        placeholder="Ex: Radiographie, Analyse sanguine..."
                        required
                      />
                    </div>

                    <div className="input-field-div">
                      <label>Date de réalisation</label>
                      <input
                        name="dateRealisation"
                        type="datetime-local"
                        value={formData.dateRealisation}
                        onChange={handleChange}
                        placeholder="Date et heure de réalisation"
                      />
                    </div>

                    {isEditMode && (
                      <div className="input-field-div">
                        <label>Statut</label>
                        <select
                          name="statut"
                          value={formData.statut}
                          onChange={handleChange}
                          required
                        >
                          <option value="prescrit">Prescrit</option>
                          <option value="en_cours">En cours</option>
                          <option value="termine">Terminé</option>
                          <option value="annule">Annulé</option>
                        </select>
                      </div>
                    )}

                    <div className="input-field-div">
                      <label>Résultat</label>
                      <textarea
                        name="resultat"
                        placeholder="Résultats de l'examen..."
                        value={formData.resultat}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="input-field-div">
                      <label>Laboratoire</label>
                      <input
                        name="laboratoire"
                        type="text"
                        value={formData.laboratoire}
                        onChange={handleChange}
                        placeholder="Nom du laboratoire"
                      />
                    </div>

                    <div className="input-field-div">
                      <label>Image {!isEditMode && '(optionnel)'}</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="file-input"
                      />
                      {previewImage && (
                        <div className="image-preview">
                          <img 
                            src={previewImage} 
                            alt="Preview" 
                            style={{ 
                              maxWidth: '200px', 
                              maxHeight: '200px',
                              marginTop: '10px',
                              border: '1px solid #ddd',
                              borderRadius: '4px'
                            }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="fields">
                      <button type="submit" className={`nextBtn ${isEditMode ? 'modif-btn' : 'add-btn'}`}>
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

export default AjoutExamen;