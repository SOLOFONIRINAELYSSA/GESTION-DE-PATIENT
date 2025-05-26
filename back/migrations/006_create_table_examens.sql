CREATE TABLE IF NOT EXISTS examens (
    idExamen INT AUTO_INCREMENT PRIMARY KEY,
    idPrescrire INT NOT NULL,
    typeExamen VARCHAR(100) NOT NULL,
    dateRealisation DATETIME NULL,
    statut VARCHAR(20) NOT NULL DEFAULT 'prescrit' 
        CHECK (statut IN ('prescrit', 'en_cours', 'termine', 'annule')),
    resultat TEXT NULL,
    image LONGBLOB NULL,
    laboratoire VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_examen_prescription
        FOREIGN KEY (idPrescrire) REFERENCES prescriptions(idPrescrire)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    INDEX idx_type_examen (typeExamen),
    INDEX idx_date_realisation (dateRealisation)
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;