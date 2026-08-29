
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { getAccessToken, setAccessToken } from "@/lib/token";

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: "SENDER" | "TRAVELER" | "ADMIN";
  profile_picture?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "accessToken";
const USER_KEY = "user";
const LEGACY_AUTH_KEYS = ["token", "access_token"];

const clearLegacyAuthKeys = () => {
  if (typeof window === "undefined") return;

  LEGACY_AUTH_KEYS.forEach((key) => {
    localStorage.removeItem(key);
    document.cookie = `${key}=; Max-Age=0; path=/; SameSite=Lax`;
  });
};

export const AuthProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = () => {
      try {
        const freshToken = getAccessToken();
        const storedUser = localStorage.getItem(USER_KEY);

        if (!freshToken || !storedUser) {
          setUser(null);
          setToken(null);
          clearLegacyAuthKeys();
          return;
        }

        const parsedUser: User = JSON.parse(storedUser);

        setToken(freshToken);
        setUser(parsedUser);
      } catch (error) {
        console.error("Failed to restore authentication:", error);

        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        clearLegacyAuthKeys();

        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = (newToken: string, userData: User) => {
    clearLegacyAuthKeys();
    localStorage.removeItem(TOKEN_KEY);
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setAccessToken(newToken);

    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    clearLegacyAuthKeys();
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    document.cookie = "accessToken=; Max-Age=0; path=/; SameSite=Lax";

    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (!event.key) return;

      if (event.key === TOKEN_KEY || event.key === USER_KEY || LEGACY_AUTH_KEYS.includes(event.key)) {
        const storedToken = getAccessToken();
        const storedUser = localStorage.getItem(USER_KEY);

        if (!storedToken || !storedUser) {
          setToken(null);
          setUser(null);
          return;
        }

        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } catch {
          setToken(null);
          setUser(null);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const isAuthenticated = Boolean(token && user);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
