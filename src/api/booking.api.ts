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

export interface RawBooking {
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
  status: string;
  payment_status: string;
  agreed_reward: string;
  currency: string;
  agreed_weight_kg: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface PendingBookingResponse {
  success: boolean;
  message: string;
  count: number;
  data: RawBooking[];
}

export interface RespondBookingPayload {
  action: "ACCEPT" | "REJECT";
}

export interface RespondBookingResponse {
  success: boolean;
  message: string;
  data?: any;
}

// ----------------------------------------------------------------------
// Booking API Endpoints
// ----------------------------------------------------------------------

export const bookingApi = {
  /**
   * Fetch pending booking requests assigned to the logged-in traveler
   * Route: path("bookings/traveler/pending/", ...)
   */
  async getTravelerPendingBookings(): Promise<PendingBookingResponse> {
    // Make sure path starts with /bookings/ traveler/pending/
    const response = await axiosInstance.get<PendingBookingResponse>(
      "/api/bookings/traveler/pending/"
    );
    return response.data;
  },

  /**
   * Accept or Reject a booking request
   * Route: path("bookings/<uuid:id>/respond/", ...)
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