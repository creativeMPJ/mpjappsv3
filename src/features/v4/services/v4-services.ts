import { apiRequest } from "@/lib/api-client";

export type V4RequestState<T> = {
  data: T | null;
  error: string | null;
};

async function safeRequest<T>(path: string): Promise<V4RequestState<T>> {
  try {
    const data = await apiRequest<T>(path);
    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Gagal memuat data",
    };
  }
}

export interface PusatHomeSummary {
  stats?: {
    totalPesantren?: number;
    totalKru?: number;
    totalWilayah?: number;
    pendingPayments?: number;
    totalIncome?: number;
  };
  levelStats?: {
    basic?: number;
    silver?: number;
    gold?: number;
    platinum?: number;
  };
  recentUsers?: Record<string, unknown>[];
}

export interface RegionalPerformance {
  pendingClaims?: number;
  totalProfiles?: number;
  totalCrews?: number;
  verifiedPayments?: number;
}

export const v4AdminService = {
  homeSummary: () => safeRequest<PusatHomeSummary>("/api/admin/home-summary"),
};

export const v4RegionalService = {
  performance: () => safeRequest<RegionalPerformance>("/api/regional/performance"),
};
