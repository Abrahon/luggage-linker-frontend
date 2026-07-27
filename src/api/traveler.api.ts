// src/api/traveler.api.ts
import axiosInstance from "@/api/axios";

export interface TravelerStatsData {
  available_balance: string;
  active_deliveries: number;
  active_trips: number;
  pending_requests: number;
  rating: string;
  completed_deliveries: number;
  pending_earnings: string;
  lifetime_earnings: string;
}

export interface MonthlyChartItem {
  month: string;
  month_number: number;
  year: number;
  earnings: string;
}

export interface MonthlyEarningsData {
  year: number;
  total_year_earnings: string;
  chart_data: MonthlyChartItem[];
}

export interface RecentActivityItem {
  type: string;
  title: string;
  message: string;
  created_at: string;
  time_ago: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const getTravelerStats = async (): Promise<ApiResponse<TravelerStatsData>> => {
  const response = await axiosInstance.get<ApiResponse<TravelerStatsData>>(
    `/api/traveler/stats/?_t=${Date.now()}`
  );
  return response.data;
};

export const getTravelerMonthlyEarnings = async (): Promise<ApiResponse<MonthlyEarningsData>> => {
  const response = await axiosInstance.get<ApiResponse<MonthlyEarningsData>>(
    `/api/traveler/monthly-earnings/?_t=${Date.now()}`
  );
  return response.data;
};

export const getTravelerRecentActivities = async (): Promise<ApiResponse<RecentActivityItem[]>> => {
  const response = await axiosInstance.get<ApiResponse<RecentActivityItem[]>>(
    `/api/traveler/recent-activities/?_t=${Date.now()}`
  );
  return response.data;
};