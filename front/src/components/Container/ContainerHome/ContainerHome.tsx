import React from 'react';
import '../ContainerHome/ContainerHome.css';
// import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getAllPatients, Patient } from '../../../services/patients_api';
import { getAllPraticiens, Praticien } from '../../../services/praticiens_api';
import { getAllPrescriptions } from '../../../services/prscrires_api';

import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const ContainerHome = () => {
    // const navigate = useNavigate();
    const [totalPatients, setTotalPatients] = useState<number>(0);
    const [totalPraticiens, setTotalPraticiens] = useState<number>(0);
    const [totalSuivis, setTotalSuivis] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [patients, setPatients] = useState<Patient[]>([]);
    const [praticiens, setPraticiens] = useState<Praticien[]>([]);

    // ***********************count patients***************
    useEffect(() => {
        const fetchPatientCount = async () => {
          try {
            setLoading(true);
            const patients = await getAllPatients();
            setTotalPatients(patients.length);
            setError(null);
          } catch (err) {
            console.error("Erreur de récupération", err);
            setError(err instanceof Error ? err.message : "Erreur inconnue");
            setTotalPatients(0);
          } finally {
            setLoading(false);
          }
        };
    
        fetchPatientCount();
      }, []);


    //   *********************count praticiens******************
    useEffect(() => {
        const fetchPraticienCount = async () => {
          try {
            setLoading(true);
            const praticiens = await getAllPraticiens();
            setTotalPraticiens(praticiens.length);
            setError(null);
          } catch (err) {
            console.error("Erreur de récupération", err);
            setError(err instanceof Error ? err.message : "Erreur inconnue");
            setTotalPraticiens(0);
          } finally {
            setLoading(false);
          }
        };
    
        fetchPraticienCount();
      }, []);

    //   **************count suivis**************************
    useEffect(() => {
        const fetchSuiviCount = async () => {
          try {
            setLoading(true);
            const suivis = await getAllPrescriptions();
            setTotalSuivis(suivis.length);
            setError(null);
          } catch (err) {
            console.error("Erreur de récupération", err);
            setError(err instanceof Error ? err.message : "Erreur inconnue");
            setTotalSuivis(0);
          } finally {
            setLoading(false);
          }
        };
    
        fetchSuiviCount();
      }, []);

    //   ******************************************table****************
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
    // **********************************
            useEffect(() => {
                fetchPraticiens();
            }, []);

            const fetchPraticiens = async () => {
                try {
                const data = await getAllPraticiens();
                setPraticiens(data);
                } catch (error) {
                toast.error(error instanceof Error ? error.message : 'Erreur lors de la récupération des praticiens');
                }
            };
    // *************************
    
      if (loading) return <div className="stat-box loading">Chargement...</div>;
      if (error) return <div className="stat-box error">{error}</div>;

    return (
        <section id="content">
            <main>
                <div className="head-title">
                    <div className="left">
                        <h1>Tableau de bord</h1>
                        <ul className="breadcrumb">
                            <li><a href="#">Gestion-Patient</a></li>
                            <li><i className='bx bx-chevron-right'></i></li>
                            <li><a className="active" href="/">Tableau de bord</a></li>
                        </ul>
                    </div>
                    <a href="/ajoutPatient" className="btn-download">
                        <i className='bx bx-plus'></i>
                        <span className="text">AJOUTER</span>
                    </a>
                </div>

                <ul className="box-info">
                    <li>
                        <i className='bx bx-user-pin'></i>
                        <span className="text">
                        <h3 className="txt-box-top">{totalPatients.toLocaleString()}</h3>
                        <p className="txt-box-bottom">Total des patients</p>
                        </span>
                    </li>
                    <li>
                        <i className='bx bx-badge-check'></i>
                        <span className="text">
                            <h3 className="txt-box-top">{totalPraticiens.toLocaleString()}</h3>
                            <p className="txt-box-bottom">Total des praticiens</p>
                        </span>
                    </li>
                    <li>
                        <i className='bx bx-bookmark-alt'></i>
                        <span className="text">
                        <h3 className="txt-box-top">{totalSuivis.toLocaleString()}</h3>
                            <p className="txt-box-bottom">Total des patients suivis</p>
                        </span>
                    </li>
                </ul>

                <div className="table-date">
                    <div className="orber">
                        <Paper className='' sx={{ 
                        width: '100%', 
                        overflow: 'hidden',
                        backgroundColor: 'white',
                        display: 'flex',
                        flexDirection: 'column'
                        }}>
                            <TableContainer sx={{ 
                                flex: 1,
                                maxHeight: 440,
                                backgroundColor: 'white',
                                overflow: 'auto', 
                                '&::-webkit-scrollbar': {
                                width: '10px',
                                height: '10px'
                                },
                                '&::-webkit-scrollbar-track': {
                                background: '#f1f1f1',
                                borderRadius: '10px'
                                },
                                '&::-webkit-scrollbar-thumb': {
                                background: '#bdb9b9',
                                borderRadius: '10px',
                                },
                                '&::-webkit-scrollbar-thumb:hover': {
                                background: '#a8a5a5',
                                },
                                '&::-webkit-scrollbar-corner': {
                                background: '#f1f1f1'
                                }
                            }}>
                                <div className="tbl">
                                    <Table 
                                    stickyHeader 
                                    aria-label="sticky table" 
                                    sx={{ 
                                        minWidth: 'max-content', // Force la largeur à s'adapter au contenu
                                    }}
                                    className=' '
                                    >
                                    <TableHead>
                                        <TableRow>
                                        <TableCell style={{ minWidth: 100, backgroundColor: '#bdb9b9', color: 'black', fontWeight: 'bold' }}>CIN</TableCell>
                                        <TableCell style={{ minWidth: 120, backgroundColor: '#bdb9b9', color: 'black', fontWeight: 'bold' }}>Nom</TableCell>
                                        <TableCell style={{ minWidth: 120, backgroundColor: '#bdb9b9', color: 'black', fontWeight: 'bold' }}>Prénom</TableCell>
                                        <TableCell style={{ minWidth: 80, backgroundColor: '#bdb9b9', color: 'black', fontWeight: 'bold', textAlign: 'center' }}>Âge</TableCell>
                                        <TableCell style={{ minWidth: 80, backgroundColor: '#bdb9b9', color: 'black', fontWeight: 'bold', textAlign: 'center' }}>Sexe</TableCell>
                                        <TableCell style={{ minWidth: 200, backgroundColor: '#bdb9b9', color: 'black', fontWeight: 'bold' }}>Adresse</TableCell>
                                        <TableCell style={{ minWidth: 120, backgroundColor: '#bdb9b9', color: 'black', fontWeight: 'bold' }}>Téléphone</TableCell>
                                        <TableCell style={{ minWidth: 180, backgroundColor: '#bdb9b9', color: 'black', fontWeight: 'bold' }}>Email</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {patients
                                        .map((patient) => (
                                            <TableRow 
                                            hover 
                                            role="checkbox" 
                                            tabIndex={-1} 
                                            key={patient.cinPatient}
                                            sx={{ 
                                                '&:hover': { 
                                                backgroundColor: '#f5f5f5'
                                                } 
                                            }}
                                            >
                                            <TableCell style={{ color: 'black' }}>{patient.cinPatient}</TableCell>
                                            <TableCell style={{ color: 'black' }}>{patient.nom}</TableCell>
                                            <TableCell style={{ color: 'black' }}>{patient.prenom}</TableCell>
                                            <TableCell style={{ color: 'black', textAlign: 'center' }}>{patient.age}</TableCell>
                                            <TableCell style={{ color: 'black', textAlign: 'center' }}>{patient.sexe}</TableCell>
                                            <TableCell style={{ color: 'black' }}>{patient.adresse}</TableCell>
                                            <TableCell style={{ color: 'black' }}>{patient.telephone}</TableCell>
                                            <TableCell style={{ color: 'black' }}>{patient.email}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                    </Table>
                                </div>
                            </TableContainer>
                        </Paper>
                    </div>

                    <div className="todo">
                    <Paper className='' sx={{ 
                        width: '100%', 
                        overflow: 'hidden',
                        backgroundColor: 'white',
                        display: 'flex',
                        flexDirection: 'column'
                        }}>
                            <TableContainer sx={{ 
                                flex: 1,
                                maxHeight: 440,
                                backgroundColor: 'white',
                                overflow: 'auto', 
                                '&::-webkit-scrollbar': {
                                width: '10px',
                                height: '10px'
                                },
                                '&::-webkit-scrollbar-track': {
                                background: '#f1f1f1',
                                borderRadius: '10px'
                                },
                                '&::-webkit-scrollbar-thumb': {
                                background: '#bdb9b9',
                                borderRadius: '10px',
                                },
                                '&::-webkit-scrollbar-thumb:hover': {
                                background: '#a8a5a5',
                                },
                                '&::-webkit-scrollbar-corner': {
                                background: '#f1f1f1'
                                }
                            }}>
                                <div className="tbl">
                                    <Table 
                                    stickyHeader 
                                    aria-label="sticky table" 
                                    sx={{ 
                                        minWidth: 'max-content', // Force la largeur à s'adapter au contenu
                                    }}
                                    className=' '
                                    >
                                    <TableHead>
                                        <TableRow>
                                        <TableCell style={{ minWidth: 100, backgroundColor: '#bdb9b9', color: 'black', fontWeight: 'bold' }}>CIN</TableCell>
                                        <TableCell style={{ minWidth: 120, backgroundColor: '#bdb9b9', color: 'black', fontWeight: 'bold' }}>Nom</TableCell>
                                        <TableCell style={{ minWidth: 120, backgroundColor: '#bdb9b9', color: 'black', fontWeight: 'bold' }}>Prénom</TableCell>
                                        <TableCell style={{ minWidth: 120, backgroundColor: '#bdb9b9', color: 'black', fontWeight: 'bold' }}>Téléphone</TableCell>
                                        <TableCell style={{ minWidth: 180, backgroundColor: '#bdb9b9', color: 'black', fontWeight: 'bold' }}>Email</TableCell>
                                        <TableCell style={{ minWidth: 180, backgroundColor: '#bdb9b9', color: 'black', fontWeight: 'bold' }}>Specialité</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {praticiens
                                        .map((praticien) => (
                                            <TableRow 
                                            hover 
                                            role="checkbox" 
                                            tabIndex={-1} 
                                            key={praticien.cinPraticien}
                                            sx={{ 
                                                '&:hover': { 
                                                backgroundColor: '#f5f5f5'
                                                } 
                                            }}
                                            >
                                            <TableCell style={{ color: 'black' }}>{praticien.cinPraticien}</TableCell>
                                            <TableCell style={{ color: 'black' }}>{praticien.nom}</TableCell>
                                            <TableCell style={{ color: 'black' }}>{praticien.prenom}</TableCell>
                                            <TableCell style={{ color: 'black' }}>{praticien.telephone}</TableCell>
                                            <TableCell style={{ color: 'black' }}>{praticien.email}</TableCell>
                                            <TableCell style={{ color: 'black' }}>{praticien.specialite}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                    </Table>
                                </div>
                            </TableContainer>
                        </Paper>
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

export default ContainerHome;