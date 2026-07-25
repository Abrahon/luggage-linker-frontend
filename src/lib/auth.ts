

import { removeAccessToken, removeRefreshToken } from "@/lib/token";

export type UserRole = "admin" | "carrier" | "sender" | "traveler";

const normalizeUserRole = (role?: string | null): UserRole | null => {
  if (!role) return null;
  const normalized = role.toLowerCase();
  if (normalized === "traveller") return "traveler";
  if (normalized === "traveler") return "traveler";
  if (normalized === "sender") return "sender";
  if (normalized === "carrier") return "carrier";
  if (normalized === "admin") return "admin";
  return null;
};

// utils/auth.ts
export const setUserRole = (role: string) => {
  if (typeof window !== "undefined") {
    const normalizedRole = normalizeUserRole(role);
    if (normalizedRole) {
      localStorage.setItem("userRole", normalizedRole);
    }
  }
};

export const getUserRole = (): UserRole | null => {
  if (typeof window !== "undefined") {
    return (localStorage.getItem("userRole") as UserRole) || null;
  }
  return null;
};

export const removeUserRole = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("userRole");
  }
};

export const clearAuthStorage = () => {
  if (typeof window !== "undefined") {
    removeUserRole();
    removeAccessToken();
    removeRefreshToken();
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }
};

export const logout = () => {
  if (typeof window !== "undefined") {
    clearAuthStorage();
    window.location.replace("/login");
  }
};