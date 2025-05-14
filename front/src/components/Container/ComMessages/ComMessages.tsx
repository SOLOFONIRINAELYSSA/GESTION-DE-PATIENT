import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import "./ComMessages.css";
import { GoMoveToTop } from "react-icons/go";
import { RiHomeLine } from "react-icons/ri";
import { MdOutlinePayment } from "react-icons/md";
import { IoMdAdd } from "react-icons/io";
import { IoSearchOutline } from "react-icons/io5";
import Pagination from "@mui/material/Pagination";
import A2 from '../../../assets/images/profil.ico';
import { BsCheckCircleFill, BsXCircleFill } from 'react-icons/bs';
import { API_BASE_URL, RendezVous} from "../../../services/rendezVous_api";


const ComMessages = () => {
  const navigate = useNavigate();
  const [activeCrumb, setActiveCrumb] = useState("etudiant");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [pendingRendezVous, setPendingRendezVous] = useState<RendezVous[]>([]);
  const [actionStates, setActionStates] = useState<Record<number, 'none' | 'processing' | 'success'>>({});
  const messagesPerPage = 5;

  // Récupération des rendez-vous en attente
  const fetchPendingRendezVous = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get<{
        success: boolean;
        data: RendezVous[];
      }>(`${API_BASE_URL}/rendezVous?statut=en_attente`);
      
      if (response.data.success) {
        setPendingRendezVous(response.data.data);
      } else {
        throw new Error("Erreur lors de la récupération des données");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors du chargement des rendez-vous");
    } finally {
      setLoading(false);
    }
  }, []);

  // Mise à jour du statut
  const updateRendezVousStatus = async (idRdv: number, newStatus: 'confirme' | 'annule') => {
    try {
      setActionStates(prev => ({ ...prev, [idRdv]: 'processing' }));
      
      const response = await axios.put<{ success: boolean }>(
        `${API_BASE_URL}/rendezVous/${idRdv}`,
        { statut: newStatus }
      );

      if (!response.data.success) {
        throw new Error("La mise à jour a échoué");
      }

      setActionStates(prev => ({ ...prev, [idRdv]: 'success' }));
      setPendingRendezVous(prev => prev.filter(rdv => rdv.idRdv !== idRdv));
      toast.success(`Rendez-vous ${newStatus === 'confirme' ? 'confirmé' : 'annulé'}`);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error(`Échec de ${newStatus === 'confirme' ? 'la confirmation' : "l'annulation"}`);
      setActionStates(prev => ({ ...prev, [idRdv]: 'none' }));
    }
  };

  // Formatage de la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 1) return 'Hier';
    if (diffDays > 1 && diffDays <= 7) return `Il y a ${diffDays} jours`;
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Chargement initial et polling
  useEffect(() => {
    fetchPendingRendezVous();
    const interval = setInterval(fetchPendingRendezVous, 30000);
    return () => clearInterval(interval);
  }, [fetchPendingRendezVous]);

  // Filtrage et pagination
  const filteredMessages = pendingRendezVous.filter(rdv => {
    const searchLower = searchQuery.toLowerCase();
    const patientName = `${rdv.patientInfo?.prenom || ''} ${rdv.patientInfo?.nom || ''}`.toLowerCase();
    const praticienName = `${rdv.praticienInfo?.prenom || ''} ${rdv.praticienInfo?.nom || ''}`.toLowerCase();
    
    return (
      patientName.includes(searchLower) ||
      praticienName.includes(searchLower) ||
      rdv.dateHeure.toLowerCase().includes(searchLower)
    );
  });

  const currentMessages = filteredMessages.slice(
    (currentPage - 1) * messagesPerPage,
    currentPage * messagesPerPage
  );

  const handleCrumbClick = (path: string, crumbName: string) => {
    setActiveCrumb(crumbName);
    navigate(path);
    localStorage.setItem('activeSidebarItem', crumbName === "accueil" ? "acceuil" : crumbName);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section id="content">
      <main>
        <div className="head-title">
          <div className="left">
            <h1 className='h1' style={{ color: '#bdb9b9' }}>Rendez-vous en attente</h1>
            <ul className="breadcrumb">
              <li><a href="#">Rendez-vous</a></li>
              <li><i className='bx bx-chevron-right'></i></li>
              <li><a className="active" href="/messages">En attente</a></li>
              <li><i className='bx bx-chevron-right'></i></li>
              <li><a className="active" href="/listRdv">Liste des rendez-vous</a></li>
            </ul>
          </div>
          <a href="/ajoutRdv" className="btn-download">
            <i className='bx bx-plus'></i>
            <span className="text">AJOUTER</span>
          </a>
        </div>

        <div className="table-date">
          <div className="orber">
            <div className="detailMessage">
              <div className="title-table">
                <h3 className="h3-title-table">Liste des rendez-vous ({filteredMessages.length})</h3>
              </div>

              <div className="ListeMessage">
                <div className="message-list">
                  {loading ? (
                    <div className="no-results">Chargement en cours...</div>
                  ) : currentMessages.length > 0 ? (
                    currentMessages.map(rdv => {
                      const actionState = actionStates[rdv.idRdv!] || 'none';
                      const isProcessed = actionState === 'success';

                      return (
                        <div 
                          key={rdv.idRdv} 
                          className={`message-card ${isProcessed ? '' : 'unread'}`}
                        >
                          <div className="message-header">
                            <img src={A2} alt="Avatar" className="message-avatar" />
                            <div className="message-sender">
                              Rendez-vous du {rdv.prenomPatient} avec Dr. {rdv.prenomPraticien}
                            </div>
                            <div className="message-time">
                              {formatDate(rdv.dateHeure)}
                            </div>
                          </div>
                          <div className="message-content">
                            <p>Rendez-vous en attente de confirmation</p>
                          </div>
                          <div className={`message-status ensbl-statu-btn ${isProcessed ? 'read' : ''}`}>
                            <div className="statu-msg">
                              {actionState === 'success' ? (
                                actionStates[rdv.idRdv!] === 'success' ? (
                                  <>
                                    <BsCheckCircleFill style={{ color: '#4CAF50' }} /> Confirmé
                                  </>
                                ) : ( 
                                  <>
                                    <BsXCircleFill style={{ color: '#f44336' }} /> Annulé
                                  </>
                                )
                              ) : (
                                <>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M8.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093L8.95 4.992a.252.252 0 0 1 .02-.022z" />
                                  </svg>
                                  En attente
                                </>
                              )}
                            </div>

                            <div className="reponse">
                              <button
                                className={`repondre ${actionState === 'success' ? 'confirmed' : ''}`}
                                onClick={() => updateRendezVousStatus(rdv.idRdv!, 'confirme')}
                                disabled={actionState !== 'none'}
                              >
                                {actionState === 'processing' ? 'Confirmation...' : 'Confirmer'}
                              </button> &nbsp;
                              <button
                                className={`repondre red ${actionState === 'success' ? 'cancelled' : ''}`}
                                onClick={() => updateRendezVousStatus(rdv.idRdv!, 'annule')}
                                disabled={actionState !== 'none'}
                              >
                                {actionState === 'processing' ? 'Annulation...' : 'Annuler'}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="no-results">
                      {searchQuery ? 
                        "Aucun rendez-vous trouvé pour votre recherche" : 
                        "Aucun rendez-vous en attente"}
                    </div>
                  )}
                </div>
              </div>

              {filteredMessages.length > messagesPerPage && (
                <div className="pagination-container">
                  <Pagination
                    count={Math.ceil(filteredMessages.length / messagesPerPage)}
                    page={currentPage}
                    onChange={handlePageChange}
                    sx={{
                      '& .MuiPaginationItem-root': {
                        color: '#333',
                      },
                      '& .MuiPaginationItem-page.Mui-selected': {
                        backgroundColor: 'blue',
                        color: 'white',
                      },
                      '& .MuiPaginationItem-page:hover': {
                        backgroundColor: 'rgba(55, 17, 248, 0.1)',
                      },
                      '& .MuiPaginationItem-page.Mui-selected:hover': {
                        backgroundColor: '#0000cc',
                      }
                    }}
                    showFirstButton
                    showLastButton
                    shape="rounded"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </section>
  );
};

export default ComMessages;