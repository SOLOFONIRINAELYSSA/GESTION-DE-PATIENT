import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4040/api";
axios.defaults.baseURL = API_BASE_URL;

export interface Consultation {
    idConsult: number;
    idRdv: number;
    dateConsult: string;
    compteRendu?: string;
    dateHeure: string;
    prenomPraticien?: string;
    prenomPatient?: string;
    cinPatient?: string;
    cinPraticien?: string;
  }

  interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
    count?: number;
  }

  // export async function createConsultation(data: Consultation): Promise<Consultation> {
  //   try {
  //     const response = await axios.post<Consultation>(`${API_BASE_URL}/consultation`, {
  //       idRdv: data.idRdv,
  //       dateConsult: data.dateConsult,
  //       compteRendu: data.compteRendu
  //     });
  //     return response.data;
  //   } catch (error) {
  //     throw new Error(
  //       axios.isAxiosError(error) 
  //         ? error.response?.data?.error || "Erreur création consultation"
  //         : "Erreur inconnue"
  //     );
  //   }
  // }
  export async function createConsultation(data: Consultation): Promise<Consultation> {
    try {
      // Vérification simple des dates
      if (data.dateConsult && data.dateHeure && new Date(data.dateConsult) < new Date(data.dateHeure)) {
        throw new Error("La date de consultation ne peut pas être antérieure à la date du rendez-vous");
      }
  
      const response = await axios.post<Consultation>(`${API_BASE_URL}/consultation`, {
        idRdv: data.idRdv,
        dateConsult: data.dateConsult,
        compteRendu: data.compteRendu
      });
      return response.data;
  
    } catch (error) {
      throw new Error(
        axios.isAxiosError(error) 
          ? error.response?.data?.error || "La date de consultation ne peut pas être antérieure à la date du rendez-vous"
          : error instanceof Error ? error.message : "Erreur inconnue"
      );
    }
  }


// export async function getAllConsultations(): Promise<Consultation[]> {
//     try {
//       const response = await axios.get<ApiResponse<Consultation[]>>(`${API_BASE_URL}/consultation`);
      
//       if (response.data.success) {
//         return response.data.data;
//       }
//       throw new Error(response.data.message || "Erreur lors de la récupération");
      
//     } catch (error) {
//       if (axios.isAxiosError(error)) {
//         const errorMsg = error.response?.data?.message || 
//                         error.response?.data?.error ||
//                         "Erreur lors de la récupération des consultations";
//         throw new Error(errorMsg);
//       }
//       throw new Error("Erreur inconnue lors de la communication avec le serveur");
//     }
//   }
export async function getAllConsultations(): Promise<Consultation[]> {
    try {
      const response = await axios.get<ApiResponse<Consultation[]>>(`${API_BASE_URL}/consultation`);
      
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Erreur lors de la récupération");
      
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMsg = error.response?.data?.message || 
                        error.response?.data?.error ||
                        "Erreur lors de la récupération des consultations";
        throw new Error(errorMsg);
      }
      throw new Error("Erreur inconnue lors de la communication avec le serveur");
    }
  }

export async function getConsultationById(idConsult: number): Promise<Consultation> {
  try {
    const response = await axios.get<Consultation>(`${API_BASE_URL}/consultation/${idConsult}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || "Consultation non trouvée");
    }
    throw new Error("Erreur inattendue");
  }
}

// export async function updateConsultation(idConsult: number, data: Partial<Omit<Consultation, 'idConsult' | 'idRdv'>>
// ): Promise<Consultation> {
//   try {
//     const response = await axios.put<Consultation>(
//       `${API_BASE_URL}/consultation/${idConsult}`,
//       data
//     );
//     return response.data;
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       throw new Error(error.response?.data?.message || "Erreur lors de la mise à jour");
//     }
//     throw new Error("Erreur inconnue lors de la mise à jour");
//   }
// }
export async function updateConsultation(
  idConsult: number, 
  data: Partial<Omit<Consultation, 'idConsult' | 'idRdv'>>
): Promise<Consultation> {
  try {
    // Vérification simple si dateConsult est fournie
    if (data.dateConsult && data.dateHeure && new Date(data.dateConsult) < new Date(data.dateHeure)) {
      throw new Error("La date de consultation ne peut pas être antérieure à la date du rendez-vous");
    }

    const response = await axios.put<Consultation>(
      `${API_BASE_URL}/consultation/${idConsult}`,
      data
    );
    return response.data;

  } catch (error) {
    throw new Error(
      axios.isAxiosError(error)
        ? error.response?.data?.message || "La date de consultation ne peut pas être antérieure à la date du rendez-vous"
        : error instanceof Error ? error.message : "Erreur inconnue"
    );
  }
}


export async function deleteConsultation(idConsult: number): Promise<void> {
    try {
      const response = await axios.delete<ApiResponse<{ idConsult: number }>>(
        `${API_BASE_URL}/consultation/${idConsult}`
      );
      
      if (!response.data.success) {
        throw new Error(response.data.message || "Erreur lors de la suppression");
      }
      
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMsg = error.response?.data?.message || 
                        error.response?.data?.error ||
                        "Erreur lors de la suppression";
        throw new Error(errorMsg);
      }
      throw new Error("Erreur inconnue lors de la suppression");
    }
  }

export async function getConsultationsByRdv(idRdv: number): Promise<Consultation[]> {
  try {
    const response = await axios.get<Consultation[]>(
      `${API_BASE_URL}/consultation/rendezVous/${idRdv}`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || "Erreur lors de la recherche");
    }
    throw new Error("Erreur inattendue");
  }
}

export async function getConsultationsByPatient(cinPatient: string): Promise<Consultation[]> {
  try {
    const response = await axios.get<Consultation[]>(
      `${API_BASE_URL}/consultation/patient/${cinPatient}`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || "Erreur lors de la recherche");
    }
    throw new Error("Erreur inattendue");
  }
}

export async function getConsultationsByPraticien(cinPraticien: string): Promise<Consultation[]> {
  try {
    const response = await axios.get<Consultation[]>(
      `${API_BASE_URL}/consultation/praticien/${cinPraticien}`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || "Erreur lors de la recherche");
    }
    throw new Error("Erreur inattendue");
  }
}

export const getAllAvailableConsultations = async (): Promise<Consultation[]> => {
  const response = await axios.get(`${API_BASE_URL}/availableForPrescription`);
  return response.data;
};