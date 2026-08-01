// matching.api.ts

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

export interface MatchesApiResponse {
  success: boolean;
  message: string;
  count: number;
  next: string | null;
  previous: string | null;
  data: MatchItem[];
}

export interface MatchDetailApiResponse {
  success: boolean;
  message: string;
  data: MatchItem;
}

export interface CreateBookingPayload {
  match_id: string;
  package_id: string;
  trip_id: string;
  weight_kg: number;
  message: string;
  images?: string[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

/**
 * Fetch all match recommendations for current user packages
 */
export async function getMyMatches(): Promise<MatchesApiResponse> {
  const response = await fetch(`${API_BASE_URL}/my-matches/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      // Include authorization token if required:
      // "Authorization": `Bearer ${token}`
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch matches");
  }

  return response.json();
}

/**
 * Fetch detailed match data by ID
 */
export async function getMatchDetails(matchId: string): Promise<MatchDetailApiResponse> {
  const response = await fetch(`${API_BASE_URL}/matches/${matchId}/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch match details");
  }

  return response.json();
}

/**
 * Send booking request to traveler based on match recommendation
 */
export async function sendBookingRequest(payload: CreateBookingPayload) {
  const response = await fetch(`${API_BASE_URL}/bookings/create/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to submit booking request");
  }

  return response.json();
}