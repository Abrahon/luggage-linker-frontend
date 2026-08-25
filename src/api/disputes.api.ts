import axiosInstance from "@/api/axios";

// ==============================================================================
// TYPES & INTERFACES (Matching Exact Backend JSON Schema)
// ==============================================================================

export type DisputeStatus =
  | "OPEN"
  | "UNDER_REVIEW"
  | "WAITING_FOR_USER"
  | "RESOLVED"
  | "REJECTED"
  | "CLOSED"
  | string;

export type DisputeReason =
  | "DAMAGED_CARGO"
  | "DAMAGED"
  | "LOST_PACKAGE"
  | "ITEM_MISSING"
  | "NO_SHOW"
  | "DELAYED_DELIVERY"
  | "OTHER"
  | string;

export type EvidenceType =
  | "IMAGE"
  | "DAMAGE_PHOTO"
  | "RECEIPT"
  | "CHAT_LOG"
  | "OTHER";

export interface DisputeUser {
  id: string;
  email: string;
  full_name: string;
  profile_picture: string | null;
}

export interface DisputeBooking {
  id: string;
  tracking_number: string;
  status: string;
  payment_status: string;
  package_details?: string;
  [key: string]: any;
}

export interface DisputeSettlement {
  currency: string;
  total_amount: string;
  refund_ratio: string;
  sender_refund: string;
  traveler_payout: string;
}

export interface DisputeTimeline {
  opened_at: string;
  assigned_at: string | null;
  resolved_at: string | null;
}

export interface DisputeEvidence {
  id: string;
  dispute: string;
  uploaded_by: string;
  uploaded_by_email: string;
  evidence_type: EvidenceType | string;
  evidence_type_display?: string;
  file_url?: string;
  file_attachment?: string;
  description?: string;
  created_at?: string;
}

export interface DisputeMessage {
  id: string;
  sender: string;
  sender_email: string;
  sender_name?: string;
  sender_profile_picture?: string | null;
  sender_role?: string;
  message_text: string;
  is_mine?: boolean;
  is_admin_note?: boolean;
  is_read?: boolean;
  created_at: string;
}

export interface DisputeHistoryEvent {
  id: string;
  action: string;
  action_display: string;
  status_from: string;
  status_from_display: string;
  status_to: string;
  status_to_display: string;
  notes: string;
  created_at: string;
}

export interface DisputePermissions {
  can_send_message: boolean;
  can_upload_evidence: boolean;
  can_reopen: boolean;
}

export interface DisputeItem {
  id: string;
  booking: DisputeBooking;
  opened_by: DisputeUser;
  against_user: DisputeUser;
  assigned_admin?: DisputeUser | null;
  reason: DisputeReason;
  reason_display?: string;
  description: string;
  disputed_amount: string;
  settlement?: DisputeSettlement | null;
  status: DisputeStatus;
  status_display?: string;
  resolution?: string | null;
  resolution_display?: string | null;
  resolution_info?: any;
  timeline?: DisputeTimeline;
  evidence: DisputeEvidence[];
  messages: DisputeMessage[];
  history?: DisputeHistoryEvent[];
  created_at: string;
  updated_at?: string;
  resolved_at?: string | null;
  permissions?: DisputePermissions;
}

export type CreateDisputeResponse = DisputeItem & {
  dispute?: DisputeItem;
  message?: string;
};

export interface CreateDisputePayload {
  booking: string; // Booking ID required by backend
  against_user: string;
  reason: string;
  description: string;
  disputed_amount: number;
}

export interface GetDisputesParams {
  page?: number;
  status?: string;
  search?: string;
}

export interface PaginatedDisputesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: DisputeItem[];
}

// ==============================================================================
// HELPERS
// ==============================================================================

/**
 * Maps arbitrary strings or dispute reasons to a valid Django EvidenceType choice.
 * Ensures choices like "LOST_PACKAGE" default safely to "OTHER" instead of failing validation.
 */
export const mapToValidEvidenceType = (
  rawType?: string
): EvidenceType => {
  if (!rawType) return "DAMAGE_PHOTO";

  const upper = rawType.toUpperCase();

  switch (upper) {
    case "IMAGE":
      return "IMAGE";
    case "DAMAGE_PHOTO":
    case "DAMAGED":
    case "DAMAGED_CARGO":
      return "DAMAGE_PHOTO";
    case "RECEIPT":
      return "RECEIPT";
    case "CHAT_LOG":
      return "CHAT_LOG";
    case "OTHER":
    case "LOST_PACKAGE":
    case "ITEM_MISSING":
    case "NO_SHOW":
    case "DELAYED_DELIVERY":
    default:
      return "OTHER";
  }
};

// ==============================================================================
// API STORE CALLS
// ==============================================================================

/** 1. Fetch all disputes for the logged-in user (Supports DRF Pagination or Direct Array) */
export const getMyDisputes = async (
  params?: GetDisputesParams
): Promise<PaginatedDisputesResponse | DisputeItem[]> => {
  const response = await axiosInstance.get("/api/disputes/", { params });
  return response.data;
};

/** 2. Fetch single dispute detail by ID (`/api/disputes/{disputeId}/`) */
export const getDisputeDetail = async (
  disputeId: string
): Promise<DisputeItem> => {
  const response = await axiosInstance.get(`/api/disputes/${disputeId}/`);
  return response.data;
};

/** 3. Open a new dispute claim */
export const createDispute = async (
  payload: CreateDisputePayload
): Promise<CreateDisputeResponse> => {
  const response = await axiosInstance.post("/api/disputes/", payload);
  return response.data;
};

/** 4. Upload evidence image for a specific dispute */
export const uploadDisputeEvidence = async (
  disputeId: string,
  file: File,
  evidenceType: EvidenceType | string = "DAMAGE_PHOTO",
  description: string = "Supporting dispute evidence"
): Promise<DisputeEvidence> => {
  // Validate evidence_type against allowed Django choices
  const validEvidenceType = mapToValidEvidenceType(evidenceType);

  const formData = new FormData();
  formData.append("dispute", disputeId); // Required by Django Serializer
  formData.append("file_attachment", file);
  formData.append("evidence_type", validEvidenceType);
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

/** 5. Send message in dispute conversation thread */
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