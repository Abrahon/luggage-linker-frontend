// // src/api/profile.api.ts
// import axiosInstance from "@/api/axios";
// import { 
//   ProfileApiResponse, 
//   UpdateProfilePayload, 
//   TravelerProfileApiResponse,
//   SenderProfileResponse
// } from "@/types/profile";

// export const getProfileApi = async (): Promise<ProfileApiResponse> => {
//   const response = await axiosInstance.get<ProfileApiResponse>("/api/profile/");
//   return response.data;
// };

// export const updateProfileApi = async (
//   payload: UpdateProfilePayload,
// ): Promise<ProfileApiResponse> => {
//   const formData = new FormData();

//   Object.entries(payload).forEach(([key, value]) => {
//     if (key !== "profile_picture" && value !== undefined && value !== null) {
//       formData.append(key, value as string);
//     }
//   });

//   if (payload.profile_picture instanceof File) {
//     formData.append("profile_picture", payload.profile_picture);
//   }

//   const response = await axiosInstance.patch<ProfileApiResponse>(
//     "/api/profile/",
//     formData,
//     {
//       headers: {
//         "Content-Type": "multipart/form-data",
//       },
//     },
//   );

//   return response.data;
// };

// /**
//  * Get public profile of a Sender by ID
//  * @param senderId - UUID of the sender
//  */
// export const getSenderProfileApi = async (
//   senderId: string
// ): Promise<SenderProfileResponse> => {
//   // Use "senders/${senderId}/profile/" if baseURL includes "/api" or "/api/v1"
//   const response = await axiosInstance.get<SenderProfileResponse>(
//     `senders/${senderId}/profile/`
//   );
//   return response.data;
// };
// /**
//  * Fetch public traveler profile by ID
//  */
// export const getTravelerProfileApi = async (
//   travelerId: string
// ): Promise<TravelerProfileApiResponse> => {
//   const response = await axiosInstance.get<TravelerProfileApiResponse>(
//     `/api/travelers/${travelerId}/profile/`
//   );
//   return response.data;
// };


// src/api/profile.api.ts
import axiosInstance from "@/api/axios";
import { 
  ProfileApiResponse, 
  UpdateProfilePayload, 
  TravelerProfileApiResponse,
  SenderProfileResponse
} from "@/types/profile";

/**
 * Fetch authenticated user's own profile
 */
export const getProfileApi = async (): Promise<ProfileApiResponse> => {
  const response = await axiosInstance.get<ProfileApiResponse>("/api/profile/");
  return response.data;
};

/**
 * Update authenticated user's profile
 */
export const updateProfileApi = async (
  payload: UpdateProfilePayload,
): Promise<ProfileApiResponse> => {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (key !== "profile_picture" && value !== undefined && value !== null) {
      formData.append(key, value as string);
    }
  });

  if (payload.profile_picture instanceof File) {
    formData.append("profile_picture", payload.profile_picture);
  }

  const response = await axiosInstance.patch<ProfileApiResponse>(
    "/api/profile/",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
};

/**
 * Get public profile of a Sender by ID
 * @param senderId - UUID of the sender
 */
export const getSenderProfileApi = async (
  senderId: string
): Promise<SenderProfileResponse> => {
  const response = await axiosInstance.get<SenderProfileResponse>(
    `/api/senders/${senderId}/profile/`
  );
  return response.data;
};

/**
 * Fetch public traveler profile by ID
 * @param travelerId - UUID of the traveler
 */
export const getTravelerProfileApi = async (
  travelerId: string
): Promise<TravelerProfileApiResponse> => {
  const response = await axiosInstance.get<TravelerProfileApiResponse>(
    `/api/travelers/${travelerId}/profile/`
  );
  return response.data;
};