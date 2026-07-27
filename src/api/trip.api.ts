

import axiosInstance from "./axios";


export interface BackendTrip {
  id: string;
  traveler_email: string;
  title: string;
  description: string;
  from_country: string;
  from_city: string;
  to_country: string;
  to_city: string;
  departure_date: string;
  arrival_date: string;
  max_weight_kg: string;
  available_weight_kg: string;
  reward_per_kg: string;
  currency: string;
  status: string; // e.g., "PLANNED", "CANCELLED", "COMPLETED", "IN_TRANSIT"
  is_active: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface TripsListApiResponse {
  message?: string;
  count?: number;
  results?: BackendTrip[];
  data?: BackendTrip[];
}

export interface TripDetailApiResponse {
  message: string;
  data: BackendTrip;
}

export interface CancelTripApiResponse {
  message: string;
  data: {
    trip_id: string;
    status: string;
  };
}




// Cancel trip API call
// Fetch trips with optional search and status query parameters
export const getAdminTripsApi = async (params?: {
  status?: string;
  search?: string;
}) => {
  const response = await axiosInstance.get("/api/admin/trips/", { params });
  return response.data;
};

// Fetch single trip details
export const getAdminTripDetailApi = async (
  tripId: string
): Promise<TripDetailApiResponse> => {
  const response = await axiosInstance.get(`/api/admin/trips/${tripId}/`);
  return response.data;
};



// Cancel trip with reason payload using PATCH method
export const cancelAdminTripApi = async (
  tripId: string,
  data: { reason: string }
): Promise<CancelTripApiResponse> => {
  // If interceptors return data directly:
  const response = await axiosInstance.patch<any, CancelTripApiResponse>(
    `/api/admin/trips/${tripId}/cancel/`,
    data
  );
  return response; // Not response.data if interceptor already unpacked it
};