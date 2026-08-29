// src/lib/token.ts

/**
 * Transforms options object into valid document.cookie directive strings.
 * Handles camelCase conversion (e.g. maxAge -> Max-Age).
 */
const cookieOptions = (options: Record<string, string | number | boolean> = {}) => {
  const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";

  const opts: Record<string, string | number | boolean> = {
    path: "/",
    SameSite: isHttps ? (options.sameSite as string) || "Lax" : "Lax",
    ...options,
  };

  delete opts.maxAge;
  delete opts.sameSite;

  if (isHttps) {
    opts.Secure = true;
  } else {
    delete opts.Secure;
    delete opts.secure;
  }

  return Object.entries(opts)
    .map(([key, value]) => {
      if (value === true) return key;
      if (value === false || value === null || value === undefined) return null;
      return `${key}=${value}`;
    })
    .filter(Boolean)
    .join("; ");
};

const setCookie = (name: string, value: string, options: Record<string, string | number | boolean> = {}) => {
  if (typeof window === "undefined") return;

  const cookieValue = encodeURIComponent(value);
  const optsString = cookieOptions(options);

  document.cookie = `${name}=${cookieValue}; ${optsString}`;
};

const getCookie = (name: string): string | null => {
  if (typeof window === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

const deleteCookie = (name: string) => {
  if (typeof window === "undefined") return;
  document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax;`;
};

const LEGACY_TOKEN_KEYS = ["token", "access_token"];

const clearLegacyTokenKeys = () => {
  if (typeof window === "undefined") return;

  LEGACY_TOKEN_KEYS.forEach((key) => {
    localStorage.removeItem(key);
    deleteCookie(key);
  });
};

// ---------------------------------------------------------------------------
// Access Token Helpers
// ---------------------------------------------------------------------------
export const getAccessToken = (): string | null => {
  if (typeof window === "undefined") return null;

  const storedToken = localStorage.getItem("accessToken");
  if (storedToken) {
    return storedToken;
  }

  const migratedToken =
    localStorage.getItem("token") || localStorage.getItem("access_token");

  if (migratedToken) {
    localStorage.setItem("accessToken", migratedToken);
    clearLegacyTokenKeys();
    return migratedToken;
  }

  return getCookie("accessToken") || null;
};

export const setAccessToken = (token: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("accessToken", token);
    clearLegacyTokenKeys();
  }

  setCookie("accessToken", token, {
    "Max-Age": 60 * 60 * 24,
  });
};

export const removeAccessToken = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken");
    clearLegacyTokenKeys();
  }

  deleteCookie("accessToken");
};

// ---------------------------------------------------------------------------
// Refresh Token Helpers
// ---------------------------------------------------------------------------
export const getRefreshToken = (): string | null => {
  if (typeof window === "undefined") return null;

  return localStorage.getItem("refreshToken") || getCookie("refreshToken") || null;
};

export const setRefreshToken = (token: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("refreshToken", token);
    localStorage.removeItem("refresh_token");
  }

  setCookie("refreshToken", token, {
    "Max-Age": 60 * 60 * 24 * 30,
  });
};

export const removeRefreshToken = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("refresh_token");
  }

  deleteCookie("refreshToken");
};