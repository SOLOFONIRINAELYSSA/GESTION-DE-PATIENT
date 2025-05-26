import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4040/api";
axios.defaults.baseURL = API_BASE_URL;

export type ExamenStatus = 'prescrit' | 'en_cours' | 'termine' | 'annule';

export interface Examen {
  idExamen: number;
  idPrescrire: number;
  typeExamen: string;
  dateRealisation?: string;
  statut: 'prescrit' | 'en_cours' | 'termine' | 'annule';
  resultat?: string;
  laboratoire?: string;
  imageUrl?: string;  
  image?: File | string | undefined;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
    count?: number;
}

 export const getUsedPrescriptionIds = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/usedPrescriptions`);
    return response.data;
  } catch (error) {
    console.error("Erreur récupération prescriptions utilisées:", error);
    return [];
  }
};

export async function createExamen(data: FormData): Promise<Examen> {
    try {
        const response = await axios.post<ApiResponse<Examen>>(
            `${API_BASE_URL}/examen`,
            data,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        );
        
        if (response.data.success) {
            return response.data.data;
        }
        throw new Error(response.data.message || "Erreur lors de la création");
        
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const serverError = error.response?.data;
            
            if (serverError?.code === 'PRESCRIPTION_NOT_FOUND') {
                throw new Error("La prescription associée n'existe pas");
            }
            
            const errorMsg = serverError?.message || 
                            serverError?.error ||
                            "Erreur lors de la création de l'examen";
            throw new Error(errorMsg);
        }
        
        if (error instanceof Error) {
            throw error;
        }
        
        throw new Error("Erreur inconnue lors de la communication avec le serveur");
    }
}

export async function getAllExamens(): Promise<Examen[]> {
    try {
        const response = await axios.get<ApiResponse<Examen[]>>(`${API_BASE_URL}/examen`);
        
        if (response.data.success) {
            return response.data.data.map(examens => ({
                ...examens,
                imageUrl: examens.image 
                    ? `data:image/jpeg;base64,${examens.image}` 
                    : undefined
            }));
        }
        throw new Error(response.data.message || "Erreur lors de la récupération");
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const errorMsg = error.response?.data?.message || 
                            error.response?.data?.error ||
                            "Erreur lors de la récupération des examens";
                            
            throw new Error(errorMsg);
        }
        throw new Error("Erreur inconnue lors de la communication avec le serveur");
    }
}

export async function getExamenById(idExamen: number): Promise<Examen> {
    try {
        const response = await axios.get<ApiResponse<Examen>>(
            `${API_BASE_URL}/examen/${idExamen}`
        );
        
        if (response.data.success) {
            return response.data.data;
        }
        throw new Error(response.data.message || "Examen non trouvé");
        
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 404) {
                throw new Error("Examen non trouvé");
            }
            
            const errorMsg = error.response?.data?.message || 
                            error.response?.data?.error ||
                            "Erreur lors de la récupération de l'examen";
            throw new Error(errorMsg);
        }
        throw new Error("Erreur inconnue lors de la communication avec le serveur");
    }
}

export async function updateExamen(
  idExamen: number, 
  formData: FormData
): Promise<Examen> {
  try {
    // Conversion FormData en objet pour le débogage
    const formEntries = Array.from(formData.entries());
    console.log('Données envoyées:', Object.fromEntries(formEntries));

    const response = await axios.put<ApiResponse<Examen>>(
      `${API_BASE_URL}/examen/${idExamen}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Erreur lors de la mise à jour");
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Détails erreur:', error.response?.data);
      
      if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || "Données invalides");
      }
      
      const errorMsg = error.response?.data?.message || 
                      error.response?.data?.error ||
                      "Erreur lors de la mise à jour";
      throw new Error(errorMsg);
    }
    throw new Error("Erreur inconnue");
  }
}

export async function deleteExamen(idExamen: number): Promise<void> {
    try {
        const response = await axios.delete<ApiResponse<{ idExamen: number }>>(
            `${API_BASE_URL}/examen/${idExamen}`
        );
        
        if (!response.data.success) {
            throw new Error(response.data.message || "Erreur lors de la suppression");
        }
        
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const errorMsg = error.response?.data?.message || 
                            error.response?.data?.error ||
                            "Erreur lors de la suppression de l'examen";
            throw new Error(errorMsg);
        }
        throw new Error("Erreur inconnue lors de la suppression");
    }
}

export async function getExamensByPrescription(idPrescrire: number): Promise<Examen[]> {
    try {
        const response = await axios.get<ApiResponse<Examen[]>>(
            `${API_BASE_URL}/examen/prescription/${idPrescrire}`
        );
        
        if (response.data.success) {
            return response.data.data;
        }
        throw new Error(response.data.message || "Erreur lors de la recherche");
        
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 404) {
                throw new Error("Prescription non trouvée");
            }
            
            const errorMsg = error.response?.data?.message || 
                            error.response?.data?.error ||
                            "Erreur lors de la recherche des examens";
            throw new Error(errorMsg);
        }
        throw new Error("Erreur inattendue");
    }
}

export async function uploadExamenImage(idExamen: number, imageFile: File): Promise<Examen> {
    try {
        const formData = new FormData();
        formData.append('image', imageFile);

        const response = await axios.post<ApiResponse<Examen>>(
            `${API_BASE_URL}/examen/image/${idExamen}`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        );
        
        if (response.data.success) {
            return response.data.data;
        }
        throw new Error(response.data.message || "Erreur lors de l'upload de l'image");
        
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const errorMsg = error.response?.data?.message || 
                            error.response?.data?.error ||
                            "Erreur lors de l'upload de l'image";
            throw new Error(errorMsg);
        }
        throw new Error("Erreur inconnue lors de l'upload de l'image");
    }
}