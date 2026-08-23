import axiosInstance from "@/api/axios";
import type { ModernInvoiceData } from "@/lib/downloadInvoice";

// ----------------------------------------------------------------------
// Delivery History Types
// ----------------------------------------------------------------------

export type DeliveryStatus =
  | "COMPLETED"
  | "CANCELLED"
  | "REFUNDED"
  | "REJECTED"
  | "PENDING"
  | string;

export type PaymentStatus =
  | "PAID"
  | "UNPAID"
  | "PARTIAL_REFUND"
  | "REFUNDED"
  | string;

export type EscrowStatus = "RELEASED" | "REFUNDED" | "NOT_FUNDED" | string;

export interface DeliveryHistoryItem {
  id: string;
  tracking_number: string;
  package_title: string;
  package_image: string | null;
  traveler: string; // Traveler User UUID
  traveler_name: string;
  status: DeliveryStatus;
  status_display: string;
  payment_status: PaymentStatus;
  payment_status_display: string;
  escrow_status: EscrowStatus;
  currency: string;
  agreed_reward: string;
  completed_date: string;
  has_dispute: boolean;
  dispute_id: string | null;
  dispute_status: string | null;
  dispute_status_display: string | null;
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

// ----------------------------------------------------------------------
// Delivery Timeline & Invoice Types
// ----------------------------------------------------------------------

export interface TimelineStepItem {
  title: string;
  status: string;
  completed: boolean;
  timestamp: string | null;
}

export interface DeliveryInvoice {
  id: string;
  invoice_number: string;
  total_paid: string;
  currency: string;
  status: string;
  invoice_date: string;
}

export interface DeliveryTimelineAndInvoiceData {
  timeline: TimelineStepItem[];
  invoice: DeliveryInvoice | null;
}

export interface DeliveryTimelineResponse {
  success: boolean;
  message?: string;
  data: DeliveryTimelineAndInvoiceData;
}

// ----------------------------------------------------------------------
// Booking Details & Invoice Generator Data Types
// ----------------------------------------------------------------------

export interface RouteDetail {
  from_country: string;
  from_city: string;
  to_country: string;
  to_city: string;
}

export interface BookingDetail {
  id: string;
  tracking_number: string;
  package_title: string;
  package_image: string | null;
  trip_title: string;
  sender_name: string;
  sender_email: string;
  sender_profile_picture: string | null;
  traveler_email: string;
  route: RouteDetail;
  status: string;
  payment_status: string;
  escrow_status: string;
  agreed_reward: string;
  currency: string;
  pending_price_offer: string | null;
  agreed_weight_kg: string;
  traveler_matches_listing: boolean | null;
  traveler_refusal_reason: string | null;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface BookingDetailResponse {
  success: boolean;
  message: string;
  data: BookingDetail;
}

// ----------------------------------------------------------------------
// API Requests
// ----------------------------------------------------------------------

/**
 * Fetch paginated delivery history list with optional status filter and search query.
 */
export async function getDeliveryHistory(
  page: number = 1,
  status?: string,
  search?: string
): Promise<DeliveryHistoryResponse> {
  const params: Record<string, string | number> = { page };
  if (status && status !== "ALL") params.status = status;
  if (search && search.trim() !== "") params.search = search;

  const response = await axiosInstance.get<DeliveryHistoryResponse>(
    "/api/sender/delivery-history/",
    { params }
  );
  return response.data;
}

/**
 * Fetch summary statistics for sender delivery history.
 */
export async function getDeliveryHistoryStats(): Promise<DeliveryStatsResponse> {
  const response = await axiosInstance.get<DeliveryStatsResponse>(
    "/api/sender/delivery-history/stats/"
  );
  return response.data;
}

/**
 * Fetch step-by-step progress timeline and associated invoice for a specific booking.
 */
export async function getDeliveryTimeline(
  bookingId: string
): Promise<DeliveryTimelineResponse> {
  const response = await axiosInstance.get<DeliveryTimelineResponse>(
    `/api/sender/bookings/${bookingId}/timeline/`
  );
  return response.data;
}

/**
 * Fetch full booking details for invoice generation.
 */
export async function getBookingDetails(
  bookingId: string
): Promise<BookingDetailResponse> {
  const response = await axiosInstance.get<BookingDetailResponse>(
    `/api/bookings/${bookingId}/`
  );
  return response.data;
}

// ----------------------------------------------------------------------
// Invoice Data Mapper
// ----------------------------------------------------------------------

/**
 * Maps raw BookingDetail response to jsPDF function input format.
 */
export function mapBookingToInvoicePdfData(
  booking: BookingDetail
): ModernInvoiceData {
  const reward = parseFloat(booking.agreed_reward || "0");

  return {
    id: booking.id,
    tracking_number: booking.tracking_number,
    package_title: booking.package_title,
    package_image: booking.package_image || undefined,
    trip_title: booking.trip_title,
    sender_name: booking.sender_name,
    sender_email: booking.sender_email,
    sender_profile_picture: booking.sender_profile_picture || undefined,
    traveler_email: booking.traveler_email,
    route: booking.route,
    status: booking.status,
    payment_status: booking.payment_status,
    escrow_status: booking.escrow_status,
    agreed_reward: reward,
    currency: booking.currency || "USD",
    agreed_weight_kg: booking.agreed_weight_kg,
    created_at: booking.created_at,
    updated_at: booking.updated_at,
  };
}