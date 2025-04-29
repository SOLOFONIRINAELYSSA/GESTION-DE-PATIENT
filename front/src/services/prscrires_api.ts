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
    nomPatient?: string;
    prenomPatient?: string;
}

interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
    count?: number;
}

export async function createPrescription(data: Omit<Prescription, 'idPrescrire'>): Promise<Prescription> {
    try {
        const response = await axios.post<ApiResponse<Prescription>>(
            `${API_BASE_URL}/prescrire`,
            data
        );
        
        if (response.data.success) {
            return response.data.data;
        }
        throw new Error(response.data.message || "Erreur lors de la création");
        
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const errorMsg = error.response?.data?.message || 
                            error.response?.data?.error ||
                            "Erreur lors de la création de la prescription";
            throw new Error(errorMsg);
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

export async function updatePrescription(
    idPrescrire: number, 
    data: Partial<Omit<Prescription, 'idPrescrire' | 'idConsult'>>
): Promise<Prescription> {
    try {
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
            const errorMsg = error.response?.data?.message || 
                            error.response?.data?.error ||
                            "Erreur lors de la mise à jour de la prescription";
            throw new Error(errorMsg);
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