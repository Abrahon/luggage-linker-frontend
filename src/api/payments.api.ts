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