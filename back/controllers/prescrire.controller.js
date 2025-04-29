import pool from "../config/db.config.js";

const formatResponse = (data, message = '', success = true) => ({
  success,
  message,
  data,
  count: Array.isArray(data) ? data.length : 1
});

export const create = async (req, res) => {
  try {
    const { idConsult, typePrescrire, posologie, datePrescrire } = req.body;

    if (!idConsult || !typePrescrire || !posologie) {
      return res.status(400).json(
        formatResponse(null, "idConsult, typePrescrire et posologie sont obligatoires", false)
      );
    }

    const [result] = await pool.query(
      "INSERT INTO prescriptions (idConsult, typePrescrire, posologie, datePrescrire) VALUES (?, ?, ?, ?)",
      [idConsult, typePrescrire, posologie, datePrescrire || new Date()]
    );

    return res.status(201).json(
      formatResponse({ idPrescrire: result.insertId }, "Prescription créée avec succès")
    );

  } catch (error) {
    console.error("Erreur création prescription:", error);
    
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json(
        formatResponse(null, "Consultation non trouvée", false)
      );
    }
    
    return res.status(500).json(
      formatResponse(null, "Erreur serveur lors de la création", false)
    );
  }
};

export const getAll = async (req, res) => {
  try {
    const [prescriptions] = await pool.query(`
      SELECT 
        p.*,
        c.dateConsult,
        pat.nom AS nomPatient,
        pat.prenom AS prenomPatient
      FROM prescriptions p
      JOIN consultations c ON p.idConsult = c.idConsult
      JOIN rendezVous r ON c.idRdv = r.idRdv
      JOIN patients pat ON r.cinPatient = pat.cinPatient
      ORDER BY p.datePrescrire DESC
    `);

    return res.status(200).json(
      formatResponse(prescriptions)
    );

  } catch (error) {
    console.error("Erreur récupération prescriptions:", error);
    return res.status(500).json(
      formatResponse(null, "Erreur serveur lors de la récupération", false)
    );
  }
};

export const getOne = async (req, res) => {
  try {
    const { idPrescrire } = req.params;

    const [prescription] = await pool.query(`
      SELECT 
        p.*,
        c.dateConsult,
        pat.nom AS nomPatient,
        pat.prenom AS prenomPatient
      FROM prescriptions p
      JOIN consultations c ON p.idConsult = c.idConsult
      JOIN rendezVous r ON c.idRdv = r.idRdv
      JOIN patients pat ON r.cinPatient = pat.cinPatient
      WHERE p.idPrescrire = ?
    `, [idPrescrire]);

    if (prescription.length === 0) {
      return res.status(404).json(
        formatResponse(null, "Prescription non trouvée", false)
      );
    }

    return res.status(200).json(
      formatResponse(prescription[0])
    );

  } catch (error) {
    console.error("Erreur récupération prescription:", error);
    return res.status(500).json(
      formatResponse(null, "Erreur serveur lors de la récupération", false)
    );
  }
};

export const update = async (req, res) => {
  try {
    const { idPrescrire } = req.params;
    const { typePrescrire, posologie, datePrescrire } = req.body;

    if (!typePrescrire && !posologie && !datePrescrire) {
      return res.status(400).json(
        formatResponse(null, "Au moins un champ à modifier est requis", false)
      );
    }

    const updates = [];
    const params = [];

    if (typePrescrire) {
      updates.push("typePrescrire = ?");
      params.push(typePrescrire);
    }

    if (posologie) {
      updates.push("posologie = ?");
      params.push(posologie);
    }

    if (datePrescrire) {
      updates.push("datePrescrire = ?");
      params.push(datePrescrire);
    }

    params.push(idPrescrire);

    const query = `UPDATE prescriptions 
                  SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP 
                  WHERE idPrescrire = ?`;

    const [result] = await pool.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json(
        formatResponse(null, "Prescription non trouvée", false)
      );
    }

    return res.status(200).json(
      formatResponse({ idPrescrire }, "Prescription mise à jour avec succès")
    );

  } catch (error) {
    console.error("Erreur mise à jour prescription:", error);
    return res.status(500).json(
      formatResponse(null, "Erreur serveur lors de la mise à jour", false)
    );
  }
};

export const deleteOne = async (req, res) => {
  try {
    const { idPrescrire } = req.params;

    const [result] = await pool.query(
      "DELETE FROM prescriptions WHERE idPrescrire = ?",
      [idPrescrire]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json(
        formatResponse(null, "Prescription non trouvée", false)
      );
    }

    return res.status(200).json(
      formatResponse({ idPrescrire }, "Prescription supprimée avec succès")
    );

  } catch (error) {
    console.error("Erreur suppression prescription:", error);
    return res.status(500).json(
      formatResponse(null, "Erreur serveur lors de la suppression", false)
    );
  }
};

export const getByConsultation = async (req, res) => {
  try {
    const { idConsult } = req.params;

    const [prescriptions] = await pool.query(`
      SELECT 
        p.*,
        c.dateConsult,
        pat.nom AS nomPatient,
        pat.prenom AS prenomPatient
      FROM prescriptions p
      JOIN consultations c ON p.idConsult = c.idConsult
      JOIN rendezVous r ON c.idRdv = r.idRdv
      JOIN patients pat ON r.cinPatient = pat.cinPatient
      WHERE p.idConsult = ?
      ORDER BY p.datePrescrire DESC
    `, [idConsult]);

    return res.status(200).json(
      formatResponse(prescriptions)
    );

  } catch (error) {
    console.error("Erreur récupération prescriptions par consultation:", error);
    return res.status(500).json(
      formatResponse(null, "Erreur serveur lors de la récupération", false)
    );
  }
};

export const updateOne = async (req, res) => {
  try {
    const { idPrescrire } = req.params;
    const { typePrescrire, posologie, datePrescrire } = req.body;

    // Vérification qu'au moins un champ est fourni pour la mise à jour
    if (!typePrescrire && !posologie && !datePrescrire) {
      return res.status(400).json(
        formatResponse(null, "Au moins un champ à modifier est requis (typePrescrire, posologie ou datePrescrire)", false)
      );
    }

    // Construction dynamique de la requête SQL
    const updates = [];
    const params = [];

    if (typePrescrire !== undefined) {
      updates.push("typePrescrire = ?");
      params.push(typePrescrire);
    }

    if (posologie !== undefined) {
      updates.push("posologie = ?");
      params.push(posologie);
    }

    if (datePrescrire !== undefined) {
      updates.push("datePrescrire = ?");
      params.push(datePrescrire);
    }

    params.push(idPrescrire);

    // Exécution de la requête
    const [result] = await pool.query(
      `UPDATE prescriptions 
       SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP 
       WHERE idPrescrire = ?`,
      params
    );

    // Vérification si la prescription existe
    if (result.affectedRows === 0) {
      return res.status(404).json(
        formatResponse(null, "Prescription non trouvée", false)
      );
    }

    // Récupération de la prescription mise à jour pour la réponse
    const [updatedPrescription] = await pool.query(
      `SELECT p.*, c.dateConsult, pat.nom AS nomPatient, pat.prenom AS prenomPatient
       FROM prescriptions p
       JOIN consultations c ON p.idConsult = c.idConsult
       JOIN rendezVous r ON c.idRdv = r.idRdv
       JOIN patients pat ON r.cinPatient = pat.cinPatient
       WHERE p.idPrescrire = ?`,
      [idPrescrire]
    );

    return res.status(200).json(
      formatResponse(updatedPrescription[0], "Prescription mise à jour avec succès")
    );

  } catch (error) {
    console.error("Erreur lors de la mise à jour de la prescription:", error);
    
    // Gestion des erreurs spécifiques
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json(
        formatResponse(null, "Consultation référencée non trouvée", false)
      );
    }
    
    return res.status(500).json(
      formatResponse(null, "Erreur serveur lors de la mise à jour de la prescription", false)
    );
  }
};

export default {
  create,
  getAll,
  getOne,
  update,
  updateOne,
  deleteOne,
  getByConsultation
};