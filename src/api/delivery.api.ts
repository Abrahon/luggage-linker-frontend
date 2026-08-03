import axiosInstance from "@/api/axios";


// ----------------------------------------------------------------------
// Delivery History Types
// ----------------------------------------------------------------------

export type DeliveryStatus = "COMPLETED" | "CANCELLED" | "REFUNDED" | "REJECTED" | "PENDING" | string;
export type PaymentStatus = "PAID" | "UNPAID" | string;
export type EscrowStatus = "RELEASED" | "REFUNDED" | "NOT_FUNDED" | string;

export interface DeliveryHistoryItem {
  id: string;
  tracking_number: string;
  package_title: string;
  traveler_name: string;
  status: DeliveryStatus;
  payment_status: PaymentStatus;
  escrow_status: EscrowStatus;
  currency: string;
  agreed_reward: string;
  completed_date: string;
  package_image: string;
}

export interface DeliveryHistoryResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: DeliveryHistoryItem[];
}

export interface DeliveryStatsData {
  completed: number;
  cancelled: number;
  refunded: string;
  total_paid: string;
}

export interface DeliveryStatsResponse {
  success: boolean;
  message: string;
  data: DeliveryStatsData;
}

// Exact API Structure matching backend response
export interface TimelineStepItem {
  title: string;
  status: string;
  completed: boolean;
  timestamp: string | null;
}

export interface DeliveryTimelineResponse {
  success: boolean;
  message: string;
  data: TimelineStepItem[];
}

// ----------------------------------------------------------------------
// API Requests
// ----------------------------------------------------------------------

export async function getDeliveryHistory(
  page: number = 1,
  status?: string,
  search?: string
): Promise<DeliveryHistoryResponse> {
  const params: Record<string, any> = { page };
  if (status && status !== "ALL") params.status = status;
  if (search && search.trim() !== "") params.search = search;

  const response = await axiosInstance.get<DeliveryHistoryResponse>(
    "/api/sender/delivery-history/",
    { params }
  );
  return response.data;
}

export async function getDeliveryHistoryStats(): Promise<DeliveryStatsResponse> {
  const response = await axiosInstance.get<DeliveryStatsResponse>(
    "/api/sender/delivery-history/stats/"
  );
  return response.data;
}

export async function getDeliveryTimeline(bookingId: string): Promise<DeliveryTimelineResponse> {
  const response = await axiosInstance.get<DeliveryTimelineResponse>(
    `/api/sender/bookings/${bookingId}/timeline/`
  );
  return response.data;
}