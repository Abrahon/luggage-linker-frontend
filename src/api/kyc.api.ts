// src/api/kyc.api.ts
import axiosInstance from "./axios";

export type KYCStatus = "pending" | "approved" | "rejected" | "unverified";

export type KYCStatusType = "pending" | "under_review" | "approved" | "rejected" | "unverified";

export interface KYCData {
  id: string;
  id_type: "national_id" | "passport" | "drivers_license";
  id_number: string;
  document_front: string;
  document_back: string | null;
  selfie: string;
  status: KYCStatus;
  rejection_reason: string | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface KYCSubmitPayload {
  id_type: string;
  id_number: string;
  document_front: File;
  document_back?: File;
  selfie: File;
}

export interface PaginatedKYCResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: KYCData[];
}

/**
 * Fetch current user's KYC record
 * Route: GET /api/kyc/me/
 */
export const getMyKYCApi = async (): Promise<KYCData | null> => {
  try {
    const response = await axiosInstance.get<KYCData>("/api/kyc/me/");
    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return null; // Return null if no record exists yet
    }
    throw error;
  }
};

/**
 * Submit KYC verification documents
 * Route: POST /api/kyc/
 */
export const submitKYCApi = async (payload: KYCSubmitPayload): Promise<KYCData> => {
  const formData = new FormData();
  formData.append("id_type", payload.id_type);
  formData.append("id_number", payload.id_number);
  formData.append("document_front", payload.document_front);
  
  if (payload.document_back) {
    formData.append("document_back", payload.document_back);
  }
  
  formData.append("selfie", payload.selfie);

  const response = await axiosInstance.post<KYCData>("/api/kyc/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};


// ==========================================
// --- Admin Specific API Endpoints ---
// ==========================================

/**
 * Get paginated KYC submissions for Admin
 * Route: GET /api/admin/kyc/?page={page}
 */
export const getAdminKYCListApi = async (page: number = 1): Promise<PaginatedKYCResponse> => {
  const response = await axiosInstance.get<PaginatedKYCResponse>(`/api/admin/kyc/?page=${page}`);
  return response.data;
};

/**
 * Update KYC verification status (Approve, Reject, Under Review, etc.)
 * Route: PATCH /api/admin/kyc/{id}/
 */
export const updateAdminKYCStatusApi = async (
  id: string,
  payload: { status: KYCStatusType; rejection_reason?: string | null }
): Promise<KYCData> => {
  const response = await axiosInstance.patch<KYCData>(`/api/admin/kyc/${id}/`, payload);
  return response.data;
};