import axios from "axios";

export interface Patient {
    cinPatient: string;
    nom: string;
    prenom: string;
    age: number;
    sexe: string;
    adresse?: string;
    telephone?: string;
    email?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4040/api";

export async function searchPatients(query: string): Promise<Patient[]> {
    
    try {
      const response = await axios.get<Patient[]>(`${API_BASE_URL}/patient/search`, {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || "Erreur lors de la recherche des patients");
      }
      throw new Error("Erreur inconnue lors de la recherche");
    }
  }

export async function createPatient(
    data: Patient // Changed from Omit<Patient, "cinPatient">
): Promise<Patient> {
    try {
        const response = await axios.post<Patient>(
            `${API_BASE_URL}/patient`,
            
            data
        );
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(
                error.response?.data?.error || 
                "Erreur lors de la création du patient"
            );
        }
        throw new Error("Erreur inattendue");
    }
}

export async function updatePatient(patientData: Patient): Promise<Patient> {
    try {
        const response = await axios.put<Patient>(
            `${API_BASE_URL}/patient/${patientData.cinPatient}`, 
            patientData
        );
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(
                error.response?.data?.error || 
                "Erreur lors de la modification du patient"
            );
        }
        throw new Error("Erreur inattendue");
    }
}

export async function deletePatient(cinPatient: string): Promise<void> {
    try {
        await axios.delete(`${API_BASE_URL}/patient/${cinPatient}`);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(
                error.response?.data?.error || 
                "Erreur lors de la suppression du patient"
            );
        }
        throw new Error("Erreur inattendue");
    }
}

export async function getAllPatients(): Promise<Patient[]> {
    try {
        const response = await axios.get<{
            success: boolean;
            count: number;
            data: Patient[];
        }>(`${API_BASE_URL}/patient`);
        
        if (response.data.success) {
            return response.data.data;
        } else {
            throw new Error("Erreur lors de la récupération des patients");
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(
                error.response?.data?.error || 
                "Erreur lors de la récupération des patients"
            );
        }
        throw new Error("Erreur inattendue");
    }
}

export async function getPatient(cinPatient: string): Promise<Patient> {
    try {
        const response = await axios.get<Patient>(
            `${API_BASE_URL}/patient/${cinPatient}`
        );
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(
                error.response?.data?.error || 
                "Patient non trouvé"
            );
        }
        throw new Error("Erreur inattendue");
    }
}