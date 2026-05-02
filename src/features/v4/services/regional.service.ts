import { apiRequest } from "@/lib/api-client";
import type { V4RequestState } from "./v4-services";

export interface V4PendingRegistrationItem {
  id: string;
  pesantren_name: string | null;
  status: string | null;
  kecamatan: string | null;
  nama_pengelola: string | null;
  no_wa_pendaftar: string | null;
  dokumen_bukti_url: string | null;
  created_at: string | null;
  jenis_pengajuan: string | null;
}

interface PendingRegistrationResponse {
  claims?: V4PendingRegistrationItem[];
}

export async function getPendingRegistrations(): Promise<V4RequestState<V4PendingRegistrationItem[]>> {
  try {
    const response = await apiRequest<PendingRegistrationResponse>("/api/regional/pending-claims");
    return { data: response.claims ?? [], error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Gagal memuat data pendaftaran",
    };
  }
}
