import { useState } from 'react';
import { updateRendezVousStatus, RendezVous } from '../../../services/rendezVous_api';
import '../ContainerRendezVous/notification.css';

interface NotificationProps {
  unreadCount: number;
  notifications: RendezVous[];
  onBellClick: () => void;
  onStatusUpdate: (idRdv: number) => void; // On garde number car on vérifiera avant l'appel
}

const Notification = ({ 
  unreadCount, 
  notifications, 
  onBellClick, 
  onStatusUpdate 
}: NotificationProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(!isOpen);
    if (!isOpen) onBellClick();
  };

  const handleAction = async (rdv: RendezVous, action: 'confirme' | 'annule') => {
    if (rdv.idRdv === undefined) {
      console.error("Impossible de mettre à jour - idRdv manquant");
      return;
    }

    try {
      await updateRendezVousStatus(rdv.idRdv, action);
      onStatusUpdate(rdv.idRdv);
    } catch (error) {
      console.error("Erreur de mise à jour:", error);
    }
  };

  return (
    <div className="notification-container">
      <div className="bell-icon" onClick={handleClick}>
        
        {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
      </div>

      {isOpen && (
        <div className="dropdown">
          {notifications.length === 0 ? (
            <div className="empty-message">Aucun nouveau rendez-vous</div>
          ) : (
            notifications.map(rdv => (
              <div key={rdv.idRdv || rdv.dateHeure} className="notification-item">
                <span>
                  RDV {rdv.idRdv ? `#${rdv.idRdv}` : 'Nouveau'} - {new Date(rdv.dateHeure).toLocaleString()}
                </span>
                <div className="notification-actions">
                  <button
                    onClick={() => handleAction(rdv, 'confirme')}
                    className="confirm-btn"
                  >
                    Confirmer
                  </button>
                  <button
                    onClick={() => handleAction(rdv, 'annule')}
                    className="cancel-btn"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Notification;