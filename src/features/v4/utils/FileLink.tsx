import { ExternalLink } from "lucide-react";

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
