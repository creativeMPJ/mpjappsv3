import { apiRequest } from "@/lib/api-client";
import type { V4RequestState } from "./v4-services";

export interface V4PaymentItem {
  id: string;
  total_amount: number | null;
  proof_file_url: string | null;
  status: string | null;
  created_at: string | null;
  pesantren_claims?: {
    pesantren_name?: string | null;
    nama_pengelola?: string | null;
    jenis_pengajuan?: string | null;
  } | null;
}

interface PaymentListResponse {
  payments?: V4PaymentItem[];
}

export async function getPaymentList(): Promise<V4RequestState<V4PaymentItem[]>> {
  try {
    const response = await apiRequest<PaymentListResponse>("/api/admin/payments");
    return { data: response.payments ?? [], error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Gagal memuat data pembayaran",
    };
  }
}
