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
   * Route: /api/bookings/active/
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
};