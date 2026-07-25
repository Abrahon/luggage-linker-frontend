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
}

export interface ProfileApiResponse {
  message: string;
  data: UserProfile;
}

export interface UpdateProfilePayload {
  first_name: string;
  last_name: string;
  phone?: string;
  country: string;
  city: string;
  address: string;
  postal_code: string;
  date_of_birth: string;
  bio?: string;
  profile_picture?: File | null;
}