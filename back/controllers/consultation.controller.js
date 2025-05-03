import pool from "../config/db.config.js";

// Format standard pour les réponses API
const formatResponse = (data, message = '', success = true) => ({
  success,
  message,
  data,
  count: Array.isArray(data) ? data.length : 1
});

// export const create = async (req, res) => {
//   try {
//     const { idRdv, dateConsult, compteRendu } = req.body;

//     // Validation minimale
//     if (!idRdv || !dateConsult) {
//       return res.status(400).json({ 
//         error: "ID du rendez-vous et date de consultation sont obligatoires" 
//       });
//     }

//     // Vérification existence RDV
//     const [rdv] = await pool.query(
//       "SELECT idRdv FROM rendezVous WHERE idRdv = ?", 
//       [idRdv]
//     );

//     if (rdv.length === 0) {
//       return res.status(404).json({ error: "Rendez-vous non trouvé" });
//     }

//     // Insertion directe
//     const [result] = await pool.query(
//       "INSERT INTO consultations (idRdv, dateConsult, compteRendu) VALUES (?, ?, ?)",
//       [idRdv, dateConsult, compteRendu || null]
//     );

//     return res.status(201).json({
//       idConsult: result.insertId,
//       dateConsult // Renvoie la date exacte reçue
//     });

//   } catch (error) {
//     console.error("Erreur création consultation:", error);
//     return res.status(500).json({ 
//       error: error.code === 'ER_DUP_ENTRY' 
//         ? "Une consultation existe déjà pour ce rendez-vous" 
//         : "Erreur serveur" 
//     });
//   }
// };
export const create = async (req, res) => {
  try {
    const { idRdv, dateConsult, compteRendu } = req.body;

    // Validation minimale
    if (!idRdv || !dateConsult) {
      return res.status(400).json({ 
        error: "ID du rendez-vous et date de consultation sont obligatoires" 
      });
    }

    // Vérification existence RDV + récupération dateHeure
    const [rdvRows] = await pool.query(
      "SELECT dateHeure FROM rendezVous WHERE idRdv = ?", 
      [idRdv]
    );

    if (rdvRows.length === 0) {
      return res.status(404).json({ error: "Rendez-vous non trouvé" });
    }

    // Comparaison des dates
    const rdvDate = new Date(rdvRows[0].dateHeure);
    const consultDate = new Date(dateConsult);
    
    if (consultDate < rdvDate) {
      return res.status(400).json({
        error: "La date de consultation ne peut pas être antérieure à la date du rendez-vous"
      });
    }

    // Insertion directe
    const [result] = await pool.query(
      "INSERT INTO consultations (idRdv, dateConsult, compteRendu) VALUES (?, ?, ?)",
      [idRdv, dateConsult, compteRendu || null]
    );

    return res.status(201).json({
      idConsult: result.insertId,
      dateConsult // Renvoie la date exacte reçue
    });

  } catch (error) {
    console.error("Erreur création consultation:", error);
    return res.status(500).json({ 
      error: error.code === 'ER_DUP_ENTRY' 
        ? "Une consultation existe déjà pour ce rendez-vous" 
        : "Erreur serveur" 
    });
  }
};

// export const getAll = async (req, res) => {
//   try {
//     console.log("Tentative de récupération des consultations...");
    
//     // Testez d'abord la connexion à la base de données
//     const [testConnection] = await pool.query("SELECT 1");
//     console.log("Connexion DB OK:", testConnection);

//     // Exécutez la requête avec un try-catch séparé
//     let consultations;
//     try {
//       [consultations] = await pool.query(`
//         SELECT 
//           c.idConsult,
//           c.idRdv,
//           c.dateConsult,
//           c.compteRendu,
//           r.dateHeure,
//           r.cinPatient,
//           r.cinPraticien
//         FROM consultations c
//         JOIN rendezVous r ON c.idRdv = r.idRdv
//         ORDER BY c.dateConsult DESC
//       `);
//     } catch (queryError) {
//       console.error("Erreur SQL:", queryError.sqlMessage);
//       console.error("Requête SQL:", queryError.sql);
//       throw queryError;
//     }

//     console.log(`Récupération réussie: ${consultations.length} consultations`);
//     return res.status(200).json(formatResponse(consultations));

//   } catch (error) {
//     console.error("Erreur complète:", {
//       message: error.message,
//       code: error.code,
//       stack: error.stack
//     });
    
//     return res.status(500).json(
//       formatResponse(null, `Erreur serveur détaillée: ${error.message}`, false)
//     );
//   }
// };
export const getAll = async (req, res) => {
  try {
    const [testConnection] = await pool.query("SELECT 1");
    
    const [consultations] = await pool.query(`
      SELECT 
        c.idConsult,
        c.idRdv,
        
        c.dateConsult,
        c.compteRendu,
        r.dateHeure,
        r.cinPatient,
        r.cinPraticien,
        p.prenom AS prenomPraticien,
        pat.prenom AS prenomPatient
      FROM consultations c
      JOIN rendezVous r ON c.idRdv = r.idRdv
      LEFT JOIN praticiens p ON r.cinPraticien = p.cinPraticien
      LEFT JOIN patients pat ON r.cinPatient = pat.cinPatient
      ORDER BY c.dateConsult DESC
    `);

    return res.status(200).json({
      success: true,
      count: consultations.length,
      data: consultations
    });

  } catch (error) {
    console.error("Erreur récupération consultations:", {
      message: error.message,
      code: error.code,
      sql: error.sql
    });
    
    return res.status(500).json({
      success: false,
      error: "Erreur serveur lors de la récupération des consultations",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
export const getOne = async (req, res) => {
    try {
        const { idConsult } = req.params;

        const [consultation] = await pool.query(`
            SELECT c.*, r.dateHeure, r.cinPatient, r.cinPraticien
            FROM consultations c
            JOIN rendezVous r ON c.idRdv = r.idRdv
            WHERE c.idConsult = ?
        `, [idConsult]);

        if (consultation.length === 0) {
            return res.status(404).json({ error: "Consultation non trouvée" });
        }

        return res.status(200).json(consultation[0]);

    } catch (error) {
        console.error("Erreur récupération consultation:", error);
        return res.status(500).json({ error: "Erreur serveur lors de la récupération de la consultation" });
    }
};

export const update = async (req, res) => {
    try {
        const { idConsult } = req.params;
        const { compteRendu } = req.body;

        if (!compteRendu) {
            return res.status(400).json({ error: "Le compte-rendu est obligatoire" });
        }

        const [result] = await pool.query(
            "UPDATE consultations SET compteRendu = ? WHERE idConsult = ?",
            [compteRendu, idConsult]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Consultation non trouvée" });
        }

        return res.status(200).json({
            message: "Consultation mise à jour avec succès",
            idConsult: idConsult
        });

    } catch (error) {
        console.error("Erreur mise à jour consultation:", error);
        return res.status(500).json({ error: "Erreur serveur lors de la mise à jour de la consultation" });
    }
};

export const deleteOne = async (req, res) => {
  try {
    const { idConsult } = req.params;

    const [result] = await pool.query(
      "DELETE FROM consultations WHERE idConsult = ?",
      [idConsult]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json(
        formatResponse(null, "Consultation non trouvée", false)
      );
    }

    return res.status(200).json(
      formatResponse({ idConsult }, "Consultation supprimée avec succès")
    );

  } catch (error) {
    console.error("Erreur suppression consultation:", error);
    return res.status(500).json(
      formatResponse(null, "Erreur serveur lors de la suppression", false)
    );
  }
};

export const getByPatient = async (req, res) => {
    try {
        const { cinPatient } = req.params;

        const [consultations] = await pool.query(`
            SELECT c.*, r.dateHeure, r.cinPraticien
            FROM consultations c
            JOIN rendezVous r ON c.idRdv = r.idRdv
            WHERE r.cinPatient = ?
            ORDER BY c.dateConsult DESC
        `, [cinPatient]);

        return res.status(200).json(consultations);

    } catch (error) {
        console.error("Erreur récupération consultations patient:", error);
        return res.status(500).json({ error: "Erreur serveur lors de la récupération des consultations du patient" });
    }
};

export const getByPraticien = async (req, res) => {
    try {
        const { cinPraticien } = req.params;

        const [consultations] = await pool.query(`
            SELECT c.*, r.dateHeure, r.cinPatient
            FROM consultations c
            JOIN rendezVous r ON c.idRdv = r.idRdv
            WHERE r.cinPraticien = ?
            ORDER BY c.dateConsult DESC
        `, [cinPraticien]);

        return res.status(200).json(consultations);

    } catch (error) {
        console.error("Erreur récupération consultations praticien:", error);
        return res.status(500).json({ error: "Erreur serveur lors de la récupération des consultations du praticien" });
    }
};

// export const updateOne = async (req, res) => {
//   try {
//     const { idConsult } = req.params;
//     const { compteRendu, idRdv, dateConsult } = req.body; // Ajoutez dateConsult

//     // Vérifier qu'au moins un champ est fourni
//     if (!compteRendu && !idRdv && !dateConsult) {
//       return res.status(400).json({ 
//         error: "Au moins un champ à modifier est requis" 
//       });
//     }

//     const updates = [];
//     const params = [];

//     if (compteRendu) {
//       updates.push("compteRendu = ?");
//       params.push(compteRendu);
//     }

//     if (idRdv) {
//       const [rdvCheck] = await pool.query(
//         "SELECT idRdv FROM rendezVous WHERE idRdv = ?", 
//         [idRdv]
//       );
//       if (rdvCheck.length === 0) {
//         return res.status(400).json({ error: "Rendez-vous non trouvé" });
//       }
//       updates.push("idRdv = ?");
//       params.push(idRdv);
//     }

//     if (dateConsult) {
//       // Validation de la date
//       if (isNaN(new Date(dateConsult).getTime())) {
//         return res.status(400).json({ error: "Format de date invalide" });
//       }
//       updates.push("dateConsult = ?");
//       params.push(dateConsult);
//     }

//     params.push(idConsult);

//     const [result] = await pool.query(
//       `UPDATE consultations SET ${updates.join(", ")} WHERE idConsult = ?`,
//       params
//     );

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ error: "Consultation non trouvée" });
//     }

//     return res.status(200).json({
//       message: "Consultation mise à jour avec succès",
//       idConsult
//     });

//   } catch (error) {
//     console.error("Erreur modification:", error);
//     return res.status(500).json({ error: "Erreur serveur" });
//   }
// };
export const updateOne = async (req, res) => {
  try {
    const { idConsult } = req.params;
    const { compteRendu, idRdv, dateConsult } = req.body;

    // Vérifier qu'au moins un champ est fourni
    if (!compteRendu && !idRdv && !dateConsult) {
      return res.status(400).json({ 
        error: "Au moins un champ à modifier est requis" 
      });
    }

    const updates = [];
    const params = [];

    // Récupération du RDV actuel si idRdv ou dateConsult est modifié
    let currentRdvId = idRdv;
    if (idRdv || dateConsult) {
      const [currentConsult] = await pool.query(
        "SELECT idRdv FROM consultations WHERE idConsult = ?",
        [idConsult]
      );
      currentRdvId = currentConsult[0]?.idRdv;
    }

    if (compteRendu) {
      updates.push("compteRendu = ?");
      params.push(compteRendu);
    }

    if (idRdv) {
      const [rdvCheck] = await pool.query(
        "SELECT dateHeure FROM rendezVous WHERE idRdv = ?", 
        [idRdv]
      );
      if (rdvCheck.length === 0) {
        return res.status(400).json({ error: "Rendez-vous non trouvé" });
      }
      updates.push("idRdv = ?");
      params.push(idRdv);
      currentRdvId = idRdv; // Mise à jour pour la vérification de date
    }

    if (dateConsult) {
      // Validation de la date
      if (isNaN(new Date(dateConsult).getTime())) {
        return res.status(400).json({ error: "Format de date invalide" });
      }

      // Vérification cohérence dateConsult/dateHeure
      if (currentRdvId) {
        const [rdv] = await pool.query(
          "SELECT dateHeure FROM rendezVous WHERE idRdv = ?",
          [currentRdvId]
        );
        if (rdv.length > 0 && new Date(dateConsult) < new Date(rdv[0].dateHeure)) {
          return res.status(400).json({
            error: "La date de consultation ne peut pas être antérieure à la date du rendez-vous"
          });
        }
      }

      updates.push("dateConsult = ?");
      params.push(dateConsult);
    }

    params.push(idConsult);

    const [result] = await pool.query(
      `UPDATE consultations SET ${updates.join(", ")} WHERE idConsult = ?`,
      params
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Consultation non trouvée" });
    }

    return res.status(200).json({
      message: "Consultation mise à jour avec succès",
      idConsult
    });

  } catch (error) {
    console.error("Erreur modification:", error);
    return res.status(500).json({ 
      error: "Erreur serveur",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Dans votre fichier backend (controller ou route)
export const getAvailableForPrescription = async (req, res) => {
  try {
    const query = `
      SELECT 
        c.idConsult, c.idRdv, c.dateConsult, c.compteRendu,
        r.dateHeure,
        p.prenom AS prenomPraticien, 
        pat.prenom AS prenomPatient
      FROM consultations c
      JOIN rendezVous r ON c.idRdv = r.idRdv
      JOIN praticiens p ON r.cinPraticien = p.cinPraticien
      JOIN patients pat ON r.cinPatient = pat.cinPatient
      WHERE NOT EXISTS (
        SELECT 1 FROM prescriptions pr WHERE pr.idConsult = c.idConsult
      )
      ORDER BY c.dateConsult DESC
    `;

    const [results] = await pool.query(query);
    
    // Formatez les dates pour le frontend
    const formattedResults = results.map(item => ({
      ...item,
      dateConsult: item.dateConsult.toISOString(),
      dateHeure: item.dateHeure?.toISOString() || null
    }));

    res.status(200).json(formattedResults);
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({ 
      error: "Erreur serveur",
      details: error.message 
    });
  }
};

export default {
    create,
    getAll,
    getOne,
    update,
    updateOne,
    deleteOne,
    getByPatient,
    getByPraticien,
    getAvailableForPrescription
};