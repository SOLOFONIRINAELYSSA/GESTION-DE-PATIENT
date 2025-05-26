import pool from "../config/db.config.js";


const formatResponse = (data, message = '', success = true) => ({
  success,
  message,
  data,
  count: Array.isArray(data) ? data.length : (data ? 1 : 0)
});

// export const create = async (req, res) => {
//   try {
//     const { idPrescrire, typeExamen, dateRealisation, statut, resultat, laboratoire } = req.body;

//     // Validation des champs obligatoires
//     if (!idPrescrire || !typeExamen) {
//       return res.status(400).json(
//         formatResponse(null, "idPrescrire et typeExamen sont obligatoires", false)
//       );
//     }

//     // Vérification que la prescription existe
//     const [prescription] = await pool.query(
//       "SELECT idPrescrire, datePrescrire FROM prescriptions WHERE idPrescrire = ?", 
//       [idPrescrire]
//     );

//     if (prescription.length === 0) {
//       return res.status(404).json(
//         formatResponse(null, "Prescription non trouvée", false)
//       );
//     }

//     const prescriptionDate = new Date(prescription[0].datePrescrire);
//     const realisationDate = dateRealisation ? new Date(dateRealisation) : null;

//     // Validation des dates si dateRealisation est fournie
//     if (realisationDate && realisationDate < prescriptionDate) {
//       return res.status(400).json(
//         formatResponse(null, "La date de réalisation ne peut pas être antérieure à la date de prescription", false)
//       );
//     }

//     // Validation du statut
//     const validStatuses = ['prescrit', 'en_cours', 'termine', 'annule'];
//     if (statut && !validStatuses.includes(statut)) {
//       return res.status(400).json(
//         formatResponse(null, "Statut invalide", false)
//       );
//     }

//     // Gestion de l'image (si fournie)
//     let imageBuffer = null;
//     if (req.file) {
//       imageBuffer = req.file.buffer;
//     }

//     // Création de l'examen
//     const [result] = await pool.query(
//       "INSERT INTO examens (idPrescrire, typeExamen, dateRealisation, statut, resultat, image, laboratoire) VALUES (?, ?, ?, ?, ?, ?, ?)",
//       [
//         idPrescrire, 
//         typeExamen, 
//         realisationDate,
//         statut || 'prescrit',
//         resultat || null,
//         imageBuffer,
//         laboratoire || null
//       ]
//     );

//     return res.status(201).json(
//       formatResponse({ idExamen: result.insertId }, "Examen créé avec succès")
//     );

//   } catch (error) {
//     console.error("Erreur création examen:", error);
    
//     if (error.code === 'ER_NO_REFERENCED_ROW_2') {
//       return res.status(400).json(
//         formatResponse(null, "Prescription non trouvée", false)
//       );
//     }
    
//     return res.status(500).json(
//       formatResponse(null, "Erreur serveur lors de la création", false)
//     );
//   }
// };

export const create = async (req, res) => {
  try {
    const { idPrescrire, typeExamen, dateRealisation, statut, resultat, laboratoire } = req.body;
    const imageFile = req.file;

    // Validation des champs obligatoires
    if (!idPrescrire || !typeExamen) {
      return res.status(400).json(
        formatResponse(null, "idPrescrire et typeExamen sont obligatoires", false)
      );
    }

    // Vérification que la prescription existe
    const [prescription] = await pool.query(
      "SELECT idPrescrire, datePrescrire FROM prescriptions WHERE idPrescrire = ?", 
      [idPrescrire]
    );

    if (prescription.length === 0) {
      return res.status(404).json(
        formatResponse(null, "Prescription non trouvée", false)
      );
    }

    const prescriptionDate = new Date(prescription[0].datePrescrire);
    const realisationDate = dateRealisation ? new Date(dateRealisation) : null;

    // Validation des dates
    if (realisationDate && realisationDate < prescriptionDate) {
      return res.status(400).json(
        formatResponse(null, "La date de réalisation ne peut pas être antérieure à la date de prescription", false)
      );
    }

    // Validation du statut
    const validStatuses = ['prescrit', 'en_cours', 'termine', 'annule'];
    if (statut && !validStatuses.includes(statut)) {
      return res.status(400).json(
        formatResponse(null, "Statut invalide", false)
      );
    }

    // Création de l'examen
    const [result] = await pool.query(
      "INSERT INTO examens (idPrescrire, typeExamen, dateRealisation, statut, resultat, image, laboratoire) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        idPrescrire, 
        typeExamen, 
        realisationDate,
        statut || 'prescrit',
        resultat || null,
        imageFile ? imageFile.buffer : null,
        laboratoire || null
      ]
    );

    return res.status(201).json(
      formatResponse({ idExamen: result.insertId }, "Examen créé avec succès")
    );

  } catch (error) {
    console.error("Erreur création examen:", error);
    
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json(
        formatResponse(null, "Prescription non trouvée", false)
      );
    }
    
    return res.status(500).json(
      formatResponse(null, "Erreur serveur lors de la création", false)
    );
  }
};

export const getAll = async (req, res) => {
  try {
    const [examens] = await pool.query(`
      SELECT 
        e.*,
        p.typePrescrire,
        p.datePrescrire
      FROM examens e
      LEFT JOIN prescriptions p ON e.idPrescrire = p.idPrescrire
      ORDER BY e.created_at DESC
    `);

    // Convertir les buffers d'image en base64
    const examensWithImages = examens.map(examen => {
      const examenData = { ...examen };
      if (examen.image) {
        examenData.image = examen.image.toString('base64');
      }
      return examenData;
    });

    return res.status(200).json(
      formatResponse(examensWithImages)
    );

  } catch (error) {
    console.error("Erreur récupération examens:", error);
    if (error.sql) {
      console.error("Requête SQL:", error.sql);
    }
    return res.status(500).json(
      formatResponse(null, "Erreur serveur lors de la récupération", false)
    );
  }
};

export const getOne = async (req, res) => {
  try {
    const { idExamen } = req.params;

    const [examen] = await pool.query(`
      SELECT 
        e.*,
        p.typePrescrire,
        p.datePrescrire,
        CASE WHEN e.image IS NOT NULL THEN 1 ELSE 0 END AS hasImage
      FROM examens e
      LEFT JOIN prescriptions p ON e.idPrescrire = p.idPrescrire
      WHERE e.idExamen = ?
    `, [idExamen]);

    if (examen.length === 0) {
      return res.status(404).json(
        formatResponse(null, "Examen non trouvé", false)
      );
    }

    const examenData = examen[0];
    const { image, ...rest } = examenData;

    return res.status(200).json(
      formatResponse(rest)
    );

  } catch (error) {
    console.error("Erreur récupération examen:", error);
    return res.status(500).json(
      formatResponse(null, "Erreur serveur lors de la récupération", false)
    );
  }
};

export const update = async (req, res) => {
  try {
    const { idExamen } = req.params;
    const { typeExamen, dateRealisation, statut, resultat, laboratoire, removeImage } = req.body;

    // Vérification des champs obligatoires pour la mise à jour
    if (!typeExamen && !dateRealisation && !statut && !resultat && !laboratoire && !req.file && removeImage !== 'true') {
      return res.status(400).json(
        formatResponse(null, "Au moins un champ à modifier est requis", false)
      );
    }

    // Vérification de l'existence de l'examen et récupération de la date de prescription
    const [currentExamen] = await pool.query(
      `SELECT e.*, p.datePrescrire 
       FROM examens e
       JOIN prescriptions p ON e.idPrescrire = p.idPrescrire
       WHERE e.idExamen = ?`,
      [idExamen]
    );

    if (currentExamen.length === 0) {
      return res.status(404).json(
        formatResponse(null, "Examen non trouvé", false)
      );
    }

    // Validation du statut
    const validStatuses = ['prescrit', 'en_cours', 'termine', 'annule'];
    if (statut && !validStatuses.includes(statut)) {
      return res.status(400).json(
        formatResponse(null, "Statut invalide. Valeurs acceptées: prescrit, en_cours, termine, annule", false)
      );
    }

    // Validation de la date
    if (dateRealisation) {
      const newRealisationDate = new Date(dateRealisation);
      const prescriptionDate = new Date(currentExamen[0].datePrescrire);
      
      if (newRealisationDate < prescriptionDate) {
        return res.status(400).json(
          formatResponse(null, "La date de réalisation ne peut pas être antérieure à la date de prescription", false)
        );
      }
    }

    // Construction dynamique de la requête
    const updates = [];
    const params = [];

    if (typeExamen) {
      updates.push("typeExamen = ?");
      params.push(typeExamen);
    }

    if (dateRealisation) {
      updates.push("dateRealisation = ?");
      params.push(dateRealisation);
    } else if (dateRealisation === null) {
      updates.push("dateRealisation = NULL");
    }

    if (statut) {
      updates.push("statut = ?");
      params.push(statut);
    }

    if (resultat) {
      updates.push("resultat = ?");
      params.push(resultat);
    } else if (resultat === null) {
      updates.push("resultat = NULL");
    }

    if (laboratoire) {
      updates.push("laboratoire = ?");
      params.push(laboratoire);
    } else if (laboratoire === null) {
      updates.push("laboratoire = NULL");
    }

    if (req.file) {
      updates.push("image = ?");
      params.push(req.file.buffer);
    } else if (removeImage === 'true') {
      updates.push("image = NULL");
    }

    params.push(idExamen);

    const query = `UPDATE examens SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE idExamen = ?`;
    const [result] = await pool.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json(
        formatResponse(null, "Aucune modification effectuée", false)
      );
    }

    // Retourne l'examen mis à jour
    const [updatedExamen] = await pool.query(
      "SELECT * FROM examens WHERE idExamen = ?",
      [idExamen]
    );

    return res.status(200).json(
      formatResponse(updatedExamen[0], "Examen mis à jour avec succès")
    );

  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'examen:", error);
    return res.status(500).json(
      formatResponse(null, "Erreur serveur lors de la mise à jour", false)
    );
  }
};

export const deleteOne = async (req, res) => {
  try {
    const { idExamen } = req.params;

    const [result] = await pool.query(
      "DELETE FROM examens WHERE idExamen = ?",
      [idExamen]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json(
        formatResponse(null, "Examen non trouvé", false)
      );
    }

    return res.status(200).json(
      formatResponse({ idExamen }, "Examen supprimé avec succès")
    );

  } catch (error) {
    console.error("Erreur suppression examen:", error);
    return res.status(500).json(
      formatResponse(null, "Erreur serveur lors de la suppression", false)
    );
  }
};

export const getByPrescription = async (req, res) => {
  try {
    const { idPrescrire } = req.params;

    const [examens] = await pool.query(`
      SELECT 
        e.*,
        p.typePrescrire,
        p.datePrescrire,
        p.posologie
      FROM examens e
      JOIN prescriptions p ON e.idPrescrire = p.idPrescrire
      WHERE e.idPrescrire = ?
      ORDER BY e.created_at DESC
    `, [idPrescrire]);

    // Ne pas renvoyer les images dans la liste
    const examensWithoutImages = examens.map(examen => {
      const { image, ...rest } = examen;
      return {
        ...rest,
        hasImage: image ? true : false
      };
    });

    return res.status(200).json(
      formatResponse(examensWithoutImages)
    );

  } catch (error) {
    console.error("Erreur récupération examens par prescription:", error);
    return res.status(500).json(
      formatResponse(null, "Erreur serveur lors de la récupération", false)
    );
  }
};

export const getByStatus = async (req, res) => {
  try {
    const { statut } = req.params;

    // Validation du statut
    const validStatuses = ['prescrit', 'en_cours', 'termine', 'annule'];
    if (!validStatuses.includes(statut)) {
      return res.status(400).json(
        formatResponse(null, "Statut invalide", false)
      );
    }

    const [examens] = await pool.query(`
      SELECT 
        e.idExamen,
        e.typeExamen,
        e.dateRealisation,
        e.statut,
        e.laboratoire,
        p.typePrescrire,
        p.datePrescrire,
        pat.nom AS nomPatient,
        pat.prenom AS prenomPatient
      FROM examens e
      JOIN prescriptions p ON e.idPrescrire = p.idPrescrire
      JOIN consultations c ON p.idConsult = c.idConsult
      JOIN rendezVous r ON c.idRdv = r.idRdv
      JOIN patients pat ON r.cinPatient = pat.cinPatient
      WHERE e.statut = ?
      ORDER BY e.created_at DESC
    `, [statut]);

    return res.status(200).json(
      formatResponse(examens)
    );

  } catch (error) {
    console.error("Erreur récupération examens par statut:", error);
    return res.status(500).json(
      formatResponse(null, "Erreur serveur lors de la récupération", false)
    );
  }
};

export const updateImage = async (req, res) => {
  try {
    const { idExamen } = req.params;

    if (!req.file) {
      return res.status(400).json(
        formatResponse(null, "Aucune image fournie", false)
      );
    }

    const [result] = await pool.query(
      "UPDATE examens SET image = ?, updated_at = CURRENT_TIMESTAMP WHERE idExamen = ?",
      [req.file.buffer, idExamen]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json(
        formatResponse(null, "Examen non trouvé", false)
      );
    }

    return res.status(200).json(
      formatResponse({ idExamen }, "Image de l'examen mise à jour avec succès")
    );

  } catch (error) {
    console.error("Erreur mise à jour image:", error);
    return res.status(500).json(
      formatResponse(null, "Erreur serveur lors de la mise à jour de l'image", false)
    );
  }
};

export const deleteImage = async (req, res) => {
  try {
    const { idExamen } = req.params;

    const [result] = await pool.query(
      "UPDATE examens SET image = NULL, updated_at = CURRENT_TIMESTAMP WHERE idExamen = ?",
      [idExamen]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json(
        formatResponse(null, "Examen non trouvé", false)
      );
    }

    return res.status(200).json(
      formatResponse({ idExamen }, "Image de l'examen supprimée avec succès")
    );

  } catch (error) {
    console.error("Erreur suppression image:", error);
    return res.status(500).json(
      formatResponse(null, "Erreur serveur lors de la suppression de l'image", false)
    );
  }
};

export const getImage = async (req, res) => {
  try {
    const { idExamen } = req.params;
    const [examen] = await pool.query(
      "SELECT image FROM examens WHERE idExamen = ?",
      [idExamen]
    );

    if (!examen[0]?.image) {
      return res.status(404).json(
        formatResponse(null, "Image non trouvée", false)
      );
    }

    res.set('Content-Type', 'image/jpeg');
    return res.send(examen[0].image);

  } catch (error) {
    console.error("Erreur récupération image:", error);
    return res.status(500).json(
      formatResponse(null, "Erreur serveur lors de la récupération de l'image", false)
    );
  }
};

// export const updateOne = async (req, res) => {
//   try {
//     const { idExamen } = req.params;
//     const formData = req.body; // Recevra les champs textuels
//     const imageFile = req.file; // Recevra le fichier image

//     // Vérification minimale
//     if (!idExamen) {
//       return res.status(400).json(
//         formatResponse(null, "ID examen requis", false)
//       );
//     }

//     // Construction de l'objet de mise à jour
//     const updateFields = {};
    
//     // Champs textuels
//     if (formData.idPrescrire) updateFields.idPrescrire = formData.idPrescrire;
//     if (formData.typeExamen) updateFields.typeExamen = formData.typeExamen;
//     if (formData.dateRealisation) updateFields.dateRealisation = formData.dateRealisation;
//     if (formData.statut) updateFields.statut = formData.statut;
//     if (formData.resultat) updateFields.resultat = formData.resultat;
//     if (formData.laboratoire) updateFields.laboratoire = formData.laboratoire;

//     // Gestion de l'image
//     if (imageFile) {
//       updateFields.image = imageFile.buffer;
//     } else if (formData.removeImage === 'true') {
//       updateFields.image = null;
//     }

//     // Vérification qu'il y a bien des modifications
//     if (Object.keys(updateFields).length === 0) {
//       return res.status(400).json(
//         formatResponse(null, "Aucune donnée à mettre à jour", false)
//       );
//     }

//     updateFields.updated_at = new Date();

//     // Exécution de la mise à jour
//     const [result] = await pool.query(
//       "UPDATE examens SET ? WHERE idExamen = ?",
//       [updateFields, idExamen]
//     );

//     if (result.affectedRows === 0) {
//       return res.status(404).json(
//         formatResponse(null, "Examen non trouvé", false)
//       );
//     }

//     // Retourner l'examen mis à jour
//     const [updatedExamen] = await pool.query(
//       "SELECT * FROM examens WHERE idExamen = ?",
//       [idExamen]
//     );

//     return res.status(200).json(
//       formatResponse(updatedExamen[0], "Examen mis à jour avec succès")
//     );

//   } catch (error) {
//     console.error("Erreur updateOne:", error);
//     return res.status(500).json(
//       formatResponse(null, "Erreur serveur", false)
//     );
//   }
// };

export const updateOne = async (req, res) => {
  try {
    const { idExamen } = req.params;
    const formData = req.body;
    const imageFile = req.file;

    // Vérification minimale
    if (!idExamen) {
      return res.status(400).json(
        formatResponse(null, "ID examen requis", false)
      );
    }

    // Récupérer l'examen existant et la prescription associée
    const [existingExamen] = await pool.query(
      `SELECT e.*, p.datePrescrire 
       FROM examens e
       JOIN prescriptions p ON e.idPrescrire = p.idPrescrire
       WHERE e.idExamen = ?`,
      [idExamen]
    );

    if (existingExamen.length === 0) {
      return res.status(404).json(
        formatResponse(null, "Examen non trouvé", false)
      );
    }

    const prescriptionDate = new Date(existingExamen[0].datePrescrire);
    const newRealisationDate = formData.dateRealisation 
      ? new Date(formData.dateRealisation) 
      : null;

    // Validation des dates si dateRealisation est fournie
    if (newRealisationDate && newRealisationDate < prescriptionDate) {
      return res.status(400).json(
        formatResponse(null, "La date de réalisation ne peut pas être antérieure à la date de prescription", false)
      );
    }

    // Validation du statut
    const validStatuses = ['prescrit', 'en_cours', 'termine', 'annule'];
    if (formData.statut && !validStatuses.includes(formData.statut)) {
      return res.status(400).json(
        formatResponse(null, "Statut invalide", false)
      );
    }

    // Construction de l'objet de mise à jour
    const updateFields = {};
    
    // Champs textuels
    if (formData.idPrescrire) updateFields.idPrescrire = formData.idPrescrire;
    if (formData.typeExamen) updateFields.typeExamen = formData.typeExamen;
    if (formData.dateRealisation) updateFields.dateRealisation = formData.dateRealisation;
    if (formData.statut) updateFields.statut = formData.statut;
    if (formData.resultat) updateFields.resultat = formData.resultat;
    if (formData.laboratoire) updateFields.laboratoire = formData.laboratoire;

    // Gestion de l'image
    if (imageFile) {
      updateFields.image = imageFile.buffer;
    } else if (formData.removeImage === 'true') {
      updateFields.image = null;
    }

    // Vérification qu'il y a bien des modifications
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json(
        formatResponse(null, "Aucune donnée à mettre à jour", false)
      );
    }

    updateFields.updated_at = new Date();

    // Exécution de la mise à jour
    const [result] = await pool.query(
      "UPDATE examens SET ? WHERE idExamen = ?",
      [updateFields, idExamen]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json(
        formatResponse(null, "Aucune modification effectuée", false)
      );
    }

    // Retourner l'examen mis à jour
    const [updatedExamen] = await pool.query(
      "SELECT * FROM examens WHERE idExamen = ?",
      [idExamen]
    );

    return res.status(200).json(
      formatResponse(updatedExamen[0], "Examen mis à jour avec succès")
    );

  } catch (error) {
    console.error("Erreur updateOne:", error);
    return res.status(500).json(
      formatResponse(null, "Erreur serveur", false)
    );
  }
};

// Dans votre controller examen
export const getUsedPrescriptions = async (req, res) => {
  try {
    const [results] = await pool.query(
      "SELECT DISTINCT idPrescrire FROM examens"
    );
    console.log('Résultats de used-prescriptions:', results); // <-- Ajoutez ceci
    const usedIds = results.map(r => r.idPrescrire);
    res.json(usedIds);
  } catch (error) {
    console.error(error);
    res.status(500).json([]);
  }
};

export default {
  create,
  getAll,
  getOne,
  getImage,
  update,
  updateOne,
  deleteOne,
  updateImage,
  deleteImage,
  getByPrescription,
  getByStatus,
  getUsedPrescriptions
};