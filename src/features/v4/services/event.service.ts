import { apiRequest } from "@/lib/api-client";
import type { V4RequestState } from "./v4-services";

export interface V4EventItem {
  id: string;
  name: string | null;
  description: string | null;
  date: string | null;
  location: string | null;
  status: string | null;
}

export async function getEventList(): Promise<V4RequestState<V4EventItem[]>> {
  try {
    const response = await apiRequest<V4EventItem[]>("/api/events");
    return { data: Array.isArray(response) ? response : [], error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Gagal memuat data event",
    };
  }
}
