import axiosInstance from "./axios";

// Raw API types matching backend response
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
  escrow_status: "AUTHORIZED" | "CAPTURED" | "RELEASED" | "REFUNDED" | string;
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
  escrow_status?: string;
  page?: number;
}

/**
 * 1. Fetch dashboard stats
 */
export const getAdminPaymentStatsApi = async (): Promise<BackendPaymentStats> => {
  const response = await axiosInstance.get<StatsResponse>("/api/admin/payment-dashboard/stats/");
  return response.data.data;
};

/**
 * 2. Fetch payments list with filters and pagination
 */
export const getAdminPaymentsApi = async (
  params?: FetchPaymentsParams
): Promise<AdminPaymentsResponse> => {
  const queryParams: Record<string, any> = {};

  if (params?.search?.trim()) queryParams.search = params.search.trim();
  if (params?.escrow_status && params.escrow_status !== "all") {
    queryParams.escrow_status = params.escrow_status;
  }
  if (params?.page) queryParams.page = params.page;

  const response = await axiosInstance.get<AdminPaymentsResponse>("/api/admin/payments/", {
    params: queryParams,
  });
  return response.data;
};

/**
 * 3. Release Escrow
 */
export const releaseEscrowApi = async (paymentId: string) => {
  const response = await axiosInstance.post(`/api/admin/payments/${paymentId}/release/`);
  return response.data;
};

/**
 * 4. Refund Escrow
 */
export const refundEscrowApi = async (paymentId: string) => {
  const response = await axiosInstance.post(`/api/admin/payments/${paymentId}/refund/`);
  return response.data;
};