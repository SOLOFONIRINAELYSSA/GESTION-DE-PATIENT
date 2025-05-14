CREATE TABLE IF NOT EXISTS prescriptions (
    idPrescrire INT AUTO_INCREMENT PRIMARY KEY,
    idConsult INT NOT NULL,
    typePrescrire VARCHAR(100) NOT NULL,
    posologie VARCHAR(255) NOT NULL,
    datePrescrire DATETIME NOT NULL DEFAULT (CURRENT_DATE),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_presc_consult
        FOREIGN KEY (idConsult) REFERENCES consultations(idConsult)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    INDEX idx_medicament (typePrescrire),
    INDEX idx_date_presc (datePrescrire)
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;