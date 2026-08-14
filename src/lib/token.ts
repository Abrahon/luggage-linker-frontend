// src/lib/token.ts

/**
 * Transforms options object into valid document.cookie directive strings.
 * Handles camelCase conversion (e.g. maxAge -> Max-Age).
 */
const cookieOptions = (options: Record<string, string | number | boolean> = {}) => {
  const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";

  // Default cookie directives
  const opts: Record<string, string | number | boolean> = {
    path: "/",
    SameSite: isHttps ? (options.sameSite as string) || "Lax" : "Lax",
    ...options,
  };

  // Remove duplicate camelCase keys
  delete opts.maxAge;
  delete opts.sameSite;

  // Modern browsers discard Secure cookies on HTTP (localhost)
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

// ---------------------------------------------------------------------------
// Access Token Helpers
// ---------------------------------------------------------------------------
export const getAccessToken = (): string | null => {
  return getCookie("accessToken");
};

export const setAccessToken = (token: string): void => {
  setCookie("accessToken", token, {
    "Max-Age": 60 * 60 * 24, // 1 Day (Fixed Max-Age)
  });
};

export const removeAccessToken = (): void => {
  deleteCookie("accessToken");
};

// ---------------------------------------------------------------------------
// Refresh Token Helpers
// ---------------------------------------------------------------------------
export const getRefreshToken = (): string | null => {
  return getCookie("refreshToken");
};

export const setRefreshToken = (token: string): void => {
  setCookie("refreshToken", token, {
    "Max-Age": 60 * 60 * 24 * 30, // 30 Days (Fixed Max-Age)
  });
};

export const removeRefreshToken = (): void => {
  deleteCookie("refreshToken");
};