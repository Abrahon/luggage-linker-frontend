import axiosInstance from "@/api/axios";


export interface ApiUser {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
  is_online: boolean;
  last_seen: string | null;
  is_staff: boolean;
  is_verified: boolean;
  date_joined: string;
  updated_at: string;
}

export interface PaginatedUserResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ApiUser[];
}

export const getAdminUserListApi = async (
  page: number,
  search?: string,
  role?: string,
  status?: string
): Promise<PaginatedUserResponse> => {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  if (search) params.append("search", search);
  if (role && role !== "all") params.append("role", role.toUpperCase());
  if (status && status !== "all") {
    params.append("is_active", status === "active" ? "true" : "false");
  }

  const response = await axiosInstance.get<PaginatedUserResponse>(
    `/api/admin/users/?${params.toString()}`
  );
  return response.data;
};

export const toggleAdminUserStatusApi = async (
  userId: string,
  action: "ban" | "unban"
) => {
  const response = await axiosInstance.patch(
    `/api/admin/users/${userId}/${action}/`
  );
  return response.data;
};



export interface MonthlyGrowthItem {
  year: number;
  month: number;
  month_name: string;
  total_users: number;
  active_users: number;
}

export const getUserGrowthData = async (): Promise<MonthlyGrowthItem[]> => {
  const response = await axiosInstance.get<MonthlyGrowthItem[]>(
    "/api/admin/users/growth/"
  );
  return response.data;
};



export interface RoleDetail {
  count: number;
  percentage: number;
}

export interface UserRoleDistributionResponse {
  total_users: number;
  roles: {
    SENDER: RoleDetail;
    TRAVELER: RoleDetail;
  };
}

export const getUserRoleDistribution = async (): Promise<UserRoleDistributionResponse> => {
  const response = await axiosInstance.get<UserRoleDistributionResponse>(
    "/api/admin/users/role-distribution/"
  );
  return response.data;
};


export interface MonthlyRevenueItem {
  year: number;
  month: number;
  month_name: string;
  total_revenue: number;
  platform_fee_revenue: number;
  transaction_count: number;
  paying_users: number;
}

export const getMonthlyRevenueApi = async (): Promise<MonthlyRevenueItem[]> => {
  const response = await axiosInstance.get<MonthlyRevenueItem[]>(
    "/api/admin/revenue/monthly/"
  );
  return response.data;
};