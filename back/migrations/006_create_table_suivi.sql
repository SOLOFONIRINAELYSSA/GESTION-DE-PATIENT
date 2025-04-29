CREATE TABLE IF NOT EXISTS suivis (
    idSuivi INT AUTO_INCREMENT PRIMARY KEY,
    cinPatient VARCHAR(50) NOT NULL,
    cinPraticien VARCHAR(50) NOT NULL,
    idConsult INT NOT NULL,
    idPrescrire INT NOT NULL,
    datePrescrire DATETIME NOT NULL,
    compte_rendu TEXT NOT NULL,
    typePrescrire TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_suivi_patient
        FOREIGN KEY (cinPatient) REFERENCES patients(cinPatient)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_suivi_praticien
        FOREIGN KEY (cinPraticien) REFERENCES praticiens(cinPraticien)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_suivi_consultation
        FOREIGN KEY (idConsult) REFERENCES consultations(idConsult)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_suivi_prescrire
        FOREIGN KEY (idPrescrire) REFERENCES prescriptions(idPrescrire)
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_suivi_date (datePrescrire),
    INDEX idx_suivi_patient (cinPatient)
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
