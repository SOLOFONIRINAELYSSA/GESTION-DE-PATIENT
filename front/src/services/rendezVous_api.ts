import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4040/api";
axios.defaults.baseURL = API_BASE_URL;

 export interface RendezVous {
  idRdv?: number;
  cinPatient: string;
  cinPraticien: string;
  dateHeure: string;
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
    const response = await axios.patch<RendezVous>(
      `${API_BASE_URL}/rendezVous/${idRdv}/status`,
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

// Dans votre service rendezVous_api.ts
export const getAllAvailableRendezVous = async (): Promise<RendezVous[]> => {
  const response = await axios.get(`${API_BASE_URL}/available`);
  return response.data;
};

