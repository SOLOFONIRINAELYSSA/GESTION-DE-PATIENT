import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4040/api";
axios.defaults.baseURL = API_BASE_URL;

 export interface RendezVous {
  idRdv?: number;
  idExamen?: number;
  cinPatient: string;
  cinPraticien: string;
  dateHeure: string;
  prenomPatient?: string;
  prenomPraticien?: string;
  idRdvParent: string | null; // Soit string, soit null, mais pas undefined
  statut: 'en_attente' | 'confirme' | 'annule';
  hasConsultation?: boolean;
  patientInfo?: {
    nom: string;
    prenom: string;
  };
  praticienInfo?: {
    nom: string;
    prenom: string;
    specialite?: string;
  };
  nomPraticienParent?: string;
  prenomPraticienParent?: string;
  specialitePraticienParent?: string;
}

export interface RendezVousAvecExamens extends RendezVous {
  typePrescription?: string;
  typeExamen?: string;
  statutExamen?: string;
   idExamen?: number;
   nomPraticien?: string;   
   specialite?: string;   
    idRdv?: number;

}

export interface Notification {
  idRdv: number;
  primary: string;
  secondary: string;
  person: string;
}

export async function getPendingRendezVousNotifications(): Promise<Notification[]> {
  try {
    const response = await axios.get<{
      success: boolean;
      data: Array<{
        idRdv: number;
        cinPatient: string;
        cinPraticien: string;
        dateHeure: string;
        prenomPatient: string;
        prenomPraticien: string;
      }>;
    }>(`${API_BASE_URL}/rendezVous/pending/notifications`);
    
    if (response.data.success) {
      return response.data.data.map(rdv => ({
        idRdv: rdv.idRdv,
        primary: 'Nouvel rendez-vous',
        secondary: `M. ${rdv.prenomPatient} a demandé un rendez-vous avec Dr ${rdv.prenomPraticien} le ${new Date(rdv.dateHeure).toLocaleString()}`,
        person: '/static/images/avatar/5.jpg' 
      }));
    }
    throw new Error("Erreur lors de la récupération des notifications");
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error || 
        "Erreur lors de la récupération des notifications"
      );
    }
    throw new Error("Erreur inattendue");
  }
}

export async function createRendezVous(data: RendezVous): Promise<RendezVous> {
  try {
    const response = await axios.post<RendezVous>(
      `${API_BASE_URL}/rendezVous`,
      data
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error || 
        "Erreur lors de la création du rendez-vous"
      );
    }
    throw new Error("Erreur inattendue");
  }
}

// export async function getAllRendezVous(): Promise<RendezVous[]> {
//   try {
//     const response = await axios.get<{
//       success: boolean;
//       count: number;
//       data: RendezVous[];
//     }>(`${API_BASE_URL}/rendezVous`);
    
//     if (response.data.success) {
//       return response.data.data;
//     } else {
//       throw new Error("Erreur lors de la récupération des rendez-vous");
//     }
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       throw new Error(
//         error.response?.data?.error || 
//         "Erreur lors de la récupération des rendez-vous"
//       );
//     }
//     throw new Error("Erreur inattendue");
//   }
// }

export async function getAllRendezVous(): Promise<RendezVous[]> {
  try {
    const response = await axios.get<{

      success: boolean;
      count: number;
      data: RendezVous[];
    }>(`${API_BASE_URL}/rendezVous`);
    
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error("Erreur lors de la récupération des rendez-vous");
    
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error || 
        "Erreur lors de la récupération des rendez-vous"
      );
    }
    throw new Error("Erreur inattendue");
  }
}

export async function getAllRendezVousParticulier(): Promise<RendezVous[]> {
  try {
    const response = await axios.get<{

      success: boolean;
      count: number;
      data: RendezVous[];
    }>(`${API_BASE_URL}/rendezVousParticulier`);
    
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error("Erreur lors de la récupération des rendez-vous");
    
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error || 
        "Erreur lors de la récupération des rendez-vous"
      );
    }
    throw new Error("Erreur inattendue");
  }
}

// Dans services/rendezVous_api.ts
export async function getRendezVousAvecExamens(cinPatient?: string): Promise<RendezVousAvecExamens[]> {
  try {
    const response = await axios.get<{
      success: boolean;
      data: RendezVousAvecExamens[];
    }>(`${API_BASE_URL}/rendezVousExamen${cinPatient ? `?cinPatient=${cinPatient}` : ''}`);
    
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error("Erreur lors de la récupération des rendez-vous avec examens");
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error || 
        "Erreur lors de la récupération des rendez-vous avec examens"
      );
    }
    throw new Error("Erreur inattendue");
  }
}

export async function getRendezVousById(idRdv: number): Promise<RendezVous> {
  try {
    const response = await axios.get<RendezVous>(`${API_BASE_URL}/rendezvous/${idRdv}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || "Rendez-vous non trouvé");
    }
    throw new Error("Erreur inattendue");
  }
}

export async function updateRendezVous(idRdv: number, data: Partial<RendezVous>): Promise<RendezVous> {
  try {
    const response = await axios.put<RendezVous>(
      `${API_BASE_URL}/rendezVous/${idRdv}`,
      data
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Erreur lors de la mise à jour");
    }
    throw new Error("Erreur inconnue lors de la mise à jour");
  }
}

export async function deleteRendezVous(idRdv: number): Promise<void> {
  try {
    await axios.delete(`${API_BASE_URL}/rendezVous/${idRdv}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Erreur lors de la suppression");
    }
    throw new Error("Erreur inconnue lors de la suppression");
  }
}

export async function getRendezVousByPatient(cinPatient: string): Promise<RendezVous[]> {
  try {
    const response = await axios.get<RendezVous[]>(
      `${API_BASE_URL}/rendezVous/patient/${cinPatient}`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || "Erreur lors de la recherche");
    }
    throw new Error("Erreur inattendue");
  }
}

export async function getRendezVousByPraticien(cinPraticien: string): Promise<RendezVous[]> {
  try {
    const response = await axios.get<RendezVous[]>(
      `${API_BASE_URL}/rendezVous/praticien/${cinPraticien}`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || "Erreur lors de la recherche");
    }
    throw new Error("Erreur inattendue");
  }
}

export async function updateRendezVousStatus(
  idRdv: number, 
  statut: 'en_attente' | 'confirme' | 'annule'
): Promise<RendezVous> {
  try {
    const response = await axios.put<RendezVous>(
      `${API_BASE_URL}/rendezVous/${idRdv}`,
      { statut }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Erreur lors du changement de statut");
    }
    throw new Error("Erreur inconnue lors du changement de statut");
  }
}

export async function getPendingRendezVousCount(): Promise<number> {
  try {
    const response = await axios.get<{
      success: boolean;
      count: number;
    }>(`${API_BASE_URL}/rendezVous/pending/count`);
    
    if (response.data.success) {
      return response.data.count;
    }
    throw new Error("Erreur lors de la récupération du nombre de rendez-vous en attente");
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error || 
        "Erreur lors de la récupération du compteur"
      );
    }
    throw new Error("Erreur inattendue");
  }
}

// Dans votre service rendezVous_api.ts
export const getAllAvailableRendezVous = async (): Promise<RendezVous[]> => {
  const response = await axios.get(`${API_BASE_URL}/available`);
  return response.data;
};

