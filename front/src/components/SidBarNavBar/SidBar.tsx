import { useEffect, useState, useCallback} from 'react';
import '../SidBarNavBar/SidBar.css';
import Profil from '../../assets/images/a1.png';
import Logo from '../../assets/images/Logo.png';
import { getPendingRendezVousCount, getPendingRendezVousNotifications, updateRendezVousStatus, Notification } from '../../services/rendezVous_api';

import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import Popover from '@mui/material/Popover';
import { pink } from '@mui/material/colors';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


// Boutons personnalisés
const ConfirmButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#4caf50',
  color: 'white',
  fontWeight: 'bold',
  textTransform: 'none',
  borderRadius: '20px',
  padding: '6px 16px',
  fontSize: '0.8rem',
  boxShadow: 'none',
  '&:hover': {
    backgroundColor: '#388e3c',
    boxShadow: '0 2px 10px rgba(76, 175, 80, 0.4)'
  },
  '&:active': {
    transform: 'scale(0.98)'
  }
}));

const CancelButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#f44336',
  color: 'white',
  fontWeight: 'bold',
  textTransform: 'none',
  borderRadius: '20px',
  padding: '6px 16px',
  fontSize: '0.8rem',
  boxShadow: 'none',
  '&:hover': {
    backgroundColor: '#d32f2f',
    boxShadow: '0 2px 10px rgba(244, 67, 54, 0.4)'
  },
  '&:active': {
    transform: 'scale(0.98)'
  }
}));


interface MessageExample {
  primary: string;
  secondary: string;
  person: string;
}

const messageExamples: readonly MessageExample[] = [
  {
    primary: 'Nouveau rendez-vous',
    secondary: "Mr PrenomPatient a ete demander en rendez-vous a Dr PrenomPraticien du Date et heure",
    person: '/static/images/avatar/5.jpg',
  },
];

const SidBar = () => {
  const [sidebarHidden, setSidebarHidden] = useState(
    localStorage.getItem('sidebarHidden') === 'true' || window.innerWidth < 768
  );
  const [darkTheme, setDarkTheme] = useState(localStorage.getItem('theme') === 'dark');
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState(localStorage.getItem('activeMenu') || 'Dashboard');
  const [notificationCount, setNotificationCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState<HTMLAnchorElement | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pendingCount, setPendingCount] = useState<number>(0);

  const open = Boolean(anchorEl);

  // Chargement initial et vérification périodique
  const fetchData = useCallback(async () => {
    try {
      const count = await getPendingRendezVousCount();
      setPendingCount(count);
      setNotificationCount(count);
      if (count > 0) setNotifications(await getPendingRendezVousNotifications());
    } catch (error) {
      toast.error(error.message);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // ******************************
  // Gestion du redimensionnement
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      setSidebarHidden(isMobile);
      
      if (window.innerWidth > 576) {
        setSearchExpanded(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Appliquer le thème au chargement
  useEffect(() => {
    document.body.classList.toggle('dark-theme-variables', darkTheme);
  }, [darkTheme]);

  // Sauvegarder l'état du menu actif
  useEffect(() => {
    localStorage.setItem('activeMenu', activeMenuItem);
  }, [activeMenuItem]);

  // Sauvegarder l'état de la barre latérale
  useEffect(() => {
    localStorage.setItem('sidebarHidden', sidebarHidden.toString());
  }, [sidebarHidden]);

  const toggleSidebar = () => {
    setSidebarHidden((prev) => {
      const newState = !prev;
      localStorage.setItem('sidebarHidden', newState.toString());
      return newState;
    });
  };

  const toggleTheme = () => {
    const newTheme = !darkTheme;
    setDarkTheme(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : '');
  };

  const handleSearchClick = (e) => {
    if (window.innerWidth < 576) {
      e.preventDefault();
      setSearchExpanded(!searchExpanded);
    }
  };

  const handleMenuItemClick = (menuItem) => {
    setActiveMenuItem(menuItem);
  };
  // ******************************************

  const handleNotificationClick = async (event: React.MouseEvent<HTMLAnchorElement>) => {
    setAnchorEl(event.currentTarget);
    setNotificationCount(0);
    
    // Rafraîchir les notifications lorsqu'on clique
    try {
      const notifs = await getPendingRendezVousNotifications();
      setNotifications(notifs);
    } catch (error) {
      console.error("Erreur lors du rafraîchissement des notifications:", error);
    }
  };

  const handleCloseNotifications = () => {
    setAnchorEl(null);
  };

 
  const [isConfirming, setIsConfirming] = useState<number | null>(null);

  const handleConfirm = async (idRdv: number) => {
    setIsConfirming(idRdv);
    try {
      const response = await updateRendezVousStatus(idRdv, 'confirme');
      
      if (!response || !response.success) {
        throw new Error(response?.message || 'Réponse invalide du serveur');
      }
  
      setNotifications(prev => prev.filter(notif => notif.idRdv !== idRdv));
      setPendingCount(prev => prev - 1);
      setNotificationCount(prev => prev - 1);
      
    
      toast.success('Rendez-vous confirmé avec succès');
      
    } catch (error) {
      console.error("Erreur confirmation:", {
        error,
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      toast.error(
        error instanceof Error ? 
        `Échec de confirmation: ${error.message}` : 
        'Erreur inconnue lors de la confirmation'
      );
      
    } finally {
      setIsConfirming(null);
    }
  };

  const handleCancel = async (idRdv: number) => {
    try {
      await updateRendezVousStatus(idRdv, 'annule');
      setNotifications(prev => prev.filter(notif => notif.idRdv !== idRdv));
      setPendingCount(prev => prev - 1);
      setNotificationCount(prev => prev - 1);
      toast.success('Rendez-vous annulé avec succès');
    } catch (error) {
      console.error("Erreur lors de l'annulation:", error);
      toast.error(error instanceof Error ? error.message : 'Erreur inconnue');
    }
  };

  return (
    <>
      {/* SidBar */}
      <section id="sidebar" className={sidebarHidden ? 'hide' : ''}>
        <a href="/" className="brand">
          <img className='Logo' width={40} src={Logo} alt="Logo" />
          <span className="text txt-Logo">G-PATIENT</span>
        </a>
        <ul className="side-menu top">
          <li className={activeMenuItem === 'Dashboard' ? 'active' : ''}>
            <a href="/" onClick={() => handleMenuItemClick('Dashboard')}>
              <i className="bx bxs-dashboard"></i>
              <span className="text">Tableau de bord</span>
            </a>
          </li>
          <li className={activeMenuItem === 'My Store' ? 'active' : ''}>
            <a href="/listPatient" onClick={() => handleMenuItemClick('My Store')}>
              <i className='bx bxs-detail'></i>
              <span className="text">Liste des patients</span>
            </a>
          </li>
          <li className={activeMenuItem === 'Team' ? 'active' : ''}>
            <a href="/listPraticien" onClick={() => handleMenuItemClick('Team')}>
              <i className='bx bx-spreadsheet'></i>  
              <span className="text">Liste des praticiens</span>
            </a>
          </li>
          <li className={activeMenuItem === 'Analytics' ? 'active' : ''}>
            <a href="/listRdv" onClick={() => handleMenuItemClick('Analytics')}>
              <i className='bx bx-calendar-check'></i>  
              <span className="text">Rendez-vous</span>
            </a>
          </li>
          <li className={activeMenuItem === 'Analytic' ? 'active' : ''}>
            <a href="/listRdvExamen" onClick={() => handleMenuItemClick('Analytic')}>
              <i className='bx bx-calendar-check'></i>  
              <span className="text">Rendez-vous pour l'examen</span>
            </a>
          </li>
          <li className={activeMenuItem === 'Consultation' ? 'active' : ''}>
            <a href="/listConsultation" onClick={() => handleMenuItemClick('Consultation')}>
              <i className='bx bx-user-voice'></i>  
              <span className="text">Consultation</span>
            </a>
          </li>
          <li className={activeMenuItem === 'Prescription' ? 'active' : ''}>
            <a href="/listPrescrire" onClick={() => handleMenuItemClick('Prescription')}>
              <i className='bx bx-spreadsheet'></i>
              <span className="text">Préscription</span>
            </a>
          </li>
          <li className={activeMenuItem === 'Suivi' ? 'active' : ''}>
            <a href="/listSuivi" onClick={() => handleMenuItemClick('Suivi')}>
              <i className='bx bx-list-check'></i>  
              <span className="text">Liste de suivi</span>
            </a>
          </li>
          <li className={activeMenuItem === 'Examen' ? 'active' : ''}>
            <a href="/listExamen" onClick={() => handleMenuItemClick('Examen')}>
              <i className='bx bx-first-aid'></i>  
              <span className="text">Examen médical</span>
            </a>
          </li>
        </ul>
        <div className="bottom-menu">
          <ul className="side-menu">
            <li>
              <a href="/parametres">
                <i className="bx bxs-cog"></i>
                <span className="text">Paramètres</span>
              </a>
            </li>
            <li>
              <a href="#" className="logout">
                <i className='bx bx-log-out'></i>
                <span className="text">Déconnexion</span>
              </a>
            </li>
          </ul>
        </div>
      </section>

      {/* NavBar et Content */}
      <section id="content" style={{
          left: sidebarHidden ? '54px' : '280px',
          width: sidebarHidden ? 'calc(100% - 54px)' : 'calc(100% - 280px)'
        }}>
        <nav>
            <i className="bx bx-menu menu" onClick={toggleSidebar}></i>
            <a href="#" className="nav-link">Catégories</a>
            <form action="#" className={searchExpanded ? 'show' : ''}>
                <div className="form-input">
                <input 
                    type="search" 
                    placeholder="Chercher..." 
                    className={darkTheme ? 'dark-input' : ''}
                />
                <button 
                    type="submit" 
                    className="search-btn" 
                    onClick={handleSearchClick}
                >
                    <i className={`bx ${searchExpanded ? 'bx-x' : 'bx-search'}`}></i>
                </button>
                </div>
            </form>

            <div className="theme-toggler" onClick={toggleTheme}>
                <i className={`bx bxs-brightness-half them ${darkTheme ? 'active' : ''}`}></i>
            </div>

            <a 
              href="#" 
              className="notification" 
              onClick={handleNotificationClick}
              aria-describedby="notification-popover"
            >
              <i className="bx bxs-bell"></i>
              {notificationCount > 0 && <span className="num">{notificationCount}</span>}
            </a>

            

            <Popover
              id="notification-popover"
              open={open}
              anchorEl={anchorEl}
              onClose={handleCloseNotifications}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              sx={{
                '& .MuiPaper-root': {
                  width: '450px',
                  maxHeight: '500px',
                  overflow: 'auto',
                  borderRadius: '12px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                }
              }}
            >
              <Box sx={{ pb: 7 }}>
                <CssBaseline />
                <List sx={{ p: 0 }}>
                  {notifications.length > 0 ? (
                    notifications.map((notification, index) => (
                      <Box key={index} sx={{ 
                        borderBottom: '1px solid rgba(0,0,0,0.08)',
                        '&:last-child': { borderBottom: 'none' }
                      }}>
                        <ListItemButton sx={{ pt: 2, pb: 1 }}>
                          <ListItemAvatar>
                            <Avatar
                              sx={{ 
                                bgcolor: pink[100],
                                color: pink[600],
                                fontWeight: 'bold'
                              }}
                              alt="Notification"
                            >
                              {notification.primary.charAt(0)}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText 
                            primary={
                              <span style={{ 
                                fontWeight: '600',
                                color: '#333'
                              }}>
                                {notification.primary}
                              </span>
                            }
                            secondary={
                              <span style={{ 
                                color: '#666',
                                fontSize: '0.9rem'
                              }}>
                                {notification.secondary}
                              </span>
                            }
                            secondaryTypographyProps={{ 
                              style: { 
                                whiteSpace: 'normal',
                                marginTop: '4px'
                              } 
                            }}
                            sx={{ pr: 2 }}
                          />
                        </ListItemButton>
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'flex-end',
                          pb: 2,
                          px: 2,
                          gap: 1
                        }}>
                          <ConfirmButton 
                            variant="contained"
                            component="a"
                            href="/listRdv"
                            onClick={() => handleConfirm(notification.idRdv)}
                            disabled={isConfirming === notification.idRdv}
                          >
                            {isConfirming === notification.idRdv ? (
                              <CircularProgress size={24} />
                            ) : (
                              "Confirmer"
                            )}
                          </ConfirmButton>
                          <CancelButton 
                            variant="contained"
                            component="a"
                            href="/listRdv"
                            onClick={() => handleCancel(notification.idRdv)}
                          >
                            Annuler
                          </CancelButton>
                        </Box>
                      </Box>
                    ))
                  ) : (
                    <ListItemButton>
                      <ListItemText 
                        primary="Aucune nouvelle notification"
                        primaryTypographyProps={{ 
                          style: { 
                            color: '#888',
                            textAlign: 'center',
                            fontStyle: 'italic'
                          } 
                        }}
                      />
                    </ListItemButton>
                  )}
                </List>
                <Paper sx={{ 
                  position: 'sticky', 
                  bottom: 0, 
                  left: 0, 
                  right: 0,
                  borderTop: '1px solid rgba(0,0,0,0.05)',
                  background: 'rgba(255,255,255,0.8)',
                  backdropFilter: 'blur(5px)'
                }} elevation={0}>
                  <BottomNavigation
                    showLabels
                    sx={{
                      '& .MuiBottomNavigationAction-root': {
                        minWidth: 'auto',
                        padding: '8px 0'
                      }
                    }}
                  >
                    <BottomNavigationAction 
                      className='btn-voir-plus' 
                      label="VOIR PLUS ..." 
                      component="a"
                      href="/messages#"
                      sx={{
                        color: '#1976d2',
                        fontWeight: '500',
                        '&:hover': {
                          backgroundColor: 'rgba(25, 118, 210, 0.04)'
                        }
                      }}
                    />
                  </BottomNavigation>
                </Paper>
              </Box>
            </Popover>
                    
            <div className="right">
                <div className="top">
                    <div className="profile">
                        <div className="info">
                            <p className="admin-nom">Mr, <b>Robot</b></p>
                            <small className="text-muted admin-grad">Administrateur</small>
                        </div>
                    </div>
                </div>
            </div>
            <a href="#" className="profile">
                <img src={Profil} alt="Profil" />
            </a>
        </nav>

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
    </>
  );
};

export default SidBar;