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
  recentUsers?: unknown[];
}

export interface RegionalPerformance {
  pendingClaims?: number;
  totalProfiles?: number;
  totalCrews?: number;
  verifiedPayments?: number;
}

export const v4AdminService = {
  homeSummary: () => safeRequest<PusatHomeSummary>("/api/admin/home-summary"),
  payments: () => safeRequest<{ payments?: unknown[] }>("/api/admin/payments"),
  claims: () => safeRequest<{ claims?: unknown[] }>("/api/admin/claims"),
  masterData: () => safeRequest<{ profiles?: unknown[]; crews?: unknown[]; regions?: unknown[] }>("/api/admin/master-data"),
  pricingPackages: () => safeRequest<{ packages?: unknown[] }>("/api/admin/pricing-packages"),
  jabatanCodes: () => safeRequest<{ jabatan_codes?: unknown[] }>("/api/admin/jabatan-codes"),
};

export const v4RegionalService = {
  masterData: () => safeRequest<{ profiles?: unknown[]; crews?: unknown[] }>("/api/regional/master-data"),
  pendingClaims: () => safeRequest<{ claims?: unknown[] }>("/api/regional/pending-claims"),
  performance: () => safeRequest<RegionalPerformance>("/api/regional/performance"),
  leaderboard: () => safeRequest<{ leaderboard?: unknown[] }>("/api/regional/leaderboard"),
  latePayments: () => safeRequest<{ claims?: unknown[] }>("/api/regional/late-payments"),
};

export const v4EventService = {
  pusatEvents: () => safeRequest<unknown[]>("/api/events"),
  regionalEvents: () => safeRequest<{ events?: unknown[] }>("/api/events/regional"),
};
