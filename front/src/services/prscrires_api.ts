import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4040/api";
axios.defaults.baseURL = API_BASE_URL;

export interface Prescription {
    idPrescrire: number;
    idConsult: number;
    typePrescrire: string;
    posologie: string;
    datePrescrire: string;
    dateConsult?: string;
    prenomPraticien?: string;
    prenomPatient?: string;
    nomPatient?: string;
    agePatient?: number;
}

interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
    count?: number;
}

// export async function createPrescription(data: Omit<Prescription, 'idPrescrire'>): Promise<Prescription> {
//     try {
//         const response = await axios.post<ApiResponse<Prescription>>(
//             `${API_BASE_URL}/prescrire`,
//             data
//         );
        
//         if (response.data.success) {
//             return response.data.data;
//         }
//         throw new Error(response.data.message || "Erreur lors de la création");
        
//     } catch (error) {
//         if (axios.isAxiosError(error)) {
//             const errorMsg = error.response?.data?.message || 
//                             error.response?.data?.error ||
//                             "Erreur lors de la création de la prescription";
//             throw new Error(errorMsg);
//         }
//         throw new Error("Erreur inconnue lors de la communication avec le serveur");
//     }
// }
export async function createPrescription(data: Omit<Prescription, 'idPrescrire'>): Promise<Prescription> {
    try {
        // Validation côté client (optionnel mais recommandé)
        if (!data.idConsult || !data.typePrescrire || !data.posologie) {
            throw new Error("idConsult, typePrescrire et posologie sont obligatoires");
        }

        const response = await axios.post<ApiResponse<Prescription>>(
            `${API_BASE_URL}/prescrire`,
            {
                ...data,
                datePrescrire: data.datePrescrire || new Date().toISOString()
            }
        );
        
        if (response.data.success) {
            return response.data.data;
        }
        throw new Error(response.data.message || "Erreur lors de la création");
        
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const serverError = error.response?.data;
            
            if (serverError?.code === 'DATE_VALIDATION_ERROR') {
                throw new Error("La date de prescription ne peut pas être antérieure à la date de consultation");
            }
            
            const errorMsg = serverError?.message || 
                            serverError?.error ||
                            "Erreur lors de la création de la prescription";
            throw new Error(errorMsg);
        }
        
        // Gestion des erreurs non-Axios (comme notre validation côté client)
        if (error instanceof Error) {
            throw error;
        }
        
        throw new Error("Erreur inconnue lors de la communication avec le serveur");
    }
}

export async function getAllPrescriptions(): Promise<Prescription[]> {
    try {
        const response = await axios.get<ApiResponse<Prescription[]>>(`${API_BASE_URL}/prescrire`);
        
        if (response.data.success) {
            return response.data.data;
        }
        throw new Error(response.data.message || "Erreur lors de la récupération");
        
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const errorMsg = error.response?.data?.message || 
                            error.response?.data?.error ||
                            "Erreur lors de la récupération des prescriptions";
                            
            throw new Error(errorMsg);
        }
        throw new Error("Erreur inconnue lors de la communication avec le serveur");
    }
}

export async function getPrescriptionById(idPrescrire: number): Promise<Prescription> {
    try {
        const response = await axios.get<ApiResponse<Prescription>>(
            `${API_BASE_URL}/prescrire/${idPrescrire}`
        );
        
        if (response.data.success) {
            return response.data.data;
        }
        throw new Error(response.data.message || "Prescription non trouvée");
        
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const errorMsg = error.response?.data?.message || 
                            error.response?.data?.error ||
                            "Erreur lors de la récupération de la prescription";
            throw new Error(errorMsg);
        }
        throw new Error("Erreur inconnue lors de la communication avec le serveur");
    }
}

// export async function updatePrescription(
//     idPrescrire: number, 
//     data: Partial<Omit<Prescription, 'idPrescrire' | 'idConsult'>>
// ): Promise<Prescription> {
//     try {
//         const response = await axios.put<ApiResponse<Prescription>>(
//             `${API_BASE_URL}/prescrire/${idPrescrire}`,
//             data
//         );
        
//         if (response.data.success) {
//             return response.data.data;
//         }
//         throw new Error(response.data.message || "Erreur lors de la mise à jour");
        
//     } catch (error) {
//         if (axios.isAxiosError(error)) {
//             const errorMsg = error.response?.data?.message || 
//                             error.response?.data?.error ||
//                             "Erreur lors de la mise à jour de la prescription";
//             throw new Error(errorMsg);
//         }
//         throw new Error("Erreur inconnue lors de la mise à jour");
//     }
// }
export async function updatePrescription(
    idPrescrire: number, 
    data: Partial<Omit<Prescription, 'idPrescrire' | 'idConsult'>>
): Promise<Prescription> {
    try {
        // Validation côté client (optionnel)
        if (Object.keys(data).length === 0) {
            throw new Error("Au moins un champ à modifier est requis");
        }

        if (data.datePrescrire) {
            // Optionnel: Vous pourriez faire une pré-validation ici en récupérant la consultation associée
            // Mais c'est mieux de laisser le serveur faire cette validation
        }

        const response = await axios.put<ApiResponse<Prescription>>(
            `${API_BASE_URL}/prescrire/${idPrescrire}`,
            data
        );
        
        if (response.data.success) {
            return response.data.data;
        }
        throw new Error(response.data.message || "Erreur lors de la mise à jour");
        
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const serverError = error.response?.data;
            
            if (serverError?.code === 'DATE_VALIDATION_ERROR') {
                throw new Error("La date de prescription ne peut pas être antérieure à la date de consultation");
            }
            
            if (error.response?.status === 404) {
                throw new Error("Prescription non trouvée");
            }
            
            const errorMsg = serverError?.message || 
                            serverError?.error ||
                            "Erreur lors de la mise à jour de la prescription";
            throw new Error(errorMsg);
        }
        
        if (error instanceof Error) {
            throw error;
        }
        
        throw new Error("Erreur inconnue lors de la mise à jour");
    }
}


export async function deletePrescription(idPrescrire: number): Promise<void> {
    try {
        const response = await axios.delete<ApiResponse<{ idPrescrire: number }>>(
            `${API_BASE_URL}/prescrire/${idPrescrire}`
        );
        
        if (!response.data.success) {
            throw new Error(response.data.message || "Erreur lors de la suppression");
        }
        
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const errorMsg = error.response?.data?.message || 
                            error.response?.data?.error ||
                            "Erreur lors de la suppression de la prescription";
            throw new Error(errorMsg);
        }
        throw new Error("Erreur inconnue lors de la suppression");
    }
}

export async function getPrescriptionsByConsultation(idConsult: number): Promise<Prescription[]> {
    try {
        const response = await axios.get<ApiResponse<Prescription[]>>(
            `${API_BASE_URL}/prescrire/consultation/${idConsult}`
        );
        
        if (response.data.success) {
            return response.data.data;
        }
        throw new Error(response.data.message || "Erreur lors de la recherche");
        
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const errorMsg = error.response?.data?.message || 
                            error.response?.data?.error ||
                            "Erreur lors de la recherche des prescriptions";
            throw new Error(errorMsg);
        }
        throw new Error("Erreur inattendue");
    }
}