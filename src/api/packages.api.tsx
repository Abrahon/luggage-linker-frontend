import axiosInstance from "./axios";

export interface PackageImage {
  id: string;
  image: string;
  is_primary: boolean;
  created_at?: string;
}

export interface AdminPackage {
  id: string;
  title: string;
  description: string;
  category: string;
  weight: string;
  declared_value: string;
  reward_amount: string;
  currency: string;
  pickup_country: string;
  pickup_city: string;
  pickup_address: string;
  destination_country: string;
  destination_city: string;
  destination_address: string;
  pickup_date: string;
  latest_delivery_date: string;
  status: string;
  verification_status: string;
  risk_score: number;
  declared_as_legal: boolean;
  terms_accepted: boolean;
  traveler_matches_listing: any;
  traveler_refusal_reason: string | null;
  sender_email: string;
  sender_name: string;
  images: PackageImage[];
  is_fragile?: boolean;
  requires_signature?: boolean;
  is_public?: boolean;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminPackagesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminPackage[];
}

export interface AdminReviewResponse {
  success: boolean;
  message: string;
  data: AdminPackage;
}

export interface FetchPackagesParams {
  search?: string;
  status?: string;
  verification?: string;
  verification_status?: string; // Kept for backwards compatibility
  category?: string;
  page?: number;
}

/**
 * 1. Fetch list of packages with search and filtering
 */
export const getAdminPackagesApi = async (
  params?: FetchPackagesParams
): Promise<AdminPackagesResponse> => {
  const queryParams: Record<string, any> = {};

  if (params?.search?.trim()) queryParams.search = params.search.trim();
  if (params?.status && params.status !== "all") queryParams.status = params.status;
  
  // FIX: Read either verification or verification_status, but pass "verification" key to backend API
  const verificationFilter = params?.verification || params?.verification_status;
  if (verificationFilter && verificationFilter !== "all") {
    queryParams.verification = verificationFilter;
  }

  if (params?.category && params.category !== "all") {
    queryParams.category = params.category;
  }
  if (params?.page) queryParams.page = params.page;

  const response = await axiosInstance.get<AdminPackagesResponse>("/api/admin/packages/", {
    params: queryParams,
  });
  return response.data;
};

/**
 * 2. Fetch specific package details
 */
export const getAdminPackageDetailApi = async (
  packageId: string
): Promise<AdminPackage> => {
  const response = await axiosInstance.get<AdminPackage>(
    `/api/admin/packages/${packageId}/`
  );
  return response.data;
};

/**
 * 3. Approve or Reject Package Review
 */
export const reviewAdminPackageApi = async (
  packageId: string,
  approve: boolean
): Promise<AdminReviewResponse> => {
  const response = await axiosInstance.patch<AdminReviewResponse>(
    `/api/package/${packageId}/admin-review/`,
    { approve }
  );
  return response.data;
};