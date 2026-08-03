import axiosInstance from "./axios";

export interface BackendPaymentStats {
  total_transactions: number;
  escrow_balance: string;
  pending_escrow: string;
  released_escrow: string;
  refund_amount: string;
  platform_revenue: string;
}

export interface StatsResponse {
  message: string;
  data: BackendPaymentStats;
}

export interface BackendPaymentItem {
  id: string;
  booking_id: string;
  sender: string;
  traveler: string;
  amount: string;
  platform_fee: string;
  escrow_status: string;
  created_at: string;
}

export interface AdminPaymentsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: BackendPaymentItem[];
}

export interface FetchPaymentsParams {
  search?: string;
  status?: string;
  page?: number;
}

/**
 * Fetch dashboard stats
 */
export const getAdminPaymentStatsApi = async (): Promise<BackendPaymentStats> => {
  const response = await axiosInstance.get<StatsResponse>("/api/admin/payment-dashboard/stats/");
  return response.data.data;
};

/**
 * Fetch payments list with filter & search parameters
 */
export const getAdminPaymentsApi = async (
  params?: FetchPaymentsParams
): Promise<AdminPaymentsResponse> => {
  const queryParams: Record<string, any> = {};

  if (params?.search?.trim()) {
    queryParams.search = params.search.trim();
  }

  // Sends query parameter as: /api/admin/payments/?status=CAPTURED
  if (params?.status && params.status !== "all") {
    queryParams.status = params.status;
  }

  if (params?.page) {
    queryParams.page = params.page;
  }

  const response = await axiosInstance.get<AdminPaymentsResponse>("/api/admin/payments/", {
    params: queryParams,
  });
  return response.data;
};


// --- Enums / Union Types matching Backend Models ---
export type TransactionType =
  | "ESCROW_HOLD"
  | "ESCROW_RELEASE"
  | "WITHDRAWAL"
  | "WITHDRAWAL_CANCEL"
  | "REFUND"
  | "ADJUSTMENT";

export type TransactionStatus = "PENDING" | "COMPLETED" | "FAILED";

// --- API Response Interfaces ---
export interface PaymentSummaryData {
  total_paid: string;
  escrow_held: string;
  released: string;
  refunded: string;
}

export interface PaymentSummaryResponse {
  success: boolean;
  message: string;
  data: PaymentSummaryData;
}

export interface PaymentHistoryItem {
  id: string;
  tracking_number: string;
  package_title: string;
  transaction_type: TransactionType;
  amount: string;
  currency: string;
  transaction_status: TransactionStatus;
  booking_status: string;
  description: string;
  date: string;
}

export interface PaymentHistoryResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PaymentHistoryItem[];
}

// --- API Calls ---

/**
 * Fetch Sender Payment Summary Stats
 */
export const getSenderPaymentSummary = async (): Promise<PaymentSummaryResponse> => {
  const response = await axiosInstance.get<PaymentSummaryResponse>(
    "/api/sender/payment-summary/"
  );
  return response.data;
};

/**
 * Fetch Sender Payment History List
 */
export const getSenderPaymentHistory = async (): Promise<PaymentHistoryResponse> => {
  const response = await axiosInstance.get<PaymentHistoryResponse>(
    "/api/sender/payment-history/"
  );
  return response.data;
};