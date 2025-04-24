import axios from "axios";

export interface Appartement {
  numApp: number;
  design: string;
  loyer: number;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4040/api";

export async function createAppartement(
  data: Omit<Appartement, "numApp">
): Promise<Appartement | undefined> {
  try {
    const response = await axios.post<Appartement>(
      `${API_BASE_URL}/appartement`,
      data
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error || "Erreur lors de la création"
      );
    }
    throw new Error("Erreur inattendue");
  }
}

export async function updateAppartement(data: Appartement): Promise<Appartement> {
    try {
        const response = await axios.put<Appartement>(
            `${API_BASE_URL}/appartement/${data.numApp}`, 
            data
        );
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.error || "Erreur lors de la modification");
        }
        throw new Error("Erreur inattendue");
    }
}

export async function deleteAppartement(numApp: number): Promise<void> {
  try {
    await axios.delete(`${API_BASE_URL}/appartement/${numApp}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error || "Erreur lors de la suppression"
      );
    }
    throw new Error("Erreur inattendue");
  }
}

export async function getAllAppartement(): Promise<Appartement[]> {
  try {
    const response = await axios.get<Appartement[]>(
      `${API_BASE_URL}/appartement`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error || "Erreur lors de la récupération"
      );
    }
    throw new Error("Erreur inattendue");
  }
}

export async function getAppartement(numApp: number): Promise<Appartement> {
    try {
        const response = await axios.get<Appartement>(`${API_BASE_URL}/appartement/${numApp}`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.error || "Appartement non trouvé");
        }
        throw new Error("Erreur inattendue");
    }
}