import '../ContainerHome/ContainerHome.css';
// import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getAllPatients} from '../../../services/patients_api';
import { getAllPraticiens } from '../../../services/praticiens_api';
import { getAllPrescriptions } from '../../../services/prscrires_api';

import { ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import PagePatientDashbord from '../../../pages/PagePatientDashbord/PagePatientDashbord';
import PagePraticienDashbord from '../../../pages/PagePraticienDashbord/PagePraticienDashbord';


const ContainerHome = () => {
    // const navigate = useNavigate();
    const [totalPatients, setTotalPatients] = useState<number>(0);
    const [totalPraticiens, setTotalPraticiens] = useState<number>(0);
    const [totalSuivis, setTotalSuivis] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);


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
                    <div className="orber orber-tab1">
                        <PagePatientDashbord />
                    </div>

                    <div className="todo">
                       <PagePraticienDashbord />
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