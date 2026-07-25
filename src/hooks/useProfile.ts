// src/hooks/useProfile.ts
import { useState, useEffect, useCallback } from "react";
import { getProfileApi, updateProfileApi } from "@/api/profile.api";
import { UserProfile, UpdateProfilePayload } from "@/types/profile";

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getProfileApi();
      
      // Support both wrapped response { data: { ... } } and direct response { ... }
      const profileData = res?.data || res;
      setProfile(profileData);
    } catch (err: any) {
      // 1. Log exact error object to browser console for immediate debugging
      console.error("Profile Fetch Error:", err);
      console.error("Backend Error Response Data:", err.response?.data);

      // 2. Extract error message across standard backend formats (DRF uses 'detail')
      const backendMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        (typeof err.response?.data === "string" ? err.response?.data : null) ||
        err.message ||
        "Failed to load profile.";

      setError(backendMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

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