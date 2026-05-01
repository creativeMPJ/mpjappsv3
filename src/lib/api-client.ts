import { IS_DEV_AUTH_BYPASS_ENABLED } from "@/config/devAuth";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:3001";

function getToken(): string | null {
  return localStorage.getItem("mpj_auth_token");
}

export async function apiRequest<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const headers = new Headers(init?.headers ?? {});
  const isFormData = typeof FormData !== "undefined" && init?.body instanceof FormData;

  if (!headers.has("Content-Type") && init?.body && !isFormData) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    if (response.status === 401 && !IS_DEV_AUTH_BYPASS_ENABLED) {
      localStorage.removeItem("mpj_auth_token");
      window.location.href = "/login";
    }
    throw new Error(data?.message || "Request failed");
  }

  return data as T;
}
