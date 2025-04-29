import pool from "../config/db.config.js";

// Fonctions de validation
const validateCin = (cin) => /^[0-9]{4} [0-9]{4} [0-9]{4}$/.test(cin);
const validatePhone = (phone) => /^\+261 [0-9]{2} [0-9]{2} [0-9]{3} [0-9]{2}$/.test(phone);
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

async function create(req, res) {
  try {
    const { cinPatient, nom, prenom, age, sexe, adresse, telephone, email } = req.body;

    // Validations
    if (!cinPatient || !nom || !prenom || !age || !sexe) {
      return res.status(400).json({ 
        success: false,
        error: "Les champs CIN, nom, prénom, âge et sexe sont obligatoires" 
      });
    }

    if (!validateCin(cinPatient)) {
      return res.status(400).json({ 
        success: false,
        error: "CIN invalide" 
      });
    }

    if (telephone && !validatePhone(telephone)) {
      return res.status(400).json({ 
        success: false,
        error: "Le téléphone doit être au format international (+212612345678)" 
      });
    }

    if (email && !validateEmail(email)) {
      return res.status(400).json({ 
        success: false,
        error: "Format d'email invalide" 
      });
    }

    const [result] = await pool.query(
      "INSERT INTO patients (cinPatient, nom, prenom, age, sexe, adresse, telephone, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [cinPatient, nom, prenom, age, sexe, adresse, telephone, email]
    );

    return res.status(201).json({
      success: true,
      message: "Patient ajouté avec succès",
      data: { cinPatient }
    });

  } catch (error) {
    console.error("Erreur création patient:", error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ 
        success: false,
        error: "Un patient avec ce CIN, téléphone ou email existe déjà" 
      });
    }
    
    return res.status(500).json({ 
      success: false,
      error: "Erreur serveur lors de la création du patient" 
    });
  }
}

async function updateOne(req, res) {
  try {
    const { nom, prenom, age, sexe, adresse, telephone, email } = req.body;
    const { cinPatient } = req.params;

    if (!validateCin(cinPatient)) {
      return res.status(400).json({ 
        success: false,
        error: "CIN invalide" 
      });
    }

    if (!nom || !prenom || !age || !sexe) {
      return res.status(400).json({ 
        success: false,
        error: "Les champs nom, prénom, âge et sexe sont obligatoires" 
      });
    }

    if (telephone && !validatePhone(telephone)) {
      return res.status(400).json({ 
        success: false,
        error: "Le téléphone doit être au format international (+212612345678)" 
      });
    }

    if (email && !validateEmail(email)) {
      return res.status(400).json({ 
        success: false,
        error: "Format d'email invalide" 
      });
    }

    const [result] = await pool.query(
      "UPDATE patients SET nom = ?, prenom = ?, age = ?, sexe = ?, adresse = ?, telephone = ?, email = ? WHERE cinPatient = ?",
      [nom, prenom, age, sexe, adresse, telephone, email, cinPatient]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false,
        error: "Patient non trouvé" 
      });
    }

    return res.status(200).json({
      success: true,
      message: "Patient modifié avec succès",
      data: { cinPatient, nom, prenom, age, sexe, adresse, telephone, email },
    });

  } catch (error) {
    console.error("Erreur modification patient:", error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ 
        success: false,
        error: "Un patient avec ce téléphone ou email existe déjà" 
      });
    }
    
    return res.status(500).json({ 
      success: false,
      error: "Erreur serveur lors de la modification du patient" 
    });
  }
}

async function deleteOne(req, res) {
  try {
    const { cinPatient } = req.params;

    if (!validateCin(cinPatient)) {
      return res.status(400).json({ 
        success: false,
        error: "CIN invalide" 
      });
    }

    const [result] = await pool.query(
      "DELETE FROM patients WHERE cinPatient = ?",
      [cinPatient]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false,
        error: "Patient non trouvé" 
      });
    }

    return res.status(200).json({
      success: true,
      message: "Suppression effectuée avec succès",
    });

  } catch (error) {
    console.error("Erreur suppression patient:", error);
    return res.status(500).json({ 
      success: false,
      error: "Erreur serveur lors de la suppression du patient" 
    });
  }
}

async function getAll(req, res) {
  try {
    const [patients] = await pool.query("SELECT * FROM patients ORDER BY nom, prenom");
    
    return res.status(200).json({
      success: true,
      count: patients.length,
      data: patients
    });
  } catch (error) {
    console.error("Erreur récupération patients:", error);
    return res.status(500).json({ 
      success: false,
      error: "Erreur serveur lors de la récupération des patients" 
    });
  }
}

async function getOne(req, res) {
  try {
    const { cinPatient } = req.params;

    if (!validateCin(cinPatient)) {
      return res.status(400).json({ 
        success: false,
        error: "CIN invalide" 
      });
    }

    const [patient] = await pool.query(
      "SELECT * FROM patients WHERE cinPatient = ?",
      [cinPatient]
    );

    if (patient.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: "Patient non trouvé" 
      });
    }

    return res.status(200).json({
      success: true,
      data: patient[0]
    });

  } catch (error) {
    console.error("Erreur récupération patient:", error);
    return res.status(500).json({ 
      success: false,
      error: "Erreur serveur lors de la récupération du patient" 
    });
  }
}

export default {
  create,
  updateOne,
  deleteOne,
  getAll,
  getOne
};