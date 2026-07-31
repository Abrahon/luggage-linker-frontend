// src/api/sender.api.ts

import axiosInstance from "@/api/axios";

// Interfaces matching your Django backend payloads
export interface DashboardStats {
  active_bookings: number;
  pending_bookings: number;
  completed_bookings: number;
  total_spent: string;
}

export interface ActionRequiredItem {
  booking_id: string;
  tracking_number: string;
  package_title: string;
  action: string;
  title: string;
  description: string;
  button_text: string;
  current_status: string;
  reward: string;
  currency: string;
}

export interface RecentBooking {
  id: string;
  tracking_number: string;
  package_title: string;
  traveler_name: string;
  status: string;
  payment_status: string;
  escrow_status: string;
  currency: string;
  agreed_reward: string;
  created_at: string;
  package_image: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  count?: number;
  data: T;
}

// Sender Dashboard API Service using centralized axios instance
export const SenderApiService = {
  /**
   * Get sender dashboard statistics (Active, Pending, Completed, Total Spent)
   */
  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    const response = await axiosInstance.get<ApiResponse<DashboardStats>>(
      "/api/sender/dashboard/stats/"
    );
    return response.data;
  },

  /**
   * Get items requiring sender's immediate action (e.g., Delivery Verification)
   */
  getActionRequired: async (): Promise<ApiResponse<ActionRequiredItem[]>> => {
    const response = await axiosInstance.get<ApiResponse<ActionRequiredItem[]>>(
      "/api/sender/action-required/"
    );
    return response.data;
  },

  /**
   * Get list of recent bookings with traveler and payment statuses
   */
  getRecentBookings: async (): Promise<ApiResponse<RecentBooking[]>> => {
    const response = await axiosInstance.get<ApiResponse<RecentBooking[]>>(
      "/api/sender/recent-bookings/"
    );
    return response.data;
  },
};