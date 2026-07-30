import axiosInstance from "./axios";

export type NotificationTypeEnum =
  | "MATCH"
  | "REQUEST"
  | "BOOKING"
  | "DELIVERY"
  | "PAYMENT"
  | "WALLET"
  | "REVIEW"
  | "CHAT"
  | "SYSTEM";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  notification_type: NotificationTypeEnum;
  object_id: string;
  action_url: string | null;
  sender: string | null;
  sender_profile_picture: string | null;
  room_id: string | null;
  message_id: string | null;
  is_read: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationsResponse {
  success: boolean;
  message: string;
  count: number;
  data: NotificationItem[];
}

export interface ReadAllResponse {
  success: boolean;
  message: string;
  updated_count: number;
}

/**
 * Fetch all notifications for the current user (Role aware path handler)
 */
export const getNotifications = async (role?: string): Promise<NotificationsResponse> => {
  const endpoint = role === "admin" ? "/api/admin/notifications/" : "/api/notifications/";
  const response = await axiosInstance.get<NotificationsResponse>(endpoint);
  return response.data;
};

/**
 * Mark all unread notifications as read
 */
export const markAllNotificationsRead = async (role?: string): Promise<ReadAllResponse> => {
  const endpoint = role === "admin" ? "/api/admin/notifications/read-all/" : "/api/notifications/read-all/";
  const response = await axiosInstance.patch<ReadAllResponse>(endpoint, {});
  return response.data;
};