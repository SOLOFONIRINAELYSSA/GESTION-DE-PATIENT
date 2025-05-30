import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import Home from "./pages/Home/Home";
import ListPatient from "./pages/ListPatient/ListPatient";
import ListPracticien from "./pages/ListPracticien/ListPracticien";
import AjoutPracticien from "./pages/ListPracticien/AjoutPracticien";
import ListConsultation from "./pages/Consultation/ListConsultation";
import AjoutConsultation from "./pages/Consultation/AjoutConsultation";
import RendezVous from "./pages/RendezVous/AjoutRdv";
import ListRendezVous from "./pages/RendezVous/ListRdv";
import Messages from "./pages/Messages/Messages";
import Parametres from "./pages/Parametres/Parametres";
import AjoutPatient from "./pages/ListPatient/ajoutPatient";
import AjoutPrescrire from "./pages/Prescrire/AjoutPrescrire";
import ListPrescrire from "./pages/Prescrire/ListPrescrire";
import ListSuivi from "./pages/Suivi/ListSuivi";
import ListExamen from "./pages/Examen/ListExamen";
import AjoutExamen from "./pages/Examen/AjoutExamen";
import ListRdvExamen from "./pages/RendezVousExamen/ListRdvExamen";
import AjoutRdvExamen from "./pages/RendezVousExamen/AjoutRdvExamen";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/listPatient" element={<ListPatient />} />
        <Route path="/ajoutPatient" element={<AjoutPatient />} />
        <Route path="/ajoutPatient/:cinPatient" element={<AjoutPatient />} />
        <Route path="/listPraticien" element={<ListPracticien/>} />
        <Route path="/ajoutPraticien" element={<AjoutPracticien/>} />
        <Route path="/ajoutPraticien/:cinPraticien" element={<AjoutPracticien/>} />
        <Route path="/listConsultation" element={<ListConsultation/>} />
        <Route path="/ajoutConsultation" element={<AjoutConsultation/>} />
        <Route path="/ajoutConsultation/:idConsult" element={<AjoutConsultation/>} />
        <Route path="/ajoutRdv" element={<RendezVous />} />
        <Route path="/ajoutRdv/:idRdv" element={<RendezVous />} />
        <Route path="/listRdv" element={<ListRendezVous />} />
        <Route path="/ajoutPrescrire" element={<AjoutPrescrire />} />
        <Route path="/ajoutPrescrire/:idPrescrire" element={<AjoutPrescrire />} />
        <Route path="/listPrescrire" element={<ListPrescrire />} />
        <Route path="/listSuivi" element={<ListSuivi />} />
        <Route path="/listExamen" element={<ListExamen />} />
        <Route path="/ajoutExamen" element={<AjoutExamen />} />
        <Route path="/ajoutExamen/:idExamen" element={<AjoutExamen />} />
        <Route path="/listRdvExamen" element={<ListRdvExamen />} />
        <Route path="/ajoutRdvExamen" element={<AjoutRdvExamen />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/parametres" element={<Parametres />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;