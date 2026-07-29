// src/services/revenueService.ts

import axiosInstance from "@/api/axios";

// --- Data Interfaces ---

export interface WalletDashboardData {
  total_earned: string;
  available_balance: string;
  pending_releases: string;
  completed_deliveries: number;
}

export interface MonthlyEarningItem {
  month: string;
  earnings: string;
  deliveries: number;
}

export interface RecentBookingItem {
  id: string;
  tracking_number: string;
  reward: string;
  currency: string;
  delivered_at: string;
  status?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  count?: number;
  data: T;
}

// --- Revenue API Services ---

/**
 * 1. Fetch wallet summary metrics (total earned, available balance, etc.)
 */
export async function getWalletDashboard(): Promise<WalletDashboardData> {
  const response = await axiosInstance.get<ApiResponse<WalletDashboardData>>("/api/wallet/dashboard/");
  return response.data.data;
}

/**
 * 2. Fetch monthly earnings breakdown array
 */
export async function getMonthlyEarnings(): Promise<MonthlyEarningItem[]> {
  const response = await axiosInstance.get<ApiResponse<MonthlyEarningItem[]>>("/api/dashboard/monthly-earnings/");
  return response.data.data;
}

/**
 * 3. Fetch list of recent completed bookings/deliveries
 */
export async function getRecentCompletedBookings(): Promise<RecentBookingItem[]> {
  const response = await axiosInstance.get<ApiResponse<RecentBookingItem[]>>("/api/recent-bookings/completed/");
  return response.data.data;
}

/**
 * Combined helper to load all revenue dashboard datasets simultaneously
 */
export async function fetchRevenueDashboardData() {
  const [wallet, monthly, bookings] = await Promise.all([
    getWalletDashboard(),
    getMonthlyEarnings(),
    getRecentCompletedBookings(),
  ]);

  return {
    wallet,
    monthly,
    bookings,
  };
}