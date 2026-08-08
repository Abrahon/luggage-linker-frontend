
"use client";

import { CloudCog } from "lucide-react";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

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

const TOKEN_KEY = "token";
const USER_KEY = "user";

export const AuthProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  console.log("the user:",user)

  /**
   * Restore authentication when application starts.
   */
  useEffect(() => {
    const restoreSession = () => {
      try {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);

        if (!storedToken || !storedUser) {
          setUser(null);
          setToken(null);
          return;
        }

        const parsedUser: User = JSON.parse(storedUser);

        setToken(storedToken);
        setUser(parsedUser);
      } catch (error) {
        console.error("Failed to restore authentication:", error);

        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);

        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  /**
   * Login
   */
  const login = (newToken: string, userData: User) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));

    // Update React state immediately.
    setToken(newToken);
    setUser(userData);
  };

  /**
   * Logout
   */
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    setToken(null);
    setUser(null);
  };

  /**
   * Keep authentication state synchronized between browser tabs.
   */
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === TOKEN_KEY || event.key === USER_KEY) {
        const storedToken = localStorage.getItem(TOKEN_KEY);
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
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};
