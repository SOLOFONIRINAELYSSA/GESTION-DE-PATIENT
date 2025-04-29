import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4040/api";
axios.defaults.baseURL = API_BASE_URL;

export interface Praticien {
  cinPraticien: string;
  nom: string;
  prenom: string;
  telephone?: string;
  email?: string;
  specialite?: string;
}

export async function createPraticien(data: Praticien): Promise<Praticien> {
  try {
    const response = await axios.post<Praticien>(
      `${API_BASE_URL}/praticien`, // Corrigé de "/praticen" à "/praticien"
      data
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error || 
        "Erreur lors de la création du Praticien" // Corrigé le message
      );
    }
    throw new Error("Erreur inattendue");
  }
}

export async function getAllPraticiens(): Promise<Praticien[]> {
  try {
      const response = await axios.get<{
          success: boolean;
          count: number;
          data: Praticien[];
      }>(`${API_BASE_URL}/praticien`);
      
      if (response.data.success) {
          return response.data.data;
      } else {
          throw new Error("Erreur lors de la récupération des praticien");
      }
  } catch (error) {
      if (axios.isAxiosError(error)) {
          throw new Error(
              error.response?.data?.error || 
              "Erreur lors de la récupération des praticien"
          );
      }
      throw new Error("Erreur inattendue");
  }
}


// Récupérer un praticien par son CIN
export async function getPraticienByCin(cinPraticien: string): Promise<Praticien> {
  try {
    const response = await axios.get<Praticien>(`${API_BASE_URL}/praticien/${cinPraticien}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || "Praticien non trouvé");
    }
    throw new Error("Erreur inattendue");
  }
}

// Mettre à jour un praticien
export async function updatePraticien(cinPraticien: string, praticien: Partial<Praticien>): Promise<Praticien> {
  try {
    const response = await axios.put<Praticien>(`${API_BASE_URL}/praticien/${cinPraticien}`, praticien);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Erreur lors de la mise à jour");
    }
    throw new Error("Erreur inconnue lors de la mise à jour");
  }
}

// Supprimer un praticien
export async function deletePraticien(cinPraticien: string): Promise<void> {
  try {
    await axios.delete(`${API_BASE_URL}/praticien/${cinPraticien}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Erreur lors de la suppression");
    }
    throw new Error("Erreur inconnue lors de la suppression");
  }
}

// Recherche des praticiens par spécialité
export async function searchPraticiensBySpecialite(specialite: string): Promise<Praticien[]> {
  try {
    const response = await axios.get<Praticien[]>(`${API_BASE_URL}/praticien/search`, {
      params: { specialite }
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || "Erreur lors de la recherche");
    }
    throw new Error("Erreur inattendue");
  }
}