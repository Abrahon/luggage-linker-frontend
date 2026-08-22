// ==========================================
// Existing User Profile Interfaces
// ==========================================

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  gender: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  postal_code: string;
  date_of_birth: string;
  profile_picture: string | null;
  bio: string;
  average_rating: string;
  total_reviews: number;
  completed_deliveries: number;
  cancelled_deliveries: number;
  created_at: string;
  updated_at: string;
  email?: string;
  role?: string;
}

export interface ProfileApiResponse {
  message: string;
  data: UserProfile;
}

export interface UpdateProfilePayload {
  first_name: string;
  last_name: string;
  gender?: string;
  phone?: string;
  country: string;
  city: string;
  address: string;
  postal_code: string;
  date_of_birth: string;
  bio?: string;
  profile_picture?: File | null;
}


export interface SenderProfileData {
  id: string;
  name: string;
  country: string;
  email: string;
  phone: string;
  profile_image: string | null;
  member_since: string;
  is_email_verified: boolean;
  total_packages: number;
  successful_deliveries: number;
  cancelled_deliveries: number;
  success_rate: number;
}

export interface SenderProfileResponse {
  success: boolean;
  message: string;
  data: SenderProfileData;
}

// ==========================================
// Public Traveler Profile Interfaces (Added)
// ==========================================

/** Single review left by a sender for a traveler */
export interface TravelerReview {
  id: string;
  rating: number;
  comment: string;
  reviewer: string;
  reviewer_profile_image: string;
  created_at: string;
}

/** Breakdown of total star ratings (1 through 5) */
export interface RatingDistribution {
  "1": number;
  "2": number;
  "3": number;
  "4": number;
  "5": number;
}

/** Public profile data returned for a specific traveler */
export interface PublicTravelerProfile {
  id: string;
  name: string;
  country: string;
  profile_image: string;
  about?: string;
  average_rating: number;
  total_reviews: number;
  completed_trips: number;
  total_deliveries: number;
  successful_deliveries: number;
  disputed_deliveries: number;
  traveler_fault_disputes: number;
  pending_disputes: number;
  success_rate: number;
  rating_distribution: RatingDistribution;
  recent_reviews: TravelerReview[];
}

/** API response structure for GET /api/travelers/{id}/profile/ */
export interface TravelerProfileApiResponse {
  success: boolean;
  message: string;
  data: PublicTravelerProfile;
}