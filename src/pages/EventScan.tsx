import { useState, useRef, useCallback } from "react";
import { Camera, CheckCircle, XCircle, RotateCcw, QrCode, Users, Clock, UserCheck } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getParticipantByTicketCode, getEventById, MOCK_PARTICIPANTS, MOCK_EVENTS } from "@/lib/event-mock-data";

type ScanResult = 'idle' | 'success' | 'already_attended' | 'invalid';

interface ScanRecord {
  ticket_code: string;
  name: string;
  event: string;
  result: ScanResult;
  time: string;
}

const ResultDisplay = ({
  result,
  participant,
  eventTitle,
  onReset,
}: {
  result: ScanResult;
  participant?: ReturnType<typeof getParticipantByTicketCode>;
  eventTitle?: string;
  onReset: () => void;
}) => {
  if (result === 'success' && participant) {
    return (
      <div className="flex flex-col items-center gap-5 py-6 animate-in fade-in zoom-in-95 duration-300">
        <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center ring-4 ring-emerald-200">
          <CheckCircle className="w-12 h-12 text-emerald-600" />
        </div>
        <div className="text-center">
          <p className="text-2xl font-black text-emerald-700">Berhasil!</p>
          <p className="text-slate-500 text-sm mt-1">Peserta berhasil check-in</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 w-full max-w-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-200 flex items-center justify-center text-lg font-black text-emerald-700">
              {participant.full_name.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-slate-900">{participant.full_name}</p>
              <p className="text-sm text-slate-500">{participant.institution}</p>
            </div>
            <Badge className={`ml-auto text-xs ${participant.type === 'NIAM' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
              {participant.type}
            </Badge>
          </div>
          <div className="border-t border-emerald-100 pt-3 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Event</span>
              <span className="font-medium text-slate-700 text-right max-w-[60%] truncate">{eventTitle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Kode Tiket</span>
              <span className="font-mono text-xs text-emerald-700">{participant.ticket_code}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Waktu Check-in</span>
              <span className="text-slate-700">{format(new Date(), 'HH:mm:ss', { locale: idLocale })}</span>
            </div>
          </div>
        </div>
        <Button
          onClick={onReset}
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 h-12 font-semibold"
        >
          Scan Selanjutnya →
        </Button>
      </div>
    );
  }

  if (result === 'already_attended') {
    return (
      <div className="flex flex-col items-center gap-5 py-6 animate-in fade-in zoom-in-95 duration-300">
        <div className="w-24 h-24 rounded-full bg-amber-100 flex items-center justify-center ring-4 ring-amber-200">
          <XCircle className="w-12 h-12 text-amber-500" />
        </div>
        <div className="text-center">
          <p className="text-2xl font-black text-amber-600">Sudah Scan!</p>
          <p className="text-slate-500 text-sm mt-1">Tiket ini sudah pernah digunakan untuk check-in</p>
        </div>
        {participant && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 w-full max-w-sm">
            <p className="font-bold text-slate-900">{participant.full_name}</p>
            <p className="text-sm text-slate-500">{participant.institution}</p>
            {participant.attended_at && (
              <p className="text-xs text-amber-600 mt-2">
                Check-in: {format(new Date(participant.attended_at), 'dd MMM yyyy · HH:mm', { locale: idLocale })}
              </p>
            )}
          </div>
        )}
        <Button onClick={onReset} variant="outline" className="rounded-xl px-8 h-12 font-semibold">
          <RotateCcw className="w-4 h-4 mr-2" />Scan Lagi
        </Button>
      </div>
    );
  }

  if (result === 'invalid') {
    return (
      <div className="flex flex-col items-center gap-5 py-6 animate-in fade-in zoom-in-95 duration-300">
        <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center ring-4 ring-red-200">
          <XCircle className="w-12 h-12 text-red-500" />
        </div>
        <div className="text-center">
          <p className="text-2xl font-black text-red-600">Tiket Tidak Valid</p>
          <p className="text-slate-500 text-sm mt-1">Kode QR tidak ditemukan atau belum dikonfirmasi</p>
        </div>
        <Button onClick={onReset} variant="outline" className="rounded-xl px-8 h-12 font-semibold border-red-200 text-red-600 hover:bg-red-50">
          <RotateCcw className="w-4 h-4 mr-2" />Coba Lagi
        </Button>
      </div>
    );
  }

  return null;
};

const EventScan = () => {
  const [manualCode, setManualCode] = useState('');
  const [result, setResult] = useState<ScanResult>('idle');
  const [scannedParticipant, setScannedParticipant] = useState<ReturnType<typeof getParticipantByTicketCode>>(undefined);
  const [scannedEventTitle, setScannedEventTitle] = useState('');
  const [history, setHistory] = useState<ScanRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'scan' | 'history' | 'stats'>('scan');

  // Stats
  const totalPaid = MOCK_PARTICIPANTS.filter(p => ['PAID', 'ATTENDED'].includes(p.ticket_status)).length;
  const totalAttended = MOCK_PARTICIPANTS.filter(p => p.ticket_status === 'ATTENDED').length;

  const processCode = useCallback((code: string) => {
    const trimmed = code.trim();
    if (!trimmed) return;

    const participant = getParticipantByTicketCode(trimmed);

    if (!participant) {
      setResult('invalid');
      setScannedParticipant(undefined);
      setHistory(prev => [{ ticket_code: trimmed, name: 'Tidak diketahui', event: '-', result: 'invalid', time: new Date().toISOString() }, ...prev.slice(0, 19)]);
      return;
    }

    const event = getEventById(participant.event_id);
    const eventTitle = event?.title ?? 'Unknown Event';

    if (participant.ticket_status === 'ATTENDED') {
      setResult('already_attended');
      setScannedParticipant(participant);
      setScannedEventTitle(eventTitle);
      setHistory(prev => [{ ticket_code: trimmed, name: participant.full_name, event: eventTitle, result: 'already_attended', time: new Date().toISOString() }, ...prev.slice(0, 19)]);
      return;
    }

    if (!['PAID'].includes(participant.ticket_status)) {
      setResult('invalid');
      setScannedParticipant(participant);
      setScannedEventTitle(eventTitle);
      setHistory(prev => [{ ticket_code: trimmed, name: participant.full_name, event: eventTitle, result: 'invalid', time: new Date().toISOString() }, ...prev.slice(0, 19)]);
      return;
    }

    // SUCCESS — mark as attended (in real app, call API)
    setResult('success');
    setScannedParticipant(participant);
    setScannedEventTitle(eventTitle);
    setHistory(prev => [{ ticket_code: trimmed, name: participant.full_name, event: eventTitle, result: 'success', time: new Date().toISOString() }, ...prev.slice(0, 19)]);
  }, []);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processCode(manualCode);
    setManualCode('');
  };

  const reset = () => {
    setResult('idle');
    setScannedParticipant(undefined);
    setManualCode('');
  };

  const DEMO_CODES = [
    { code: 'TKT-EVT001-ARXK', label: 'PAID ✓', color: 'bg-emerald-100 text-emerald-700' },
    { code: 'TKT-EVT004-FTMZ', label: 'ATTENDED', color: 'bg-teal-100 text-teal-700' },
    { code: 'TKT-EVT001-STNR', label: 'UNPAID', color: 'bg-amber-100 text-amber-700' },
    { code: 'TKT-INVALID-0001', label: 'INVALID', color: 'bg-red-100 text-red-700' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-white text-sm">MPJ Scanner</p>
            <p className="text-slate-400 text-xs">Mode Panitia</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 text-xs font-medium">Online</span>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="bg-slate-800 border-b border-slate-700 flex">
        {[
          { id: 'scan', label: 'Scanner', icon: <Camera className="w-4 h-4" /> },
          { id: 'history', label: 'Riwayat', icon: <Clock className="w-4 h-4" /> },
          { id: 'stats', label: 'Statistik', icon: <Users className="w-4 h-4" /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-emerald-400 border-b-2 border-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      <div className="max-w-md mx-auto px-4 py-6">

        {/* ── SCAN TAB ── */}
        {activeTab === 'scan' && (
          <div className="space-y-6">
            {result === 'idle' ? (
              <>
                {/* Camera Frame */}
                <div className="relative aspect-square bg-slate-800 rounded-3xl overflow-hidden border-2 border-slate-700 flex items-center justify-center">
                  {/* Scan overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-56 h-56 relative">
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />
                      {/* Scan line animation */}
                      <div className="absolute inset-x-2 h-0.5 bg-emerald-400/80 shadow-[0_0_8px_#34d399] animate-bounce top-1/2" />
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-3 z-10">
                    <Camera className="w-12 h-12 text-slate-600" />
                    <p className="text-slate-500 text-sm font-medium">Kamera tidak aktif di demo</p>
                    <p className="text-slate-600 text-xs">Gunakan input manual di bawah</p>
                  </div>
                </div>

                {/* Manual input */}
                <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700 space-y-4">
                  <p className="text-slate-300 text-sm font-semibold flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-emerald-400" />Input Manual / Simulasi Scan
                  </p>
                  <form onSubmit={handleManualSubmit} className="flex gap-2">
                    <Input
                      value={manualCode}
                      onChange={e => setManualCode(e.target.value)}
                      placeholder="Masukkan kode tiket..."
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 rounded-xl font-mono text-sm"
                    />
                    <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 rounded-xl px-4 flex-shrink-0">
                      Scan
                    </Button>
                  </form>

                  {/* Demo quick buttons */}
                  <div className="space-y-2">
                    <p className="text-xs text-slate-500 font-medium">Simulasi cepat:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {DEMO_CODES.map(d => (
                        <button
                          key={d.code}
                          onClick={() => processCode(d.code)}
                          className={`text-xs font-medium px-3 py-2 rounded-lg transition-all ${d.color} hover:opacity-80`}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-slate-800 rounded-2xl border border-slate-700 p-2">
                <ResultDisplay
                  result={result}
                  participant={scannedParticipant}
                  eventTitle={scannedEventTitle}
                  onReset={reset}
                />
              </div>
            )}
          </div>
        )}

        {/* ── HISTORY TAB ── */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            <p className="text-slate-400 text-sm font-medium">Riwayat Scan Sesi Ini ({history.length})</p>
            {history.length === 0 ? (
              <div className="text-center py-16">
                <Clock className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <p className="text-slate-500">Belum ada scan</p>
              </div>
            ) : (
              history.map((rec, i) => (
                <div key={i} className="bg-slate-800 rounded-xl border border-slate-700 p-4 flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    rec.result === 'success' ? 'bg-emerald-900/60' :
                    rec.result === 'already_attended' ? 'bg-amber-900/60' :
                    'bg-red-900/60'
                  }`}>
                    {rec.result === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <XCircle className={`w-5 h-5 ${rec.result === 'already_attended' ? 'text-amber-400' : 'text-red-400'}`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white text-sm truncate">{rec.name}</p>
                    <p className="text-slate-500 text-xs truncate">{rec.ticket_code}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-xs font-semibold ${
                      rec.result === 'success' ? 'text-emerald-400' :
                      rec.result === 'already_attended' ? 'text-amber-400' :
                      'text-red-400'
                    }`}>
                      {rec.result === 'success' ? 'Berhasil' : rec.result === 'already_attended' ? 'Duplikat' : 'Invalid'}
                    </p>
                    <p className="text-slate-600 text-xs">
                      {format(new Date(rec.time), 'HH:mm:ss')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── STATS TAB ── */}
        {activeTab === 'stats' && (
          <div className="space-y-4">
            <p className="text-slate-400 text-sm font-medium">Statistik Kehadiran (All Events)</p>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Tiket Valid', val: totalPaid, icon: <UserCheck className="w-5 h-5" />, color: 'text-emerald-400 bg-emerald-900/40' },
                { label: 'Sudah Hadir', val: totalAttended, icon: <CheckCircle className="w-5 h-5" />, color: 'text-teal-400 bg-teal-900/40' },
                { label: 'Scan Sesi Ini', val: history.filter(h => h.result === 'success').length, icon: <Camera className="w-5 h-5" />, color: 'text-blue-400 bg-blue-900/40' },
                { label: 'Scan Gagal', val: history.filter(h => h.result !== 'success').length, icon: <XCircle className="w-5 h-5" />, color: 'text-red-400 bg-red-900/40' },
              ].map(stat => (
                <div key={stat.label} className="bg-slate-800 rounded-2xl border border-slate-700 p-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <p className="text-2xl font-black text-white">{stat.val}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Per-event breakdown */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4 space-y-3">
              <p className="text-slate-300 text-sm font-semibold">Per Event</p>
              {MOCK_EVENTS.filter(e => e.status === 'APPROVED').map(ev => {
                const attended = MOCK_PARTICIPANTS.filter(p => p.event_id === ev.id && p.ticket_status === 'ATTENDED').length;
                const paid = MOCK_PARTICIPANTS.filter(p => p.event_id === ev.id && ['PAID', 'ATTENDED'].includes(p.ticket_status)).length;
                return (
                  <div key={ev.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300 truncate max-w-[60%]">{ev.title}</span>
                      <span className="text-slate-400">{attended}/{paid} hadir</span>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: paid > 0 ? `${(attended / paid) * 100}%` : '0%' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventScan;
