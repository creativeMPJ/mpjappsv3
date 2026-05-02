import { IS_DEV_AUTH_BYPASS_ENABLED } from "@/config/devAuth";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:3001";

function getToken(): string | null {
  return localStorage.getItem("mpj_auth_token");
}

export class ApiError extends Error {
  status: number | null;
  body: unknown;
  responseText: string | null;

  constructor(
    message: string,
    options: {
      status?: number | null;
      body?: unknown;
      responseText?: string | null;
      cause?: unknown;
    } = {}
  ) {
    super(message);
    this.name = "ApiError";
    this.status = options.status ?? null;
    this.body = options.body ?? null;
    this.responseText = options.responseText ?? null;
    if (options.cause !== undefined) {
      (this as Error & { cause?: unknown }).cause = options.cause;
    }
  }
}

function parseResponseBody(text: string): unknown {
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function extractErrorMessage(body: unknown, fallback: string): string {
  if (!body) return fallback;

  if (typeof body === "string") {
    const trimmed = body.trim();
    return trimmed || fallback;
  }

  if (typeof body === "object" && !Array.isArray(body)) {
    const record = body as Record<string, unknown>;
    const message = record.message ?? record.error ?? record.detail ?? record.details;

    if (typeof message === "string" && message.trim()) {
      return message.trim();
    }
  }

  return fallback;
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

  let response: Response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers,
    });
  } catch (cause) {
    throw new ApiError("Network request failed", {
      status: null,
      cause,
    });
  }

  const text = await response.text();
  const data = parseResponseBody(text);

  if (!response.ok) {
    if (response.status === 401 && !IS_DEV_AUTH_BYPASS_ENABLED) {
      localStorage.removeItem("mpj_auth_token");
      window.location.href = "/login";
    }

    throw new ApiError(extractErrorMessage(data, response.statusText || "Request failed"), {
      status: response.status,
      body: data,
      responseText: text || null,
    });
  }

  return data as T;
}
