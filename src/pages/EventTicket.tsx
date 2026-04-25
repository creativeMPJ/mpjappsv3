import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, CheckCircle, Clock, AlertCircle, QrCode } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { QRCodeSVG } from "qrcode.react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getParticipantByTicketCode, getEventById, formatRupiah } from "@/lib/event-mock-data";

const STATUS_CONFIG = {
  PENDING_PAYMENT: {
    label: 'Menunggu Pembayaran',
    color: 'bg-amber-50 border-amber-200 text-amber-700',
    icon: <Clock className="w-5 h-5 text-amber-500" />,
    desc: 'Segera lakukan transfer sesuai nominal invoice.',
  },
  PENDING_APPROVAL: {
    label: 'Verifikasi Pembayaran',
    color: 'bg-blue-50 border-blue-200 text-blue-700',
    icon: <Clock className="w-5 h-5 text-blue-500" />,
    desc: 'Bukti transfer sudah diterima. Admin sedang memverifikasi (maks 1×24 jam).',
  },
  PAID: {
    label: 'Terkonfirmasi — Tiket Aktif',
    color: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    desc: 'Tunjukkan QR Code ini kepada panitia saat check-in.',
  },
  ATTENDED: {
    label: 'Sudah Check-in',
    color: 'bg-teal-50 border-teal-200 text-teal-700',
    icon: <CheckCircle className="w-5 h-5 text-teal-500" />,
    desc: 'Kehadiran sudah tercatat. Terima kasih telah mengikuti event!',
  },
  REJECTED: {
    label: 'Pembayaran Ditolak',
    color: 'bg-red-50 border-red-200 text-red-700',
    icon: <AlertCircle className="w-5 h-5 text-red-500" />,
    desc: 'Pembayaran ditolak. Silakan hubungi panitia untuk informasi lebih lanjut.',
  },
};

// Simulate fetching by ticket code — in real app from URL param or user auth
const DEMO_TICKET_CODE = 'TKT-EVT001-ARXK'; // PAID example
const DEMO_PAID_TICKET = 'TKT-EVT001-RZFL'; // PENDING_APPROVAL example

const EventTicket = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  // Use param if given, else show demo paid ticket
  const ticketCode = code ?? DEMO_TICKET_CODE;
  const participant = getParticipantByTicketCode(ticketCode);
  const event = participant ? getEventById(participant.event_id) : null;

  if (!participant || !event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50 px-4">
        <QrCode className="w-16 h-16 text-slate-300" />
        <p className="text-xl font-bold text-slate-600">Tiket tidak ditemukan</p>
        <p className="text-slate-400 text-sm">Kode: {ticketCode}</p>
        <Button variant="outline" onClick={() => navigate('/events')}>← Kembali ke Event</Button>
      </div>
    );
  }

  const status = STATUS_CONFIG[participant.ticket_status];
  const showQR  = ['PAID', 'ATTENDED'].includes(participant.ticket_status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-emerald-50/30 px-4 py-8">
      {/* Back */}
      <div className="max-w-md mx-auto mb-6">
        <button
          onClick={() => navigate('/events')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Event
        </button>
      </div>

      <div className="max-w-md mx-auto">

        {/* Tiket Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

          {/* Ticket top / header */}
          <div className="bg-gradient-to-br from-emerald-700 to-teal-700 p-6 text-white">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-emerald-300 text-xs font-medium uppercase tracking-widest mb-1">E-Tiket MPJ</p>
                <p className="text-xs text-emerald-200 font-mono">{participant.ticket_code}</p>
              </div>
              <Badge className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                participant.ticket_status === 'ATTENDED'  ? 'bg-teal-500/20 text-teal-100 border-teal-400/30' :
                participant.ticket_status === 'PAID'      ? 'bg-emerald-400/20 text-emerald-100 border-emerald-300/30' :
                'bg-white/10 text-white/80 border-white/20'
              }`}>
                {status.label}
              </Badge>
            </div>
            <h2 className="font-black text-lg leading-tight">{event.title}</h2>
            <p className="text-emerald-200 text-sm mt-1">
              {format(new Date(event.date_start), 'EEEE, dd MMMM yyyy · HH:mm', { locale: idLocale })} WIB
            </p>
            <p className="text-emerald-300 text-xs mt-0.5">{event.location}</p>
          </div>

          {/* Dashed divider */}
          <div className="relative flex items-center mx-5">
            <div className="absolute -left-8 w-8 h-8 bg-slate-100 rounded-full" />
            <div className="flex-1 border-t-2 border-dashed border-slate-200" />
            <div className="absolute -right-8 w-8 h-8 bg-slate-100 rounded-full" />
          </div>

          {/* Ticket body */}
          <div className="p-6 space-y-6">

            {/* Participant info */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Informasi Peserta</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-slate-400">Nama</p>
                  <p className="font-bold text-slate-900 text-sm">{participant.full_name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Jenis</p>
                  <Badge className={`text-xs mt-0.5 ${participant.type === 'NIAM' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                    {participant.type === 'NIAM' ? `🎫 NIAM` : '🌐 Umum'}
                  </Badge>
                </div>
                {participant.niam && (
                  <div>
                    <p className="text-xs text-slate-400">NIAM</p>
                    <p className="font-mono text-sm font-bold text-emerald-700">{participant.niam}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-slate-400">Instansi</p>
                  <p className="text-sm font-semibold text-slate-700 truncate">{participant.institution}</p>
                </div>
              </div>
            </div>

            {/* Payment info */}
            {participant.total_amount > 0 && (
              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pembayaran</h3>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Total Dibayar</span>
                  <span className="font-bold text-slate-900">{formatRupiah(participant.total_amount)}</span>
                </div>
                {participant.paid_at && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Tanggal Bayar</span>
                    <span className="text-slate-700">{format(new Date(participant.paid_at), 'dd MMM yyyy HH:mm', { locale: idLocale })}</span>
                  </div>
                )}
              </div>
            )}

            {/* Status banner */}
            <div className={`flex items-start gap-3 p-4 rounded-xl border ${status.color}`}>
              {status.icon}
              <div>
                <p className="font-semibold text-sm">{status.label}</p>
                <p className="text-xs mt-0.5 opacity-80">{status.desc}</p>
                {participant.rejection_reason && (
                  <p className="text-xs mt-1 font-medium">Alasan: {participant.rejection_reason}</p>
                )}
              </div>
            </div>

            {/* QR CODE — only for valid tickets */}
            {showQR ? (
              <div className="flex flex-col items-center gap-4 py-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-100 rounded-3xl scale-105 blur-sm" />
                  <div className="relative bg-white p-5 rounded-2xl shadow-lg border-2 border-emerald-200">
                    <QRCodeSVG
                      value={participant.ticket_code}
                      size={180}
                      level="H"
                      fgColor="#166534"
                      imageSettings={{
                        src: '',
                        height: 0,
                        width: 0,
                        excavate: false,
                      }}
                    />
                  </div>
                  {participant.ticket_status === 'ATTENDED' && (
                    <div className="absolute inset-0 bg-teal-600/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <div className="bg-teal-600 text-white font-black text-lg px-6 py-2 rounded-full rotate-[-12deg] shadow-lg">
                        ✓ HADIR
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-slate-500 text-xs text-center">
                  Scan QR ini kepada panitia di lokasi acara
                </p>
                <p className="font-mono text-sm font-bold text-slate-700 tracking-widest">
                  {participant.ticket_code}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="w-32 h-32 bg-slate-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-200">
                  <QrCode className="w-12 h-12 text-slate-300" />
                </div>
                <p className="text-slate-400 text-xs text-center">
                  QR Code akan tersedia setelah pembayaran dikonfirmasi
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-6 space-y-3">
          {showQR && (
            <Button className="w-full h-11 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md">
              <Download className="w-4 h-4 mr-2" />Screenshot / Simpan Tiket
            </Button>
          )}
          <Button variant="outline" onClick={() => navigate('/events')} className="w-full h-11 rounded-xl">
            ← Kembali ke Daftar Event
          </Button>
        </div>

        {/* Demo links */}
        <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-600 space-y-1">
          <p className="font-bold">Demo Tiket:</p>
          <button onClick={() => navigate('/ticket/TKT-EVT001-ARXK')} className="block hover:underline">→ TKT-EVT001-ARXK (Paid / NIAM)</button>
          <button onClick={() => navigate('/ticket/TKT-EVT001-RZFL')} className="block hover:underline">→ TKT-EVT001-RZFL (Pending Approval / Umum)</button>
          <button onClick={() => navigate('/ticket/TKT-EVT001-STNR')} className="block hover:underline">→ TKT-EVT001-STNR (Pending Payment)</button>
          <button onClick={() => navigate('/ticket/TKT-EVT004-FTMZ')} className="block hover:underline">→ TKT-EVT004-FTMZ (Attended)</button>
        </div>
      </div>
    </div>
  );
};

export default EventTicket;
