import pool from "../config/db.config.js";

// Fonctions de validation (format "XXXX XXXX XXXX" - 14 caractères avec espaces)
const validateCin = (cin) => /^[0-9]{4} [0-9]{4} [0-9]{4}$/.test(cin) && cin.length === 14;
const validateDateTime = (dateTime) => !isNaN(Date.parse(dateTime));
const validateStatus = (status) => ['en_attente', 'confirme', 'annule'].includes(status);

export const create = async (req, res) => {
  try {
    const { cinPatient, cinPraticien, dateHeure, idRdvParent } = req.body;

    // Validations
    if (!cinPatient || !cinPraticien || !dateHeure) {
      return res.status(400).json({ 
        success: false,
        error: "Les champs CIN patient, CIN praticien et date/heure sont obligatoires" 
      });
    }

    if (!validateCin(cinPatient) || !validateCin(cinPraticien)) {
      return res.status(400).json({ 
        success: false,
        error: "Le CIN doit être au format 'XXXX XXXX XXXX' (14 caractères)" 
      });
    }

    if (!validateDateTime(dateHeure)) {
      return res.status(400).json({ 
        success: false,
        error: "Format de date/heure invalide (utilisez YYYY-MM-DD HH:MM:SS)" 
      });
    }

    if (idRdvParent && !validateCin(idRdvParent)) {
      return res.status(400).json({ 
        success: false,
        error: "Le CIN du parent doit être au format 'XXXX XXXX XXXX'" 
      });
    }

    const [result] = await pool.query(
      "INSERT INTO rendezVous (cinPatient, cinPraticien, dateHeure, statut, idRdvParent) VALUES (?, ?, ?,'en_attente', ?)",
      [cinPatient, cinPraticien, dateHeure, idRdvParent || null]
    );

    return res.status(201).json({
      success: true,
      message: "Rendez-vous créé avec succès",
      data: { 
        idRdv: result.insertId,
        cinPatient,
        cinPraticien,
        statut: 'en_attente'
      }
    });

  } catch (error) {
    console.error("Erreur création rendez-vous:", error);
    
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ 
        success: false,
        error: "Patient ou praticien non trouvé" 
      });
    }
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ 
        success: false,
        error: "Un rendez-vous similaire existe déjà" 
      });
    }
    
    return res.status(500).json({ 
      success: false,
      error: "Erreur serveur lors de la création du rendez-vous" 
    });
  }
};

export const updateOne = async (req, res) => {
  try {
    const { idRdv } = req.params;
    const { dateHeure, statut, cinPatient, cinPraticien, idRdvParent } = req.body;

    // Vérifier qu'au moins un champ est fourni pour la modification
    if (!dateHeure && !statut && !cinPatient && !cinPraticien && !idRdvParent) {
      return res.status(400).json({ 
        success: false,
        error: "Au moins un champ à modifier est requis" 
      });
    }

    // Validations des champs fournis
    const updates = [];
    const params = [];

    if (dateHeure) {
      if (!validateDateTime(dateHeure)) {
        return res.status(400).json({ 
          success: false,
          error: "Format de date/heure invalide" 
        });
      }
      updates.push("dateHeure = ?");
      params.push(dateHeure);
    }

    if (statut) {
      if (!validateStatus(statut)) {
        return res.status(400).json({ 
          success: false,
          error: "Statut invalide" 
        });
      }
      updates.push("statut = ?");
      params.push(statut);
    }

    if (cinPatient) {
      if (!validateCin(cinPatient)) {
        return res.status(400).json({ 
          success: false,
          error: "CIN patient invalide" 
        });
      }
      updates.push("cinPatient = ?");
      params.push(cinPatient);
    }

    if (cinPraticien) {
      if (!validateCin(cinPraticien)) {
        return res.status(400).json({ 
          success: false,
          error: "CIN praticien invalide" 
        });
      }
      updates.push("cinPraticien = ?");
      params.push(cinPraticien);
    }

    if (idRdvParent) {
      if (!validateCin(idRdvParent)) {
        return res.status(400).json({ 
          success: false,
          error: "CIN parent invalide" 
        });
      }
      updates.push("idRdvParent = ?");
      params.push(idRdvParent);
    }

    params.push(idRdv);

    const query = `UPDATE rendezVous 
                  SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP 
                  WHERE idRdv = ?`;

    const [result] = await pool.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false,
        error: "Rendez-vous non trouvé" 
      });
    }

    return res.status(200).json({
      success: true,
      message: "Rendez-vous modifié avec succès",
      data: { idRdv }
    });

  } catch (error) {
    console.error("Erreur modification rendez-vous:", error);
    
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ 
        success: false,
        error: "Référence invalide (patient/praticien non trouvé)" 
      });
    }
    
    return res.status(500).json({ 
      success: false,
      error: "Erreur serveur lors de la modification" 
    });
  }
};

export const deleteOne = async (req, res) => {
  try {
    const { idRdv } = req.params;

    const [result] = await pool.query(
      "DELETE FROM rendezVous WHERE idRdv = ?",
      [idRdv]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false,
        error: "Rendez-vous non trouvé" 
      });
    }

    return res.status(200).json({
      success: true,
      message: "Rendez-vous supprimé avec succès"
    });

  } catch (error) {
    console.error("Erreur suppression rendez-vous:", error);
    return res.status(500).json({ 
      success: false,
      error: "Erreur serveur lors de la suppression" 
    });
  }
};

// export const getAll = async (req, res) => {
//   try {
//     const { cinPatient, cinPraticien, statut } = req.query;
    
//     let query = "SELECT * FROM rendezVous";
//     const conditions = [];
//     const params = [];

//     if (cinPatient) {
//       conditions.push("cinPatient = ?");
//       params.push(cinPatient);
//     }

//     if (cinPraticien) {
//       conditions.push("cinPraticien = ?");
//       params.push(cinPraticien);
//     }

//     if (statut) {
//       conditions.push("statut = ?");
//       params.push(statut);
//     }

//     if (conditions.length > 0) {
//       query += " WHERE " + conditions.join(" AND ");
//     }

//     query += " ORDER BY dateHeure ASC";

//     const [rendezVous] = await pool.query(query, params);

//     return res.status(200).json({
//       success: true,
//       count: rendezVous.length,
//       data: rendezVous
//     });

//   } catch (error) {
//     console.error("Erreur récupération rendez-vous:", error);
//     return res.status(500).json({ 
//       success: false,
//       error: "Erreur serveur lors de la récupération" 
//     });
//   }
// };

export const getAll = async (req, res) => {
  try {
    const { cinPatient, cinPraticien, statut } = req.query;
    
    let query = `
      SELECT 
        r.*,
        p.prenom AS prenomPraticien,
        pat.prenom AS prenomPatient
      FROM rendezVous r
      LEFT JOIN praticiens p ON r.cinPraticien = p.cinPraticien
      LEFT JOIN patients pat ON r.cinPatient = pat.cinPatient
    `;
    
    const conditions = [];
    const params = [];

    if (cinPatient) {
      conditions.push("r.cinPatient = ?");
      params.push(cinPatient);
    }

    if (cinPraticien) {
      conditions.push("r.cinPraticien = ?");
      params.push(cinPraticien);
    }

    if (statut) {
      conditions.push("r.statut = ?");
      params.push(statut);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY r.dateHeure DESC";

    const [rendezVous] = await pool.query(query, params);

    return res.status(200).json({
      success: true,
      count: rendezVous.length,
      data: rendezVous
    });

  } catch (error) {
    console.error("Erreur récupération rendez-vous:", {
      message: error.message,
      code: error.code,
      sql: error.sql
    });
    
    return res.status(500).json({ 
      success: false,
      error: "Erreur serveur lors de la récupération",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getOne = async (req, res) => {
  try {
    const { idRdv } = req.params;

    const [rendezVous] = await pool.query(
      "SELECT * FROM rendezVous WHERE idRdv = ?",
      [idRdv]
    );

    if (rendezVous.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: "Rendez-vous non trouvé" 
      });
    }

    return res.status(200).json({
      success: true,
      data: rendezVous[0]
    });

  } catch (error) {
    console.error("Erreur récupération rendez-vous:", error);
    return res.status(500).json({ 
      success: false,
      error: "Erreur serveur lors de la récupération" 
    });
  }
};

export const getAvailable = async (req, res) => {
  try {
    const query = `
      SELECT r.*, p.prenom AS prenomPraticien
      FROM rendezVous r
      LEFT JOIN praticiens p ON r.cinPraticien = p.cinPraticien
      WHERE NOT EXISTS (
        SELECT 1 FROM consultations c WHERE c.idRdv = r.idRdv
      )
      ORDER BY r.dateHeure DESC
    `;

    const [results] = await pool.query(query);
    res.status(200).json(results);
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// Dans votre fichier d'API rendez-vous
export const getNew = async (req, res) => {
  try {
    const { since } = req.query;
    
    console.log("Paramètre since reçu:", since); // Debug
    
    if (!since) {
      return res.status(400).json({ error: "Le paramètre 'since' est requis" });
    }

    const rendezVousList = await RendezVous.find({ // Note: Changé de 'rendezVous' à 'RendezVous' (avec majuscule)
      createdAt: { $gt: new Date(since) }
    });

    res.json(rendezVousList);
  } catch (error) {
    console.error("Erreur dans getNew:", error);
    res.status(500).json({ error: "Erreur serveur", details: error.message });
  }
};

export default {
  create,
  updateOne,
  deleteOne,
  getAll,
  getOne,
  getAvailable ,
  getNew
};