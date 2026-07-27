import axiosInstance from "@/api/axios"; // Adjust this relative import path if needed (e.g. "@/lib/axios" or "@/src/api/axios")

// --- Types based on Backend DRF Responses ---

export interface WithdrawalMethodDetails {
  type: string;
  account_name: string;
  account_number: string;
  bank_name: string;
  branch_name: string;
  routing_number: string;
  is_verified: boolean;
}

export interface WithdrawalListItem {
  id: string;
  traveler_name: string;
  traveler_email: string;
  withdrawal_method: string | null;
  withdrawal_method_details?: WithdrawalMethodDetails | null;
  amount: string;
  status: "PENDING" | "COMPLETED" | "PAID" | "REJECTED" | "CANCELLED";
  processed_by: string | null;
  processed_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface WithdrawalListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: WithdrawalListItem[];
}

export interface DetailedWithdrawalMethod {
  id: string;
  type: string;
  type_display: string;
  account_name: string;
  account_number: string;
  bank_name: string;
  branch_name: string;
  routing_number: string;
  stripe_account_id: string;
  is_default: boolean;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WithdrawalDetailResponse {
  id: string;
  withdrawal_method: string | null;
  withdrawal_method_details: DetailedWithdrawalMethod | null;
  amount: string;
  status: "PENDING" | "COMPLETED" | "PAID" | "REJECTED" | "CANCELLED";
  stripe_transfer_id: string | null;
  stripe_payout_id: string | null;
  rejection_reason: string | null;
  processed_by: string | null;
  processed_at: string | null;
  admin_note: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

// Params interface for searching & paginating
export interface GetWithdrawalsParams {
  page?: number;
  search?: string;
  status?: string;
}

export interface AdminWithdrawalStats {
  total_travelers_requested: number;
  total_pending_balance: string;
  pending_requests: number;
  completed_requests: number;
}

export interface AdminWithdrawalStatsResponse {
  success: boolean;
  message: string;
  data: AdminWithdrawalStats;
}
export interface WithdrawalActionResponse {
  success: boolean;
  message: string;
  data: WithdrawalDetailResponse;
}


export const WalletApi = {


    getStats: async (): Promise<AdminWithdrawalStatsResponse> => {
    const response = await axiosInstance.get<AdminWithdrawalStatsResponse>(
      "/api/admin/withdrawals/stats/"
    );
    return response.data;
  },
  /**
   * Fetch paginated & filtered withdrawal requests list
   * GET /api/admin/withdrawals/
   */
  getWithdrawals: async (params?: GetWithdrawalsParams): Promise<WithdrawalListResponse> => {
    const response = await axiosInstance.get<WithdrawalListResponse>("/api/admin/withdrawals/", {
      params: {
        page: params?.page,
        search: params?.search || undefined,
        status: params?.status || undefined,
      },
    });
    return response.data;
  },

  /**
   * Fetch single withdrawal request detail
   * GET /api/admin/withdrawals/{id}/
   */
  getWithdrawalDetail: async (id: string): Promise<WithdrawalDetailResponse> => {
    const response = await axiosInstance.get<WithdrawalDetailResponse>(
      `/api/admin/withdrawals/${id}/`
    );
    return response.data;
  },


  approveWithdrawal: async (id: string, adminNote?: string): Promise<WithdrawalActionResponse> => {
    const response = await axiosInstance.post<WithdrawalActionResponse>(
      `/api/admin/withdrawals/${id}/approve/`,
      { admin_note: adminNote || undefined }
    );
    return response.data;
  },

  /**
   * Reject a pending withdrawal request with reason
   * POST /api/admin/withdrawals/{id}/reject/
   */
  rejectWithdrawal: async (id: string, rejectionReason: string): Promise<WithdrawalActionResponse> => {
    const response = await axiosInstance.post<WithdrawalActionResponse>(
      `/api/admin/withdrawals/${id}/reject/`,
      { rejection_reason: rejectionReason }
    );
    return response.data;
  },
};