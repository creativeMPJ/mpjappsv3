import { useState, useMemo } from "react";
import {
  Search, CheckCircle2, Clock, XCircle, Wallet, Ticket, UserCheck, Filter, Phone, Download
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import {
  MOCK_PARTICIPANTS, MOCK_EVENTS,
  MockParticipant, TicketStatus, ParticipantType,
  formatRupiah,
} from "@/lib/event-mock-data";

// ─── Badge helpers ────────────────────────────────────────────────────────────

const PAYMENT_MAP: Record<TicketStatus, { label: string; cls: string }> = {
  PENDING_PAYMENT:  { label: "Belum Bayar",   cls: "bg-red-100 text-red-600" },
  PENDING_APPROVAL: { label: "Menunggu Verif", cls: "bg-amber-100 text-amber-700" },
  PAID:             { label: "Lunas",          cls: "bg-emerald-100 text-emerald-700" },
  ATTENDED:         { label: "Hadir",          cls: "bg-teal-100 text-teal-700" },
  REJECTED:         { label: "Ditolak",        cls: "bg-red-100 text-red-600" },
};

const PATH_MAP: Record<ParticipantType, { label: string; cls: string }> = {
  NIAM: { label: "NIAM",  cls: "bg-emerald-100 text-emerald-700" },
  UMUM: { label: "Umum",  cls: "bg-blue-100 text-blue-700" },
};

// ─── Component ────────────────────────────────────────────────────────────────

const EventMasterPeserta = () => {
  const [search, setSearch]         = useState("");
  const [pathFilter, setPathFilter] = useState("ALL");
  const [payFilter, setPayFilter]   = useState("ALL");
  const [eventFilter, setEventFilter] = useState("ALL");

  // Enrich participants with event title
  const enriched = useMemo(() =>
    MOCK_PARTICIPANTS.map((p) => ({
      ...p,
      event_title: MOCK_EVENTS.find((e) => e.id === p.event_id)?.title ?? "-",
      avatar: `https://placehold.co/80x80/166534/fff?text=${p.full_name.charAt(0)}`,
    })),
    []
  );

  const filtered = useMemo(() =>
    enriched.filter((p) => {
      const q = search.toLowerCase();
      const matchS = !q ||
        p.full_name.toLowerCase().includes(q) ||
        p.event_title.toLowerCase().includes(q) ||
        (p.institution ?? "").toLowerCase().includes(q) ||
        p.whatsapp.includes(q);
      const matchPath  = pathFilter  === "ALL" || p.type           === pathFilter;
      const matchPay   = payFilter   === "ALL" || p.ticket_status  === payFilter;
      const matchEvent = eventFilter === "ALL" || p.event_id        === eventFilter;
      return matchS && matchPath && matchPay && matchEvent;
    }),
    [enriched, search, pathFilter, payFilter, eventFilter]
  );

  const stats = useMemo(() => ({
    total:   enriched.length,
    niam:    enriched.filter((p) => p.type === "NIAM").length,
    umum:    enriched.filter((p) => p.type === "UMUM").length,
    hadir:   enriched.filter((p) => p.ticket_status === "ATTENDED").length,
    lunas:   enriched.filter((p) => ["PAID", "ATTENDED"].includes(p.ticket_status)).length,
    pending: enriched.filter((p) => p.ticket_status === "PENDING_APPROVAL").length,
  }), [enriched]);

  const resetFilters = () => {
    setSearch(""); setPathFilter("ALL"); setPayFilter("ALL"); setEventFilter("ALL");
  };
  const hasFilter = search || pathFilter !== "ALL" || payFilter !== "ALL" || eventFilter !== "ALL";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Master Peserta</h1>
          <p className="text-slate-500 text-sm mt-0.5">Semua pendaftar dari seluruh event</p>
        </div>
        <div className="flex items-center gap-2">
          {hasFilter && (
            <button
              onClick={resetFilters}
              className="text-xs text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100"
            >
              <XCircle className="w-3.5 h-3.5" /> Reset
            </button>
          )}
          <button
            className="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-100"
            onClick={() => window.alert('Fitur Export Excel/CSV sedang dalam pengembangan.')}
          >
            <Download className="w-3.5 h-3.5" /> Ekspor Data
          </button>
        </div>
      </div>

      {/* Stats — clickable */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
        {[
          { label: "Total",   value: stats.total,   icon: <UserCheck className="w-4 h-4" />,    color: "text-slate-900",    bg: "bg-slate-100",   action: resetFilters },
          { label: "NIAM",    value: stats.niam,    icon: <Ticket className="w-4 h-4" />,       color: "text-emerald-700",  bg: "bg-emerald-100", action: () => { resetFilters(); setPathFilter("NIAM"); } },
          { label: "Umum",    value: stats.umum,    icon: <Ticket className="w-4 h-4" />,       color: "text-blue-700",     bg: "bg-blue-100",    action: () => { resetFilters(); setPathFilter("UMUM"); } },
          { label: "Hadir",   value: stats.hadir,   icon: <CheckCircle2 className="w-4 h-4" />, color: "text-teal-700",     bg: "bg-teal-100",    action: () => { resetFilters(); setPayFilter("ATTENDED"); } },
          { label: "Lunas",   value: stats.lunas,   icon: <Wallet className="w-4 h-4" />,       color: "text-emerald-700",  bg: "bg-emerald-100", action: () => { resetFilters(); setPayFilter("PAID"); } },
          { label: "Pending", value: stats.pending, icon: <Clock className="w-4 h-4" />,        color: "text-amber-700",    bg: "bg-amber-100",   action: () => { resetFilters(); setPayFilter("PENDING_APPROVAL"); } },
        ].map((s) => (
          <button
            key={s.label}
            onClick={s.action}
            className="bg-white rounded-2xl border border-slate-100 p-3 shadow-sm text-center hover:bg-slate-50 hover:border-slate-200 transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <div className={`w-7 h-7 rounded-lg ${s.bg} ${s.color} flex items-center justify-center mx-auto mb-1.5`}>
              {s.icon}
            </div>
            <p className={`text-xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{s.label}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, event, institusi..."
            className="pl-9 h-9 rounded-xl border-slate-200 text-sm"
          />
        </div>
        <Select value={eventFilter} onValueChange={(v) => v != null && setEventFilter(v)}>
          <SelectTrigger className="h-9 w-full sm:w-52 rounded-xl border-slate-200 text-sm">
            <SelectValue placeholder="Semua Event" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua Event</SelectItem>
            {MOCK_EVENTS.map((e) => (
              <SelectItem key={e.id} value={e.id}>{e.title.slice(0, 35)}...</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={pathFilter} onValueChange={(v) => v != null && setPathFilter(v)}>
          <SelectTrigger className="h-9 w-full sm:w-36 rounded-xl border-slate-200 text-sm">
            <SelectValue placeholder="Jalur" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua Jalur</SelectItem>
            <SelectItem value="NIAM">NIAM</SelectItem>
            <SelectItem value="UMUM">Umum</SelectItem>
          </SelectContent>
        </Select>
        <Select value={payFilter} onValueChange={(v) => v != null && setPayFilter(v)}>
          <SelectTrigger className="h-9 w-full sm:w-44 rounded-xl border-slate-200 text-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua Status</SelectItem>
            <SelectItem value="PENDING_PAYMENT">Belum Bayar</SelectItem>
            <SelectItem value="PENDING_APPROVAL">Menunggu Verif</SelectItem>
            <SelectItem value="PAID">Lunas</SelectItem>
            <SelectItem value="ATTENDED">Hadir</SelectItem>
            <SelectItem value="REJECTED">Ditolak</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-xs text-slate-400">
        Menampilkan <span className="font-bold text-slate-600">{filtered.length}</span> dari {enriched.length} peserta
        {hasFilter && <span className="text-emerald-600 font-semibold"> (difilter)</span>}
      </p>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                {["Peserta", "Event", "Jalur", "Pembayaran", "Kehadiran", "Nominal", "Aksi"].map((h) => (
                  <th key={h} className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 text-sm">
                    Tidak ada peserta ditemukan
                  </td>
                </tr>
              ) : filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <img src={p.avatar} alt={p.full_name} className="w-8 h-8 rounded-full bg-slate-100 object-cover flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-slate-800 text-sm leading-tight">{p.full_name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[160px]">{p.institution ?? "-"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-xs font-medium text-slate-700 max-w-[200px] line-clamp-2">{p.event_title}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PATH_MAP[p.type].cls}`}>
                      {PATH_MAP[p.type].label}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PAYMENT_MAP[p.ticket_status].cls}`}>
                      {PAYMENT_MAP[p.ticket_status].label}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      p.ticket_status === "ATTENDED" ? "bg-teal-100 text-teal-700" : "bg-slate-100 text-slate-500"
                    }`}>
                      {p.ticket_status === "ATTENDED" ? "✓ Hadir" : "Terdaftar"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-xs font-bold text-slate-700">
                      {p.total_amount === 0 ? "—" : formatRupiah(p.total_amount)}
                    </p>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => window.open(`https://wa.me/${p.whatsapp.replace(/\D/g, '')}`, '_blank')}
                        className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors tooltip-trigger"
                        title={`Hubungi ${p.whatsapp}`}
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">Tidak ada peserta ditemukan</div>
          ) : filtered.map((p) => (
            <div key={p.id} className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <img src={p.avatar} alt={p.full_name} className="w-10 h-10 rounded-xl bg-slate-100 object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 text-sm truncate">{p.full_name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{p.institution ?? "-"}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PATH_MAP[p.type].cls}`}>
                  {PATH_MAP[p.type].label}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium line-clamp-1">📅 {p.event_title}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PAYMENT_MAP[p.ticket_status].cls}`}>
                  {PAYMENT_MAP[p.ticket_status].label}
                </span>
                {p.total_amount > 0 && (
                  <span className="text-[10px] text-slate-500 font-semibold">{formatRupiah(p.total_amount)}</span>
                )}
                <div className="flex-1" />
                <button 
                  onClick={() => window.open(`https://wa.me/${p.whatsapp.replace(/\D/g, '')}`, '_blank')}
                  className="px-3 py-1 bg-green-50 text-green-700 font-semibold text-xs rounded-lg hover:bg-green-100 transition-colors flex items-center gap-1"
                >
                  <Phone className="w-3 h-3" /> WA
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventMasterPeserta;
