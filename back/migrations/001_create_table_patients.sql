CREATE TABLE IF NOT EXISTS patients (
    cinPatient VARCHAR(14) PRIMARY KEY,
    nom VARCHAR(50) NOT NULL,
    prenom VARCHAR(50) NOT NULL,
    age int NOT NULL,
    sexe VARCHAR(50) CHECK (sexe IN ('Homme', 'Femme')), -- Contrainte de validation
    adresse VARCHAR(50),
    telephone VARCHAR(17) UNIQUE, 
    email VARCHAR(50) UNIQUE    
)ENGINE=InnoDB;