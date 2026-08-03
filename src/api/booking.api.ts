import axiosInstance from "@/api/axios";

// ----------------------------------------------------------------------
// Types & Interfaces
// ----------------------------------------------------------------------

export interface RouteInfo {
  from_country: string;
  from_city: string;
  to_country: string;
  to_city: string;
}

export interface BookingData {
  id: string;
  tracking_number: string;
  package_title: string;
  trip_title: string;
  sender_name: string;
  sender_email: string;
  sender_profile_picture: string | null;
  traveler_email: string;
  route: RouteInfo;
  package_image: string | null;
  status:
    | "PENDING"
    | "TRAVELER_ACCEPTED"
    | "PAYMENT_PENDING"
    | "CONFIRMED"
    | "PICKED_UP"
    | "IN_TRANSIT"
    | "COMPLETED"
    | "CANCELLED"
    | "EXPIRED"
    | string;
  payment_status: "UNPAID" | "PAID" | "REFUNDED" | string;
  escrow_status?: "PENDING" | "HELD" | "RELEASED" | "REFUNDED" | string; 
  traveler_matches_listing?: boolean | null;
  traveler_refusal_reason?: string | null;
  agreed_reward: string;
  currency: string;
  agreed_weight_kg: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PendingBookingResponse {
  success: boolean;
  message: string;
  count: number;
  data: BookingData[];
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface RespondBookingPayload {
  action: "ACCEPT" | "REJECT";
}

export interface RespondBookingResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface CancelBookingResponse {
  message: string;
  id: string;
  status: string;
}
export interface CompletedDeliveriesResponse {
  success: boolean;
  message: string;
  count: number;
  data: BookingData[];
}

export interface CancelledDeliveriesResponse {
  success: boolean;
  message: string;
  count: number;
  data: BookingData[];
}

export interface VerifyPickupPayload {
  booking_id: string;
  traveler_matches_listing: boolean;
  pickup_pin?: string;
  traveler_refusal_reason?: string;
}

export interface VerifyPickupResponse {
  success: boolean;
  message: string;
  current_status: string;
  picked_up_at?: string;
}

export interface StartTransitPayload {
  booking_id: string;
}

export interface StartTransitResponse {
  success: boolean;
  message: string;
  current_status: string;
  in_transit_at?: string;
}

export interface VerifyDeliveryPayload {
  booking_id: string;
  delivery_pin: string;
}

export interface VerifyDeliveryResponse {
  success: boolean;
  message: string;
  current_status: string;
  delivered_at?: string;
}

export interface MyBookingItem {
  id: string;
  tracking_number: string;
  package_title: string;
  trip_title: string;
  traveler_name: string;
  traveler_email: string;
  route: RouteInfo;
  package_image: string | null;
  status:
    | "PENDING"
    | "TRAVELER_ACCEPTED"
    | "PAYMENT_PENDING"
    | "CONFIRMED"
    | "PICKED_UP"
    | "IN_TRANSIT"
    | "DELIVERED"
    | "COMPLETED"
    | "CANCELLED"
    | string;
  payment_status: "UNPAID" | "PAID" | "REFUNDED" | string;
  escrow_status: "NOT_FUNDED" | "HELD" | "RELEASED" | "REFUNDED" | string;
  currency: string;
  agreed_reward: string;
  created_date: string;
  current_step: number;
  can_pay: boolean;
  can_track: boolean;
  can_chat: boolean;
  can_verify_delivery: boolean;
  can_cancel: boolean;
  can_review: boolean;
  can_view_receipt: boolean;
  show_progress: boolean;
  show_payment_required: boolean;
  show_delivery_verification: boolean;
}

export interface TimelineStep {
  title: string;
  status: string;
  completed: boolean;
  timestamp: string | null;
}

export interface TimelineResponse {
  success: boolean;
  message: string;
  data: TimelineStep[];
}

export interface RawBooking {
  id: string;
  tracking_number: string;
  package_title?: string;
  package_image?: string;
  status: string;
  created_at?: string;
  sender_name?: string;
  sender_email?: string;
  agreed_weight_kg?: string;
  agreed_reward?: string;
  route?: {
    from_city?: string;
    from_country?: string;
    to_city?: string;
    to_country?: string;
  };
  // add any other fields returned by your API
}
// ----------------------------------------------------------------------
// Booking & Delivery API Endpoints
// ----------------------------------------------------------------------

export const bookingApi = {
  /**
   * Fetch pending booking requests assigned to the logged-in traveler
   * Route: /api/bookings/traveler/pending/
   */
  async getTravelerPendingBookings(): Promise<PendingBookingResponse> {
    const response = await axiosInstance.get<PendingBookingResponse>(
      "/api/bookings/traveler/pending/"
    );
    return response.data;
  },

  /**
   * Accept or Reject a booking request
   * Route: /api/bookings/<uuid:id>/respond/
   */
  async respondToBooking(
    bookingId: string,
    action: "ACCEPT" | "REJECT"
  ): Promise<RespondBookingResponse> {
    const payload: RespondBookingPayload = { action };
    const response = await axiosInstance.post<RespondBookingResponse>(
      `/api/bookings/${bookingId}/respond/`,
      payload
    );
    return response.data;
  },
};

export const deliveryApi = {
  /**
   * Fetch list of active bookings (PAYMENT_PENDING, CONFIRMED, PICKED_UP, IN_TRANSIT)

   */
  async getActiveDeliveries(): Promise<PaginatedResponse<BookingData>> {
    const response = await axiosInstance.get<PaginatedResponse<BookingData>>(
      "/api/bookings/active/"
    );
    return response.data;
  },

  /**
   * Fetch single booking detail by ID
   * Route: /api/bookings/<uuid:id>/
   */
  async getDeliveryById(bookingId: string): Promise<BookingData> {
    const response = await axiosInstance.get<BookingData>(
      `/api/bookings/${bookingId}/`
    );
    return response.data;
  },

  /**
   * Cancel an active booking request
   * Accessible before payment or after payment (before pickup)
   * Route: /api/bookings/<uuid:id>/cancel/
   */
  async cancelDelivery(bookingId: string): Promise<CancelBookingResponse> {
    const response = await axiosInstance.post<CancelBookingResponse>(
      `/api/bookings/${bookingId}/cancel/`
    );
    return response.data;
  },


   async getCompletedDeliveries(): Promise<CompletedDeliveriesResponse> {
    const response = await axiosInstance.get<CompletedDeliveriesResponse>(
      "/api/traveler/completed-deliveries/"
    );
    return response.data;
  },

  async getCancelledDeliveries(): Promise<CancelledDeliveriesResponse> {
    const response = await axiosInstance.get<CancelledDeliveriesResponse>(
      "/api/bookings/cancelled/"
    );
    return response.data;
  },

  // ----------------------------------------------------------------------
// Delivery API Endpoints
// ----------------------------------------------------------------------

  /**
   * Verify package pickup (match or refusal)
   * Route: POST /api/booking/verify-pickup/
   */
  async verifyPickup(payload: VerifyPickupPayload): Promise<VerifyPickupResponse> {
    const response = await axiosInstance.post<VerifyPickupResponse>(
      "/api/booking/verify-pickup/",
      payload
    );
    return response.data;
  },

  /**
   * Start transit state
   * Route: POST /api/booking/start-transit/
   */
  async startTransit(payload: StartTransitPayload): Promise<StartTransitResponse> {
    const response = await axiosInstance.post<StartTransitResponse>(
      "/api/booking/start-transit/",
      payload
    );
    return response.data;
  },

  /**
   * Verify delivery PIN at destination
   * Route: POST /api/booking/verify-delivery/
   */
  async verifyDelivery(payload: VerifyDeliveryPayload): Promise<VerifyDeliveryResponse> {
    const response = await axiosInstance.post<VerifyDeliveryResponse>(
      "/api/booking/verify-delivery/",
      payload
    );
    return response.data;
  },

};

export async function getMyBookings(page: number = 1): Promise<PaginatedResponse<MyBookingItem>> {
  const response = await axiosInstance.get<PaginatedResponse<MyBookingItem>>(
    `/api/sender/my-bookings/?page=${page}`
  );
  return response.data;
}

/**
 * Get tracking timeline for a specific booking
 */
export async function getBookingTimeline(bookingId: string): Promise<TimelineResponse> {
  const response = await axiosInstance.get<TimelineResponse>(
    `/api/sender/bookings/${bookingId}/timeline/`
  );
  return response.data;
}

/**
 * Cancel a booking
 */
// ----------------------------------------------------------------------
// Cancel Booking Types
// ----------------------------------------------------------------------

export interface CancelBookingData {
  booking_id: string;
  tracking_number: string;
  status: "CANCELLED" | string;
}

export interface CancelBookingResponse {
  success: boolean;
  message: string;
  data: CancelBookingData;
}


/**
 * Cancel a booking via POST
 * Endpoint: /api/bookings/<uuid:pk>/cancel/
 */
export async function cancelBooking(bookingId: string): Promise<CancelBookingResponse> {
  const response = await axiosInstance.post<CancelBookingResponse>(
    `/api/bookings/${bookingId}/cancel/`
  );
  return response.data;
}
// ----------------------------------------------------------------------
// Stats Interfaces
// ----------------------------------------------------------------------

export interface EscrowHeldInfo {
  amount: string;
  currency: string;
}

export interface SenderDashboardStats {
  pending_requests: number;
  active_bookings: number;
  completed_bookings: number;
  total_escrow_held: EscrowHeldInfo;
}

export interface SenderDashboardStatsResponse {
  success: boolean;
  message: string;
  data: SenderDashboardStats;
}

// ----------------------------------------------------------------------
// Stats API Endpoint
// ----------------------------------------------------------------------

/**
 * Fetch Sender Dashboard Statistics
 */
export async function getSenderDashboardStats(): Promise<SenderDashboardStatsResponse> {
  const response = await axiosInstance.get<SenderDashboardStatsResponse>(
    "/api/sender/booking-stats/"
  );
  return response.data;
}


