import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TableCell, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, History, Ticket } from "lucide-react";
import { DataTableShell, DisabledActionCell, EmptyState, PageHeader, StatusBadge } from "@/features/v4/components/v4-components";
import { getEventList, type V4EventItem } from "@/features/v4/services/event.service";
import { formatDate, formatText } from "@/features/v4/utils";

const EventPage = () => {
  const [events, setEvents] = useState<V4EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const tabs = [
    {
      id: "tersedia",
      label: "Event Tersedia",
      icon: CalendarDays,
      title: "Belum ada event",
      description: "Data event akan tampil setelah tersedia.",
    },
    {
      id: "terdaftar",
      label: "Terdaftar",
      icon: Ticket,
      title: "Belum ada pendaftaran event",
      description: "Data event akan tampil setelah tersedia.",
    },
    {
      id: "riwayat",
      label: "Riwayat",
      icon: History,
      title: "Belum ada riwayat event",
      description: "Data event akan tampil setelah tersedia.",
    },
  ];

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
        title="Event Saya"
        description="Lihat event tersedia, pendaftaran, dan riwayat keikutsertaan."
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Data event akan tampil setelah tersedia.</p>
        </div>
        <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
          Monitoring
        </Badge>
      </div>

      <Tabs defaultValue="tersedia" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-100 p-1 md:h-auto">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex flex-col gap-1 px-2 py-2 text-xs data-[state=active]:bg-[#166534] data-[state=active]:text-white"
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id}>
            {tab.id === "tersedia" ? (
              <DataTableShell
                title="Event Tersedia"
                description="Daftar event untuk pemantauan kegiatan."
                columns={["Nama Event", "Tanggal", "Lokasi", "Status", "Aksi"]}
                rows={events}
                loading={loading}
                error={error}
                emptyTitle={tab.title}
                emptyDescription={tab.description}
                renderRow={(row, index) => {
                  const event = row as V4EventItem;

                  return (
                    <TableRow key={event.id || index}>
                      <TableCell className="font-medium">{formatText(event.name)}</TableCell>
                      <TableCell>{formatDate(event.date)}</TableCell>
                      <TableCell>{formatText(event.location)}</TableCell>
                      <TableCell><StatusBadge status={event.status} /></TableCell>
                      <DisabledActionCell />
                    </TableRow>
                  );
                }}
              />
            ) : (
              <Card className="border-border shadow-sm">
                <CardContent className="p-6">
                  <EmptyState
                    title={tab.title}
                    description={tab.description}
                    action={<Button disabled>Segera Hadir</Button>}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default EventPage;
