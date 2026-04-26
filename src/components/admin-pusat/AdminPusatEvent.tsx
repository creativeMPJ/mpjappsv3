import { useState, useRef, useEffect } from "react";
import { Plus, Calendar, MapPin, Users, ChevronRight, CheckCircle, XCircle, Clock, Eye, EyeOff, Download, Search, Filter, MoreHorizontal, Trash2, Edit, QrCode, DollarSign, Settings, Info, Wallet, CreditCard, Phone, FileText, Award, UploadCloud, File, Upload, Type, Image as ImageIcon, Camera } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

import {
  MOCK_EVENTS, MOCK_PARTICIPANTS, MockEvent, MockParticipant, EventStatus,
  getParticipantsByEvent, getEventStats, formatRupiah,
  Speaker, MOCK_SPEAKERS
} from "@/lib/event-mock-data";

// ─── Status helpers ───────────────────────────────────────────────────────────

const EVENT_STATUS_COLORS: Record<EventStatus, string> = {
  DRAFT:    "bg-slate-100 text-slate-600 border-slate-200",
  PENDING:  "bg-amber-100 text-amber-700 border-amber-200",
  APPROVED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  FINISHED: "bg-blue-100 text-blue-700 border-blue-200",
};

const TICKET_STATUS_COLORS: Record<string, string> = {
  PENDING_PAYMENT:  "bg-slate-100 text-slate-600",
  PENDING_APPROVAL: "bg-amber-100 text-amber-700",
  PAID:             "bg-emerald-100 text-emerald-700",
  ATTENDED:         "bg-teal-100 text-teal-700",
  REJECTED:         "bg-red-100 text-red-700",
};

const TICKET_STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT:  "Belum Bayar",
  PENDING_APPROVAL: "Verifikasi",
  PAID:             "Lunas",
  ATTENDED:         "Hadir",
  REJECTED:         "Ditolak",
};

// ─── Stat card ────────────────────────────────────────────────────────────────

const StatCard = ({ label, value, sub, color }: { label: string; value: number | string; sub?: string; color: string }) => (
  <div className={`rounded-2xl border p-5 ${color}`}>
    <p className="text-sm font-medium opacity-70">{label}</p>
    <p className="text-3xl font-black mt-1">{value}</p>
    {sub && <p className="text-xs opacity-60 mt-0.5">{sub}</p>}
  </div>
);

const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5 shrink-0">{icon}</div>
    <div>
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{label}</p>
      <p className="text-sm text-slate-900 font-semibold mt-0.5">{value}</p>
    </div>
  </div>
);

// ─── Event row card ───────────────────────────────────────────────────────────

const EventRow = ({
  event,
  onSelect,
  onStatusChange,
}: {
  event: MockEvent;
  onSelect: () => void;
  onStatusChange: (id: string, status: EventStatus) => void;
}) => {
  const stats = getEventStats(event.id);
  const pct = Math.round((event.registered_count / event.quota) * 100);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-5">
      <div className="flex items-start gap-4">
        <img src={event.poster_url} alt={event.title} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Badge className={`text-xs border ${EVENT_STATUS_COLORS[event.status]}`}>{event.status}</Badge>
            <span className="text-xs text-slate-400">{event.category}</span>
          </div>
          <h3 className="font-bold text-slate-900 truncate">{event.title}</h3>
          <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{format(new Date(event.date_start || new Date()), "dd MMM yyyy", { locale: idLocale })}</span>
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{event.location?.split(",")[0] || "-"}</span>
            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{event.registered_count}/{event.quota}</span>
          </div>
          {/* Progress */}
          <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden w-48">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(pct, 100)}%` }} />
          </div>
        </div>
        <div className="flex flex-col gap-2 flex-shrink-0">
          <Button size="sm" variant="outline" onClick={onSelect} className="rounded-xl text-xs h-8">
            <Eye className="w-3.5 h-3.5 mr-1" />Detail
          </Button>
          {event.status === "DRAFT" && (
            <Button size="sm" onClick={() => onStatusChange(event.id, "APPROVED")} className="rounded-xl text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white">
              <CheckCircle className="w-3.5 h-3.5 mr-1" />Approve
            </Button>
          )}
          {event.status === "APPROVED" && (
            <Button size="sm" variant="outline" onClick={() => onStatusChange(event.id, "FINISHED")} className="rounded-xl text-xs h-8 text-blue-600 border-blue-200">
              Tutup Event
            </Button>
          )}
        </div>
      </div>
      {/* Quick stats */}
      <div className="grid grid-cols-5 gap-2 mt-4 pt-4 border-t border-slate-50 text-center text-xs">
        {[
          { label: "Terdaftar", val: stats.total },
          { label: "Belum Bayar", val: stats.pending_payment },
          { label: "Verifikasi", val: stats.pending_approval },
          { label: "Lunas", val: stats.paid },
          { label: "Hadir", val: stats.attended },
        ].map(s => (
          <div key={s.label}>
            <p className="font-bold text-slate-900">{s.val}</p>
            <p className="text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Participant table ────────────────────────────────────────────────────────

const ParticipantTable = ({
  participants,
  onApprove,
  onReject,
}: {
  participants: MockParticipant[];
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
}) => {
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs">
            <tr>
              {["Peserta", "Jalur", "WA", "Status", "Total", "Bukti", "Aksi"].map(h => (
                <th key={h} className="text-left px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {participants.map(p => (
              <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-900">{p.full_name}</p>
                  {p.niam && <p className="text-xs text-emerald-600 font-mono">{p.niam}</p>}
                  <p className="text-xs text-slate-400">{p.institution}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge className={`text-xs ${p.type === "NIAM" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                    {p.type}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 text-xs">{p.whatsapp}</span>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-6 w-6 p-0 rounded-full text-green-600 hover:bg-green-50"
                      onClick={() => window.open(`https://wa.me/${p.whatsapp.replace(/\D/g, '')}`, '_blank')}
                    >
                      <Phone className="w-3 h-3" />
                    </Button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge className={`text-xs ${TICKET_STATUS_COLORS[p.ticket_status]}`}>
                    {TICKET_STATUS_LABELS[p.ticket_status]}
                  </Badge>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-700">
                  {p.total_amount > 0 ? formatRupiah(p.total_amount) : "Gratis"}
                </td>
                <td className="px-4 py-3">
                  {p.payment_proof_url ? (
                    <a href={p.payment_proof_url} target="_blank" rel="noreferrer">
                      <img src={p.payment_proof_url} alt="bukti" className="w-10 h-10 rounded-lg object-cover border border-slate-200 hover:scale-150 transition-transform" />
                    </a>
                  ) : (
                    <span className="text-slate-300 text-xs">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {p.ticket_status === "PENDING_APPROVAL" && (
                    <div className="flex gap-1.5">
                      <Button size="sm" onClick={() => onApprove(p.id)} className="h-7 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-2">
                        <CheckCircle className="w-3 h-3 mr-1" />OK
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setRejectId(p.id)} className="h-7 text-xs rounded-lg border-red-200 text-red-600 hover:bg-red-50 px-2">
                        <XCircle className="w-3 h-3 mr-1" />Tolak
                      </Button>
                    </div>
                  )}
                  {p.ticket_status === "ATTENDED" && (
                    <span className="text-xs text-teal-600 font-medium flex items-center gap-1"><CheckCircle className="w-3 h-3" />Hadir</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {participants.length === 0 && (
          <div className="text-center py-10 text-slate-400 text-sm">Belum ada peserta terdaftar</div>
        )}
      </div>

      {/* Reject dialog */}
      <Dialog open={!!rejectId} onOpenChange={() => setRejectId(null)}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>Tolak Pembayaran</DialogTitle>
            <DialogDescription>Berikan alasan penolakan agar peserta dapat memperbaiki.</DialogDescription>
          </DialogHeader>
          <Textarea
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            placeholder="Contoh: Nominal transfer tidak sesuai..."
            rows={3}
            className="rounded-xl"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectId(null)}>Batal</Button>
            <Button
              onClick={() => { if (rejectId) { onReject(rejectId, rejectReason); setRejectId(null); setRejectReason(""); } }}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
              disabled={!rejectReason.trim()}
            >
              Konfirmasi Tolak
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

// ─── SECTION HEADER ──────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 mb-5 border-b border-slate-50 pb-4">
      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h2 className="font-bold text-slate-800 text-sm leading-tight">{title}</h2>
        <p className="text-[11px] text-slate-400 mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

// ─── ADVANCED CREATE EVENT FORM ──────────────────────────────────────────────

const AdvancedCreateEventForm = ({ onCancel }: { onCancel: () => void }) => {
  const { toast } = useToast();
  const [isPaid, setIsPaid] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'manual' | 'gateway'>('manual');
  
  const [locationType, setLocationType] = useState<'offline' | 'online'>('offline');
  const [onlinePlatform, setOnlinePlatform] = useState<'Google Meet' | 'Zoom'>('Google Meet');
  
  const [customFields, setCustomFields] = useState<{ id: string; label: string; type: string; required: boolean; options: string }[]>([]);
  const [selectedSpeakerId, setSelectedSpeakerId] = useState<string>("");

  const [eventType, setEventType] = useState("Non-Kelas");
  const [eventClasses, setEventClasses] = useState<{ id: string; name: string; quota: string }[]>([]);

  const addClass = () => {
    setEventClasses([...eventClasses, { id: Math.random().toString(), name: "", quota: "" }]);
  };

  const addField = () => {
    setCustomFields([...customFields, { id: Math.random().toString(), label: '', type: 'TEXT', required: false, options: '' }]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Event berhasil dibuat", description: "Event disimpan sebagai DRAFT dan siap dikelola." });
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-12 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Form */}
      <div className="flex items-center gap-3">
        <Button type="button" variant="ghost" size="icon" onClick={onCancel} className="rounded-xl hover:bg-slate-100">
          <ChevronRight className="w-5 h-5 rotate-180 text-slate-500" />
        </Button>
        <div>
          <h1 className="text-xl font-black text-slate-900">Buat Event Baru</h1>
          <p className="text-sm text-slate-500">Event akan tersimpan sebagai DRAFT terlebih dahulu</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* SECTION 1: INFO DASAR */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
          <SectionHeader icon={Calendar} title="Info Dasar" desc="Informasi utama event" />
          
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-500 uppercase">Nama Event *</Label>
            <Input required placeholder="Contoh: Workshop Jurnalistik 2026" className="rounded-xl h-11 border-slate-200" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-500 uppercase">Kategori *</Label>
              <Select defaultValue="Workshop">
                <SelectTrigger className="rounded-xl h-11 border-slate-200">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {["Workshop", "Pelatihan", "Festival", "Rapat Koordinasi", "Seminar"].map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-500 uppercase">Tipe Event *</Label>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger className="rounded-xl h-11 border-slate-200">
                  <SelectValue placeholder="Pilih tipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Non-Kelas">Non-Kelas</SelectItem>
                  <SelectItem value="Sistem Kelas">Sistem Kelas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {eventType === "Sistem Kelas" && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Manajemen Kelas</h3>
                  <p className="text-[11px] text-slate-500">Tentukan kelas-kelas yang tersedia beserta kuotanya</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addClass} className="h-8 text-[11px] font-bold rounded-lg border-slate-200 bg-white">
                  + Tambah Kelas
                </Button>
              </div>

              <div className="space-y-3">
                {eventClasses.map((cls, idx) => (
                  <div key={cls.id} className="flex items-center gap-3 relative group">
                    <div className="flex-1 space-y-1.5">
                      <Label className="text-[10px] font-bold text-slate-400">Nama Kelas</Label>
                      <Input placeholder="Contoh: Kelas Pemula" className="rounded-xl h-9 text-sm bg-white" />
                    </div>
                    <div className="w-24 space-y-1.5">
                      <Label className="text-[10px] font-bold text-slate-400">Kuota</Label>
                      <Input type="number" placeholder="20" className="rounded-xl h-9 text-sm bg-white" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setEventClasses(eventClasses.filter(c => c.id !== cls.id))}
                      className="mt-5 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {eventClasses.length === 0 && (
                  <div className="py-4 text-center border-2 border-dashed border-slate-200 rounded-xl bg-white">
                    <p className="text-xs text-slate-400">Belum ada kelas yang ditambahkan.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-500 uppercase">Tanggal *</Label>
              <Input type="date" required className="rounded-xl h-11 border-slate-200" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-500 uppercase">Jam Mulai</Label>
              <Input type="time" className="rounded-xl h-11 border-slate-200" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-500 uppercase">Poster Event</Label>
            <div className="w-full rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-center p-10 hover:bg-slate-100 transition-colors cursor-pointer group">
              <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
                  <path d="M4 16L8.586 11.414C8.96106 11.0391 9.46967 10.8284 10 10.8284C10.5303 10.8284 11.0389 11.0391 11.414 11.414L16 16M14 14L15.586 12.414C15.9611 12.0391 16.4697 11.8284 17 11.8284C17.5303 11.8284 18.0389 12.0391 18.414 12.414L20 14M14 8H14.01M6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-sm font-bold text-slate-700">Drag & drop poster</p>
              <p className="text-sm text-slate-500 mb-2">atau <span className="text-[#166534]">klik untuk memilih file</span></p>
              <p className="text-[10px] text-slate-400">JPG / WebP / PNG • Rasio 4:5 • Maks 100KB</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-500 uppercase">Deskripsi Event</Label>
            <Textarea placeholder="Tuliskan deskripsi singkat tentang event ini..." className="rounded-xl min-h-[120px] border-slate-200 resize-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-500 uppercase">Maks. Peserta</Label>
              <Input type="number" placeholder="Kosongkan jika tidak terbatas" className="rounded-xl h-11 border-slate-200" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-500 uppercase">Batas Pendaftaran</Label>
              <Input type="datetime-local" className="rounded-xl h-11 border-slate-200" />
            </div>
          </div>
        </div>

        {/* SECTION 2: LOKASI */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
          <SectionHeader icon={MapPin} title="Lokasi" desc="Tempat pelaksanaan event" />
          
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-500 uppercase">Jenis Lokasi *</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setLocationType('offline')}
                className={`p-3 rounded-xl border-2 text-sm font-bold transition-all ${locationType === 'offline' ? 'border-[#166534] bg-emerald-50 text-[#166534]' : 'border-slate-100 text-slate-500 hover:border-slate-300'}`}
              >
                Offline
              </button>
              <button
                type="button"
                onClick={() => setLocationType('online')}
                className={`p-3 rounded-xl border-2 text-sm font-bold transition-all ${locationType === 'online' ? 'border-[#166534] bg-emerald-50 text-[#166534]' : 'border-slate-100 text-slate-500 hover:border-slate-300'}`}
              >
                Online
              </button>
            </div>
          </div>

          {locationType === 'offline' ? (
            <>
              <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                <Label className="text-xs font-bold text-slate-500 uppercase">Nama Lokasi *</Label>
                <Input required placeholder="Contoh: Gedung MPJ, Jakarta Pusat" className="rounded-xl h-11 border-slate-200" />
              </div>
              <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                <Label className="text-xs font-bold text-slate-500 uppercase">Link Google Maps</Label>
                <Input placeholder="https://maps.google.com/..." className="rounded-xl h-11 border-slate-200" />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                <Label className="text-xs font-bold text-slate-500 uppercase">Platform Online *</Label>
                <Select value={onlinePlatform} onValueChange={(val: any) => setOnlinePlatform(val)}>
                  <SelectTrigger className="rounded-xl h-11 border-slate-200">
                    <SelectValue placeholder="Pilih platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Google Meet">Google Meet</SelectItem>
                    <SelectItem value="Zoom">Zoom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                <Label className="text-xs font-bold text-slate-500 uppercase">Link Meeting *</Label>
                <Input required placeholder={onlinePlatform === 'Google Meet' ? "https://meet.google.com/..." : "https://zoom.us/j/..."} className="rounded-xl h-11 border-slate-200" />
              </div>
            </>
          )}
        </div>

        {/* SECTION 3: PENGATURAN PESERTA & CUSTOM FORM */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
          <SectionHeader icon={Users} title="Pengaturan Peserta" desc="Siapa yang bisa mendaftar & pertanyaan tambahan" />
          
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div>
              <p className="text-sm font-bold text-slate-800">Buka Jalur Umum</p>
              <p className="text-[11px] text-slate-500">Izinkan peserta non-anggota (tanpa NIAM) mendaftar</p>
            </div>
            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
          </div>

          <div className="pt-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <Label className="text-sm font-bold text-slate-800">Pertanyaan Tambahan Pendaftaran</Label>
                <p className="text-[11px] text-slate-500">Kumpulkan info spesifik seperti ukuran baju, riwayat medis, dll</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addField} className="h-8 text-[11px] font-bold rounded-lg border-slate-200">
                + Tambah Field
              </Button>
            </div>

            <div className="space-y-3">
              {customFields.map((field, idx) => (
                <div key={field.id} className="p-4 bg-white border border-slate-200 rounded-2xl relative group">
                  <button type="button" onClick={() => setCustomFields(customFields.filter(f => f.id !== field.id))} className="absolute -top-2 -right-2 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <XCircle className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-slate-400">Pertanyaan #{idx+1}</Label>
                      <Input placeholder="Misal: Ukuran Baju" className="rounded-xl h-9 border-slate-100 text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-slate-400">Tipe Input</Label>
                      <Select defaultValue="TEXT">
                        <SelectTrigger className="rounded-xl h-9 border-slate-100 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TEXT">Teks Pendek</SelectItem>
                          <SelectItem value="TEXTAREA">Paragraf</SelectItem>
                          <SelectItem value="RADIO">Pilihan Ganda</SelectItem>
                          <SelectItem value="CHECKBOX">Kotak Centang</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
              {customFields.length === 0 && (
                <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50">
                  <p className="text-xs text-slate-400">Belum ada pertanyaan tambahan.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 4: PEMBAYARAN */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
          <SectionHeader icon={CreditCard} title="Pembayaran" desc="Konfigurasi biaya & metode bayar" />
          
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div>
              <p className="text-sm font-bold text-slate-800">Event Berbayar</p>
              <p className="text-[11px] text-slate-500">Aktifkan jika peserta perlu membayar tiket</p>
            </div>
            <Switch checked={isPaid} onCheckedChange={setIsPaid} />
          </div>

          {isPaid && (
            <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase">Harga Anggota (NIAM)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
                    <Input type="number" defaultValue="0" className="rounded-xl h-10 pl-9 font-bold" />
                  </div>
                  <p className="text-[10px] text-slate-400">Bisa Rp 0 (gratis untuk anggota)</p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase">Harga Umum</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
                    <Input type="number" defaultValue="0" className="rounded-xl h-10 pl-9 font-bold" />
                  </div>
                </div>
              </div>

              <div className="pt-2 space-y-3">
                <p className="text-xs font-bold text-slate-500 uppercase">Metode Pembayaran</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('manual')}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${paymentMethod === 'manual' ? 'border-[#166534] bg-emerald-50' : 'border-slate-100 hover:border-slate-300'}`}
                  >
                    <div className="text-left">
                      <p className={`text-xs font-bold ${paymentMethod === 'manual' ? 'text-[#166534]' : 'text-slate-800'}`}>Transfer Manual</p>
                      <p className="text-[9px] text-slate-400 mt-0.5">Kode unik 3 digit</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('gateway')}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${paymentMethod === 'gateway' ? 'border-[#166534] bg-emerald-50' : 'border-slate-100 hover:border-slate-300'}`}
                  >
                    <div className="text-left">
                      <p className={`text-xs font-bold ${paymentMethod === 'gateway' ? 'text-[#166534]' : 'text-slate-800'}`}>Midtrans Snap</p>
                      <p className="text-[9px] text-slate-400 mt-0.5">QRIS, VA, dll</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Rekening Tujuan untuk Manual */}
              {paymentMethod === 'manual' && (
                <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100 mt-4 animate-in fade-in">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Rekening Tujuan</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-slate-400">Nama Bank</Label>
                      <Input placeholder="BCA, BSI..." className="rounded-xl h-9 text-sm bg-white" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-slate-400">No. Rekening</Label>
                      <Input placeholder="1234567890" className="rounded-xl h-9 text-sm bg-white" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-slate-400">Atas Nama</Label>
                      <Input placeholder="MPJ Indonesia" className="rounded-xl h-9 text-sm bg-white" />
                    </div>
                  </div>
                </div>
              )}

              {/* API Key untuk Gateway */}
              {paymentMethod === 'gateway' && (
                <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100 mt-4 animate-in fade-in">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kredensial Payment Gateway (Midtrans)</p>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-slate-400">Server Key / API Key</Label>
                      <Input type="password" placeholder="SB-Mid-server-..." className="rounded-xl h-9 text-sm bg-white font-mono" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-slate-400">Client Key</Label>
                      <Input placeholder="SB-Mid-client-..." className="rounded-xl h-9 text-sm bg-white font-mono" />
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400">Penting: Pastikan key yang dimasukkan sesuai dengan mode (Sandbox/Production).</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* SECTION 5: NARASUMBER */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
          <SectionHeader icon={Users} title="Narasumber" desc="Pilih narasumber utama event" />
          
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-500 uppercase">Narasumber Utama</Label>
            <Select value={selectedSpeakerId} onValueChange={setSelectedSpeakerId}>
              <SelectTrigger className="rounded-xl h-11 border-slate-200">
                <SelectValue placeholder="Cari nama atau keahlian narasumber..." />
              </SelectTrigger>
              <SelectContent>
                {MOCK_SPEAKERS.map(speaker => (
                  <SelectItem key={speaker.id} value={speaker.id}>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-100 overflow-hidden shrink-0">
                        <img src={speaker.foto_url} alt={speaker.nama_lengkap} className="w-full h-full object-cover" />
                      </div>
                      <span className="font-medium">{speaker.nama_lengkap}</span>
                      <span className="text-slate-400 text-xs ml-1">({speaker.kategori})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[10px] text-slate-400">Pilih dari daftar narasumber terdaftar</p>
          </div>

          <div className="pt-2">
            {!selectedSpeakerId ? (
              <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50">
                <p className="text-xs text-slate-400">Belum ada narasumber. Klik tombol di bawah untuk menambahkan.</p>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-xl space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-slate-500">Narasumber Terpilih</p>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedSpeakerId("")} className="h-6 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg">
                    Hapus
                  </Button>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-200 overflow-hidden shrink-0">
                    <img src={MOCK_SPEAKERS.find(s => s.id === selectedSpeakerId)?.foto_url} alt="Speaker" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{MOCK_SPEAKERS.find(s => s.id === selectedSpeakerId)?.nama_lengkap}</p>
                    <p className="text-xs text-slate-500 line-clamp-1">{MOCK_SPEAKERS.find(s => s.id === selectedSpeakerId)?.bio}</p>
                  </div>
                </div>
              </div>
            )}
            <Button type="button" variant="outline" className="w-full mt-4 border-dashed border-slate-200 text-slate-500 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 rounded-xl h-11">
              <Plus className="w-4 h-4 mr-2" /> Tambah Narasumber Tambahan
            </Button>
          </div>
        </div>

      </div>

      <div className="flex gap-3 pt-6 border-t border-slate-100">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1 rounded-xl h-12 font-bold border-slate-200">
          Batal
        </Button>
        <Button type="submit" className="flex-1 bg-[#166534] hover:bg-[#114d27] text-white rounded-xl h-12 font-bold">
          Simpan sebagai Draft
        </Button>
      </div>
    </form>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const AdminPusatEvent = () => {
  const { toast } = useToast();
  const [events, setEvents] = useState<MockEvent[]>(MOCK_EVENTS);
  const [participants, setParticipants] = useState<MockParticipant[]>(MOCK_PARTICIPANTS);
  const [selectedEvent, setSelectedEvent] = useState<MockEvent | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<EventStatus | "ALL">("ALL");
  const [ptSearch, setPtSearch] = useState("");
  const [ptFilter, setPtFilter] = useState("ALL");
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedBerita, setUploadedBerita] = useState<{name: string, date: string, size: string} | null>(null);
  
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "Perubahan belum disimpan, apakah Anda yakin ingin keluar?";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Drag state for certificate template
  const [dragVars, setDragVars] = useState({
    nama: { x: 50, y: 45, scale: 1, visible: true },
    instansi: { x: 50, y: 52, scale: 1, visible: true },
    nomor: { x: 50, y: 20, scale: 1, visible: true },
    foto: { x: 20, y: 80, scale: 1, visible: true }
  });
  const [draggingVar, setDraggingVar] = useState<keyof typeof dragVars | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Tambah SDM state
  const [showAddSdmModal, setShowAddSdmModal] = useState(false);
  const [sdmNiamInput, setSdmNiamInput] = useState("");

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!draggingVar || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    let x = ((e.clientX - rect.left) / rect.width) * 100;
    let y = ((e.clientY - rect.top) / rect.height) * 100;
    x = Math.max(0, Math.min(100, x));
    y = Math.max(0, Math.min(100, y));
    setDragVars(prev => ({ ...prev, [draggingVar]: { x, y } }));
  };

  const handleCanvasMouseUp = () => {
    setDraggingVar(null);
  };

  // Status change
  const handleStatusChange = (id: string, status: EventStatus) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, status } : e));
    if (selectedEvent?.id === id) setSelectedEvent(prev => prev ? { ...prev, status } : null);
    
    setHasUnsavedChanges(true);

    if (status === 'FINISHED') {
      toast({ 
        title: "Event Selesai!", 
        description: "Notifikasi otomatis & sertifikat sedang dikirim ke semua peserta via WhatsApp.",
        duration: 5000,
      });
    } else {
      toast({ title: `Event ${status === "APPROVED" ? "disetujui" : "diubah"}`, description: `Status berhasil diubah ke ${status}.` });
    }
  };

  const handleAddSdm = () => {
    if (!sdmNiamInput.trim()) return;
    
    // Validasi dummy: cek di MOCK_PARTICIPANTS atau asumsi "NIAM-" valid
    const isValid = sdmNiamInput.toUpperCase().startsWith("NIAM-");
    
    if (!isValid) {
      toast({
        variant: "destructive",
        title: "Gagal Menambahkan SDM",
        description: `NIAM ${sdmNiamInput} tidak ditemukan di sistem. Pastikan NIAM terdaftar.`,
      });
      return;
    }

    toast({
      title: "SDM Berhasil Ditambahkan",
      description: `Panitia dengan NIAM ${sdmNiamInput} telah ditambahkan ke event ini.`,
    });
    setSdmNiamInput("");
    setShowAddSdmModal(false);
  };

  // Payment approval
  const handleApprove = (pid: string) => {
    setParticipants(prev => prev.map(p => p.id === pid ? { ...p, ticket_status: "PAID" as const, paid_at: new Date().toISOString() } : p));
    toast({ title: "Pembayaran dikonfirmasi", description: "Peserta mendapat status PAID dan QR tiket aktif." });
  };

  const handleReject = (pid: string, reason: string) => {
    setParticipants(prev => prev.map(p => p.id === pid ? { ...p, ticket_status: "REJECTED" as const, rejection_reason: reason } : p));
    toast({ title: "Pembayaran ditolak", description: reason, variant: "destructive" });
  };

  // Filtered events
  const filteredEvents = events.filter(e => {
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "ALL" || e.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // Global stats
  const totalEvents   = events.length;
  const liveEvents    = events.filter(e => e.status === "APPROVED").length;
  const pendingApprovals = participants.filter(p => p.ticket_status === "PENDING_APPROVAL").length;
  const totalRevenue  = participants.filter(p => ["PAID","ATTENDED"].includes(p.ticket_status)).reduce((sum, p) => sum + p.total_amount, 0);

  // ── CREATE VIEW ──
  if (isCreating) {
    return <AdvancedCreateEventForm onCancel={() => setIsCreating(false)} />;
  }

  // ── EVENT DETAIL VIEW ──
  if (selectedEvent) {
    const evParticipants = participants.filter(p => p.event_id === selectedEvent.id);
    const stats = {
      total: evParticipants.length,
      paid: evParticipants.filter(p => ["PAID", "ATTENDED"].includes(p.ticket_status)).length,
      pending_approval: evParticipants.filter(p => p.ticket_status === "PENDING_APPROVAL").length,
      attended: evParticipants.filter(p => p.ticket_status === "ATTENDED").length,
      revenue: evParticipants.filter(p => ["PAID", "ATTENDED"].includes(p.ticket_status)).reduce((sum, p) => sum + p.total_amount, 0),
    };

    const filteredPt = evParticipants.filter(p => {
      const matchS = p.full_name.toLowerCase().includes(ptSearch.toLowerCase()) || (p.niam ?? "").toLowerCase().includes(ptSearch.toLowerCase());
      const matchF = ptFilter === "ALL" || p.ticket_status === ptFilter;
      return matchS && matchF;
    });

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-400">
        {/* Header */}
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" onClick={() => setSelectedEvent(null)} className="rounded-xl hover:bg-slate-100 mt-1">
            <ChevronRight className="w-5 h-5 rotate-180" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-black text-slate-900 line-clamp-1">{selectedEvent.title}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge className={`text-[10px] uppercase font-bold border ${EVENT_STATUS_COLORS[selectedEvent.status]}`}>
                {selectedEvent.status}
              </Badge>
              <span className="text-xs text-slate-400">{selectedEvent.category}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-xl h-9 text-xs">
              <Download className="w-3.5 h-3.5 mr-1.5" />Ekspor
            </Button>
          </div>
        </div>

        {/* 6-Tab System */}
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="bg-slate-100 rounded-xl h-auto p-1 flex flex-wrap gap-1 w-full justify-start border border-slate-200/50">
              {[
              { value: 'info', label: 'Info & Acara', icon: Info },
              { value: 'sdm', label: 'SDM / Panitia', icon: Users },
              { value: 'peserta', label: 'Peserta', icon: Users },
              { value: 'keuangan', label: 'Keuangan', icon: DollarSign },
              { value: 'absensi', label: 'Absensi', icon: QrCode },
              { value: 'sertifikat', label: 'Sertifikat', icon: Award },
              { value: 'laporan', label: 'Laporan', icon: FileText },
              { value: 'dokumentasi', label: 'Dokumentasi', icon: Camera },
              { value: 'status', label: 'Pengaturan', icon: Settings },
            ].map(({ value, label, icon: Icon }) => (
              <TabsTrigger key={value} value={value} className="flex items-center gap-1.5 text-xs font-semibold rounded-lg px-3 py-1.5 data-[state=active]:bg-[#166534] data-[state=active]:text-white">
                <Icon className="w-3.5 h-3.5" />{label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Tab 1: Info & Acara */}
          <TabsContent value="info" className="mt-4 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-5">
              <div className="aspect-video w-full max-h-[300px] overflow-hidden rounded-xl border border-slate-100">
                <img src={selectedEvent.poster_url} alt={selectedEvent.title} className="w-full h-full object-cover" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoRow icon={<Calendar className="w-4 h-4 text-amber-500" />} label="Waktu" value={`${format(new Date(selectedEvent.date_start || new Date()), "dd MMM yyyy", { locale: idLocale })} — ${format(new Date(selectedEvent.date_end || new Date()), "dd MMM yyyy", { locale: idLocale })}`} />
                <InfoRow icon={<MapPin className="w-4 h-4 text-amber-500" />} label="Lokasi" value={selectedEvent.location || "-"} />
                <InfoRow icon={<Users className="w-4 h-4 text-amber-500" />} label="Kapasitas" value={`${selectedEvent.registered_count} / ${selectedEvent.quota} Peserta Terdaftar`} />
                <InfoRow icon={<DollarSign className="w-4 h-4 text-amber-500" />} label="Biaya" value={`NIAM: ${formatRupiah(selectedEvent.price_niam)} | Umum: ${formatRupiah(selectedEvent.price_umum)}`} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Deskripsi Event</p>
                <p className="text-sm text-slate-600 leading-relaxed">{selectedEvent.description}</p>
              </div>
            </div>
          </TabsContent>

          {/* Tab 2: SDM (Narasumber/Panitia) */}
          <TabsContent value="sdm" className="mt-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-sm">Daftar Narasumber & Panitia</h3>
                <Button size="sm" variant="outline" className="h-7 text-xs rounded-lg bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" onClick={() => setShowAddSdmModal(true)}>+ Tambah SDM</Button>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Dummy speakers list directly mapped from MOCK_SPEAKERS */}
                {MOCK_SPEAKERS.slice(0, 2).map((speaker) => (
                  <div key={speaker.id} className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                    <img src={speaker.foto_url} alt={speaker.nama_lengkap} className="w-12 h-12 rounded-full object-cover border-2 border-emerald-100 shadow-sm" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 text-sm line-clamp-1">{speaker.nama_lengkap}</p>
                      <p className="text-xs text-slate-500 line-clamp-1">{speaker.kategori} • {speaker.alamat}</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0">Narasumber</Badge>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Tab 3: Peserta */}
          <TabsContent value="peserta" className="mt-4 space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <Input value={ptSearch} onChange={e => setPtSearch(e.target.value)} placeholder="Cari nama/niam..." className="pl-9 h-8 text-xs rounded-xl" />
                </div>
                <Select value={ptFilter} onValueChange={setPtFilter}>
                  <SelectTrigger className="h-8 w-32 rounded-xl text-xs border-slate-200">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Semua</SelectItem>
                    <SelectItem value="PAID">Lunas</SelectItem>
                    <SelectItem value="PENDING_APPROVAL">Verifikasi</SelectItem>
                    <SelectItem value="ATTENDED">Hadir</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Total {evParticipants.length} Peserta</p>
            </div>
            <ParticipantTable
              participants={filteredPt}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          </TabsContent>

          {/* Tab 4: Keuangan */}
          <TabsContent value="keuangan" className="mt-4 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-2xl border border-slate-100 p-4 text-center">
                <p className="text-xl font-black text-emerald-600">{stats.paid}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Selesai Bayar</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 p-4 text-center">
                <p className="text-xl font-black text-amber-600">{stats.pending_approval}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Pending Verif</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 p-4 text-center">
                <p className="text-xl font-black text-slate-900">{formatRupiah(stats.revenue)}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Total Masuk</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 text-sm">Log Pembayaran</h3>
              </div>
              <ParticipantTable
                participants={evParticipants.filter(p => ["PAID", "PENDING_APPROVAL", "REJECTED"].includes(p.ticket_status))}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            </div>
          </TabsContent>

          {/* Tab 5: Absensi */}
          <TabsContent value="absensi" className="mt-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-sm">Kehadiran Peserta</h3>
                <span className="text-[10px] font-bold px-2 py-1 bg-teal-100 text-teal-700 rounded-full">{stats.attended} Hadir</span>
              </div>
              <ParticipantTable
                participants={evParticipants.filter(p => p.ticket_status === "ATTENDED")}
                onApprove={handleApprove}
                onReject={handleReject}
              />
              {stats.attended === 0 && (
                <div className="p-12 text-center text-slate-400 text-sm">
                  Belum ada peserta yang melakukan absensi.
                </div>
              )}
            </div>
          </TabsContent>



          {/* Tab Sertifikat */}
          <TabsContent value="sertifikat" className="mt-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Manajemen Sertifikat</h3>
                  <p className="text-sm text-slate-500">Atur layout dan generate sertifikat untuk peserta</p>
                </div>
                <Button 
                  onClick={() => setShowTemplateModal(true)}
                  className="bg-[#166534] hover:bg-[#114d27] text-white rounded-xl"
                >
                  <Plus className="w-4 h-4 mr-2" /> Buat Template
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="border-2 border-slate-200 rounded-2xl aspect-[1.414/1] relative overflow-hidden bg-slate-50 shadow-inner group">
                  <img src="https://placehold.co/800x565/f1f5f9/94a3b8?text=Desain+Sertifikat" alt="Template" className="absolute inset-0 w-full h-full object-cover mix-blend-multiply" />
                  
                  {/* Dummy Draggable Elements mapped to percentages */}
                  <div className="absolute border border-dashed border-blue-500 bg-blue-500/10 rounded p-1 flex items-center justify-center cursor-move shadow-sm backdrop-blur-sm" style={{ left: '50%', top: '45%', transform: 'translate(-50%, -50%)', width: '60%', height: '8%' }}>
                    <span className="text-blue-700 font-bold text-xs">[ NAMA_PESERTA ]</span>
                  </div>
                  <div className="absolute border border-dashed border-emerald-500 bg-emerald-500/10 rounded p-1 flex items-center justify-center cursor-move shadow-sm backdrop-blur-sm" style={{ left: '50%', top: '52%', transform: 'translate(-50%, -50%)', width: '50%', height: '6%' }}>
                    <span className="text-emerald-700 font-bold text-[10px]">[ INSTANSI ]</span>
                  </div>
                  <div className="absolute border border-dashed border-amber-500 bg-amber-500/10 rounded flex items-center justify-center cursor-move shadow-sm backdrop-blur-sm" style={{ left: '50%', top: '20%', transform: 'translate(-50%, -50%)', width: '30%', height: '5%' }}>
                    <span className="text-amber-700 font-bold text-[8px]">[ NO_SERTIFIKAT ]</span>
                  </div>
                  <div className="absolute border border-dashed border-purple-500 bg-purple-500/10 rounded flex items-center justify-center cursor-move shadow-sm backdrop-blur-sm overflow-hidden" style={{ left: '20%', top: '80%', transform: 'translate(-50%, -50%)', width: '12%', height: '18%' }}>
                    <ImageIcon className="w-4 h-4 text-purple-700/50" />
                  </div>
                  
                  <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <Button variant="secondary" size="sm" onClick={() => setShowTemplateModal(true)} className="rounded-xl font-semibold shadow-xl">
                      <Edit className="w-4 h-4 mr-2" /> Edit Layout
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-emerald-800 mb-1">Status Pengiriman Aktif</p>
                      <p className="text-xs text-emerald-600 leading-relaxed">Sertifikat berformat PDF akan digenerate menggunakan TCPDF dan otomatis dikirim ke WhatsApp peserta ketika event status diubah ke "FINISHED".</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Koordinat Elemen (%)</Label>
                      <Badge variant="outline" className="text-[10px] bg-slate-50">Tersimpan</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 border border-slate-100 rounded-lg bg-white shadow-sm flex items-start gap-2">
                        <Type className="w-3.5 h-3.5 text-blue-500 mt-0.5" />
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Nama Peserta</p>
                          <p className="text-xs font-bold mt-1 text-slate-700 font-mono">X: {Math.round(dragVars.nama.x)}% | Y: {Math.round(dragVars.nama.y)}%</p>
                        </div>
                      </div>
                      <div className="p-3 border border-slate-100 rounded-lg bg-white shadow-sm flex items-start gap-2">
                        <Type className="w-3.5 h-3.5 text-emerald-500 mt-0.5" />
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Instansi</p>
                          <p className="text-xs font-bold mt-1 text-slate-700 font-mono">X: {Math.round(dragVars.instansi.x)}% | Y: {Math.round(dragVars.instansi.y)}%</p>
                        </div>
                      </div>
                      <div className="p-3 border border-slate-100 rounded-lg bg-white shadow-sm flex items-start gap-2">
                        <Type className="w-3.5 h-3.5 text-amber-500 mt-0.5" />
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Nomor Sertifikat</p>
                          <p className="text-xs font-bold mt-1 text-slate-700 font-mono">X: {Math.round(dragVars.nomor.x)}% | Y: {Math.round(dragVars.nomor.y)}%</p>
                        </div>
                      </div>
                      <div className="p-3 border border-slate-100 rounded-lg bg-white shadow-sm flex items-start gap-2">
                        <ImageIcon className="w-3.5 h-3.5 text-purple-500 mt-0.5" />
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Foto Pas</p>
                          <p className="text-xs font-bold mt-1 text-slate-700 font-mono">X: {Math.round(dragVars.foto.x)}% | Y: {Math.round(dragVars.foto.y)}%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <Button variant="outline" className="w-full text-xs h-9 rounded-xl font-semibold border-slate-200 text-slate-600">
                      <Eye className="w-3.5 h-3.5 mr-2" /> Preview PDF Sample
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Dialog Template Editor */}
          <Dialog open={showTemplateModal} onOpenChange={setShowTemplateModal}>
            <DialogContent className="max-w-4xl rounded-3xl p-0 overflow-hidden">
              <div className="flex h-[600px]">
                {/* Sidebar */}
                <div className="w-72 bg-slate-50 border-r border-slate-100 p-6 flex flex-col h-full">
                  <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-600" />
                    Editor Template
                  </h3>
                  
                  <div className="space-y-5 flex-1 overflow-y-auto pr-2">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-500 uppercase">Background PDF</Label>
                      <Button variant="outline" className="w-full justify-start h-10 rounded-xl text-xs bg-white border-dashed border-2">
                        <UploadCloud className="w-4 h-4 mr-2 text-slate-400" /> Upload File (.pdf/.jpg)
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-xs font-bold text-slate-500 uppercase">Variabel Dinamis</Label>
                      <div className="grid grid-cols-1 gap-2">
                        <div onClick={() => setDragVars(p => ({...p, nama: {...p.nama, visible: !p.nama.visible}}))} className={`p-2 border border-slate-200 ${dragVars.nama.visible ? 'bg-white' : 'bg-slate-100 opacity-60'} rounded-lg flex items-center justify-between text-xs cursor-pointer hover:border-blue-500 transition-colors`}>
                          <span className="font-mono text-slate-600">[ NAMA_PESERTA ]</span>
                          {dragVars.nama.visible ? <span className="w-2 h-2 rounded-full bg-blue-500"></span> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
                        </div>
                        <div onClick={() => setDragVars(p => ({...p, instansi: {...p.instansi, visible: !p.instansi.visible}}))} className={`p-2 border border-slate-200 ${dragVars.instansi.visible ? 'bg-white' : 'bg-slate-100 opacity-60'} rounded-lg flex items-center justify-between text-xs cursor-pointer hover:border-emerald-500 transition-colors`}>
                          <span className="font-mono text-slate-600">[ INSTANSI ]</span>
                          {dragVars.instansi.visible ? <span className="w-2 h-2 rounded-full bg-emerald-500"></span> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
                        </div>
                        <div onClick={() => setDragVars(p => ({...p, nomor: {...p.nomor, visible: !p.nomor.visible}}))} className={`p-2 border border-slate-200 ${dragVars.nomor.visible ? 'bg-white' : 'bg-slate-100 opacity-60'} rounded-lg flex items-center justify-between text-xs cursor-pointer hover:border-amber-500 transition-colors`}>
                          <span className="font-mono text-slate-600">[ NO_SERTIFIKAT ]</span>
                          {dragVars.nomor.visible ? <span className="w-2 h-2 rounded-full bg-amber-500"></span> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
                        </div>
                        <div onClick={() => setDragVars(p => ({...p, foto: {...p.foto, visible: !p.foto.visible}}))} className={`p-2 border border-slate-200 ${dragVars.foto.visible ? 'bg-white' : 'bg-slate-100 opacity-60'} rounded-lg flex items-center justify-between text-xs cursor-pointer hover:border-purple-500 transition-colors`}>
                          <span className="font-mono text-slate-600">[ FOTO_PESERTA ]</span>
                          {dragVars.foto.visible ? <span className="w-2 h-2 rounded-full bg-purple-500"></span> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight">Seret elemen di canvas. Klik variabel di atas untuk menyembunyikan/menampilkan.</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 space-y-2 mt-auto">
                    <Button 
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                      onClick={() => {
                        toast({title: "Template Disimpan", description: "Koordinat berhasil disimpan ke database."});
                        setShowTemplateModal(false);
                      }}
                    >
                      Simpan Template
                    </Button>
                    <Button variant="ghost" className="w-full rounded-xl text-slate-500" onClick={() => setShowTemplateModal(false)}>
                      Batal
                    </Button>
                  </div>
                </div>
                
                {/* Canvas Area */}
                <div 
                  className="flex-1 bg-slate-200 p-8 flex items-center justify-center relative overflow-hidden"
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={handleCanvasMouseUp}
                >
                  {/* Grid background for design feel */}
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, black 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>
                  
                  <div 
                    ref={canvasRef}
                    className="bg-white shadow-2xl w-full aspect-[1.586/1] relative transform scale-95 border border-slate-100 select-none overflow-hidden"
                  >
                    <img src="https://placehold.co/800x504/ffffff/cbd5e1?text=F4+Landscape+Canvas" alt="Canvas" className="w-full h-full opacity-50 pointer-events-none" />
                    
                    {/* Element Controls Toolbar (appears when an element is selected) */}
                    {draggingVar && dragVars[draggingVar].visible && (
                      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-800 text-white p-1.5 rounded-lg flex gap-1 z-50 shadow-xl">
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-white hover:bg-slate-700" onClick={() => setDragVars(p => ({...p, [draggingVar]: {...p[draggingVar], scale: Math.max(0.5, p[draggingVar].scale - 0.1)}}))}>-</Button>
                        <div className="flex items-center px-2 text-[10px] font-bold">{Math.round(dragVars[draggingVar].scale * 100)}%</div>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-white hover:bg-slate-700" onClick={() => setDragVars(p => ({...p, [draggingVar]: {...p[draggingVar], scale: Math.min(2, p[draggingVar].scale + 0.1)}}))}>+</Button>
                        <div className="w-px h-4 bg-slate-600 my-auto mx-1"></div>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-red-400 hover:bg-red-500/20 hover:text-red-400" onClick={() => { setDragVars(p => ({...p, [draggingVar]: {...p[draggingVar], visible: false}})); setDraggingVar(null); }}><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    )}

                    {/* Interactive Draggable Elements */}
                    {dragVars.nama.visible && (
                      <div 
                        onMouseDown={(e) => { e.preventDefault(); setDraggingVar('nama'); }}
                        className={`absolute border-2 ${draggingVar === 'nama' ? 'border-blue-500 bg-blue-500/20 ring-4 ring-blue-500/30' : 'border-blue-400 bg-blue-500/10'} rounded cursor-move flex items-center justify-center shadow-md transition-shadow`} 
                        style={{ left: `${dragVars.nama.x}%`, top: `${dragVars.nama.y}%`, transform: `translate(-50%, -50%) scale(${dragVars.nama.scale})`, width: '60%', height: '8%', transformOrigin: 'center' }}
                      >
                        <span className="text-blue-700 font-bold text-sm tracking-widest">[ NAMA_PESERTA ]</span>
                        {draggingVar === 'nama' && (
                          <>
                            <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-full"></div>
                            <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-full"></div>
                          </>
                        )}
                      </div>
                    )}
                    
                    {dragVars.instansi.visible && (
                      <div 
                        onMouseDown={(e) => { e.preventDefault(); setDraggingVar('instansi'); }}
                        className={`absolute border-2 ${draggingVar === 'instansi' ? 'border-emerald-500 bg-emerald-500/20 ring-4 ring-emerald-500/30' : 'border-emerald-400 bg-emerald-500/10'} rounded cursor-move flex items-center justify-center shadow-md transition-shadow`} 
                        style={{ left: `${dragVars.instansi.x}%`, top: `${dragVars.instansi.y}%`, transform: `translate(-50%, -50%) scale(${dragVars.instansi.scale})`, width: '50%', height: '6%', transformOrigin: 'center' }}
                      >
                        <span className="text-emerald-700 font-bold text-xs">[ INSTANSI ]</span>
                      </div>
                    )}

                    {dragVars.nomor.visible && (
                      <div 
                        onMouseDown={(e) => { e.preventDefault(); setDraggingVar('nomor'); }}
                        className={`absolute border-2 ${draggingVar === 'nomor' ? 'border-amber-500 bg-amber-500/20 ring-4 ring-amber-500/30' : 'border-amber-400 bg-amber-500/10'} rounded cursor-move flex items-center justify-center shadow-md transition-shadow`} 
                        style={{ left: `${dragVars.nomor.x}%`, top: `${dragVars.nomor.y}%`, transform: `translate(-50%, -50%) scale(${dragVars.nomor.scale})`, width: '30%', height: '5%', transformOrigin: 'center' }}
                      >
                        <span className="text-amber-700 font-bold text-[10px]">[ NO_SERTIFIKAT ]</span>
                      </div>
                    )}

                    {dragVars.foto.visible && (
                      <div 
                        onMouseDown={(e) => { e.preventDefault(); setDraggingVar('foto'); }}
                        className={`absolute border-2 ${draggingVar === 'foto' ? 'border-purple-500 bg-purple-500/20 ring-4 ring-purple-500/30' : 'border-purple-400 bg-purple-500/10'} rounded cursor-move flex items-center justify-center shadow-md transition-shadow overflow-hidden`} 
                        style={{ left: `${dragVars.foto.x}%`, top: `${dragVars.foto.y}%`, transform: `translate(-50%, -50%) scale(${dragVars.foto.scale})`, width: '12%', height: '18%', transformOrigin: 'center' }}
                      >
                        <ImageIcon className="w-6 h-6 text-purple-700/50" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Tab Laporan */}
          <TabsContent value="laporan" className="mt-4 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Laporan Event</h3>
                  <p className="text-sm text-slate-500">Data statistik dan ringkasan pelaksanaan event</p>
                </div>
                <Button variant="outline" className="rounded-xl">
                  <Download className="w-4 h-4 mr-2" /> Download Rekap (PDF)
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Efektivitas Kehadiran</p>
                  <p className="text-2xl font-black text-slate-900">{Math.round((stats.attended / stats.total) * 100) || 0}%</p>
                  <p className="text-xs text-slate-500 mt-1">{stats.attended} dari {stats.total} peserta hadir</p>
                </div>
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">ROI Pendaftaran</p>
                  <p className="text-2xl font-black text-slate-900">{formatRupiah(stats.revenue)}</p>
                  <p className="text-xs text-slate-500 mt-1">Total pendapatan kotor</p>
                </div>
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Sertifikat Terkirim</p>
                  <p className="text-2xl font-black text-emerald-600">{selectedEvent.status === "FINISHED" ? stats.attended : 0}</p>
                  <p className="text-xs text-slate-500 mt-1">Sertifikat otomatis via WA</p>
                </div>
              </div>
            </div>

            {/* Dokumen Laporan (Berita Acara) */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="mb-6 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-slate-800">Dokumen Berita Acara</h3>
                  <p className="text-xs text-slate-500 mt-1">Upload laporan resmi (LPJ) atau berita acara pelaksanaan event dalam format PDF.</p>
                </div>
                {uploadedBerita && (
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0">
                    <CheckCircle className="w-3 h-3 mr-1" /> Tersimpan
                  </Badge>
                )}
              </div>

              {!uploadedBerita ? (
                <div 
                  className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-colors cursor-pointer
                    ${isUploading ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300'}`}
                  onClick={() => {
                    setIsUploading(true);
                    setTimeout(() => {
                      setUploadedBerita({
                        name: `BA_${selectedEvent.id.toUpperCase()}_MPJ_2026.pdf`,
                        date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
                        size: '2.4 MB'
                      });
                      setIsUploading(false);
                      toast({title: "Berita Acara Tersimpan", description: "Dokumen PDF berhasil diunggah."});
                    }, 1500);
                  }}
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${isUploading ? 'bg-emerald-100 text-emerald-600 animate-pulse' : 'bg-white text-slate-400 shadow-sm'}`}>
                    {isUploading ? <Upload className="w-6 h-6 animate-bounce" /> : <FileText className="w-6 h-6" />}
                  </div>
                  <h4 className="font-bold text-slate-700 text-sm mb-1">
                    {isUploading ? "Mengunggah Dokumen..." : "Klik atau Drop file PDF ke sini"}
                  </h4>
                  <p className="text-xs text-slate-400 text-center max-w-xs">
                    Format yang didukung: PDF. Ukuran maksimal: 10MB.
                  </p>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <File className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-sm truncate">{uploadedBerita.name}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {uploadedBerita.date}</span>
                      <span className="flex items-center gap-1"><Info className="w-3 h-3" /> {uploadedBerita.size}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="outline" size="sm" className="h-8 rounded-lg" onClick={() => window.open('#', '_blank')}>
                      <Eye className="w-3.5 h-3.5 mr-1.5" /> Lihat
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 rounded-lg text-red-600 border-red-100 hover:bg-red-50" onClick={() => setUploadedBerita(null)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Tab Dokumentasi */}
          <TabsContent value="dokumentasi" className="mt-4 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Dokumentasi Acara</h3>
                  <p className="text-sm text-slate-500">Upload dan kelola foto kegiatan event dan foto bersama</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upload Foto Kegiatan */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-bold text-slate-700">Foto Kegiatan Event</Label>
                    <Badge variant="outline" className="text-[10px] bg-slate-50">10 / 10 Terunggah</Badge>
                  </div>
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors h-48 opacity-70 pointer-events-none">
                    <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3">
                      <ImageIcon className="w-6 h-6 text-emerald-500" />
                    </div>
                    <p className="font-bold text-slate-700 text-sm">Batas Maksimal Tercapai</p>
                    <p className="text-xs text-slate-400 mt-1">Maksimal 10 foto kegiatan (Hapus untuk mengunggah baru)</p>
                  </div>
                  {/* Dummy Gallery (10 items) */}
                  <div className="grid grid-cols-5 gap-2">
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className="aspect-square rounded-lg overflow-hidden border border-slate-200 relative group shadow-sm">
                        <img src={`https://placehold.co/400x400/166534/fff?text=Kegiatan+${i + 1}`} alt={`Kegiatan ${i + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Trash2 className="w-4 h-4 text-white cursor-pointer hover:text-red-400 transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upload Foto Bersama */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-bold text-slate-700">Foto Bersama (Official)</Label>
                    <Badge variant="outline" className="text-[10px] bg-slate-50">3 / 10 Terunggah</Badge>
                  </div>
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors h-48">
                    <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3">
                      <Users className="w-6 h-6 text-blue-500" />
                    </div>
                    <p className="font-bold text-slate-700 text-sm">Upload Foto Bersama</p>
                    <p className="text-xs text-slate-400 mt-1">Maksimal 10 foto (Resolusi tinggi diutamakan)</p>
                  </div>
                  {/* Dummy Gallery (3 items out of 10) */}
                  <div className="grid grid-cols-3 gap-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="aspect-video rounded-lg overflow-hidden border border-slate-200 relative group shadow-sm">
                        <img src={`https://placehold.co/800x450/1e40af/fff?text=Bersama+${i + 1}`} alt={`Foto Bersama ${i + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Trash2 className="w-4 h-4 text-white cursor-pointer hover:text-red-400 transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tab 6: Status / Pengaturan */}
          <TabsContent value="status" className="mt-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-6">
              <div>
                <h3 className="font-bold text-slate-800 text-sm mb-4">Pengaturan Status Event</h3>
                <div className="flex flex-wrap gap-2">
                  {(["DRAFT", "PENDING", "APPROVED", "FINISHED"] as EventStatus[]).map(s => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(selectedEvent.id, s)}
                      className={`text-xs font-bold px-4 py-2 rounded-xl border-2 transition-all ${
                        selectedEvent.status === s
                          ? "border-[#166534] bg-[#166534] text-white shadow-md shadow-emerald-500/20"
                          : "border-slate-100 text-slate-500 hover:border-slate-300"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-50">
                <h3 className="font-bold text-slate-800 text-sm mb-4">Kontrol Pendaftaran</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                      <p className="text-sm font-bold text-slate-800">Buka Jalur Umum</p>
                      <p className="text-xs text-slate-500">Izinkan peserta non-anggota mendaftar</p>
                    </div>
                    <Switch defaultChecked onCheckedChange={() => setHasUnsavedChanges(true)} />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                      <p className="text-sm font-bold text-slate-800">Aktifkan Sertifikat Otomatis</p>
                      <p className="text-xs text-slate-500">Kirim sertifikat digital setelah absensi</p>
                    </div>
                    <Switch onCheckedChange={() => setHasUnsavedChanges(true)} />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-50 flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  className="rounded-xl border-slate-200 font-bold"
                  onClick={() => {
                    if (hasUnsavedChanges && !window.confirm("Perubahan belum disimpan, apakah Anda yakin ingin keluar?")) return;
                    setSelectedEvent(null);
                  }}
                >
                  Tutup / Kembali
                </Button>
                <Button 
                  className="bg-[#166534] hover:bg-[#114d27] text-white rounded-xl font-bold"
                  onClick={() => {
                    setHasUnsavedChanges(false);
                    toast({
                      title: "Berhasil Disimpan",
                      description: "Semua pengaturan event telah disimpan."
                    });
                  }}
                >
                  Simpan Perubahan Pengaturan
                </Button>
              </div>
            </div>
          </TabsContent>
          <Dialog open={showAddSdmModal} onOpenChange={setShowAddSdmModal}>
            <DialogContent className="max-w-sm rounded-2xl">
              <DialogHeader>
                <DialogTitle>Tambah SDM / Panitia</DialogTitle>
                <DialogDescription>Masukkan NIAM anggota yang akan ditugaskan sebagai panitia event.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-3">
                <Label>NIAM Anggota *</Label>
                <Input 
                  value={sdmNiamInput}
                  onChange={(e) => setSdmNiamInput(e.target.value)}
                  placeholder="Contoh: NIAM-12345" 
                  className="rounded-xl"
                  autoFocus
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddSdmModal(false)} className="rounded-xl">Batal</Button>
                <Button onClick={handleAddSdm} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">Tambah SDM</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

        </Tabs>
      </div>
    );
  }

  // ── EVENT LIST VIEW ──
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Manajemen Event</h1>
          <p className="text-slate-500 text-sm mt-0.5">Pantau dan kelola seluruh siklus hidup event MPJ.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.open('/scan', '_blank')} className="rounded-xl h-10 px-4 font-bold border-slate-200">
            <QrCode className="w-4 h-4 mr-2" />Scanner
          </Button>
          <Button onClick={() => setIsCreating(true)} className="bg-[#166534] hover:bg-[#114d27] text-white rounded-xl h-10 px-5 font-bold shadow-lg shadow-emerald-900/10 transition-all hover:scale-[1.02] active:scale-95">
            <Plus className="w-5 h-5 mr-2" /> Buat Event Baru
          </Button>
        </div>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Event" value={totalEvents} sub="Semua status" color="bg-white border-slate-100 text-slate-900" />
        <StatCard label="Live / Approved" value={liveEvents} sub="Terlihat oleh publik" color="bg-emerald-50 border-emerald-200 text-emerald-900" />
        <StatCard label="Menunggu Verif" value={pendingApprovals} sub="Bukti bayar peserta" color={pendingApprovals > 0 ? "bg-amber-50 border-amber-200 text-amber-900" : "bg-white border-slate-100 text-slate-900"} />
        <StatCard label="Total Revenue" value={formatRupiah(totalRevenue)} sub="Tiket terbayar" color="bg-slate-900 border-slate-800 text-white" />
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari judul event..."
              className="pl-10 h-10 w-64 rounded-xl border-slate-200"
            />
          </div>
          <Select value={filterStatus} onValueChange={v => setFilterStatus(v as any)}>
            <SelectTrigger className="h-10 w-40 rounded-xl border-slate-200">
              <Filter className="w-4 h-4 mr-2 text-slate-400" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Status</SelectItem>
              <SelectItem value="DRAFT">DRAFT</SelectItem>
              <SelectItem value="APPROVED">APPROVED</SelectItem>
              <SelectItem value="FINISHED">FINISHED</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredEvents.map(ev => (
          <EventRow
            key={ev.id}
            event={ev}
            onSelect={setSelectedEvent}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-100">
          <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800">Tidak ada event ditemukan</h3>
          <p className="text-slate-400 text-sm mt-1">Coba sesuaikan kata kunci pencarian atau filter status Anda.</p>
        </div>
      )}
    </div>
  );
};

export default AdminPusatEvent;
