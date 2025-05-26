import express from "express";
import multer from 'multer';

import patientController from "../controllers/patient.controller.js";
import praticienController from "../controllers/praticien.controller.js";
import rendezVousController from "../controllers/rendezVous.controller.js";
import consultationController from "../controllers/consultation.controller.js";
import prescrireController from "../controllers/prescrire.controller.js";
import examenController from "../controllers/examen.controller.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

router.get("/patient/", patientController.getAll);
router.get("/patient/:cinPatient", patientController.getOne);
router.post("/patient/", patientController.create);
router.put("/patient/:cinPatient", patientController.updateOne);
router.delete("/patient/:cinPatient", patientController.deleteOne);

router.get("/praticien/", praticienController.getAll);
router.get("/praticien/:cinPraticien", praticienController.getOne);
router.post("/praticien/", praticienController.create);
router.put("/praticien/:cinPraticien", praticienController.updateOne);
router.delete("/praticien/:cinPraticien", praticienController.deleteOne);

router.get("/rendezVous/", rendezVousController.getAll);
router.get("/rendezVousParticulier/", rendezVousController.getAllParticulier);
router.get("/rendezVousExamen/", rendezVousController.rendezVousExamens);
router.get("/rendezVous/:idRdv", rendezVousController.getOne);
router.post("/rendezVous/", rendezVousController.create);
router.put("/rendezVous/:idRdv", rendezVousController.updateOne);
router.delete("/rendezVous/:idRdv", rendezVousController.deleteOne);
router.get('/available', rendezVousController.getAvailable);
router.get("/rendezVous/pending/count", rendezVousController.getPendingCount);
router.get("/rendezVous/pending/notifications", rendezVousController.getPendingNotifications);

router.get("/consultation/", consultationController.getAll);
router.get("/consultation/:idConsult", consultationController.getOne); 
router.post("/consultation/", consultationController.create);
router.put("/consultation/:idConsult", consultationController.updateOne);
router.delete("/consultation/:idConsult", consultationController.deleteOne);
router.get('/availableForPrescription', consultationController.getAvailableForPrescription);

router.get("/prescrire/", prescrireController.getAll);
router.get("/prescrire/:idPrescrire", prescrireController.getOne);
router.get("/prescrire/", prescrireController.getByConsultation);
router.post("/prescrire/", prescrireController.create);
router.put("/prescrire/:idPrescrire", prescrireController.updateOne);
router.delete("/prescrire/:idPrescrire", prescrireController.deleteOne);

router.get("/examen/", examenController.getAll);
router.get("/examen/:idExamen", examenController.getOne);
router.get("/examen/image/:idExamen", examenController.getImage);
router.get("/examen/prescription/:idPrescrire", examenController.getByPrescription);
router.get("/examen/statut/:statut", examenController.getByStatus);
// router.post("/examen/", examenController.create);
router.post('/examen', upload.single('image'), examenController.create);
// router.put("/examen/:idExamen", examenController.updateOne);
router.put('/examen/:idExamen', upload.single('image'), examenController.updateOne);
router.put("/examen/image/:idExamen", examenController.updateImage);
router.delete("/examen/:idExamen", examenController.deleteOne);
router.delete("/examen/image/:idExamen", examenController.deleteImage);
router.get('/usedPrescriptions', examenController.getUsedPrescriptions);

export default router;
