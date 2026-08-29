// src/lib/auth.ts
import { removeAccessToken, removeRefreshToken } from "@/lib/token";

export type UserRole = "ADMIN" | "SENDER" | "TRAVELER";

const normalizeUserRole = (role?: string | null): UserRole | null => {
  if (!role) return null;
  const normalized = role.toUpperCase();

  if (normalized === "TRAVELLER" || normalized === "TRAVELER") return "TRAVELER";
  if (normalized === "SENDER") return "SENDER";
  if (normalized === "ADMIN") return "ADMIN";

  return null;
};

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
    const role = localStorage.getItem("userRole");
    return normalizeUserRole(role);
  }
  return null;
};

export const removeUserRole = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("userRole");
  }
};

export const setUserId = (userId: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("userId", userId);
  }
};

export const getUserId = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("userId");
  }
  return null;
};

export const clearAuthStorage = () => {
  if (typeof window !== "undefined") {
    removeUserRole();
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("refresh_token");

    document.cookie = "accessToken=; Max-Age=0; path=/; SameSite=Lax";
    document.cookie = "token=; Max-Age=0; path=/; SameSite=Lax";
    document.cookie = "access_token=; Max-Age=0; path=/; SameSite=Lax";
    document.cookie = "refreshToken=; Max-Age=0; path=/; SameSite=Lax";
    document.cookie = "refresh_token=; Max-Age=0; path=/; SameSite=Lax";

    removeAccessToken();
    removeRefreshToken();
  }
};

export const logout = () => {
  if (typeof window !== "undefined") {
    clearAuthStorage();
    if (window.location.pathname !== "/login") {
      window.location.replace("/login");
    }
  }
};