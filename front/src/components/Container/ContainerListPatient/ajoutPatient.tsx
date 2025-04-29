import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPatient, updatePatient } from '../../../services/patients_api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../ContainerListPatient/ajoutPatient.css';

const AjoutPatient = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    cinPatient: '',
    nom: '',
    prenom: '',
    age: 0,
    sexe: '',
    adresse: '',
    telephone: '',
    email: ''
  });

  // États pour le formatage visuel
  const [cinValue, setCinValue] = useState("");
  const [phoneValue, setPhoneValue] = useState("");

  const handleCinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Garde les chiffres et espaces, limite à 14 caractères
    const value = e.target.value.replace(/[^\d ]/g, '');
    
    // Formatage automatique "XXXX XXXX XXXX"
    const digits = value.replace(/\D/g, '');
    let formattedValue = '';
    
    if (digits.length > 0) formattedValue = digits.substring(0, 4);
    if (digits.length > 4) formattedValue += ' ' + digits.substring(4, 8);
    if (digits.length > 8) formattedValue += ' ' + digits.substring(8, 12);
    
    // Limite à 14 caractères (12 chiffres + 2 espaces)
    formattedValue = formattedValue.substring(0, 14);
    
    setCinValue(formattedValue);
    setFormData(prev => ({
      ...prev,
      cinPatient: formattedValue // Stockage AVEC espaces
    }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 1. Nettoyage - garde uniquement les chiffres
    const digits = e.target.value.replace(/\D/g, '');
    
    // 2. Force le préfixe 261 si absent
    let phoneDigits = digits;
    if (!phoneDigits.startsWith('261') && phoneDigits.length > 0) {
      phoneDigits = '261' + phoneDigits;
    }
  
    // 3. Formatage "+261 XX XX XXX XX"
    let formattedValue = '';
    if (phoneDigits.length > 0) formattedValue = `+${phoneDigits.substring(0, 3)}`; // +261
    if (phoneDigits.length > 3) formattedValue += ` ${phoneDigits.substring(3, 5)}`; // XX
    if (phoneDigits.length > 5) formattedValue += ` ${phoneDigits.substring(5, 7)}`; // XX
    if (phoneDigits.length > 7) formattedValue += ` ${phoneDigits.substring(7, 10)}`; // XXX
    if (phoneDigits.length > 10) formattedValue += ` ${phoneDigits.substring(10, 12)}`; // XX
  
    // 4. Limite à 17 caractères (format complet)
    formattedValue = formattedValue.substring(0, 17);
  
    // 5. Mise à jour des états
    setPhoneValue(formattedValue);
    setFormData(prev => ({
      ...prev,
      telephone: formattedValue // Stocke le format complet "+261 XX XX XXX XX"
    }));
  };
  
  const handlePhoneFocus = () => {
    if (!phoneValue && !formData.telephone) {
      const initialValue = "+261 ";
      setPhoneValue(initialValue);
      setFormData(prev => ({
        ...prev,
        telephone: initialValue
      }));
    }
  };

  const sexes = [
    { value: '', label: 'Sélectionnez un sexe' },
    { value: 'Homme', label: 'Homme' },
    { value: 'Femme', label: 'Femme' }
  ];

  useEffect(() => {
    if (location.state?.patient) {
      setIsEditMode(true);
      const patient = location.state.patient;
      
      // Initialisation avec les valeurs formatées directement
      setFormData(patient);
      
      if (patient.cinPatient) {
        setCinValue(patient.cinPatient);
      }
      
      if (patient.telephone) {
        setPhoneValue(patient.telephone);
      }
    }
  }, [location.state]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation des champs obligatoires
    if (!formData.cinPatient || !formData.nom || !formData.prenom || !formData.age || !formData.sexe) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Validation CIN (14 caractères avec espaces)
    if (formData.cinPatient.length !== 14 || !/^\d{4} \d{4} \d{4}$/.test(formData.cinPatient)) {
      toast.error('Le CIN doit être au format "XXXX XXXX XXXX" (14 caractères)');
      return;
    }
    
    // Validation téléphone (17 caractères format international)
    if (formData.telephone && (formData.telephone.length !== 17 || !formData.telephone.startsWith('+261 '))) {
      toast.error('Le numéro doit être au format "+261 XX XX XXX XX"');
      return;
    }

    // Age validation
    if (formData.age <= 0) {
      toast.error('L\'âge doit être un nombre positif');
      return;
    }

    try {
      // Préparation des données pour l'API
      const patientData = {
        cinPatient: formData.cinPatient,
        nom: formData.nom,
        prenom: formData.prenom,
        age: formData.age,
        sexe: formData.sexe,
        adresse: formData.adresse || undefined,
        telephone: formData.telephone || undefined,
        email: formData.email || undefined
      };

      // Debug log (optional)
      console.log('Submitting patient data:', patientData);

      if (isEditMode) {
        await updatePatient(patientData);
        toast.success('Patient modifié avec succès');
      } else {
        await createPatient(patientData);
        toast.success('Patient créé avec succès');
      }
      
      setTimeout(() => navigate('/listPatient'), 1500);
    } catch (error) {
      console.error('Erreur:', error);
      if (error instanceof Error) {
        // Handle specific error messages from backend
        if (error.message.includes('CIN')) {
          toast.error('Format CIN invalide: doit être "XXXX XXXX XXXX" (14 caractères)');
        } else {
          toast.error(error.message || 
            `Erreur lors de ${isEditMode ? 'la modification' : 'la création'} du patient`);
        }
      } else {
        toast.error(`Erreur inattendue lors de ${isEditMode ? 'la modification' : 'la création'} du patient`);
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      cinPatient: '',
      nom: '',
      prenom: '',
      age: 0,
      sexe: '',
      adresse: '',
      telephone: '',
      email: ''
    });
    setCinValue("");
    setPhoneValue("");
    setIsEditMode(false);
    navigate(isEditMode ? '/listPatient' : '/ajoutPatient'); 
  };

  return (
    <section id="content">
      <main>
        <div className="head-title">
          <div className="left">
            <h1 className='h1' style={{ color: '#bdb9b9' }}>{isEditMode ? 'Modification du patient' : 'Formulaire pour le patient'}</h1>
            <ul className="breadcrumb">
              <li><a href="#">Patient</a></li>
              <li><i className='bx bx-chevron-right'></i></li>
              <li><a className="active" href="/listPatient">Liste des patients</a></li>
              <li><i className='bx bx-chevron-right'></i></li>
              <li><a className="active" href="/ajoutPatient"> {isEditMode ? 'Modification de patient' : 'Ajout de patient'}</a></li>
            </ul>
          </div>
        </div>

        <div className="table-date">
          <div className="orber">
            <div className="form-conge">
              <form onSubmit={handleSubmit}>
                <div className="form first">
                  <div className="details personal">
                    <span className="title">{isEditMode ? 'Modifier un patient' : 'Détail du patient'}</span>

                    <div className="fields">
                      {isEditMode ? (
                        <input 
                          name="cinPatient" 
                          type="hidden" 
                          value={formData.cinPatient}
                        />
                      ) : (
                        <div className="input-field-div">
                          <label>CIN</label>                                                
                          <input 
                            name="cinPatient" 
                            type="text" 
                            value={cinValue}
                            onChange={handleCinChange}
                            placeholder="1234 5678 9012"
                            maxLength={14}
                            className="form-input"
                            required 
                          />
                        </div>
                      )}
                      <div className="input-field-div">
                        <label>Nom</label>
                        <input 
                          name="nom"  
                          type="text" 
                          placeholder="Nom du patient" 
                          value={formData.nom}
                          onChange={handleChange}
                          className="form-input"
                          required 
                        />
                      </div>
                    </div>

                    <div className="fields">
                      <div className="input-field-div">
                        <label>Prénom</label>                                                
                        <input 
                          name="prenom" 
                          type="text" 
                          placeholder="Prénom du patient" 
                          value={formData.prenom}
                          onChange={handleChange}
                          className="form-input"
                          required 
                        />
                      </div>
                      <div className="input-field-div">
                        <label>Âge</label>
                        <input 
                          name="age"  
                          type="number" 
                          placeholder="Âge"  
                          value={formData.age || ''}
                          onChange={handleChange}
                          min="0"
                          className="form-input"
                          required 
                        />
                      </div>
                    </div>

                    <div className="fields">
                      <div className="input-field-div">
                        <label>Sexe</label>                                                
                        <select
                          name="sexe"
                          value={formData.sexe}
                          onChange={handleChange}
                          required
                          className={`form-input select-sex ${formData.sexe ? 'selected' : ''}`}
                        >
                          {sexes.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="input-field-div">
                        <label>Adresse</label>
                        <input 
                          name="adresse" 
                          type="text" 
                          placeholder="Adresse"  
                          value={formData.adresse}
                          onChange={handleChange}
                          className="form-input"
                        />
                      </div>
                    </div>

                    <div className="fields">
                      <div className="input-field-div">
                        <label>Téléphone</label>                                                
                        <input 
                          name="telephone"
                          type="text"
                          placeholder="+261 34 456 12 34"
                          value={phoneValue}
                          onChange={handlePhoneChange}
                          onFocus={handlePhoneFocus}
                          maxLength={17}
                          className="form-input"
                        />
                      </div>
                      <div className="input-field-div">
                        <label>Email</label>
                        <input 
                          name="email" 
                          type="email" 
                          placeholder="Adresse email"  
                          value={formData.email}
                          onChange={handleChange}
                          className="form-input"
                        />
                      </div>
                    </div>

                    <div className="fields button-field">
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

export default AjoutPatient;