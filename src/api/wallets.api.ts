import axiosInstance from "@/api/axios";

// --- Enums & Types ---

export type MethodType = "BANK" | "BKASH" | "NAGAD" | "ROCKET" | "STRIPE";

export interface WithdrawMethod {
  id: string;
  type: MethodType;
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

export interface CreateBankWithdrawMethodPayload {
  type: "BANK";
  account_name: string;
  account_number: string;
  bank_name: string;
  branch_name: string;
  routing_number: string;
}

export interface CreateMobileWithdrawMethodPayload {
  type: "BKASH" | "NAGAD" | "ROCKET";
  account_name: string;
  account_number: string;
}

export type CreateWithdrawMethodPayload =
  | CreateBankWithdrawMethodPayload
  | CreateMobileWithdrawMethodPayload;

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface RequestWithdrawalPayload {
  withdrawal_method: string;
  amount: string;
}

export interface WithdrawalRecord {
  id: string;
  withdrawal_method: string;
  withdrawal_method_details: WithdrawMethod;
  amount: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED" | string;
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

export interface WalletData {
  available_balance: string;
  pending_balance: string;
  total_earned: string;
  total_withdrawn: string;
}

export interface MonthlyWithdrawalData {
  month: string;
  withdrawn: string;
  withdrawals: number;
}

export interface MonthlyWithdrawalResponse {
  success: boolean;
  message: string;
  data: MonthlyWithdrawalData[];
}

// --- Withdrawal Requests History Types ---

export interface WithdrawalMethodDetails {
  type: "BANK" | "MOBILE_MONEY" | "BKASH" | "NAGAD" | "ROCKET" | string;
  type_display: string;
  account_name: string;
  account_number: string;
  bank_name?: string;
  branch_name?: string;
}

export interface WithdrawalItem {
  id: string;
  amount: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "CANCELLED" | "FAILED" | string;
  created_at: string;
  processed_at: string | null;
  completed_at: string | null;
  withdrawal_method: WithdrawalMethodDetails;
}

export interface WithdrawalResponse {
  success: boolean;
  message: string;
  count: number;
  data: WithdrawalItem[];
}

// --- Wallet Ledger Types ---

export interface WalletLedgerItem {
  reference: string;
  transaction_date: string;
  transaction_type: string;
  amount: string;
  booking_id: string | null;
  booking_tracking: string | null;
  status: string;
  description: string;
}

export interface WalletLedgerResponse {
  success: boolean;
  message: string;
  count: number;
  data: WalletLedgerItem[];
}

// --- Pending Release Types ---

export interface PendingReleaseItem {
  id: string;
  tracking_number: string;
  package: string;
  reward: string;
  currency: string;
  expected_release: string;
  escrow_status: string;
  status: string;
}

export interface PendingReleasesResponse {
  success: boolean;
  message: string;
  count: number;
  data: PendingReleaseItem[];
}

// --- API Functions ---

export const getWalletData = async (): Promise<WalletData> => {
  const response = await axiosInstance.get("/api/wallets/");
  return response.data?.data || response.data;
};

export const getWithdrawalMethods = async (): Promise<WithdrawMethod[]> => {
  const response = await axiosInstance.get<any>(
    "/api/wallets/withdraw-methods/"
  );
  return response.data?.data || response.data?.results || response.data || [];
};

export const createWithdrawalMethod = async (
  payload: CreateWithdrawMethodPayload
): Promise<ApiResponse<WithdrawMethod>> => {
  const response = await axiosInstance.post<ApiResponse<WithdrawMethod>>(
    "/api/wallets/withdraw-methods/",
    payload
  );
  return response.data;
};

export const requestWithdrawal = async (
  payload: RequestWithdrawalPayload
): Promise<ApiResponse<WithdrawalRecord>> => {
  const response = await axiosInstance.post<ApiResponse<WithdrawalRecord>>(
    "/api/wallets/withdraw/",
    payload
  );
  return response.data;
};

export const getWithdrawals = async (): Promise<WithdrawalResponse> => {
  const response = await axiosInstance.get<WithdrawalResponse>(
    "/api/wallets/withdrawals/"
  );
  return response.data;
};

export const getMonthlyWithdrawals = async (): Promise<MonthlyWithdrawalResponse> => {
  const response = await axiosInstance.get<MonthlyWithdrawalResponse>(
    "/api/wallet/monthly-withdrawals/"
  );
  return response.data;
};

export const getWalletLedger = async (): Promise<WalletLedgerResponse> => {
  const response = await axiosInstance.get<WalletLedgerResponse>(
    "/api/wallet/ledger/"
  );
  return response.data;
};

export const getPendingReleases = async (): Promise<PendingReleasesResponse> => {
  const response = await axiosInstance.get<PendingReleasesResponse>(
    "/api/wallet/pending-releases/"
  );
  return response.data;
};