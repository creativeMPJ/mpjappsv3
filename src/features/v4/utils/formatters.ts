export function formatText(value: string | number | null | undefined) {
  if (typeof value === "number") return String(value);
  return value && value.trim() ? value : "-";
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatCurrency(value: number | null | undefined) {
  if (typeof value !== "number") return "-";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
}
