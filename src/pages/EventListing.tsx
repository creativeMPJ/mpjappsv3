import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, Users, Search, Tag, ArrowRight, Clock, CheckCircle, Trophy } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getPublicEvents, formatRupiah, MockEvent, EventStatus } from "@/lib/event-mock-data";

const STATUS_CONFIG: Record<EventStatus, { label: string; color: string; icon: React.ReactNode }> = {
  APPROVED: { label: 'LIVE', color: 'bg-emerald-500 text-white', icon: <span className="w-2 h-2 rounded-full bg-white animate-pulse inline-block mr-1.5" /> },
  FINISHED: { label: 'Selesai', color: 'bg-slate-500 text-white', icon: <CheckCircle className="w-3 h-3 mr-1" /> },
  DRAFT: { label: 'Draft', color: 'bg-yellow-500 text-white', icon: null },
  PENDING: { label: 'Pending', color: 'bg-orange-500 text-white', icon: null },
};

const CATEGORIES = ['Semua', 'Workshop', 'Rapat Koordinasi', 'Pelatihan', 'Festival'];

const EventCard = ({ event, onClick }: { event: MockEvent; onClick: () => void }) => {
  const status = STATUS_CONFIG[event.status];
  const isFree = event.price_umum === 0;
  const isFull = event.registered_count >= event.quota;
  const isFinished = event.status === 'FINISHED';

  return (
    <div
      onClick={onClick}
      className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col"
    >
      {/* Poster */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={event.poster_url}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        {/* Status badge */}
        <span className={`absolute top-3 left-3 inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full ${status.color}`}>
          {status.icon}{status.label}
        </span>
        {/* Category */}
        <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-slate-700 text-xs font-medium px-2 py-0.5 rounded-full">
          {event.category}
        </span>
        {/* Price badge */}
        <div className="absolute bottom-3 left-3">
          {isFree ? (
            <span className="bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">GRATIS (Anggota)</span>
          ) : (
            <span className="bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-bold px-2.5 py-1 rounded-full">
              ab {formatRupiah(event.price_umum)}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-slate-900 text-base leading-tight group-hover:text-emerald-700 transition-colors mb-3 line-clamp-2">
          {event.title}
        </h3>

        <div className="space-y-2 text-sm text-slate-500 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span>{format(new Date(event.date_start), 'dd MMM yyyy', { locale: idLocale })}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span>{event.registered_count} / {event.quota} peserta</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${isFull ? 'bg-red-400' : 'bg-emerald-500'}`}
              style={{ width: `${Math.min((event.registered_count / event.quota) * 100, 100)}%` }}
            />
          </div>
          {isFull && <p className="text-xs text-red-500 mt-1 font-medium">Kuota penuh</p>}
        </div>

        <div className="mt-auto">
          <Button
            className={`w-full text-sm font-semibold rounded-xl h-9 ${
              isFinished || isFull
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed hover:bg-slate-100'
                : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white'
            }`}
            disabled={isFinished || isFull}
          >
            {isFinished ? (
              <><Trophy className="w-4 h-4 mr-1.5" />Event Selesai</>
            ) : isFull ? (
              'Kuota Penuh'
            ) : (
              <>Lihat Detail <ArrowRight className="w-4 h-4 ml-1.5" /></>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

const EventListing = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');

  const allEvents = getPublicEvents();

  const filtered = allEvents.filter(e => {
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.location.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'Semua' || e.category === activeCategory;
    return matchSearch && matchCat;
  });

  const liveCount = allEvents.filter(e => e.status === 'APPROVED').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/3" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 py-16 sm:py-20">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
            <span className="text-emerald-300 text-sm font-medium uppercase tracking-widest">{liveCount} Event Aktif</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black mb-3 leading-tight">
            Event & Pelatihan<br />
            <span className="text-emerald-300">Media Pesantren</span>
          </h1>
          <p className="text-emerald-100 text-base max-w-xl mb-8">
            Tingkatkan kapasitas kru media pesantrenmu. Daftar sekarang dan dapatkan harga khusus untuk anggota MPJ.
          </p>

          {/* Search */}
          <div className="relative max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari event atau lokasi..."
              className="pl-11 h-12 bg-white/95 border-0 text-slate-900 placeholder:text-slate-400 rounded-xl shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <Tag className="w-4 h-4 text-slate-400 flex-shrink-0" />
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 text-sm font-medium px-4 py-1.5 rounded-full transition-all ${
                activeCategory === cat
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
          <span className="ml-auto text-slate-400 text-sm flex-shrink-0">{filtered.length} event</span>
        </div>
      </div>

      {/* Event Grid */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">Tidak ada event ditemukan</p>
            <p className="text-slate-400 text-sm mt-1">Coba ubah kata kunci atau kategori</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(event => (
              <EventCard
                key={event.id}
                event={event}
                onClick={() => navigate(`/events/${event.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Info Bar */}
      <div className="border-t border-slate-100 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>Anggota MPJ (pemilik NIAM) mendapat harga khusus atau gratis</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/login')} className="text-emerald-700 border-emerald-200">
            Masuk sebagai Anggota
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EventListing;
