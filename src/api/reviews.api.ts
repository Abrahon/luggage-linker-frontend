// ✅ CORRECT: Use your configured axiosInstance
import axiosInstance from "@/api/axios";

export interface ReviewData {
  id?: string;
  booking: string;
  traveler: string;
  rating: number;
  comment: string;
  created_at?: string;
}

export interface ReviewPayload {
  booking?: string;
  traveler?: string;
  rating: number;
  comment: string;
}

// 1. Fetch existing review for a booking
export const getBookingReview = async (bookingId: string) => {
  const response = await axiosInstance.get(`/api/reviews/?booking=${bookingId}`);
  return response.data;
};

// 2. Submit a new review (POST) -> /api/reviews/
export const createBookingReview = async (payload: ReviewPayload) => {
  const response = await axiosInstance.post(`/api/reviews/`, payload);
  return response.data;
};

// 3. Update an existing review (PATCH) -> /api/reviews/<uuid:pk>/
export const updateReview = async (
  reviewId: string,
  payload: Partial<ReviewPayload>
) => {
  const response = await axiosInstance.patch(`/api/reviews/${reviewId}/`, {
    rating: payload.rating,
    comment: payload.comment,
  });
  return response.data;
};