// src/api/kyc.api.ts
import axiosInstance from "./axios";

export type KYCStatus = "pending" | "approved" | "rejected" | "unverified";

export type KYCStatusType = "pending" | "under_review" | "approved" | "rejected" | "unverified";

export interface KYCUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface KYCData {
  id: string;
  user?: KYCUser;
  id_type: "national_id" | "passport" | "driving_license";
  id_number: string;
  document_front: string;
  document_back: string | null;
  selfie: string;
  status: KYCStatusType; 
  rejection_reason: string | null;
  verified_by_email?: string | null; // <-- Added property
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface KYCActionResponse {
  message: string;
  data: KYCData;
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
      return null;
    }
    throw error;
  }
};

export const submitKYCApi = async (payload: KYCSubmitPayload): Promise<KYCData> => {
  const formData = new FormData();
  formData.append("id_type", payload.id_type);
  formData.append("id_number", payload.id_number);
  formData.append("document_front", payload.document_front);
  
  if (payload.document_back && payload.id_type !== "passport") {
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


export const updateKYCApi = async (payload: Partial<KYCSubmitPayload>): Promise<KYCData> => {
  const formData = new FormData();
  if (payload.id_type) formData.append("id_type", payload.id_type);
  if (payload.id_number) formData.append("id_number", payload.id_number);
  if (payload.document_front) formData.append("document_front", payload.document_front);
  if (payload.document_back && payload.id_type !== "passport") {
    formData.append("document_back", payload.document_back);
  }
  if (payload.selfie) formData.append("selfie", payload.selfie);

  const response = await axiosInstance.patch<KYCData>("/api/kyc/me/", formData, {
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

export const getAdminKYCDetailApi = async (id: string): Promise<KYCData> => {
  const response = await axiosInstance.get<KYCData>(`/api/admin/kyc/${id}/`);
  return response.data;
};

/**
 * Approve KYC application
 * Route: POST /api/admin/kyc/{id}/approve/
 */
export const approveAdminKYCApi = async (id: string): Promise<KYCActionResponse> => {
  const response = await axiosInstance.post<KYCActionResponse>(`/api/admin/kyc/${id}/approve/`);
  return response.data;
};

/**
 * Reject KYC application
 * Route: POST /api/admin/kyc/{id}/reject/
 */
export const rejectAdminKYCApi = async (
  id: string,
  rejectionReason: string
): Promise<KYCActionResponse> => {
  const response = await axiosInstance.post<KYCActionResponse>(`/api/admin/kyc/${id}/reject/`, {
    rejection_reason: rejectionReason,
  });
  return response.data;
};