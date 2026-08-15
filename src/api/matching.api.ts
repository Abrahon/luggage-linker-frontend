// // src/api/matching.api.ts
// import axiosInstance from "@/api/axios";

// export interface MatchItem {
//   id: string;
//   package: string;
//   package_title: string;
//   package_image: string | null;
//   sender: string;
//   package_pickup_city: string;
//   package_pickup_country: string;
//   package_destination_city: string;
//   package_destination_country: string;
//   trip: string;
//   trip_title: string;
//   traveler: string;
//   traveler_name: string;
//   traveler_avatar: string | null;
//   traveler_rating: string;
//   total_reviews: number;
//   departure_date: string;
//   arrival_date: string;
//   remaining_weight: string;
//   reward_per_kg: string;
//   currency: string;
//   trip_status: string;
//   traveler_from_city: string;
//   traveler_from_country: string;
//   traveler_to_city: string;
//   traveler_to_country: string;
//   score: string;
//   status: "AVAILABLE" | "REQUESTED" | "ACCEPTED" | "REJECTED" | "EXPIRED";
//   is_active: boolean;
//   created_at: string;
//   updated_at: string;
// }

// export interface MatchesApiResponse {
//   success: boolean;
//   message: string;
//   count: number;
//   next: string | null;
//   previous: string | null;
//   data: MatchItem[];
// }

// export interface MatchDetailApiResponse {
//   success: boolean;
//   message: string;
//   data: MatchItem;
// }

// export interface CreateBookingPayload {
//   match_id: string;
//   package_id: string;
//   trip_id: string;
//   weight_kg: number;
//   message: string;
//   images?: string[];
// }

// /**
//  * Fetch all match recommendations for current user packages
//  */
// export async function getMyMatches(): Promise<MatchesApiResponse> {
//   // Added /api/ prefix
//   const response = await axiosInstance.get<MatchesApiResponse>("/api/my-matches/");
//   return response.data;
// }

// /**
//  * Fetch detailed match data by ID
//  */
// export async function getMatchDetails(matchId: string): Promise<MatchDetailApiResponse> {
//   // Added /api/ prefix
//   const response = await axiosInstance.get<MatchDetailApiResponse>(`/api/matches/${matchId}/`);
//   return response.data;
// }

// /**
//  * Send booking request to traveler based on match recommendation
//  */
// export async function sendBookingRequest(payload: CreateBookingPayload) {
//   // Added /api/ prefix
//   const response = await axiosInstance.post("/api/bookings/create/", payload);
//   return response.data;
// }

import axiosInstance from "@/api/axios";

export interface MatchItem {
  id: string;
  package: string;
  package_title: string;
  package_image: string | null;
  sender: string;
  package_pickup_city: string;
  package_pickup_country: string;
  package_destination_city: string;
  package_destination_country: string;
  trip: string;
  trip_title: string;
  traveler: string;
  traveler_name: string;
  traveler_avatar: string | null;
  traveler_rating: string;
  total_reviews: number;
  departure_date: string;
  arrival_date: string;
  remaining_weight: string;
  reward_per_kg: string;
  currency: string;
  trip_status: string;
  traveler_from_city: string;
  traveler_from_country: string;
  traveler_to_city: string;
  traveler_to_country: string;
  score: string;
  status: "AVAILABLE" | "REQUESTED" | "ACCEPTED" | "REJECTED" | "EXPIRED";
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Support both standard DRF pagination and wrapped responses
export interface MatchesApiResponse {
  success?: boolean;
  message?: string;
  count: number;
  next: string | null;
  previous: string | null;
  results?: MatchItem[];
  data?: MatchItem[];
}

export interface MatchDetailApiResponse {
  success?: boolean;
  message?: string;
  data?: MatchItem;
  [key: string]: any;
}

export interface CreateBookingPayload {
  match_id: string;
  package_id: string;
  trip_id: string;
  weight_kg: number;
  message: string;
  images?: string[];
}

/**
 * Fetch all match recommendations for current user packages
 */
export async function getMyMatches(): Promise<MatchItem[]> {
  const response = await axiosInstance.get<MatchesApiResponse>("/api/my-matches/");
  
  // Handles both standard DRF `results` array and wrapped `data` payload
  if (Array.isArray(response.data.results)) {
    return response.data.results;
  }
  if (Array.isArray(response.data.data)) {
    return response.data.data;
  }
  return [];
}

/**
 * Fetch detailed match data by ID
 */
export async function getMatchDetails(matchId: string): Promise<MatchItem> {
  const response = await axiosInstance.get<MatchDetailApiResponse>(`/api/matches/${matchId}/`);
  return response.data.data || (response.data as unknown as MatchItem);
}

/**
 * Send booking request to traveler based on match recommendation
 */
export async function sendBookingRequest(payload: CreateBookingPayload) {
  const response = await axiosInstance.post("/api/bookings/create/", payload);
  return response.data;
}