import axiosInstance from "@/api/axios";

// Response Types matching your Backend Schema
export interface InitiatePaymentRequest {
  booking_id: string;
}

export interface InitiatePaymentData {
  payment_id: string;
  gateway: "STRIPE";
  status: string;
  checkout_url: string;
  amount: number;
  currency: string;
}

export interface InitiatePaymentResponse {
  success: boolean;
  message: string;
  data: InitiatePaymentData;
}

export const PaymentApiService = {
  /**
   * Initiates Stripe checkout session for a given booking.
   * Automatically inherits Authorization headers and baseURL from axiosInstance.
   */
  initiatePayment: async (bookingId: string): Promise<InitiatePaymentResponse> => {
    const response = await axiosInstance.post<InitiatePaymentResponse>(
      "/api/booking/initiate/",
      { booking_id: bookingId }
    );
    return response.data;
  },
};