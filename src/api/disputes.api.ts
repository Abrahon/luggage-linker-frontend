import axiosInstance from "@/api/axios";

// ==============================================================================
// TYPES & INTERFACES
// ==============================================================================

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
  evidence_type: "IMAGE" | "DAMAGE_PHOTO" | "RECEIPT" | "CHAT_LOG" | "OTHER" | string;
  evidence_type_display: string;
  description: string;
  created_at: string;
}

export interface DisputeMessage {
  id: string;
  dispute: string;
  sender: string;
  sender_email: string;
  message_text: string;
  is_admin_note: boolean;
  is_read: boolean;
  created_at: string;
}

export interface DisputeItem {
  id: string; // <-- DISPUTE ID (e.g., "1b61d506-b348-4b34-a464-6ea2d0fa607d")
  booking: string | { tracking_number?: string; package_details?: string; [key: string]: any };
  opened_by: DisputeUser;
  against_user: DisputeUser;
  assigned_admin?: DisputeUser | null;
  reason: "DAMAGED" | "LOST_PACKAGE" | "ITEM_MISSING" | "NO_SHOW" | "DELAYED_DELIVERY" | "OTHER" | string;
  reason_display?: string;
  description: string;
  disputed_amount: string | number;
  status: "OPEN" | "UNDER_REVIEW" | "WAITING_FOR_USER" | "RESOLVED" | "REJECTED" | "CLOSED" | string;
  status_display?: string;
  resolution?: "FULL_REFUND" | "PARTIAL_REFUND" | "RELEASE_PAYMENT" | "NO_ACTION" | null | string;
  resolution_display?: string | null;
  is_reopened?: boolean;
  messages: DisputeMessage[];
  evidence: DisputeEvidence[];
  created_at: string;
  updated_at?: string;
  resolved_at?: string | null;
}

export interface CreateDisputePayload {
  booking: string;       // Booking ID required by backend serializer
  booking_id?: string;   // Fallback key
  against_user: string;
  reason: string;
  description: string;
  disputed_amount: number;
}

// ==============================================================================
// API CALLS
// ==============================================================================

/** 1. Fetch all disputes for the logged-in user */
export const getMyDisputes = async (): Promise<{
  count: number;
  next: string | null;
  previous: string | null;
  results: DisputeItem[];
}> => {
  const response = await axiosInstance.get("/api/disputes/");
  return response.data;
};

/** 2. Open a new dispute claim (Returns the created Dispute object containing `id`) */
export const createDispute = async (
  payload: CreateDisputePayload
): Promise<DisputeItem> => {
  const response = await axiosInstance.post("/api/disputes/", payload);
  return response.data;
};

/** 3. Upload evidence using the created DISPUTE ID -> /api/disputes/{disputeId}/evidence/ */
export const uploadDisputeEvidence = async (
  disputeId: string, // MUST BE DISPUTE ID
  file: File,
  evidenceType: string,
  description: string
): Promise<DisputeEvidence> => {
  const formData = new FormData();

  formData.append("file_attachment", file);
  formData.append("evidence_type", evidenceType);
  formData.append("description", description);

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

/** 4. Post message into dispute chat */
export const sendDisputeMessage = async (
  disputeId: string,
  messageText: string
): Promise<DisputeMessage> => {
  const response = await axiosInstance.post(
    `/api/disputes/${disputeId}/message/`,
    { message_text: messageText }
  );
  return response.data;
};