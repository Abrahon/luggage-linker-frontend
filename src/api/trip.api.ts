// import axiosInstance from "./axios";

// // ==========================================
// // Types
// // ==========================================

// export interface BackendTrip {
//   id: string;
//   traveler_email?: string;
//   traveler?: string;
//   title: string;
//   description: string;
//   from_country: string;
//   from_city: string;
//   to_country: string;
//   to_city: string;
//   departure_date: string; // YYYY-MM-DD
//   arrival_date: string;   // YYYY-MM-DD
//   max_weight_kg: string | number;
//   available_weight_kg: string | number;
//   reward_per_kg: string | number;
//   currency: string;
//   status: string; // e.g., "PLANNED", "ACTIVE", "CANCELLED", "COMPLETED", "IN_TRANSIT"
//   is_active: boolean;
//   is_public: boolean;
//   created_at?: string;
//   updated_at?: string;
// }

// export interface CreateTripPayload {
//   title: string;
//   description: string;
//   from_country: string;
//   from_city: string;
//   to_country: string;
//   to_city: string;
//   departure_date: string;
//   arrival_date: string;
//   max_weight_kg: number | string;
//   available_weight_kg?: number | string;
//   reward_per_kg: number | string;
//   currency: string;
//   status?: string;
//   is_active?: boolean;
//   is_public?: boolean;
// }

// export type UpdateTripPayload = Partial<CreateTripPayload>;

// export interface TripsListApiResponse {
//   message?: string;
//   success?: boolean;
//   count?: number;
//   results?: BackendTrip[];
//   data?: BackendTrip[];
// }

// export interface TripDetailApiResponse {
//   message?: string;
//   success?: boolean;
//   data: BackendTrip;
// }

// export interface CancelTripApiResponse {
//   message: string;
//   data: {
//     trip_id: string;
//     status: string;
//   };
// }

// export interface FetchPublicTripsParams {
//   from_city?: string;
//   to_city?: string;
//   departure_date?: string;
// }

// // ==========================================
// // Public Trip APIs (New)
// // ==========================================

// /**
//  * Fetch all public trips (supports optional search query parameters)
//  * GET /api/trips/
//  */
// export const getPublicTripsApi = async (
//   params?: FetchPublicTripsParams
// ): Promise<BackendTrip[]> => {
//   const response = await axiosInstance.get<TripsListApiResponse>(`/api/trips/`, {
//     params,
//   });

//   const rawData = response.data;

//   if (rawData && Array.isArray(rawData.data)) {
//     return rawData.data;
//   }

//   if (rawData && Array.isArray(rawData.results)) {
//     return rawData.results;
//   }

//   return [];
// };

// /**
//  * Fetch detailed view of a single trip by ID
//  * GET /api/trip/{id}/
//  */
// export const getTripDetailApi = async (
//   tripId: string
// ): Promise<TripDetailApiResponse> => {
//   const response = await axiosInstance.get<TripDetailApiResponse>(
//     `/api/trip/${tripId}/`
//   );
//   return response.data;
// };

// // ==========================================
// // User Trip APIs (Core Endpoints)
// // ==========================================

// /**
//  * Fetch User's Trips: GET /api/my-trips/
//  * Safely handles both `.data` and `.results` array responses.
//  */
// export const getMyTrips = async (): Promise<BackendTrip[]> => {
//   const response = await axiosInstance.get<TripsListApiResponse>(
//     `/api/my-trips/?_t=${Date.now()}`
//   );

//   const rawData = response.data;

//   if (rawData && Array.isArray(rawData.data)) {
//     return rawData.data;
//   }

//   if (rawData && Array.isArray(rawData.results)) {
//     return rawData.results;
//   }

//   return [];
// };

// export const createTrip = async (payload: CreateTripPayload) => {
//   const maxWeight = Number(payload.max_weight_kg) || 0;

//   // On creation, available_weight_kg MUST equal max_weight_kg
//   const formattedPayload = {
//     ...payload,
//     max_weight_kg: maxWeight,
//     available_weight_kg: maxWeight, // Enforce equality on creation
//     reward_per_kg: Number(payload.reward_per_kg) || 0,
//     status: "PLANNED", // Django expects "PLANNED" for new trips
//     is_active: payload.is_active ?? true,
//     is_public: payload.is_public ?? true,
//   };

//   const response = await axiosInstance.post(`/api/trips/`, formattedPayload);
//   return response.data;
// };

// export const updateTripApi = async (
//   tripId: string,
//   payload: UpdateTripPayload
// ): Promise<TripDetailApiResponse> => {
//   const response = await axiosInstance.patch<TripDetailApiResponse>(
//     `/api/trip/${tripId}/manage/`,
//     payload
//   );
//   return response.data;
// };

// export const deleteTripApi = async (tripId: string): Promise<void> => {
//   const response = await axiosInstance.delete(
//     `/api/trip/${tripId}/manage/`
//   );
//   return response.data;
// };

// // ==========================================
// // Admin Trip APIs
// // ==========================================

// export const getAdminTripsApi = async (params?: {
//   status?: string;
//   search?: string;
// }) => {
//   const response = await axiosInstance.get("/api/admin/trips/", { params });
//   return response.data;
// };

// export const getAdminTripDetailApi = async (
//   tripId: string
// ): Promise<TripDetailApiResponse> => {
//   const response = await axiosInstance.get(`/api/admin/trips/${tripId}/`);
//   return response.data;
// };

// export const cancelAdminTripApi = async (
//   tripId: string,
//   data: { reason: string }
// ): Promise<CancelTripApiResponse> => {
//   const response = await axiosInstance.patch<CancelTripApiResponse>(
//     `/api/admin/trips/${tripId}/cancel/`,
//     data
//   );
//   return response.data;
// };

import axiosInstance from "./axios";

// ==========================================
// Types
// ==========================================

export interface BackendTrip {
  id: string;
  traveler?: string | number;
  title: string;
  description?: string;
  from_country: string;
  from_city: string;
  to_country: string;
  to_city: string;
  departure_date: string; // YYYY-MM-DD
  arrival_date: string;   // YYYY-MM-DD
  max_weight_kg: string | number;
  available_weight_kg: string | number;
  reward_per_kg: string | number;
  currency: string;
  status: string; // "PLANNED", "ACTIVE", "CANCELLED", "COMPLETED", "IN_TRANSIT"
  is_active: boolean;
  is_public: boolean;
  created_at?: string;
  updated_at?: string;
}

// Payload matches writable fields in DRF TripSerializer
export interface CreateTripPayload {
  title: string;
  description?: string;
  from_country: string;
  from_city: string;
  to_country: string;
  to_city: string;
  departure_date: string; // YYYY-MM-DD
  arrival_date: string;   // YYYY-MM-DD
  max_weight_kg: number;
  reward_per_kg: number;
  currency: string;
  is_public?: boolean;
}

export type UpdateTripPayload = Partial<CreateTripPayload>;

export interface TripsListApiResponse {
  message?: string;
  success?: boolean;
  count?: number;
  results?: BackendTrip[];
  data?: BackendTrip[];
}

export interface TripDetailApiResponse {
  message?: string;
  success?: boolean;
  data: BackendTrip;
}

export interface CancelTripApiResponse {
  message: string;
  data: {
    trip_id: string;
    status: string;
  };
}

export interface FetchPublicTripsParams {
  from_city?: string;
  to_city?: string;
  departure_date?: string;
}

// ==========================================
// Public Trip APIs
// ==========================================

/**
 * Fetch all public trips (supports optional search query parameters)
 * GET /api/trips/
 */
export const getPublicTripsApi = async (
  params?: FetchPublicTripsParams
): Promise<BackendTrip[]> => {
  const response = await axiosInstance.get<TripsListApiResponse>(`/api/trips/`, {
    params,
  });

  const rawData = response.data;

  if (rawData && Array.isArray(rawData.data)) {
    return rawData.data;
  }

  if (rawData && Array.isArray(rawData.results)) {
    return rawData.results;
  }

  return [];
};

/**
 * Fetch detailed view of a single trip by ID
 * GET /api/trip/{id}/
 */
export const getTripDetailApi = async (
  tripId: string
): Promise<TripDetailApiResponse> => {
  const response = await axiosInstance.get<TripDetailApiResponse>(
    `/api/trip/${tripId}/`
  );
  return response.data;
};

// ==========================================
// User Trip APIs (Core Endpoints)
// ==========================================

/**
 * Fetch User's Trips: GET /api/my-trips/
 */
export const getMyTrips = async (): Promise<BackendTrip[]> => {
  const response = await axiosInstance.get<TripsListApiResponse>(
    `/api/my-trips/?_t=${Date.now()}`
  );

  const rawData = response.data;

  if (rawData && Array.isArray(rawData.data)) {
    return rawData.data;
  }

  if (rawData && Array.isArray(rawData.results)) {
    return rawData.results;
  }

  return [];
};

/**
 * Create Trip: POST /api/trips/
 * Sends only writable serializer fields.
 */
export const createTrip = async (payload: CreateTripPayload) => {
  const formattedPayload = {
    ...payload,
    max_weight_kg: Number(payload.max_weight_kg) || 0,
    reward_per_kg: Number(payload.reward_per_kg) || 0,
    is_public: payload.is_public ?? true,
    description: payload.description?.trim() || "",
  };

  const response = await axiosInstance.post(`/api/trips/`, formattedPayload);
  return response.data;
};

/**
 * Update Trip: PATCH /api/trip/{id}/manage/
 */
export const updateTripApi = async (
  tripId: string,
  payload: UpdateTripPayload
): Promise<TripDetailApiResponse> => {
  const response = await axiosInstance.patch<TripDetailApiResponse>(
    `/api/trip/${tripId}/manage/`,
    payload
  );
  return response.data;
};

/**
 * Delete Trip: DELETE /api/trip/{id}/manage/
 */
export const deleteTripApi = async (tripId: string): Promise<void> => {
  const response = await axiosInstance.delete(
    `/api/trip/${tripId}/manage/`
  );
  return response.data;
};

// ==========================================
// Admin Trip APIs
// ==========================================

export const getAdminTripsApi = async (params?: {
  status?: string;
  search?: string;
}) => {
  const response = await axiosInstance.get("/api/admin/trips/", { params });
  return response.data;
};

export const getAdminTripDetailApi = async (
  tripId: string
): Promise<TripDetailApiResponse> => {
  const response = await axiosInstance.get(`/api/admin/trips/${tripId}/`);
  return response.data;
};

export const cancelAdminTripApi = async (
  tripId: string,
  data: { reason: string }
): Promise<CancelTripApiResponse> => {
  const response = await axiosInstance.patch<CancelTripApiResponse>(
    `/api/admin/trips/${tripId}/cancel/`,
    data
  );
  return response.data;
};