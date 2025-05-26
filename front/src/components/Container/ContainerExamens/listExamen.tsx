import { useEffect, useState } from 'react';
import { Examen, getAllExamens, deleteExamen, getExamenById } from '../../../services/examens_api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import './examen.css'

const ListExamen = () => {
  const [examens, setExamens] = useState<Examen[]>([]);
  const [filteredExamens, setFilteredExamens] = useState<Examen[]>([]);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [examenToDelete, setExamenToDelete] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchExamens();
  }, []);

  useEffect(() => {
    setFilteredExamens(examens);
  }, [examens]);

  const fetchExamens = async () => {
    try {
      const data = await getAllExamens();
      setExamens(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la récupération des examens');
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.trim() === '') {
      setFilteredExamens(examens);
      return;
    }

    const lowerTerm = term.toLowerCase();
    
    const filtered = examens.filter(examen => {
      // Recherche par type d'examen
      const typeMatch = examen.typeExamen?.toLowerCase().includes(lowerTerm) || false;
      
      // Recherche par date de réalisation (format: jj/mm/aaaa)
      const dateStr = formatDate(examen.dateRealisation).toLowerCase();
      const dateMatch = dateStr.includes(lowerTerm);
      
      // Recherche par statut
      const statusStr = examen.statut === 'prescrit' ? 'prescrit' :
                       examen.statut === 'en_cours' ? 'en cours' :
                       examen.statut === 'termine' ? 'terminé' :
                       examen.statut === 'annule' ? 'annulé' : '';
      const statusMatch = statusStr.includes(lowerTerm);
      
      // Recherche par résultat
      const resultMatch = examen.resultat?.toLowerCase().includes(lowerTerm) || false;
      
      // Recherche par laboratoire
      const labMatch = examen.laboratoire?.toLowerCase().includes(lowerTerm) || false;

      return typeMatch || dateMatch || statusMatch || resultMatch || labMatch;
    });

    setFilteredExamens(filtered);
  };

  const handleDeleteClick = (idExamen: number) => {
    setExamenToDelete(idExamen);
    setOpenDeleteDialog(true);
  };

  const handleCancelDelete = () => {
    setOpenDeleteDialog(false);
    setExamenToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (examenToDelete) {
      try {
        await deleteExamen(examenToDelete);
        toast.success('Examen supprimé avec succès');
        fetchExamens();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Erreur lors de la suppression');
      } finally {
        setOpenDeleteDialog(false);
        setExamenToDelete(null);
      }
    }
  };

  const handleEdit = async (idExamen: number) => {
    try {
      const examen = await getExamenById(idExamen);
      navigate('/ajoutExamen', { 
        state: { 
          examen: examen,
          isEditMode: true
        } 
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la récupération de l\'examen');
    }
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

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'prescrit':
        return <span className="status-badge prescrit">Prescrit</span>;
      case 'en_cours':
        return <span className="status-badge en-cours">En cours</span>;
      case 'termine':
        return <span className="status-badge termine">Terminé</span>;
      case 'annule':
        return <span className="status-badge annule">Annulé</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  return (
    <section id="content">
      <main>
        <div className="head-title">
          <div className="left">
            <h1 className='h1' style={{ color: '#bdb9b9' }}>Examens médicaux des patients</h1>
            <ul className="breadcrumb">
              <li><a href="#">Examen</a></li>
              <li><i className='bx bx-chevron-right'></i></li>
              <li><a className="active" href="/listExamen">Liste des examens</a></li>
            </ul>
          </div>
          <a href="/ajoutExamen" className="btn-download">
            <i className='bx bx-plus'></i>
            <span className="text">AJOUTER</span>
          </a>
        </div>

        <div className="table-date">
          <div className="orber">
            <div className="head">
              <h3 style={{ color: '#bdb9b9' }}>Liste des examens</h3>
              <div className="search-container">
                {showSearchInput && (
                  <input
                    type="text"
                    placeholder="Rechercher par type, date, statut, résultat ou laboratoire..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="search-input"
                    autoFocus
                  />
                )}
                <i 
                  className='bx bx-search icon-tbl' 
                  onClick={() => setShowSearchInput(!showSearchInput)}
                  style={{ cursor: 'pointer' }}
                ></i>
                <i className='bx bx-filter icon-tbl'></i>
              </div>
            </div>
            <table>
              <thead className="thead">
                <tr>
                  <th>Type d'examen</th>
                  <th>Date de réalisation</th>
                  <th>Statut</th>
                  <th>Résultat</th>
                  <th>Image</th>
                  <th>Laboratoire</th>
                  <th className='th'>Actions</th>
                </tr>
              </thead>
              <tbody className="tbody">
                {filteredExamens.length > 0 ? (
                  filteredExamens.map((examen) => (
                    <tr key={examen.idExamen}>
                      <td>{examen.typeExamen}</td>
                      <td>{formatDate(examen.dateRealisation)}</td>
                      <td>{getStatusBadge(examen.statut)}</td>
                      <td>
                        {examen.resultat ? 
                          (examen.resultat.length > 30 
                            ? `${examen.resultat.substring(0, 30)}...` 
                            : examen.resultat) 
                          : 'pas encore du resultat'}
                      </td>
                      <td>
                        {examen.imageUrl ? (
                            <img 
                            src={examen.imageUrl} 
                            alt={`Examen ${examen.typeExamen}`}
                            className="examen-image"
                            onClick={() => window.open(examen.imageUrl, '_blank')}
                            />
                        ) : (
                            <span className="no-image">Aucune image</span>
                        )}
                      </td>
                      <td>{examen.laboratoire || '-'}</td>
                      <td className='td-tbn-actions'>
                        <button 
                          className="edit-btn"
                          onClick={() => handleEdit(examen.idExamen)}
                        >
                          <i className='bx bx-edit'></i>
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => handleDeleteClick(examen.idExamen)}
                        >
                          <i className='bx bx-trash'></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center' }}>
                      {searchTerm ? 'Aucun examen ne correspond à votre recherche' : 'Aucun examen trouvé'}
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
          Êtes-vous sûr de vouloir supprimer cet examen ?
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

export default ListExamen;