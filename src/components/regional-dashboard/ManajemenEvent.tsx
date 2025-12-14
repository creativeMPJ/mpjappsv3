import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Calendar, Upload, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import EventCard, { EventData, EventStatus } from "./event/EventCard";
import EventDetailView from "./event/EventDetailView";

// Mock data for events
const mockEvents: EventData[] = [
  {
    id: "1",
    judul: "Pelatihan Jurnalistik Dasar",
    waktu: "2024-12-20T09:00",
    lokasi: "PP Nurul Huda",
    status: "UPCOMING",
    poster: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=500&fit=crop",
    pesertaCount: 45,
  },
  {
    id: "2",
    judul: "Workshop Fotografi & Videografi",
    waktu: "2024-11-15T08:00",
    lokasi: "PP Al-Hikam",
    status: "COMPLETED",
    poster: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=500&fit=crop",
    pesertaCount: 78,
  },
  {
    id: "3",
    judul: "Seminar Media Sosial Islami",
    waktu: "2025-01-10T13:00",
    lokasi: "Hotel Tugu Malang",
    status: "UPCOMING",
    pesertaCount: 120,
  },
  {
    id: "4",
    judul: "Kopdar Kru Regional Malang Raya",
    waktu: "2024-10-05T09:00",
    lokasi: "PP Darul Ulum",
    status: "COMPLETED",
    poster: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=500&fit=crop",
    pesertaCount: 32,
  },
  {
    id: "5",
    judul: "Training Content Creator",
    waktu: "2025-02-20T10:00",
    lokasi: "PP Salafiyah",
    status: "UPCOMING",
    poster: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400&h=500&fit=crop",
    pesertaCount: 0,
  },
];

// Mock pesantren data for location combobox
const pesantrenList = [
  "Pondok Pesantren Nurul Huda",
  "Pondok Pesantren Al-Hikam",
  "Pondok Pesantren Darul Ulum",
  "Pondok Pesantren Salafiyah",
  "Pondok Pesantren Al-Amin",
];

const ManajemenEvent = () => {
  const { toast } = useToast();
  const [events, setEvents] = useState<EventData[]>(mockEvents);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Create event form state
  const [newEventForm, setNewEventForm] = useState({
    poster: null as File | null,
    posterPreview: "",
    judul: "",
    waktu: "",
    lokasi: "",
    lokasiManual: "",
  });

  const [lokasiSearch, setLokasiSearch] = useState("");
  const [showLokasiDropdown, setShowLokasiDropdown] = useState(false);

  const filteredPesantren = pesantrenList.filter((p) =>
    p.toLowerCase().includes(lokasiSearch.toLowerCase())
  );

  // Filter events based on status and search
  const filteredEvents = events.filter((event) => {
    const matchesStatus = statusFilter === "all" || event.status === statusFilter;
    const matchesSearch = event.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          event.lokasi.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleManageEvent = (event: EventData) => {
    setSelectedEvent(event);
  };

  const handleBackToGallery = () => {
    setSelectedEvent(null);
  };

  const handleUpdateEvent = (updatedEvent: EventData) => {
    setEvents(events.map((e) => (e.id === updatedEvent.id ? updatedEvent : e)));
    setSelectedEvent(updatedEvent);
  };

  const handlePosterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewEventForm({
        ...newEventForm,
        poster: file,
        posterPreview: URL.createObjectURL(file),
      });
    }
  };

  const handleCreateEvent = () => {
    if (!newEventForm.judul || !newEventForm.waktu) {
      toast({
        title: "Form tidak lengkap",
        description: "Mohon lengkapi judul dan waktu event.",
        variant: "destructive",
      });
      return;
    }

    const newEvent: EventData = {
      id: Date.now().toString(),
      judul: newEventForm.judul,
      waktu: newEventForm.waktu,
      lokasi: newEventForm.lokasi || newEventForm.lokasiManual || lokasiSearch,
      status: "UPCOMING",
      poster: newEventForm.posterPreview || undefined,
      pesertaCount: 0,
    };

    setEvents([newEvent, ...events]);
    setIsCreateModalOpen(false);
    setNewEventForm({
      poster: null,
      posterPreview: "",
      judul: "",
      waktu: "",
      lokasi: "",
      lokasiManual: "",
    });
    setLokasiSearch("");

    toast({
      title: "Event berhasil dibuat",
      description: "Event baru telah ditambahkan ke galeri.",
    });
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
          <h1 className="text-2xl font-bold text-foreground">Daftar Kegiatan Regional</h1>
          <p className="text-muted-foreground">
            {filteredEvents.length} event ditemukan
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
                <Label>Lokasi</Label>
                <div className="relative">
                  <Input
                    placeholder="Cari pesantren atau ketik lokasi..."
                    value={lokasiSearch}
                    onChange={(e) => {
                      setLokasiSearch(e.target.value);
                      setShowLokasiDropdown(true);
                      setNewEventForm({ ...newEventForm, lokasiManual: e.target.value, lokasi: "" });
                    }}
                    onFocus={() => setShowLokasiDropdown(true)}
                    onBlur={() => setTimeout(() => setShowLokasiDropdown(false), 200)}
                  />
                  {showLokasiDropdown && lokasiSearch && (
                    <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-40 overflow-y-auto">
                      {filteredPesantren.length > 0 ? (
                        filteredPesantren.map((p) => (
                          <div
                            key={p}
                            className="px-3 py-2 hover:bg-muted cursor-pointer text-sm"
                            onClick={() => {
                              setLokasiSearch(p);
                              setNewEventForm({ ...newEventForm, lokasi: p, lokasiManual: "" });
                              setShowLokasiDropdown(false);
                            }}
                          >
                            {p}
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                          Menggunakan input manual
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <Button onClick={handleCreateEvent} className="w-full bg-emerald-600 hover:bg-emerald-700">
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
      {filteredEvents.length > 0 ? (
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
