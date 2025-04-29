CREATE TABLE IF NOT EXISTS praticiens (
    cinPraticien VARCHAR(14) PRIMARY KEY,
    nom VARCHAR(50) NOT NULL,
    prenom VARCHAR(50) NOT NULL,
    telephone VARCHAR(17) UNIQUE, 
    email VARCHAR(50) UNIQUE,   
    specialite VARCHAR(50)
)ENGINE=InnoDB;