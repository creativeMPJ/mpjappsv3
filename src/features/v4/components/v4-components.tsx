import type { ReactNode } from "react";
import { AlertCircle, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type DataTableEmptyType = "no_data" | "not_active" | "error";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-normal text-foreground">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  loading,
}: {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  loading?: boolean;
}) {
  return (
    <Card className="border-border bg-card shadow-sm">
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0 space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {loading ? <Skeleton className="h-8 w-24" /> : <p className="text-3xl font-bold">{value}</p>}
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        {Icon && (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function EmptyState({
  title = "Belum ada data",
  description = "Data akan tampil di sini setelah endpoint tersedia atau data dibuat.",
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 p-8 text-center">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-background text-muted-foreground">
        <AlertCircle className="h-5 w-5" />
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function StatusBadge({ status }: { status?: string | null }) {
  const normalized = (status || "belum_ada").toLowerCase();
  const label = normalized.replace(/_/g, " ");
  const className =
    normalized.includes("active") || normalized.includes("verified") || normalized.includes("aktif")
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : normalized.includes("pending") || normalized.includes("draft")
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : normalized.includes("reject") || normalized.includes("arsip")
          ? "bg-red-50 text-red-700 border-red-200"
          : "bg-slate-50 text-slate-700 border-slate-200";

  return (
    <Badge variant="outline" className={cn("capitalize", className)}>
      {label}
    </Badge>
  );
}

export function DataTableShell({
  title,
  description,
  columns,
  rows,
  loading,
  error,
  renderRow,
  actions,
  headerRight,
  enableSearch = false,
  searchPlaceholder = "Cari data",
  searchValue,
  onSearchChange,
  emptyType = "no_data",
  onRetry,
}: {
  title: string;
  description?: string;
  columns: string[];
  rows: unknown[];
  loading?: boolean;
  error?: string | null;
  renderRow?: (row: unknown, index: number) => ReactNode;
  actions?: ReactNode;
  headerRight?: ReactNode;
  enableSearch?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  emptyType?: DataTableEmptyType;
  onRetry?: () => void;
}) {
  const resolvedEmptyType: DataTableEmptyType = error ? "error" : emptyType;
  const emptyState = getDataTableEmptyState(resolvedEmptyType, error);
  const showToolbar = enableSearch || Boolean(actions) || Boolean(headerRight);

  return (
    <Card className="border-border shadow-sm">
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          </div>
          {showToolbar && (
            <div className="flex flex-wrap gap-2">
              {enableSearch && (
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="h-9 w-56 pl-9"
                    placeholder={searchPlaceholder}
                    value={searchValue ?? ""}
                    onChange={(event) => onSearchChange?.(event.target.value)}
                  />
                </div>
              )}
              {actions}
              {headerRight}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {loading ? (
            <TableLoadingSkeleton columns={columns.length} />
          ) : error ? (
            <EmptyState
              title={emptyState.title}
              description={emptyState.description}
              action={onRetry ? <Button onClick={onRetry}>Coba Lagi</Button> : undefined}
            />
          ) : rows.length === 0 ? (
            <EmptyState title={emptyState.title} description={emptyState.description} />
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-full [&_tbody_tr]:h-14 [&_td]:px-4 [&_td]:py-3 [&_th]:h-11 [&_th]:whitespace-nowrap [&_th]:bg-muted/40 [&_th]:px-4 [&_th]:text-xs [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-wide [&_th]:text-muted-foreground">
                <TableHeader>
                  <TableRow className="border-b">
                    {columns.map((column) => (
                      <TableHead key={column}>{column}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row, index) =>
                    renderRow ? (
                      renderRow(row, index)
                    ) : (
                      <TableRow key={index}>
                        <TableCell colSpan={columns.length}>Data tersedia</TableCell>
                      </TableRow>
                    ),
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function TableLoadingSkeleton({ columns }: { columns: number }) {
  const skeletonColumns = Array.from({ length: Math.max(columns, 1) });
  const skeletonRows = Array.from({ length: 5 });

  return (
    <div className="overflow-x-auto">
      <Table className="min-w-full [&_td]:px-4 [&_td]:py-3 [&_th]:h-11 [&_th]:bg-muted/40 [&_th]:px-4">
        <TableHeader>
          <TableRow>
            {skeletonColumns.map((_, index) => (
              <TableHead key={index}>
                <Skeleton className="h-4 w-24" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {skeletonRows.map((_, rowIndex) => (
            <TableRow key={rowIndex} className="h-14">
              {skeletonColumns.map((__, columnIndex) => (
                <TableCell key={columnIndex}>
                  <Skeleton className="h-4 w-full min-w-20" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function getDataTableEmptyState(type: DataTableEmptyType, error?: string | null) {
  if (type === "error") {
    return {
      title: "Gagal memuat data",
      description: error || "Terjadi kendala saat memuat data.",
    };
  }

  if (type === "not_active") {
    return {
      title: "Fitur belum tersedia",
      description: "Fitur ini akan segera hadir",
    };
  }

  return {
    title: "Belum ada data",
    description: "Data akan muncul setelah tersedia",
  };
}
