export type NormalizedPaymentStatus = "pending" | "verified" | "rejected";
export type PaymentReadinessState = NormalizedPaymentStatus | "inactive";

export interface PaymentStatusLike {
  status?: string | null;
}

export function getPaymentStatus(payment?: PaymentStatusLike | string | null): PaymentReadinessState {
  const status = typeof payment === "string" ? payment : payment?.status;

  if (!status) return "inactive";
  if (status === "verified" || status === "paid") return "verified";
  if (status === "pending" || status === "pending_payment" || status === "pending_verification") return "pending";
  if (status === "rejected") return "rejected";
  return "inactive";
}

export function isPaymentActive(payment?: PaymentStatusLike | string | null) {
  return getPaymentStatus(payment) === "verified";
}

export function getPaymentStateLabel(payment?: PaymentStatusLike | string | null) {
  const status = getPaymentStatus(payment);

  if (status === "verified") return "Aktif";
  if (status === "pending") return "Menunggu verifikasi";
  if (status === "rejected") return "Pembayaran ditolak";
  return "Belum aktif";
}
