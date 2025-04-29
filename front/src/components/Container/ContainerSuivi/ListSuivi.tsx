import { useEffect, useState } from 'react';
import { getAllPrescriptions, deletePrescription } from '../../../services/prscrires_api';
import { getAllPraticiens } from '../../../services/praticiens_api';
import { getAllConsultations } from '../../../services/concultations_api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

interface CombinedData {
  idPrescrire: number;
  datePrescrire: string;
  typePrescrire: string;
  posologie: string;
  nomPatient?: string;
  prenomPatient?: string;
  nomPraticien?: string;
  specialite?: string;
  compteRendu?: string;
}

const ListSuivi = () => {
    const [suivis, setSuivis] = useState<CombinedData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [suiviToDelete, setSuiviToDelete] = useState<number | null>(null);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                // Récupération parallèle de toutes les données
                const [prescriptions, praticiens, consultations] = await Promise.all([
                    getAllPrescriptions(),
                    getAllPraticiens(),
                    getAllConsultations()
                ]);

                // Combinaison des données
                const combinedData = prescriptions.map(prescription => {
                    const consultation = consultations.find(c => c.idConsult === prescription.idConsult);
                    const praticien = consultation ? praticiens.find(p => p.cinPraticien === consultation.cinPraticien) : null;

                    return {
                        idPrescrire: prescription.idPrescrire,
                        datePrescrire: prescription.datePrescrire,
                        typePrescrire: prescription.typePrescrire,
                        posologie: prescription.posologie,
                        prenomPatient: prescription.prenomPatient,
                        nomPatient: prescription.nomPatient,
                        nomPraticien: praticien?.nom,
                        specialite: praticien?.specialite,
                        compteRendu: consultation?.compteRendu
                    };
                });

                setSuivis(combinedData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Une erreur est survenue');
                toast.error(err instanceof Error ? err.message : 'Erreur lors de la récupération des données');
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    const handleDeleteClick = (idPrescrire: number) => {
        setSuiviToDelete(idPrescrire);
        setOpenDeleteDialog(true);
    };

    const handleCancelDelete = () => {
        setOpenDeleteDialog(false);
        setSuiviToDelete(null);
    };

    const handleConfirmDelete = async () => {
        if (suiviToDelete) {
            try {
                await deletePrescription(suiviToDelete);
                toast.success('Suivi supprimé avec succès');
                setSuivis(suivis.filter(s => s.idPrescrire !== suiviToDelete));
            } catch (error) {
                toast.error(error instanceof Error ? error.message : 'Erreur lors de la suppression');
            } finally {
                setOpenDeleteDialog(false);
                setSuiviToDelete(null);
            }
        }
    };

    const handlePrintRow = (suivi: CombinedData) => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Détail du suivi</title>
                        <style>
                            body { font-family: Arial; margin: 20px; }
                            h1 { color: #333; }
                            .info { margin-bottom: 10px; }
                            .label { font-weight: bold; }
                        </style>
                    </head>
                    <body>
                        <h1>Détail du suivi médical</h1>
                        <div class="info"><span class="label">Date:</span> ${new Date(suivi.datePrescrire).toLocaleDateString()}</div>
                        <div class="info"><span class="label">Patient:</span> ${suivi.prenomPatient || 'Inconnu'} ${suivi.nomPatient || ''}</div>
                        <div class="info"><span class="label">Praticien:</span> ${suivi.nomPraticien ? `Dr. ${suivi.nomPraticien} (${suivi.specialite})` : 'Inconnu'}</div>
                        <div class="info"><span class="label">Compte rendu:</span> ${suivi.compteRendu || 'Non spécifié'}</div>
                        <div class="info"><span class="label">Prescription:</span> ${suivi.typePrescrire} - ${suivi.posologie}</div>
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
        }
    };

    if (loading) {
        return (
            <section id="content">
                <main>
                    <div className="head-title">
                        <div className="left">
                            <h1 className='h1'>Suivi des patients</h1>
                            <ul className="breadcrumb">
                                <li><a href="#">Suivi</a></li>
                                <li><i className='bx bx-chevron-right'></i></li>
                                <li><a className="active" href="/listSuivi">Liste des suivis</a></li>
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
                            <h1 className='h1'>Suivi des patients</h1>
                            <ul className="breadcrumb">
                                <li><a href="#">Suivi</a></li>
                                <li><i className='bx bx-chevron-right'></i></li>
                                <li><a className="active" href="/listSuivi">Liste des suivis</a></li>
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
                        <h1 className='h1'>Suivi des patients</h1>
                        <ul className="breadcrumb">
                            <li><a href="#">Suivi</a></li>
                            <li><i className='bx bx-chevron-right'></i></li>
                            <li><a className="active" href="/listSuivi">Liste des suivis</a></li>
                        </ul>
                    </div>
                    <a href="#" onClick={(e) => {
                        e.preventDefault();
                        window.print();
                    }} className="btn-download">
                        <i className='bx bx-printer'></i>
                        <span className="text">Imprimer tout</span>
                    </a>
                </div>

                <div className="table-date">
                    <div className="orber">
                        <div className="head">
                            <h3>Historique des suivis</h3>
                            <i className='bx bx-search icon-tbl'></i>
                            <i className='bx bx-filter icon-tbl'></i>
                        </div>
                        <table>
                            <thead className="thead">
                                <tr>
                                    <th>Date prescription</th>
                                    <th>Patient</th>
                                    <th>Praticien</th>
                                    <th>Compte rendu</th>
                                    <th>Prescription</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody className="tbody">
                                {suivis.length > 0 ? (
                                    suivis.map((suivi) => (
                                        <tr key={suivi.idPrescrire}>
                                            <td>{new Date(suivi.datePrescrire).toLocaleDateString()}</td>
                                            <td>{suivi.prenomPatient} {suivi.nomPatient}</td>
                                            <td>{suivi.nomPraticien ? `Dr. ${suivi.nomPraticien} (${suivi.specialite})` : 'Inconnu'}</td>
                                            <td>{suivi.compteRendu || '-'}</td>
                                            <td>{suivi.typePrescrire}: {suivi.posologie}</td>
                                            <td className='td-tbn-actions'>
                                                <button 
                                                    className="print-btn"
                                                    onClick={() => handlePrintRow(suivi)}
                                                >
                                                    <i className='bx bx-printer'></i>
                                                </button>
                                                <button 
                                                    className="delete-btn"
                                                    onClick={() => handleDeleteClick(suivi.idPrescrire)}
                                                >
                                                    <i className='bx bx-trash'></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} style={{ textAlign: 'center' }}>
                                            Aucun suivi disponible
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
                  Êtes-vous sûr de vouloir supprimer cet suivi ?
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

export default ListSuivi;