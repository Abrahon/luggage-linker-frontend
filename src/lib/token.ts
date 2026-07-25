// src/lib/token.ts
const cookieOptions = (options: Record<string, string | number | boolean> = {}) => {
  const opts = { path: "/", sameSite: "Lax", ...options } as Record<string, string | number | boolean>;

  if (typeof window !== "undefined" && window.location.protocol === "https:") {
    opts.secure = true;
  }

  return Object.entries(opts)
    .map(([key, value]) => (value === true ? key : `${key}=${value}`))
    .join("; ");
};

const setCookie = (name: string, value: string, options: Record<string, string | number | boolean> = {}) => {
  if (typeof window === "undefined") return;
  const cookieValue = encodeURIComponent(value);
  if (options.sameSite === "None" && window.location.protocol !== "https:") {
    options.sameSite = "Lax";
  }
  const opts = cookieOptions(options);
  document.cookie = `${name}=${cookieValue}; ${opts}`;
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

export const getAccessToken = (): string | null => {
  return getCookie("accessToken");
};

export const setAccessToken = (token: string): void => {
  setCookie("accessToken", token, {
    maxAge: 60 * 60 * 24,
    sameSite: "None",
    secure: true,
  });
};

export const removeAccessToken = (): void => {
  deleteCookie("accessToken");
};

export const getRefreshToken = (): string | null => {
  return getCookie("refreshToken");
};

export const setRefreshToken = (token: string): void => {
  setCookie("refreshToken", token, {
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "None",
    secure: true,
  });
};

export const removeRefreshToken = (): void => {
  deleteCookie("refreshToken");
};