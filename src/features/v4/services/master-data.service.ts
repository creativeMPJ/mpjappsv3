import { apiRequest } from "@/lib/api-client";
import type { V4RequestState } from "./v4-services";

export interface V4MasterProfile {
  id: string;
  nama_pesantren: string | null;
  nama_media?: string | null;
  nama_pengasuh?: string | null;
  nip: string | null;
  region_name?: string | null;
  city_name?: string | null;
  status_account: string | null;
  status_payment?: string | null;
  profile_level: string | null;
  no_wa_pendaftar: string | null;
}

export interface V4MasterCrew {
  id: string;
  nama: string | null;
  niam: string | null;
  jabatan: string | null;
  xp_level: number | null;
  pesantren_name: string | null;
  region_name?: string | null;
}

interface MasterDataResponse {
  profiles?: V4MasterProfile[];
  crews?: V4MasterCrew[];
}

async function getMasterData(path: string, fallbackMessage: string): Promise<V4RequestState<MasterDataResponse>> {
  try {
    const response = await apiRequest<MasterDataResponse>(path);
    return {
      data: {
        profiles: response.profiles ?? [],
        crews: response.crews ?? [],
      },
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : fallbackMessage,
    };
  }
}

export function getPusatMasterData() {
  return getMasterData("/api/admin/master-data", "Gagal memuat master data pusat");
}

export function getRegionalMasterData() {
  return getMasterData("/api/regional/master-data", "Gagal memuat master data regional");
}
