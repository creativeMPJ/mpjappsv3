import { ExternalLink } from "lucide-react";

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

export function FileLink({ href, label }: { href?: string | null; label: string }) {
  if (!href) return <span className="text-muted-foreground">-</span>;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:underline"
    >
      {label}
      <ExternalLink className="h-3.5 w-3.5" />
    </a>
  );
}
