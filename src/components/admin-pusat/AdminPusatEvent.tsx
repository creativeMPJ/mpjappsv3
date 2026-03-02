import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Plus, MapPin, FileText, CheckCircle, XCircle, Search, ChevronLeft } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api-client";

// Types
interface Event {
  id: string;
  name: string;
  description?: string;
  date: string;
  location?: string;
  status: string;
}

interface EventReport {
  regionId: string;
  regionName: string;
  status: "Submitted" | "Pending";
  report: {
    id: string;
    participationCount: number;
    notes?: string;
    photoUrl?: string;
    submittedAt: string;
  } | null;
}

interface EventDetailResponse {
  event: Event;
  reports: EventReport[];
}

const AdminPusatEvent = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // -- Queries --
  const { data: events, isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      // apiRequest returns the data directly (T)
      return await apiRequest<Event[]>("/api/events");
    },
  });

  const { data: reportData, isLoading: isLoadingReports } = useQuery({
    queryKey: ["event-reports", selectedEventId],
    queryFn: async () => {
      if (!selectedEventId) return null;
      return await apiRequest<EventDetailResponse>(`/api/events/${selectedEventId}/reports`);
    },
    enabled: !!selectedEventId,
  });

  // -- Mutations --
  const createEventMutation = useMutation({
    mutationFn: async (newEvent: any) => {
      await apiRequest("/api/events", {
        method: "POST",
        body: JSON.stringify(newEvent),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      setIsCreateOpen(false);
      toast({ title: "Berhasil", description: "Event berhasil dibuat" });
    },
    onError: () => {
      toast({ title: "Gagal", description: "Terjadi kesalahan saat membuat event", variant: "destructive" });
    },
  });

  // -- Handlers --
  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    createEventMutation.mutate({
      name: formData.get("name"),
      date: formData.get("date"),
      location: formData.get("location"),
      description: formData.get("description"),
      status: "upcoming",
    });
  };

  // -- Views --

  // 1. REPORT DETAIL VIEW
  if (selectedEventId && reportData) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => setSelectedEventId(null)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{reportData.event.name}</h1>
            <p className="text-slate-500">
              {format(new Date(reportData.event.date), "dd MMMM yyyy", { locale: idLocale })} • {reportData.event.location}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Laporan Wilayah</CardTitle>
              <CardDescription>Status pelaporan dari setiap wilayah</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-1 divide-y">
                  {reportData.reports.map((item) => (
                    <div key={item.regionId} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {item.status === "Submitted" ? (
                          <div className="bg-emerald-100 p-2 rounded-full">
                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                          </div>
                        ) : (
                          <div className="bg-slate-100 p-2 rounded-full">
                            <XCircle className="h-4 w-4 text-slate-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-slate-900">{item.regionName}</p>
                          <p className="text-sm text-slate-500">
                            {item.status === "Submitted"
                              ? `Dilaporkan: ${format(new Date(item.report!.submittedAt), "dd MMM HH:mm")}`
                              : "Belum melaporkan"}
                          </p>
                        </div>
                      </div>

                      {item.status === "Submitted" && item.report && (
                        <div className="flex flex-col sm:flex-row gap-4 sm:items-center text-sm">
                          <div className="flex items-center gap-1 text-slate-600">
                            <span className="font-semibold text-slate-900">{item.report.participationCount}</span> Peserta
                          </div>
                          {item.report.notes && (
                            <div className="max-w-xs truncate text-slate-500 italic">
                              "{item.report.notes}"
                            </div>
                          )}
                          {item.report.photoUrl && (
                            <Badge variant="outline" className="w-fit">Ada Foto</Badge>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 2. EVENT LIST VIEW
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manajemen Event</h1>
          <p className="text-slate-500 mt-1">Kelola agenda dan pantau laporan wilayah</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#166534] hover:bg-[#14532d]">
              <Plus className="h-4 w-4 mr-2" />
              Buat Event Baru
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Buat Event Baru</DialogTitle>
              <DialogDescription>Isi detail event di bawah ini.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Event</Label>
                <Input id="name" name="name" required placeholder="Contoh: Rapat Akbar Nasional" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Tanggal</Label>
                <Input id="date" name="date" type="datetime-local" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Lokasi</Label>
                <Input id="location" name="location" placeholder="Contoh: Jakarta / Online" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea id="description" name="description" placeholder="Deskripsi singkat event..." />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Batal</Button>
                <Button type="submit" disabled={createEventMutation.isPending}>
                  {createEventMutation.isPending ? "Menyimpan..." : "Simpan Event"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <p>Loading events...</p>
        ) : events?.map((event) => (
          <Card
            key={event.id}
            className="hover:border-emerald-500 transition-all cursor-pointer group"
            onClick={() => setSelectedEventId(event.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <Badge variant={event.status === 'upcoming' ? 'default' : 'secondary'} className="mb-2">
                  {event.status}
                </Badge>
              </div>
              <CardTitle className="group-hover:text-emerald-700 transition-colors">{event.name}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(event.date), "dd MMMM yyyy, HH:mm", { locale: idLocale })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-slate-500 mb-4 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {event.location || "Online"}
              </div>
              <div className="flex items-center justify-between text-sm text-emerald-600 font-medium bg-emerald-50 p-2 rounded">
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Laporan Wilayah
                </span>
                <span>Lihat &rarr;</span>
              </div>
            </CardContent>
          </Card>
        ))}

        {!isLoading && events?.length === 0 && (
          <div className="col-span-full text-center py-10 text-slate-500 bg-slate-50 rounded-lg border border-dashed">
            Belum ada event yang dibuat.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPusatEvent;
