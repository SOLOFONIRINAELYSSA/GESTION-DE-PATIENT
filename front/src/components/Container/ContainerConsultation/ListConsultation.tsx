import { useEffect, useState } from 'react';
import { Consultation, getAllConsultations, deleteConsultation } from '../../../services/concultations_api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';

const ListConsultation = () => {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [consultationToDelete, setConsultationToDelete] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    try {
      const data = await getAllConsultations();
      setConsultations(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la récupération des consultations');
    }
  };

  const handleDeleteClick = (idConsult: number) => {
    setConsultationToDelete(idConsult);
    setOpenDeleteDialog(true);
  };

  const handleCancelDelete = () => {
    setOpenDeleteDialog(false);
    setConsultationToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (consultationToDelete) {
      try {
        await deleteConsultation(consultationToDelete);
        toast.success('Consultation supprimée avec succès');
        fetchConsultations();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Erreur lors de la suppression');
      } finally {
        setOpenDeleteDialog(false);
        setConsultationToDelete(null);
      }
    }
  };

  const handleEdit = (consultation: Consultation) => {
    
    const consultationToEdit = {
      ...consultation,
      idRdv: consultation.idRdv || 0,
      dateConsult: consultation.dateConsult || '',
      compteRendu: consultation.compteRendu || ''
    };
    
    navigate('/ajoutConsultation', { 
      state: { 
        consultation: consultationToEdit,
        rendezVous: {
          idRdv: consultation.idRdv,
          dateHeure: consultation.dateConsult,
          prenomPraticien: consultation.prenomPraticien
        }
      } 
    });
  };

  const formatDate = (dateString: string | undefined | null): string => {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <section id="content">
      <main>
        <div className="head-title">
          <div className="left">
            <h1 className='h1' style={{ color: '#bdb9b9' }}>Les dernieres consultations</h1>
            <ul className="breadcrumb">
              <li><a href="#">Consultation</a></li>
              <li><i className='bx bx-chevron-right'></i></li>
              <li><a className="active" href="/listConsultation">Liste des consultations</a></li>
            </ul>
          </div>
          <a href="/ajoutConsultation" className="btn-download">
            <i className='bx bx-plus'></i>
            <span className="text">AJOUTER</span>
          </a>
        </div>

        <div className="table-date">
          <div className="orber">
            <div className="head">
            <h3 style={{ color: '#bdb9b9' }}>Liste des consultations</h3>
              <i className='bx bx-search icon-tbl'></i>
              <i className='bx bx-filter icon-tbl'></i>
            </div>
            <table>
              <thead className="thead">
                <tr>
                  <th>Date Consultation</th>
                  <th>Rendez-vous</th>
                  <th>Compte rendu</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="tbody">
                {consultations.length > 0 ? (
                  consultations.map((consultation) => (
                    <tr key={consultation.idConsult}>
                      <td>{formatDate(consultation.dateConsult)}</td>
                      <td>Docteur {consultation.prenomPraticien || 'Non spécifié'}</td>
                      <td>{consultation.compteRendu ? 
                        (consultation.compteRendu.length > 50 
                          ? `${consultation.compteRendu.substring(0, 50)}...` 
                          : consultation.compteRendu) 
                        : '-'}
                      </td>
                      <td className='td-tbn-actions'>
                        <button 
                          className="edit-btn"
                          onClick={() => handleEdit(consultation)}
                        >
                          <i className='bx bx-edit'></i>
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => handleDeleteClick(consultation.idConsult)}
                        >
                          <i className='bx bx-trash'></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center' }}>
                      Aucune consultation trouvée
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

      {/* Dialog de confirmation de suppression */}
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
          Êtes-vous sûr de vouloir supprimer cette consultation ?
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
}

export default ListConsultation;