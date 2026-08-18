// src/hooks/useProfile.ts
import { useState, useEffect, useCallback } from "react";
import { getProfileApi, updateProfileApi } from "@/api/profile.api";
import { UserProfile, UpdateProfilePayload } from "@/types/profile";
import { getAccessToken } from "@/lib/token";
import { useAuth } from "@/context/AuthContext";

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth(); // React to auth state updates

  const fetchProfile = useCallback(async () => {
    const token = getAccessToken();

    // Guard check: Do not execute fetch if token is absent
    if (!token) {
      setIsLoading(false);
      setError("No authentication token found. Please log in.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await getProfileApi();
      const profileData = res?.data || res;
      setProfile(profileData);
    } catch (err: any) {
      console.error("Profile Fetch Error:", err);

      const backendMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        (typeof err.response?.data === "string" ? err.response?.data : null) ||
        err.message ||
        "Failed to load profile.";

      setError(backendMessage);
    }
    {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile, user]); // Re-fetch when user context updates

  const updateProfile = async (data: UpdateProfilePayload) => {
    try {
      const res = await updateProfileApi(data);
      const updatedData = res?.data || res;
      setProfile(updatedData);
      return res;
    } catch (err: any) {
      console.error("Profile Update Error:", err);
      const backendMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        "Failed to update profile.";
      throw new Error(backendMessage);
    }
  };

  return {
    profile,
    isLoading,
    error,
    refetchProfile: fetchProfile,
    updateProfile,
  };
};
