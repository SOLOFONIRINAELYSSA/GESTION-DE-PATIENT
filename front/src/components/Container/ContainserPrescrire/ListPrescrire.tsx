import { useEffect, useState } from 'react';
import { getAllPrescriptions, Prescription, deletePrescription } from '../../../services/prscrires_api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import './prescrire.css'

const ListPrescrire = () => {
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [filteredPrescriptions, setFilteredPrescriptions] = useState<Prescription[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [prescriptionToDelete, setPrescriptionToDelete] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showSearchInput, setShowSearchInput] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPrescriptions = async () => {
            try {
                const data = await getAllPrescriptions();
                setPrescriptions(data);
                setFilteredPrescriptions(data);
                setLoading(false);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Une erreur est survenue');
                setLoading(false);
                toast.error(err instanceof Error ? err.message : 'Erreur lors de la récupération des prescriptions');
            }
        };
        fetchPrescriptions();
    }, []);

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        if (term.trim() === '') {
            setFilteredPrescriptions(prescriptions);
            return;
        }

        const lowerTerm = term.toLowerCase();
        
        const filtered = prescriptions.filter(prescription => {
            // Recherche par date (format: jj/mm/aaaa)
            const dateStr = new Date(prescription.datePrescrire).toLocaleDateString('fr-FR');
            const dateMatch = dateStr.includes(lowerTerm);
            
            // Recherche par type de prescription
            const typeMatch = prescription.typePrescrire?.toLowerCase().includes(lowerTerm) || false;
            
            // Recherche par posologie
            const posologieMatch = prescription.posologie?.toLowerCase().includes(lowerTerm) || false;
            
            // Recherche par prénom du patient
            const patientMatch = prescription.prenomPatient?.toLowerCase().includes(lowerTerm) || false;

            return dateMatch || typeMatch || posologieMatch || patientMatch;
        });

        setFilteredPrescriptions(filtered);
    };

    const handleDeleteClick = (idPrescrire: number) => {
        setPrescriptionToDelete(idPrescrire);
        setOpenDeleteDialog(true);
    };

    const handleCancelDelete = () => {
        setOpenDeleteDialog(false);
        setPrescriptionToDelete(null);
    };

    const handleConfirmDelete = async () => {
        if (prescriptionToDelete) {
            try {
                await deletePrescription(prescriptionToDelete);
                toast.success('Prescription supprimée avec succès');
                const updatedPrescriptions = prescriptions.filter(p => p.idPrescrire !== prescriptionToDelete);
                setPrescriptions(updatedPrescriptions);
                setFilteredPrescriptions(updatedPrescriptions);
            } catch (error) {
                toast.error(error instanceof Error ? error.message : 'Erreur lors de la suppression');
            } finally {
                setOpenDeleteDialog(false);
                setPrescriptionToDelete(null);
            }
        }
    };

    const handleEdit = (prescription: Prescription) => {
        const consultationToEdit = {
            ...prescription,
            idConsult: prescription.idConsult || 0,
            datePrescrire: prescription.datePrescrire || '',
            typePrescrire: prescription.typePrescrire || '',
            posologie: prescription.posologie || ''
        };
        
        navigate('/ajoutPrescrire', { 
            state: { 
                prescription: consultationToEdit,
                rendezVous: {
                    idConsult: prescription.idConsult,
                    dateConsult: prescription.dateConsult,
                    prenomPatient: prescription.prenomPatient,
                    prenomPraticien: prescription.prenomPraticien
                }
            } 
        });
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    if (loading) {
        return (
            <section id="content">
                <main>
                    <div className="head-title">
                        <div className="left">
                            <h1 className='h1'>Prescription d'une consultation du patient</h1>
                            <ul className="breadcrumb">
                                <li><a href="#">Prescrire</a></li>
                                <li><i className='bx bx-chevron-right'></i></li>
                                <li><a className="active" href="/listPrescrire">Liste des prescriptions</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="table-date">
                        <p>Chargement en cours...</p>
                    </div>
                </main>
            </section>
        );
    }

    if (error) {
        return (
            <section id="content">
                <main>
                    <div className="head-title">
                        <div className="left">
                            <h1 className='h1'>Prescription d'une consultation du patient</h1>
                            <ul className="breadcrumb">
                                <li><a href="#">Prescrire</a></li>
                                <li><i className='bx bx-chevron-right'></i></li>
                                <li><a className="active" href="/listPrescrire">Liste des prescriptions</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="table-date">
                        <p className="error">{error}</p>
                    </div>
                </main>
            </section>
        );
    }

    return (
        <section id="content">
            <main>
                <div className="head-title">
                    <div className="left">
                        <h1 className='h1' style={{ color: '#bdb9b9' }}>Prescription d'une consultation du patient</h1>
                        <ul className="breadcrumb">
                            <li><a href="#">Prescrire</a></li>
                            <li><i className='bx bx-chevron-right'></i></li>
                            <li><a className="active" href="/listPrescrire">Liste des prescriptions</a></li>
                        </ul>
                    </div>
                    <a href="/ajoutPrescrire" className="btn-download">
                        <i className='bx bx-plus'></i>
                        <span className="text">AJOUTER</span>
                    </a>
                </div>

                <div className="table-date">
                    <div className="orber">
                        <div className="head">
                            <h3 style={{ color: '#bdb9b9' }}>Liste des prescriptions</h3>
                            <div className="search-container">
                                {showSearchInput && (
                                    <input
                                        type="text"
                                        placeholder="Rechercher par date, type, posologie ou patient..."
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
                                    <th>Date prescription</th>
                                    <th>Consultation</th>
                                    <th>Type prescription</th>
                                    <th>Posologie</th>
                                    <th className='th'>Actions</th>
                                </tr>
                            </thead>
                            <tbody className="tbody">
                                {filteredPrescriptions.length > 0 ? (
                                    filteredPrescriptions.map((prescription) => (
                                        <tr key={prescription.idPrescrire}>
                                            <td>{formatDate(prescription.datePrescrire)}</td>
                                            <td> Consultation du &nbsp;
                                                {prescription.prenomPatient} le  &nbsp;
                                                {prescription.dateConsult ? formatDate(prescription.dateConsult) : 'N/A'}
                                            </td>
                                            <td>{prescription.typePrescrire}</td>
                                            <td>{prescription.posologie || 'Pas de posologie' }</td>
                                            <td className='td-tbn-actions'>
                                                <button 
                                                    className="edit-btn"
                                                    onClick={() => handleEdit(prescription)}
                                                >
                                                    <i className='bx bx-edit'></i>
                                                </button>
                                                <button 
                                                    className="delete-btn"
                                                    onClick={() => handleDeleteClick(prescription.idPrescrire)}
                                                >
                                                    <i className='bx bx-trash'></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: 'center' }}>
                                            {searchTerm ? 'Aucune prescription ne correspond à votre recherche' : 'Aucune prescription disponible'}
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
                    Êtes-vous sûr de vouloir supprimer cette prescription ?
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

export default ListPrescrire;