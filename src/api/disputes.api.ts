import axiosInstance from "@/api/axios";

export interface DisputeUser {
  id: string;
  email: string;
  full_name: string;
  profile_picture: string | null;
}

export interface DisputeEvidence {
  id: string;
  dispute: string;
  uploaded_by: string;
  uploaded_by_email: string;
  file_url: string;
  evidence_type: string;
  evidence_type_display: string;
  description: string;
  created_at: string;
}

export interface DisputeItem {
  id: string;
  booking: string; // Booking UUID
  opened_by: DisputeUser;
  against_user: DisputeUser;
  assigned_admin?: DisputeUser | null;
  reason: string;
  reason_display: string;
  description: string;
  disputed_amount: string | number;
  status: "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "REJECTED" | string;
  status_display: string;
  resolution?: string | null;
  resolution_display?: string | null;
  is_reopened: boolean;
  messages: any[];
  evidence: DisputeEvidence[];
  created_at: string;
  updated_at: string;
  resolved_at?: string | null;
}

export interface CreateDisputePayload {
  booking_id: string;
  against_user: string;
  reason: string;
  description: string;
  disputed_amount: number;
}

export interface CreateDisputeResponse {
  success?: boolean;
  data?: DisputeItem;
  id?: string;
  [key: string]: any;
}

// 1. Fetch User Disputes
export const getMyDisputes = async (): Promise<{ results: DisputeItem[] }> => {
  const response = await axiosInstance.get("/api/disputes/");
  return response.data;
};

// 2. Create a Dispute
export const createDispute = async (
  payload: CreateDisputePayload
): Promise<CreateDisputeResponse> => {
  const response = await axiosInstance.post("/api/disputes/", payload);
  return response.data;
};

// 3. Upload Dispute Evidence
export const uploadDisputeEvidence = async (
  disputeId: string,
  fileAttachment: File,
  evidenceType: string,
  description: string
): Promise<DisputeEvidence> => {
  const formData = new FormData();
  formData.append("file_attachment", fileAttachment);
  formData.append("evidence_type", evidenceType);
  formData.append("description", description);

  // Note: Axios automatically sets the multipart boundary header when passing FormData
  const response = await axiosInstance.post(
    `/api/disputes/${disputeId}/evidence/`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};