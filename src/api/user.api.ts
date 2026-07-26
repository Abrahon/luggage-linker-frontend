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


export interface RouteItem {
  package__pickup_country: string;
  package__pickup_city: string;
  package__destination_country: string;
  package__destination_city: string;
  total_deliveries: number;
}

export interface TopRoutesApiResponse {
  success: boolean;
  message: string;
  results: RouteItem[];
}

export const getTopRoutesApi = async (): Promise<TopRoutesApiResponse> => {
  const response = await axiosInstance.get<TopRoutesApiResponse>(
    "/api/admin/dashboard/top-routes/"
  );
  return response.data;
};

export interface ActivityItem {
  type: "MATCH" | "BOOKING" | "DELIVERY" | "PAYMENT" | "KYC" | "DISPUTE";
  title: string;
  description: string;
  time: string;
  created_at: string;
}

export interface RecentActivitiesResponse {
  message: string;
  count: number;
  results: ActivityItem[];
}

export const getRecentActivitiesApi = async (): Promise<RecentActivitiesResponse> => {
  const response = await axiosInstance.get<RecentActivitiesResponse>(
    "/api/admin/dashboard/recent-activities/"
  );
  return response.data;
};


export interface DashboardStatsData {
  total_users: number;
  total_packages: number;
  total_bookings: number;
  platform_revenue: string;
  active_deliveries: number;
  completed_deliveries: number;
  pending_kyc: number;
  open_disputes: number;
}

export interface DashboardStatsApiResponse {
  message: string;
  data: DashboardStatsData;
}

export const getDashboardStatsApi = async (): Promise<DashboardStatsApiResponse> => {
  const response = await axiosInstance.get<DashboardStatsApiResponse>(
    "/api/admin/dashboard/stats/"
  );
  return response.data;
};