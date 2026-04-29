import { useEffect, useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { DataTableShell, PageHeader, StatusBadge } from "../components/v4-components";
import { getEventList, type V4EventItem } from "../services/event.service";

type EventScope = "pusat" | "regional";

function formatText(value: string | null | undefined) {
  return value && value.trim() ? value : "-";
}

function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

function V4EventListPage({ scope }: { scope: EventScope }) {
  const [events, setEvents] = useState<V4EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const label = scope === "pusat" ? "Pusat" : "Regional";

  useEffect(() => {
    getEventList().then((result) => {
      setEvents(result.data ?? []);
      setError(result.error);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Daftar Event ${label}`}
        description="Daftar event read-only dari endpoint existing /api/events."
      />
      <DataTableShell
        title="Daftar Event"
        description="Mode read-only. Create, edit, dan delete belum diaktifkan."
        columns={["Nama Event", "Deskripsi", "Tanggal", "Lokasi", "Status"]}
        rows={events}
        loading={loading}
        error={error}
        renderRow={(row, index) => {
          const event = row as V4EventItem;

          return (
            <TableRow key={event.id || index}>
              <TableCell className="font-medium">{formatText(event.name)}</TableCell>
              <TableCell>{formatText(event.description)}</TableCell>
              <TableCell>{formatDate(event.date)}</TableCell>
              <TableCell>{formatText(event.location)}</TableCell>
              <TableCell><StatusBadge status={event.status} /></TableCell>
            </TableRow>
          );
        }}
      />
    </div>
  );
}

export function PusatEventDaftarPage() {
  return <V4EventListPage scope="pusat" />;
}

export function RegionalEventDaftarPage() {
  return <V4EventListPage scope="regional" />;
}
