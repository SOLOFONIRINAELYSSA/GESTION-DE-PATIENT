import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaEdit } from 'react-icons/fa';
import { Praticien, getAllPraticiens, deletePraticien } from '../../../services/praticiens_api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import '../ContainerPracticien/AjoutPracticien.css';

const ListPracticien = () => {
  const [praticiens, setPraticiens] = useState<Praticien[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [praticienToDelete, setPraticienToDelete] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPraticiens();
  }, []);

  const fetchPraticiens = async () => {
    try {
      const data = await getAllPraticiens();
      setPraticiens(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      toast.error('Erreur lors du chargement des praticiens');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (cinPraticien: string) => {
    setPraticienToDelete(cinPraticien);
    setOpenDeleteDialog(true);
  };

  const handleCancelDelete = () => {
    setOpenDeleteDialog(false);
    setPraticienToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (praticienToDelete) {
      try {
        await deletePraticien(praticienToDelete);
        toast.success('Praticien supprimé avec succès');
        fetchPraticiens();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Erreur lors de la suppression');
      } finally {
        setOpenDeleteDialog(false);
        setPraticienToDelete(null);
      }
    }
  };

  const handleEdit = (praticien: Praticien) => {
    const praticienToEdit = {
      ...praticien,
      telephone: praticien.telephone || '', 
      email: praticien.email || '',
      specialite: praticien.specialite || ''
    };
    navigate('/ajoutPraticien', { state: { praticien: praticienToEdit } });
  };

  if (loading) return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Chargement des praticiens...</p>
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
            <h1 className='h1' style={{ color: '#bdb9b9' }}>Liste des praticiens</h1>
            <ul className="breadcrumb">
              <li><a href="#">Praticien</a></li>
              <li><i className='bx bx-chevron-right'></i></li>
              <li><a className="active" href="/listPraticien">Liste des praticiens</a></li>
            </ul>
          </div>
          <a href="/ajoutPraticien" className="btn-download">
            <i className='bx bx-plus'></i>
            <span className="text">AJOUTER</span>
          </a>
        </div>

        <div className="table-date">
          <div className="orber">
            <div className="head">
              <h3 style={{ color: '#bdb9b9' }}>Détail des praticiens</h3>
              <i className='bx bx-search icon-tbl'></i>
              <i className='bx bx-filter icon-tbl'></i>
            </div>
            
            <table>
              <thead className="thead">
                <tr>
                  <th>CIN</th>
                  <th>Nom</th>
                  <th>Prénom</th>
                  <th>Téléphone</th>
                  <th>Email</th>
                  <th>Spécialité</th>
                  <th>Actions</th>
                </tr>
              </thead>
              
              <tbody className="tbody">
                {praticiens.length > 0 ? (
                  praticiens.map((praticien) => (
                    <tr key={praticien.cinPraticien}>
                      <td>{praticien.cinPraticien}</td>
                      <td>{praticien.nom}</td>
                      <td>{praticien.prenom}</td>
                      <td>{praticien.telephone || '-'}</td>
                      <td>{praticien.email || '-'}</td>
                      <td>{praticien.specialite || '-'}</td>
                      <td className='td-tbn-actions'>
                        <button 
                          className="edit-btn"
                          onClick={() => handleEdit(praticien)}
                        >
                          <FaEdit />
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => handleDeleteClick(praticien.cinPraticien)}
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center' }}>
                      Aucun praticien trouvé
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
          Êtes-vous sûr de vouloir supprimer ce praticien ?
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

export default ListPracticien;