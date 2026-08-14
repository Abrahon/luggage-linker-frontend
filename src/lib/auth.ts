// src/lib/auth.ts
import { removeAccessToken, removeRefreshToken } from "@/lib/token";

// Strict match with Django backend UserRole TextChoices
export type UserRole = "ADMIN" | "SENDER" | "TRAVELER";

/**
 * Normalizes input role strings from API or JWT to match backend UserRole choice enum
 */
const normalizeUserRole = (role?: string | null): UserRole | null => {
  if (!role) return null;
  const normalized = role.toUpperCase();

  if (normalized === "TRAVELLER" || normalized === "TRAVELER") return "TRAVELER";
  if (normalized === "SENDER") return "SENDER";
  if (normalized === "ADMIN") return "ADMIN";

  return null;
};

// Store User Role
export const setUserRole = (role: string) => {
  if (typeof window !== "undefined") {
    const normalizedRole = normalizeUserRole(role);
    if (normalizedRole) {
      localStorage.setItem("userRole", normalizedRole);
    }
  }
};

// Get User Role
export const getUserRole = (): UserRole | null => {
  if (typeof window !== "undefined") {
    const role = localStorage.getItem("userRole");
    return normalizeUserRole(role);
  }
  return null;
};

// Remove User Role
export const removeUserRole = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("userRole");
  }
};

// Store User ID (used by Chat & Profile views)
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

// Complete Auth Storage Cleanup
export const clearAuthStorage = () => {
  if (typeof window !== "undefined") {
    removeUserRole();
    removeAccessToken();
    removeRefreshToken();
    localStorage.removeItem("userId");
  }
};

// User Logout Procedure
export const logout = () => {
  if (typeof window !== "undefined") {
    clearAuthStorage();
    if (window.location.pathname !== "/login") {
      window.location.replace("/login");
    }
  }
};