import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar, MapPin, Users, Clock, ArrowLeft,
  Tag, ExternalLink, ChevronDown, ChevronUp, Trophy,
  UserCheck, Globe,
} from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

import {
  getEventById, getEventStats, formatRupiah, EventStatus,
} from "@/lib/event-mock-data";
import RegisterForm from "@/components/registration/RegisterForm";

const STATUS_MAP: Record<EventStatus, { label: string; cls: string }> = {
  APPROVED:  { label: 'LIVE',    cls: 'bg-emerald-100 text-emerald-700 border border-emerald-200' },
  FINISHED:  { label: 'Selesai', cls: 'bg-slate-100 text-slate-500 border border-slate-200' },
  DRAFT:     { label: 'Draft',   cls: 'bg-yellow-100 text-yellow-700 border border-yellow-200' },
  PENDING:   { label: 'Pending', cls: 'bg-orange-100 text-orange-700 border border-orange-200' },
};

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [registerOpen, setRegisterOpen] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);

  const event = getEventById(id ?? '');

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-slate-400">
        <p className="text-xl font-bold">Event tidak ditemukan</p>
        <Button variant="outline" onClick={() => navigate('/events')}>← Kembali ke daftar event</Button>
      </div>
    );
  }

  const stats      = getEventStats(event.id);
  const status     = STATUS_MAP[event.status];
  const isLive     = event.status === 'APPROVED';
  const isFinished = event.status === 'FINISHED';
  const isFull     = event.registered_count >= event.quota;
  const pct        = Math.min((event.registered_count / event.quota) * 100, 100);

  const canRegister = isLive && !isFull;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Back nav */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate('/events')}
          className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="font-semibold text-slate-800 truncate text-sm">{event.title}</span>
        <Badge className={`ml-auto text-xs flex-shrink-0 ${status.cls}`}>{status.label}</Badge>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">

        {/* Hero Poster */}
        <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-video">
          <img src={event.poster_url} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute bottom-5 left-5 right-5">
            <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full mb-2 inline-block">
              {event.category}
            </span>
            <h1 className="text-white font-black text-xl sm:text-2xl leading-tight">{event.title}</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Main Info */}
          <div className="lg:col-span-2 space-y-6">

            {/* Quick Info Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: <Calendar className="w-4 h-4" />, label: 'Tanggal', val: format(new Date(event.date_start), 'dd MMM yyyy', { locale: idLocale }) },
                { icon: <Clock className="w-4 h-4" />, label: 'Waktu', val: format(new Date(event.date_start), 'HH:mm', { locale: idLocale }) + ' WIB' },
                { icon: <MapPin className="w-4 h-4" />, label: 'Lokasi', val: event.location.split(',')[0] },
                { icon: <Users className="w-4 h-4" />, label: 'Kuota', val: `${event.registered_count}/${event.quota}` },
              ].map(item => (
                <div key={item.label} className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm">
                  <div className="text-emerald-600 mb-1">{item.icon}</div>
                  <p className="text-xs text-slate-400">{item.label}</p>
                  <p className="text-sm font-semibold text-slate-800 truncate">{item.val}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h2 className="font-bold text-slate-900 mb-3">Tentang Event</h2>
              <div className={`text-slate-600 text-sm leading-relaxed whitespace-pre-line ${!descExpanded ? 'line-clamp-4' : ''}`}>
                {event.description}
              </div>
              {event.description.length > 200 && (
                <button
                  onClick={() => setDescExpanded(!descExpanded)}
                  className="text-emerald-600 text-sm font-medium mt-2 flex items-center gap-1 hover:underline"
                >
                  {descExpanded ? <><ChevronUp className="w-3.5 h-3.5" />Lebih sedikit</> : <><ChevronDown className="w-3.5 h-3.5" />Selengkapnya</>}
                </button>
              )}
            </div>

            {/* Speakers */}
            {event.speakers.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h2 className="font-bold text-slate-900 mb-4">Narasumber</h2>
                <div className="space-y-4">
                  {event.speakers.map((sp, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <img
                        src={sp.photo_url ?? 'https://placehold.co/80x80/166534/fff?text=?'}
                        alt={sp.name}
                        className="w-14 h-14 rounded-xl object-cover ring-2 ring-emerald-100"
                      />
                      <div>
                        <p className="font-bold text-slate-900">{sp.name}</p>
                        <p className="text-slate-500 text-sm">{sp.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Fields Preview */}
            {event.custom_fields.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h2 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-emerald-600" />
                  Formulir Pendaftaran
                </h2>
                <p className="text-slate-500 text-sm mb-3">Pertanyaan tambahan yang perlu dijawab saat mendaftar:</p>
                <div className="space-y-2">
                  {event.custom_fields.map(f => (
                    <div key={f.id} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="text-emerald-500 mt-0.5">•</span>
                      <span>{f.label}{f.is_required ? ' *' : ''}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h2 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />Lokasi
              </h2>
              <p className="text-slate-700 text-sm mb-3">{event.location}</p>
              {event.location_maps_url && (
                <a
                  href={event.location_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-emerald-600 font-medium hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />Buka di Google Maps
                </a>
              )}
            </div>
          </div>

          {/* Right: Registration Card (sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 bg-white rounded-2xl border border-slate-100 shadow-lg p-6 space-y-5">

              {isFinished ? (
                <div className="text-center py-4">
                  <Trophy className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="font-bold text-slate-600">Event Telah Selesai</p>
                  <p className="text-sm text-slate-400 mt-1">
                    {event.attended_count} dari {event.registered_count} peserta hadir
                  </p>
                </div>
              ) : (
                <>
                  {/* Pricing */}
                  <div className="space-y-3">
                    <h3 className="font-bold text-slate-900 text-sm">Harga Tiket</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between bg-emerald-50 rounded-xl px-4 py-3 border border-emerald-100">
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-emerald-600" />
                          <span className="text-sm font-medium text-slate-700">Anggota (NIAM)</span>
                        </div>
                        <span className="font-bold text-emerald-700">
                          {event.price_niam === 0 ? 'GRATIS' : formatRupiah(event.price_niam)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-slate-500" />
                          <span className="text-sm font-medium text-slate-700">Umum</span>
                        </div>
                        <span className="font-bold text-slate-700">
                          {event.price_umum === 0 ? 'GRATIS' : formatRupiah(event.price_umum)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quota progress */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Sisa kuota</span>
                      <span className="font-semibold">{event.quota - event.registered_count} tempat</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${pct >= 90 ? 'bg-red-400' : 'bg-emerald-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-400">{event.registered_count} dari {event.quota} peserta terdaftar</p>
                  </div>

                  {isFull ? (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center">
                      <p className="text-red-600 font-semibold text-sm">Kuota Penuh</p>
                      <p className="text-red-400 text-xs mt-1">Pendaftaran sudah ditutup</p>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setRegisterOpen(true)}
                      className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold h-12 rounded-xl shadow-md hover:shadow-lg transition-all"
                    >
                      Daftar Sekarang →
                    </Button>
                  )}
                </>
              )}

              <p className="text-xs text-center text-slate-400">
                Dibuat oleh {event.created_by} · {format(new Date(event.created_at), 'dd MMM yyyy', { locale: idLocale })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-6">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-lg font-black text-slate-900">Daftar Event</DialogTitle>
          </DialogHeader>
          <p className="text-slate-500 text-sm -mt-2 mb-4 line-clamp-1">{event.title}</p>
          <RegisterForm event={event} onClose={() => setRegisterOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventDetail;
