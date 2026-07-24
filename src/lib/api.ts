export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://z4f6lxvp-8001.asse.devtunnels.ms";

export async function postJson<T = unknown>(path: string, data: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
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
