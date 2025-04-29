import { useEffect, useState } from 'react';
import { Patient, getAllPatients, deletePatient } from '../../../../src/services/patients_api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';

const ListPatient = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const data = await getAllPatients();
      setPatients(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la récupération des patients');
    }
  };

  const handleDeleteClick = (cinPatient: string) => {
    setPatientToDelete(cinPatient);
    setOpenDeleteDialog(true);
  };

  const handleCancelDelete = () => {
    setOpenDeleteDialog(false);
    setPatientToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (patientToDelete) {
      try {
        await deletePatient(patientToDelete);
        toast.success('Patient supprimé avec succès');
        fetchPatients();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Erreur lors de la suppression');
      } finally {
        setOpenDeleteDialog(false);
        setPatientToDelete(null);
      }
    }
  };

  const handleEdit = (patient: Patient) => {
    navigate('/ajoutPatient', { state: { patient } });
  };

  return (
    <section id="content">
      <main>
        <div className="head-title">
          <div className="left">
            <h1 className='h1' style={{ color: '#bdb9b9' }}>Liste des patients</h1>
            <ul className="breadcrumb">
              <li><a href="#">G-Patient</a></li>
              <li><i className='bx bx-chevron-right'></i></li>
              <li><a className="active" href="/listPatient">Liste des patients</a></li>
            </ul>
          </div>
          <a href="/ajoutPatient" className="btn-download">
            <i className='bx bx-plus'></i>
            <span className="text">AJOUTER</span>
          </a>
        </div>

        <div className="table-date">
          <div className="orber">
            <div className="head">
              <h3 style={{ color: '#bdb9b9' }}>Détail des patiens</h3>
              <i className='bx bx-search icon-tbl'></i>
              <i className='bx bx-filter icon-tbl'></i>
            </div>
            <table>
              <thead className="thead">
                <tr>
                  <th>CIN</th>
                  <th>Nom</th>
                  <th>Prénom</th>
                  <th>Âge</th>
                  <th>Sexe</th>
                  <th>Adresse</th>
                  <th>Téléphone</th>
                  <th>Email</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="tbody">
                {patients.length > 0 ? (
                  patients.map((patient) => (
                    <tr key={patient.cinPatient}>
                      <td>{patient.cinPatient}</td>
                      <td>{patient.nom}</td>
                      <td>{patient.prenom}</td>
                      <td>{patient.age}</td>
                      <td>{patient.sexe}</td>
                      <td>{patient.adresse || '-'}</td>
                      <td>{patient.telephone || '-'}</td>
                      <td>{patient.email || '-'}</td>
                      <td className='td-tbn-actions'>
                        <button 
                          className="edit-btn"
                          onClick={() => handleEdit(patient)}
                        >
                          <i className='bx bx-edit'></i>
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => handleDeleteClick(patient.cinPatient)}
                        >
                          <i className='bx bx-trash'></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center' }}>
                      Aucun patient trouvé
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
          Êtes-vous sûr de vouloir supprimer ce patient ?
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

export default ListPatient;