import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaEdit } from 'react-icons/fa';
import { RendezVous, getAllRendezVous, deleteRendezVous, updateRendezVousStatus } from '../../../services/rendezVous_api';
import { getAllPatients, Patient } from '../../../services/patients_api';
import { getAllPraticiens, Praticien } from '../../../services/praticiens_api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import '../../Container/ContainerRendezVous/ContainerRdv.css';

const ListRdv = () => {
  const [rendezVous, setRendezVous] = useState<RendezVous[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [rdvToDelete, setRdvToDelete] = useState<number | null>(null);
  const [statusUpdateId, setStatusUpdateId] = useState<number | null>(null);
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Record<string, string>>({});
  const [praticiens, setPraticiens] = useState<Record<string, string>>({});

  // useEffect(() => {
  //   fetchRendezVous();
  //   loadNames();
  // }, []);

  useEffect(() => {
    const loadAllData = async () => {
      try {
        // 1. Charger les rendez-vous et les données associées en parallèle
        const [rdvData, patientsData, praticiensData] = await Promise.all([
          fetchRendezVous(),      // Vos rendez-vous existants
          getAllPatients(),       // Liste des patients
          getAllPraticiens()      // Liste des praticiens
        ]);
  
        // 2. Mettre à jour les états
        // (Adaptez selon comment vous gérez les rendez-vous)
        // setRendezVous(rdvData); 
        setPatients(patientsData);
        setPraticiens(praticiensData);
  
        // 3. Charger les noms si nécessaire (fonction à définir)
        await loadNames(patientsData, praticiensData);
  
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        // Ajoutez un toast ou une notification d'erreur si nécessaire
        // toast.error("Erreur lors du chargement des données");
      }
    };
  
    loadAllData();
    loadNames();
  }, []);

  const loadNames = async () => {
    try {
      // Supposons que vous avez des services pour récupérer les noms
      const patientsData = await getAllPatients(); // À implémenter
      const praticiensData = await getAllPraticiens(); // À implémenter
      
      const patientsMap = patientsData.reduce((acc, patient) => {
        acc[patient.cinPatient] = patient.prenom;
        return acc;
      }, {} as Record<string, string>);
      
      const praticiensMap = praticiensData.reduce((acc, praticien) => {
        acc[praticien.cinPraticien] = praticien.prenom;
        return acc;
      }, {} as Record<string, string>);
      
      setPatients(patientsMap);
      setPraticiens(praticiensMap);
    } catch (error) {
      console.error("Erreur lors du chargement des noms", error);
    }
  };

  const fetchRendezVous = async () => {
    try {
      const data = await getAllRendezVous();
      setRendezVous(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      toast.error('Erreur lors du chargement des rendez-vous');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (idRdv: number) => {
    setRdvToDelete(idRdv);
    setOpenDeleteDialog(true);
  };

  const handleCancelDelete = () => {
    setOpenDeleteDialog(false);
    setRdvToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (rdvToDelete) {
      try {
        await deleteRendezVous(rdvToDelete);
        toast.success('Rendez-vous supprimé avec succès');
        fetchRendezVous();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Erreur lors de la suppression');
      } finally {
        setOpenDeleteDialog(false);
        setRdvToDelete(null);
      }
    }
  };

  // const handleEdit = (rdv: RendezVous) => {
  //   navigate('/ajoutRdv', { state: { rdv } });
  // };

  const handleEdit = (rdv: RendezVous) => {
    console.log('RDV à éditer:', rdv);
    
    try {
      // 1. Vérifier et initialiser patients et praticiens
      const patientsList = Array.isArray(patients) ? patients : [];
      const praticiensList = Array.isArray(praticiens) ? praticiens : [];
  
      // 2. Trouver les informations complètes (avec vérifications)
      const patientComplet = patientsList.find((p: Patient) => p.cinPatient === rdv.cinPatient);
      const praticienComplet = praticiensList.find((p: Praticien) => p.cinPraticien === rdv.cinPraticien);
  
      // 3. Préparer l'objet à transmettre (version simplifiée et sécurisée)
      const rdvAEditer = {
        ...rdv,
        idRdvParent: rdv.idRdvParent || null,
        ...(patientComplet && { 
          patientInfo: { 
            nom: patientComplet.nom, 
            prenom: patientComplet.prenom 
          }
        }),
        ...(praticienComplet && {
          praticienInfo: {
            nom: praticienComplet.nom,
            prenom: praticienComplet.prenom,
            ...(praticienComplet.specialite && { specialite: praticienComplet.specialite })
          }
        })
      };
  
      // 4. Navigation
      navigate('/ajoutRdv', { 
        state: { 
          rdv: rdvAEditer 
        } 
      });
      
    } catch (error) {
      console.error("Erreur lors de l'édition:", error);
      // Vous pouvez aussi ajouter une notification à l'utilisateur ici
    }
  };

  const handleStatusChange = async (idRdv: number, currentStatus: 'en_attente' | 'confirme' | 'annule') => {
    setStatusUpdateId(idRdv);
    
    // Déterminer le nouveau statut en fonction du statut actuel
    let nextStatus: 'en_attente' | 'confirme' | 'annule';
    if (currentStatus === 'en_attente') nextStatus = 'confirme';
    else if (currentStatus === 'confirme') nextStatus = 'annule';
    else nextStatus = 'en_attente';

    try {
      await updateRendezVousStatus(idRdv, nextStatus);
      toast.success(`Statut du rendez-vous mis à jour: ${nextStatus}`);
      fetchRendezVous();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la mise à jour du statut');
    } finally {
      setStatusUpdateId(null);
    }
  };

  const getStatusBadgeClass = (statut: string) => {
    switch (statut) {
      case 'confirme':
        return 'status-badge confirmed';
      case 'annule':
        return 'status-badge cancelled';
      default:
        return 'status-badge pending';
    }
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Chargement des rendez-vous...</p>
    </div>
  );

  if (error) return (
    <div className="error-container">
      <p>⚠️ Erreur: {error}</p>
      <button onClick={() => window.location.reload()}>Réessayer</button>
    </div>
  );

  return (
    <section id="content">
      <main>
        <div className="head-title">
          <div className="left">
            <h1 className='h1' style={{ color: '#bdb9b9' }}>Liste des rendez-vous</h1>
            <ul className="breadcrumb">
              <li><a href="#">Rendez-vous</a></li>
              <li><i className='bx bx-chevron-right'></i></li>
              <li><a className="active" href="/listRdv">Liste des derniers rendez-vous</a></li>
            </ul>
          </div>
          <a href="/ajoutRdv" className="btn-download">
            <i className='bx bx-plus'></i>
            <span className="text">AJOUTER</span>
          </a>
        </div>
x
        <div className="table-date">
          <div className="orber">
            <div className="head">
              <h3 style={{ color: '#bdb9b9' }}>Derniers rendez-vous </h3>
              <i className='bx bx-search icon-tbl'></i>
              <i className='bx bx-filter icon-tbl'></i>
            </div>
            
            <table>
              <thead className="thead">
                <tr>
                  <th>Patient</th>
                  <th>Praticien</th>
                  <th>Date et heure</th>
                  <th>Statut</th>
                  <th>Praticien particulier</th>
                  <th>Actions</th>
                </tr>
              </thead>
              
              <tbody className="tbody">
                {rendezVous.length > 0 ? (
                  rendezVous.map((rdv) => (
                    <tr key={rdv.idRdv}>
                      <td>{patients[rdv.cinPatient] || rdv.cinPatient}</td>
                      <td>Dr. {praticiens[rdv.cinPraticien] || rdv.cinPraticien}</td>
                      <td>{formatDateTime(rdv.dateHeure)}</td>
                      <td>
                        <span 
                          className={getStatusBadgeClass(rdv.statut || 'en_attente')}
                          onClick={() => rdv.idRdv && handleStatusChange(rdv.idRdv, rdv.statut || 'en_attente')}
                          style={{ cursor: 'pointer' }}
                        >
                          {rdv.statut === 'confirme' ? 'Confirmé' : 
                           rdv.statut === 'annule' ? 'Annulé' : 'En attente'}
                          {statusUpdateId === rdv.idRdv && <span className="status-loading">...</span>}
                        </span>
                      </td>
                      {/* <td>Dr. {praticiens[rdv.idRdvParent] || null}</td> */}
                      <td>{(praticiens[rdv.idRdvParent] && "Dr. " + praticiens[rdv.idRdvParent]) || "aucun rendez-vous spécial"}</td>
                      <td className='td-tbn-actions'>
                        <button 
                          className="edit-btn"
                          onClick={() => handleEdit(rdv)}
                        >
                          <FaEdit />
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => rdv.idRdv && handleDeleteClick(rdv.idRdv)}
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center' }}>
                      Aucun rendez-vous trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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

      <Dialog
        open={openDeleteDialog}
        onClose={handleCancelDelete}
        aria-labelledby="alert-dialog-title"
        classes={{ paper: 'delete-confirmation-dialog' }}
      >
        <DialogTitle id="alert-dialog-title">
          <div className="dialog-icon">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          Êtes-vous sûr de vouloir supprimer ce rendez-vous ?
        </DialogTitle>
        <DialogActions>
          <Button className="cancel-btn" onClick={handleCancelDelete}>
            Annuler
          </Button>
          <Button className="confirm-btn" onClick={handleConfirmDelete} autoFocus>
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
    </section>
  );
};

export default ListRdv;