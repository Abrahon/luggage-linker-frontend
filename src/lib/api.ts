export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

/**
 * Retrieves authorization headers dynamically from the canonical accessToken storage.
 */
export const getAuthHeaders = (): Record<string, string> => {
  let token: string | null = null;

  if (typeof window !== "undefined") {
    token = localStorage.getItem("accessToken");

    if (!token) {
      const match = document.cookie.match(/(?:^|; )accessToken=([^;]*)/);
      if (match) {
        token = decodeURIComponent(match[1]);
      }
    }
  }

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/**
 * Core JSON fetch client supporting custom methods, auth headers, and robust error parsing.
 */
export async function requestJson<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = {
    ...getAuthHeaders(),
    ...((options.headers as Record<string, string>) || {}),
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...options,
    headers,
  });

  const text = await response.text();
  let body: unknown = null;

  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }

  if (!response.ok) {
    const errorMessage =
      body && typeof body === "object"
        ? (body as Record<string, unknown>).detail ||
          (body as Record<string, unknown>).message ||
          (body as Record<string, unknown>).error
        : response.statusText;
    throw new Error(
      String(errorMessage || `Request failed with status ${response.status}`),
    );
  }

  return body as T;
}

/**
 * Helper for POST requests.
 */
export async function postJson<T = unknown>(
  path: string,
  data: unknown,
): Promise<T> {
  return requestJson<T>(path, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ==========================================
// Authentication & Password API Functions
// ==========================================

export function verifyEmail<T = unknown>(
  email: string,
  otp: string,
): Promise<T> {
  return postJson<T>("/api/verify-email/", { email, otp });
}

export function forgotPassword<T = unknown>(email: string): Promise<T> {
  return postJson<T>("/api/forgot-password/", { email });
}

export function resendOtp<T = unknown>(email: string): Promise<T> {
  return postJson<T>("/api/resend-otp/", { email });
}

export function verifyForgotOtp<T = unknown>(
  email: string,
  otp: string,
): Promise<T> {
  return postJson<T>("/api/verify-forgot-otp/", { email, otp });
}

export function resetPassword<T = unknown>(
  newPassword: string,
  confirmPassword: string,
  resetToken?: string,
): Promise<T> {
  const body: Record<string, unknown> = {
    new_password: newPassword,
    confirm_password: confirmPassword,
  };

  if (resetToken) {
    body.reset_token = resetToken;
  }

  return postJson<T>("/api/reset-password/", body);
}

export function login<T = unknown>(
  email: string,
  password: string,
): Promise<T> {
  return postJson<T>("/api/login/", { email, password });
}
