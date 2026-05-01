import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, History, Ticket } from "lucide-react";
import { EmptyState, PageHeader } from "@/features/v4/components/v4-components";

const EventPage = () => {
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
        <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
          Segera Hadir
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
            <Card className="border-border shadow-sm">
              <CardContent className="p-6">
                <EmptyState
                  title={tab.title}
                  description={tab.description}
                  action={<Button disabled>Segera Hadir</Button>}
                />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default EventPage;
