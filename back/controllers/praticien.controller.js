import pool from "../config/db.config.js";

// Fonctions de validation (réutilisées)
const validateCin = (cin) => /^[0-9]{4} [0-9]{4} [0-9]{4}$/.test(cin);
const validatePhone = (phone) => /^\+261 [0-9]{2} [0-9]{2} [0-9]{3} [0-9]{2}$/.test(phone);
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

async function create(req, res) {
  try {
    const { cinPraticien, nom, prenom, telephone, email, specialite } = req.body;

    // Validations
    if (!cinPraticien || !nom || !prenom) {
      return res.status(400).json({ error: "Les champs CIN, nom et prénom sont obligatoires" });
    }

    if (!validateCin(cinPraticien)) {
      return res.status(400).json({ error: "CIN invalide" });
    }

    if (telephone && !validatePhone(telephone)) {
      return res.status(400).json({ error: "Le téléphone doit être au format international (+212612345678)" });
    }

    if (email && !validateEmail(email)) {
      return res.status(400).json({ error: "Format d'email invalide" });
    }

    const [result] = await pool.query(
      "INSERT INTO praticiens (cinPraticien, nom, prenom, telephone, email, specialite) VALUES (?, ?, ?, ?, ?, ?)",
      [cinPraticien, nom, prenom, telephone, email, specialite]
    );

    return res.status(201).json({
      success: true,
      message: "Praticien ajouté avec succès",
      data: { cinPraticien }
    });

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ 
        success: false,
        error: "Un praticien avec ce CIN, téléphone ou email existe déjà" 
      });
    }
    return res.status(500).json({ 
      success: false,
      error: "Erreur serveur: " + error.message 
    });
  }
}

async function updateOne(req, res) {
  try {
    const { nom, prenom, telephone, email, specialite } = req.body;
    const { cinPraticien } = req.params;

    if (!validateCin(cinPraticien)) {
      return res.status(400).json({ error: "CIN invalide" });
    }

    if (!nom || !prenom) {
      return res.status(400).json({ error: "Les champs nom et prénom sont obligatoires" });
    }

    if (telephone && !validatePhone(telephone)) {
      return res.status(400).json({ error: "Le téléphone doit être au format international (+212612345678)" });
    }

    if (email && !validateEmail(email)) {
      return res.status(400).json({ error: "Format d'email invalide" });
    }

    const [result] = await pool.query(
      "UPDATE praticiens SET nom = ?, prenom = ?, telephone = ?, email = ?, specialite = ? WHERE cinPraticien = ?",
      [nom, prenom, telephone, email, specialite, cinPraticien]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false,
        error: "Praticien non trouvé" 
      });
    }

    return res.status(200).json({
      success: true,
      message: "Praticien modifié avec succès",
      data: { cinPraticien, nom, prenom, telephone, email, specialite },
    });

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ 
        success: false,
        error: "Un praticien avec ce téléphone ou email existe déjà" 
      });
    }
    return res.status(500).json({ 
      success: false,
      error: "Erreur serveur: " + error.message 
    });
  }
}

async function deleteOne(req, res) {
  try {
    const { cinPraticien } = req.params;

    if (!validateCin(cinPraticien)) {
      return res.status(400).json({ error: "CIN invalide" });
    }

    const [result] = await pool.query(
      "DELETE FROM praticiens WHERE cinPraticien = ?",
      [cinPraticien]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false,
        error: "Praticien non trouvé" 
      });
    }

    return res.status(200).json({
      success: true,
      message: "Suppression effectuée avec succès",
    });

  } catch (error) {
    return res.status(500).json({ 
      success: false,
      error: "Erreur serveur: " + error.message 
    });
  }
}

async function getAll(req, res) {
  try {
    const [praticiens] = await pool.query("SELECT * FROM praticiens");
    return res.status(200).json({
      success: true,
      count: praticiens.length,
      data: praticiens
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false,
      error: "Erreur serveur: " + error.message 
    });
  }
}

async function getOne(req, res) {
  try {
    const { cinPraticien } = req.params;

    if (!validateCin(cinPraticien)) {
      return res.status(400).json({ error: "CIN invalide" });
    }

    const [praticien] = await pool.query(
      "SELECT * FROM praticiens WHERE cinPraticien = ?",
      [cinPraticien]
    );

    if (praticien.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: "Praticien non trouvé" 
      });
    }

    return res.status(200).json({
      success: true,
      data: praticien[0]
    });

  } catch (error) {
    return res.status(500).json({ 
      success: false,
      error: "Erreur serveur: " + error.message 
    });
  }
}

export default {
  create,
  updateOne,
  deleteOne,
  getAll,
  getOne,
  validateCin,
  validatePhone
};