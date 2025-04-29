import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPraticien, updatePraticien } from '../../../services/praticiens_api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../ContainerPracticien/AjoutPracticien.css';

const AjoutPracticien = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    cinPraticien: '',
    nom: '',

    prenom: '',
    telephone: '',
    email: '',
    specialite: ''
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
      cinPraticien: formattedValue // Stockage AVEC espaces
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

  useEffect(() => {
    if (location.state?.praticien) {
      setIsEditMode(true);
      const praticien = location.state.praticien;
      
      // Initialisation avec les valeurs formatées directement
      setFormData(praticien);
      
      if (praticien.cinPraticien) {
        setCinValue(praticien.cinPraticien);
      }
      
      if (praticien.telephone) {
        setPhoneValue(praticien.telephone);
      }
    }
  }, [location.state]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation des champs obligatoires
    if (!formData.cinPraticien || !formData.nom || !formData.prenom || !formData.telephone) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Validation CIN (14 caractères avec espaces)
    if (formData.cinPraticien.length !== 14 || !/^\d{4} \d{4} \d{4}$/.test(formData.cinPraticien)) {
      toast.error('Le CIN doit être au format "XXXX XXXX XXXX" (14 caractères)');
      return;
    }
    
    // Validation téléphone (17 caractères format international)
    if (formData.telephone.length !== 17 || !formData.telephone.startsWith('+261 ')) {
      toast.error('Le numéro doit être au format "+261 XX XX XXX XX"');
      return;
    }

    try {
      // Préparation des données pour l'API
      const praticienData = {
        cinPraticien: formData.cinPraticien,
        nom: formData.nom,
        prenom: formData.prenom,
        telephone: formData.telephone,
        email: formData.email || undefined,
        specialite: formData.specialite || undefined
      };

      // Debug log (optional)
      console.log('Submitting praticien data:', praticienData);

      if (isEditMode) {
        await updatePraticien(praticienData.cinPraticien, praticienData);
        toast.success('Praticien modifié avec succès');
      } else {
        await createPraticien(praticienData);
        toast.success('Praticien créé avec succès');
      }
      
      setTimeout(() => navigate('/listPraticien'), 1500);
    } catch (error) {
      console.error('Erreur:', error);
      if (error instanceof Error) {
        // Handle specific error messages from backend
        if (error.message.includes('CIN')) {
          toast.error('Format CIN invalide: doit être "XXXX XXXX XXXX" (14 caractères)');
        } else {
          toast.error(error.message || 
            `Erreur lors de ${isEditMode ? 'la modification' : 'la création'} du praticien`);
        }
      } else {
        toast.error(`Erreur inattendue lors de ${isEditMode ? 'la modification' : 'la création'} du praticien`);
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      cinPraticien: '',
      nom: '',
      prenom: '',
      telephone: '',
      email: '',
      specialite: ''
    });
    setCinValue("");
    setPhoneValue("");
    setIsEditMode(false);
    navigate(isEditMode ? '/listPraticien' : '/ajoutPraticien'); 
  };

  return (
    <section id="content">
      <main>
        <div className="head-title">
          <div className="left">
            <h1 className='h1' style={{ color: '#bdb9b9' }}>{isEditMode ? 'Modification du praticien' : 'Formulaire pour le praticien'}</h1>
            <ul className="breadcrumb">
              <li><a href="#">Praticien</a></li>
              <li><i className='bx bx-chevron-right'></i></li>
              <li><a className="active" href="/listPraticien">Liste des praticien(ne)s</a></li>
              <li><i className='bx bx-chevron-right'></i></li>
              <li><a className="active" href="/ajoutPraticien">
                {isEditMode ? 'Modification de praticien(ne)' : 'Ajout de praticien(ne)'}
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
                    <span className="title">Détail du praticien(ne)</span>

                    <div className="fields">
                      {isEditMode ? (
                        <input 
                          name="cinPraticien" 
                          type="hidden" 
                          value={formData.cinPraticien}
                        />
                      ) : (
                        <div className="input-field-div">
                          <label>CIN</label>                                                
                          <input 
                            name="cinPraticien" 
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
                          placeholder="Nom du praticien(ne)" 
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
                          placeholder="Prénom du praticien(ne)" 
                          value={formData.prenom}
                          onChange={handleChange}
                          className="form-input"
                          required 
                        />
                      </div>
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
                          required
                        />
                      </div>
                    </div>

                    <div className="fields">
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
                      <div className="input-field-div">
                        <label>Spécialité</label>                                                
                        <input 
                          name="specialite" 
                          type="text" 
                          placeholder="Spécialité du praticien(ne)" 
                          value={formData.specialite}
                          onChange={handleChange}
                          className="form-input"
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

export default AjoutPracticien;