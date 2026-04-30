export type InstitutionLevel = "basic" | "silver" | "gold" | "platinum";

const ACTIVE_STATUSES = new Set(["active", "aktif"]);
const ALUMNI_STATUSES = new Set(["alumni"]);
const VERIFIED_PAYMENT_STATUSES = new Set(["paid", "verified", "lunas"]);
const LEVEL_ORDER: Record<InstitutionLevel, number> = {
  basic: 0,
  silver: 1,
  gold: 2,
  platinum: 3,
};

export function normalizeStatus(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function isCrewActive(status: unknown) {
  return ACTIVE_STATUSES.has(normalizeStatus(status));
}

export function isCrewAlumni(status: unknown) {
  return ALUMNI_STATUSES.has(normalizeStatus(status));
}

export function isPaymentVerified(status: unknown) {
  return VERIFIED_PAYMENT_STATUSES.has(normalizeStatus(status));
}

export function isLevelAtLeast(level: unknown, minimum: InstitutionLevel) {
  const normalized = normalizeStatus(level) as InstitutionLevel;
  return (LEVEL_ORDER[normalized] ?? -1) >= LEVEL_ORDER[minimum];
}

export function canIssueNIAM(params: {
  crewStatus?: unknown;
  paymentStatus?: unknown;
  paymentVerified?: unknown;
}) {
  const verified =
    typeof params.paymentVerified === "boolean"
      ? params.paymentVerified
      : isPaymentVerified(params.paymentStatus);

  return isCrewActive(params.crewStatus) && verified;
}

export function canAccessRestrictedCrewFeature(params: { crewStatus?: unknown }) {
  return !isCrewAlumni(params.crewStatus);
}

export function canAccessEID(params: { crewStatus?: unknown; profileLevel?: unknown }) {
  return isCrewActive(params.crewStatus) && isLevelAtLeast(params.profileLevel, "silver");
}

export function getTransactionXPTotal(source: Record<string, unknown> | null | undefined) {
  if (!source) return 0;

  const candidates = [
    source.xpTotal,
    source.xp_total,
    source.transactionXpTotal,
    source.transaction_xp_total,
    source.xpTransactionsTotal,
    source.xp_transactions_total,
  ];

  const value = candidates.find((candidate) => typeof candidate === "number" && Number.isFinite(candidate));
  return typeof value === "number" ? value : 0;
}
