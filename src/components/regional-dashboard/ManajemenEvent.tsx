import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Calendar, Upload, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api-client";
import EventCard, { EventData, EventStatus } from "./event/EventCard";
import EventDetailView from "./event/EventDetailView";
import { MAX_FILE_SIZE_BYTES } from "@/lib/file-validation";

interface ApiEvent {
  id: string;
  name: string;
  description: string | null;
  date: string;
  location: string | null;
  status: string;
  created_at: string;
  report_count: number;
  my_report: {
    id: string;
    participationCount: number;
    notes: string | null;
    submittedAt: string;
  } | null;
}

const ManajemenEvent = () => {
  const { toast } = useToast();
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // Create event form state
  const [newEventForm, setNewEventForm] = useState({
    poster: null as File | null,
    posterPreview: "",
    judul: "",
    waktu: "",
    lokasi: "",
    deskripsi: "",
  });

  // Map API response → EventData format
  const mapApiToEventData = (e: ApiEvent): EventData => ({
    id: e.id,
    judul: e.name,
    waktu: e.date,
    lokasi: e.location || "",
    status: (e.status === "completed" ? "COMPLETED" : "UPCOMING") as EventStatus,
    pesertaCount: e.my_report?.participationCount ?? 0,
  });

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await apiRequest<{ events: ApiEvent[] }>("/api/events/regional");
      setEvents((data.events || []).map(mapApiToEventData));
    } catch (error: any) {
      toast({ title: "Gagal memuat event", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Filter events
  const filteredEvents = events.filter((event) => {
    const matchesStatus = statusFilter === "all" || event.status === statusFilter;
    const matchesSearch =
      event.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.lokasi.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleManageEvent = (event: EventData) => {
    setSelectedEvent(event);
  };

  const handleBackToGallery = () => {
    setSelectedEvent(null);
    fetchEvents(); // Refresh after detail view changes
  };

  const handleUpdateEvent = (updatedEvent: EventData) => {
    setEvents(events.map((e) => (e.id === updatedEvent.id ? updatedEvent : e)));
    setSelectedEvent(updatedEvent);
  };

  const handlePosterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast({
          title: "File terlalu besar",
          description: "Ukuran file terlalu besar. Maksimal yang diizinkan adalah 350KB.",
          variant: "destructive",
        });
        return;
      }
      setNewEventForm({
        ...newEventForm,
        poster: file,
        posterPreview: URL.createObjectURL(file),
      });
    }
  };

  const handleCreateEvent = async () => {
    if (!newEventForm.judul || !newEventForm.waktu) {
      toast({
        title: "Form tidak lengkap",
        description: "Mohon lengkapi judul dan waktu event.",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      await apiRequest("/api/events/regional", {
        method: "POST",
        body: JSON.stringify({
          name: newEventForm.judul.trim(),
          date: newEventForm.waktu,
          location: newEventForm.lokasi.trim() || undefined,
          description: newEventForm.deskripsi.trim() || undefined,
        }),
      });

      setIsCreateModalOpen(false);
      setNewEventForm({
        poster: null,
        posterPreview: "",
        judul: "",
        waktu: "",
        lokasi: "",
        deskripsi: "",
      });

      toast({
        title: "Event berhasil dibuat",
        description: "Event baru telah ditambahkan.",
      });

      await fetchEvents();
    } catch (error: any) {
      toast({
        title: "Gagal membuat event",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  // If an event is selected, show the detail view
  if (selectedEvent) {
    return (
      <EventDetailView
        event={selectedEvent}
        onBack={handleBackToGallery}
        onUpdateEvent={handleUpdateEvent}
      />
    );
  }

  // Main Gallery View
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Daftar Kegiatan Wilayah</h1>
          <p className="text-muted-foreground">
            {loading ? "Memuat..." : `${filteredEvents.length} event ditemukan`}
          </p>
        </div>

        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2 self-start lg:self-auto">
              <Plus className="h-4 w-4" />
              Buat Event Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Buat Event Baru</DialogTitle>
              <DialogDescription>
                Isi informasi dasar untuk membuat event baru.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              {/* Poster Upload */}
              <div className="space-y-2">
                <Label>Poster Event (4:5 Portrait)</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                  {newEventForm.posterPreview ? (
                    <div className="relative aspect-[4/5] max-w-[160px] mx-auto">
                      <img
                        src={newEventForm.posterPreview}
                        alt="Poster preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2 h-7 w-7 p-0"
                        onClick={() => setNewEventForm({ ...newEventForm, poster: null, posterPreview: "" })}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <div className="aspect-[4/5] max-w-[160px] mx-auto bg-muted rounded-lg flex flex-col items-center justify-center">
                        <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                        <span className="text-xs text-muted-foreground">Upload Poster</span>
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={handlePosterUpload} />
                    </label>
                  )}
                </div>
              </div>

              {/* Judul */}
              <div className="space-y-2">
                <Label htmlFor="create-judul">Judul Event *</Label>
                <Input
                  id="create-judul"
                  placeholder="Masukkan judul event"
                  value={newEventForm.judul}
                  onChange={(e) => setNewEventForm({ ...newEventForm, judul: e.target.value })}
                />
              </div>

              {/* Waktu */}
              <div className="space-y-2">
                <Label htmlFor="create-waktu">Waktu Pelaksanaan *</Label>
                <Input
                  id="create-waktu"
                  type="datetime-local"
                  value={newEventForm.waktu}
                  onChange={(e) => setNewEventForm({ ...newEventForm, waktu: e.target.value })}
                />
              </div>

              {/* Lokasi */}
              <div className="space-y-2">
                <Label htmlFor="create-lokasi">Lokasi</Label>
                <Input
                  id="create-lokasi"
                  placeholder="Masukkan lokasi event"
                  value={newEventForm.lokasi}
                  onChange={(e) => setNewEventForm({ ...newEventForm, lokasi: e.target.value })}
                />
              </div>

              {/* Deskripsi */}
              <div className="space-y-2">
                <Label htmlFor="create-deskripsi">Deskripsi</Label>
                <Textarea
                  id="create-deskripsi"
                  placeholder="Deskripsi singkat tentang event..."
                  rows={3}
                  value={newEventForm.deskripsi}
                  onChange={(e) => setNewEventForm({ ...newEventForm, deskripsi: e.target.value })}
                />
              </div>

              <Button
                onClick={handleCreateEvent}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                disabled={creating}
              >
                {creating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Buat Event
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari event..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="UPCOMING">Upcoming</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Event Grid */}
      {loading ? (
        <div className="text-center py-16 text-muted-foreground">
          <Loader2 className="h-10 w-10 mx-auto mb-4 animate-spin opacity-50" />
          <p className="text-sm">Memuat event...</p>
        </div>
      ) : filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} onManage={handleManageEvent} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Tidak ada event ditemukan</p>
          <p className="text-sm">Coba ubah filter atau buat event baru.</p>
        </div>
      )}
    </div>
  );
};

export default ManajemenEvent;
