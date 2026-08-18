// src/api/profile.api.ts
import axiosInstance from "@/api/axios";
import { ProfileApiResponse, UpdateProfilePayload } from "@/types/profile";

export const getProfileApi = async (): Promise<ProfileApiResponse> => {
  const response = await axiosInstance.get<ProfileApiResponse>("/api/profile/");
  return response.data;
};

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
