import { isCrewActive, normalizeStatus } from "@/lib/v4-core-rules";
import { isPaymentActive } from "@/features/v4/utils";

export type CrewStatusTone = "emerald" | "amber" | "slate" | "blue";

export function getCrewStatusLabel(status?: string | null) {
  const normalized = normalizeStatus(status);
  if (normalized === "active") return "Aktif";
  if (normalized === "pending") return "Menunggu aktivasi";
  if (normalized === "inactive") return "Tidak aktif";
  if (normalized === "alumni") return "Alumni";
  return "Belum ada data";
}

export function getCrewStatusTone(status?: string | null): CrewStatusTone {
  const normalized = normalizeStatus(status);
  if (normalized === "active") return "emerald";
  if (normalized === "pending") return "amber";
  if (normalized === "alumni") return "blue";
  return "slate";
}

export function getCrewStatusClass(status?: string | null) {
  const tone = getCrewStatusTone(status);
  if (tone === "emerald") return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (tone === "amber") return "bg-amber-100 text-amber-700 border-amber-200";
  if (tone === "blue") return "bg-blue-100 text-blue-700 border-blue-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
}

export function canUseCrewFeature(status?: string | null, paymentStatus?: string | null) {
  return isCrewActive(status) && isPaymentActive(paymentStatus);
}

export function canRegisterEvent(status?: string | null, paymentStatus?: string | null) {
  return canUseCrewFeature(status, paymentStatus);
}

export function canShowCrewIdentity(status?: string | null, paymentStatus?: string | null, niam?: string | null) {
  return canUseCrewFeature(status, paymentStatus) && Boolean(niam);
}

export function fieldOrDash(value?: string | number | null) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}
