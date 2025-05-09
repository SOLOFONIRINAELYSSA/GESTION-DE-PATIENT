CREATE TABLE IF NOT EXISTS rendezVous (
    idRdv INT AUTO_INCREMENT PRIMARY KEY,
    cinPatient VARCHAR(14) NOT NULL,
    cinPraticien VARCHAR(14) NOT NULL,
    dateHeure DATETIME NOT NULL,
    statut VARCHAR(20) NOT NULL DEFAULT 'en_attente' 
        CHECK (statut IN ('en_attente', 'confirme', 'annule')),
    idRdvParent VARCHAR(14) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cinPatient) REFERENCES patients(cinPatient) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (cinPraticien) REFERENCES praticiens(cinPraticien) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (idRdvParent) REFERENCES praticiens(cinPraticien) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;