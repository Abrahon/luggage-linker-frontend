export const API_BASE_URL =process.env.NEXT_PUBLIC_API_URL;

  
export async function postJson<T = unknown>(path: string, data: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
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
      body && typeof body === "object" && "detail" in body
        ? (body as Record<string, unknown>).detail
        : body && typeof body === "object" && "message" in body
        ? (body as Record<string, unknown>).message
        : response.statusText;
    throw new Error(String(errorMessage || "Request failed"));
  }

  return body as T;
}

export function verifyEmail<T = unknown>(email: string, otp: string): Promise<T> {
  return postJson<T>("/api/verify-email/", { email, otp });
}

export function forgotPassword<T = unknown>(email: string): Promise<T> {
  return postJson<T>("/api/forgot-password/", { email });
}

export function resendOtp<T = unknown>(email: string): Promise<T> {
  return postJson<T>("/api/resend-otp/", { email });
}

export function verifyForgotOtp<T = unknown>(email: string, otp: string): Promise<T> {
  return postJson<T>("/api/verify-forgot-otp/", { email, otp });
}

export function resetPassword<T = unknown>(newPassword: string, confirmPassword: string, resetToken?: string): Promise<T> {
  const body: Record<string, unknown> = {
    new_password: newPassword,
    confirm_password: confirmPassword,
  };

  if (resetToken) {
    body.reset_token = resetToken;
  }

  return postJson<T>("/api/reset-password/", body);
}

export function login<T = unknown>(email: string, password: string): Promise<T> {
  return postJson<T>("/api/login/", { email, password });
}
