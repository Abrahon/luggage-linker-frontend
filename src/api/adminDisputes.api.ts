import axiosInstance from "@/api/axios";

// ==============================================================================
// STATUS & WORKFLOW TYPES (Synchronized with Django Models)
// ==============================================================================

/**
 * Workflow status matching `DisputeStatus` text choices in Django.
 */
export type DisputeStatusType =
  | "OPEN"
  | "UNDER_REVIEW"
  | "WAITING_FOR_USER"
  | "RESOLVED"
  | "REJECTED"
  | "CLOSED";

/**
 * Resolution decisions matching `ResolutionType` text choices in Django.
 * Note: Escrow release value is 'RELEASE_PAYMENT' in backend models.
 */
/**
 * Resolution decisions matching `ResolutionType` text choices in Django.
 */
export type ResolutionType =
  | "FULL_REFUND"
  | "PARTIAL_REFUND"
  | "RELEASE_PAYMENT"
  | "NO_ACTION";

/**
 * Reasons matching `DisputeReason` text choices in Django.
 */
export type DisputeReasonType =
  | "DAMAGED"
  | "LOST_PACKAGE"
  | "ITEM_MISSING"
  | "NO_SHOW"
  | "DELAYED_DELIVERY"
  | "OTHER";

/**
 * Media categories matching `EvidenceType` text choices in Django.
 */
export type EvidenceType =
  | "IMAGE"
  | "DAMAGE_PHOTO"
  | "RECEIPT"
  | "CHAT_LOG"
  | "OTHER";

/**
 * Immutable audit log actions matching `DisputeHistoryAction` in Django.
 */
export type DisputeHistoryActionType =
  | "OPEN"
  | "OPENED"
  | "CREATED"
  | "ASSIGNED"
  | "EVIDENCE_ADDED"
  | "EVIDENCE_REQUESTED"
  | "RESOLVED_REFUND"
  | "RESOLVED_RELEASE"
  | "RESOLVED_PARTIAL"
  | "REJECTED"
  | "CLOSED";

// ==============================================================================
// DOMAIN INTERFACES
// ==============================================================================

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
  reward?: string;
}

export interface DisputeEvidence {
  id: string;
  dispute: string;
  uploaded_by: string;
  uploaded_by_email: string;
  file_url: string;
  evidence_type: EvidenceType | string;
  evidence_type_display: string;
  description: string;
  created_at: string;
}

export interface DisputeMessage {
  id: string;
  dispute: string;
  sender: string;
  sender_email: string;
  sender_name: string;
  message_text: string;
  created_at: string;
}

export interface DisputeHistoryItem {
  id: string;
  actor: string;
  actor_name: string;
  action: DisputeHistoryActionType | string;
  action_display: string;
  status_from: DisputeStatusType;
  status_from_display: string;
  status_to: DisputeStatusType;
  status_to_display: string;
  notes: string;
  created_at: string;
}

export interface DisputeSettlement {
  currency: string;
  total_amount: string;
  refund_ratio: string;
  sender_refund: string;
  traveler_payout: string;
}

export interface DisputeTimeline {
  opened_at: string | null;
  assigned_at: string | null;
  resolved_at: string | null;
}

// ==============================================================================
// MAIN DISPUTE DETAIL INTERFACE
// ==============================================================================

export interface DisputeDetailItem {
  id: string;
  booking: DisputeBooking;
  opened_by: DisputeUser;
  against_user: DisputeUser;
  assigned_admin: DisputeUser | null;
  resolved_by?: DisputeUser | null;
  reason: DisputeReasonType | string;
  reason_display: string;
  description: string;
  disputed_amount: string;
  status: DisputeStatusType;
  status_display: string;
  resolution?: ResolutionType | null;
  resolution_display?: string | null;
  admin_notes?: string;
  settlement?: DisputeSettlement;
  
  timeline?: DisputeTimeline;
  
  created_at?: string;
  updated_at?: string;
  resolved_at?: string | null;
  
  evidence?: DisputeEvidence[];
  messages?: DisputeMessage[];
  history?: DisputeHistoryItem[];
}

export interface DisputesListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: DisputeDetailItem[];
}

// ==============================================================================
// REQUEST PAYLOADS
// ==============================================================================

export interface ResolvePayload {
  resolution_type: ResolutionType;
  admin_notes: string;
  refund_ratio?: number;
}

export interface RequestEvidencePayload {
  request_message: string;
}

// ==============================================================================
// API CALLS
// ==============================================================================

// 1. Fetch All Admin Disputes with Filters
export const getAdminDisputes = async (
  params?: Record<string, any>
): Promise<DisputesListResponse> => {
  const response = await axiosInstance.get("/api/admin/disputes/", { params });
  return response.data;
};

// 2. Fetch Single Dispute Detail
export const getAdminDisputeById = async (
  id: string
): Promise<DisputeDetailItem> => {
  const response = await axiosInstance.get(`/api/admin/disputes/${id}/`);
  return response.data;
};

// 3. Assign Dispute to Admin
export const assignDisputeToMe = async (
  disputeId: string
): Promise<DisputeDetailItem> => {
  const response = await axiosInstance.post(
    `/api/admin/disputes/${disputeId}/assign/`
  );
  return response.data;
};

// 4. Resolve Dispute
export const resolveDispute = async (
  disputeId: string,
  payload: ResolvePayload
): Promise<DisputeDetailItem> => {
  const response = await axiosInstance.post(
    `/api/admin/disputes/${disputeId}/resolve/`,
    payload
  );
  return response.data;
};

// 5. Update Dispute Status
export const updateDisputeStatus = async (
  disputeId: string,
  status: DisputeStatusType
): Promise<{ success: boolean; data: DisputeDetailItem }> => {
  const response = await axiosInstance.patch(
    `/api/admin/disputes/${disputeId}/status/`,
    { status }
  );
  return response.data;
};

// 6. Request Additional Evidence from User
export const requestDisputeEvidence = async (
  disputeId: string,
  payload: RequestEvidencePayload
): Promise<DisputeDetailItem> => {
  const response = await axiosInstance.post(
    `/api/admin/disputes/${disputeId}/request-evidence/`,
    payload
  );
  return response.data;
};