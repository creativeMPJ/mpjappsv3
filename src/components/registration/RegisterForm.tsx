import { useState, useRef } from "react";
import { CheckCircle, AlertCircle, Upload, X, User, Building, Phone, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  MockEvent, CustomField, NIAMProfile,
  lookupNIAM, generateUniqueCode, formatRupiah,
} from "@/lib/event-mock-data";

// ─── Types ────────────────────────────────────────────────────────────────────

type RegistrationPath = 'CHOOSE' | 'NIAM' | 'UMUM';
type RegisterStep = 'PATH_SELECT' | 'NIAM_LOOKUP' | 'FILL_FORM' | 'PAYMENT' | 'SUCCESS';

interface RegistrationData {
  path: 'NIAM' | 'UMUM';
  niam?: string;
  niamProfile?: NIAMProfile;
  full_name: string;
  whatsapp: string;
  institution: string;
  ktp_file?: File | null;
  custom_answers: Record<string, string | string[]>;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const CustomFieldInput = ({
  field,
  value,
  onChange,
}: {
  field: CustomField;
  value: string | string[];
  onChange: (val: string | string[]) => void;
}) => {
  switch (field.type) {
    case 'TEXT':
      return (
        <Input
          value={value as string || ''}
          onChange={e => onChange(e.target.value)}
          required={field.is_required}
          className="rounded-xl"
        />
      );
    case 'TEXTAREA':
      return (
        <Textarea
          value={value as string || ''}
          onChange={e => onChange(e.target.value)}
          required={field.is_required}
          rows={3}
          className="rounded-xl resize-none"
        />
      );
    case 'RADIO':
      return (
        <div className="flex flex-wrap gap-2">
          {field.options?.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`px-4 py-2 text-sm rounded-full border transition-all font-medium ${
                value === opt.value
                  ? 'bg-emerald-600 border-emerald-600 text-white'
                  : 'border-slate-200 text-slate-600 hover:border-emerald-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      );
    case 'DROPDOWN':
      return (
        <select
          value={value as string || ''}
          onChange={e => onChange(e.target.value)}
          required={field.is_required}
          className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
        >
          <option value="">-- Pilih opsi --</option>
          {field.options?.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      );
    case 'CHECKBOX':
      return (
        <div className="flex flex-wrap gap-2">
          {field.options?.map(opt => {
            const checked = Array.isArray(value) ? value.includes(opt.value) : false;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  const arr = Array.isArray(value) ? [...value] : [];
                  onChange(checked ? arr.filter(v => v !== opt.value) : [...arr, opt.value]);
                }}
                className={`px-4 py-2 text-sm rounded-full border transition-all font-medium ${
                  checked
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'border-slate-200 text-slate-600 hover:border-emerald-300'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      );
    default:
      return null;
  }
};

// ─── Main Component ───────────────────────────────────────────────────────────

interface RegisterFormProps {
  event: MockEvent;
  onClose?: () => void;
}

const RegisterForm = ({ event, onClose }: RegisterFormProps) => {
  const [step, setStep] = useState<RegisterStep>('PATH_SELECT');
  const [path, setPath] = useState<RegistrationPath>('CHOOSE');
  const [niamInput, setNiamInput] = useState('');
  const [niamProfile, setNiamProfile] = useState<NIAMProfile | null>(null);
  const [niamError, setNiamError] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [formData, setFormData] = useState<Partial<RegistrationData>>({ custom_answers: {} });
  const [ktpPreview, setKtpPreview] = useState<string | null>(null);
  const ktpRef = useRef<HTMLInputElement>(null);

  const isNiamPath = path === 'NIAM';
  const price = isNiamPath ? event.price_niam : event.price_umum;
  const isFree = price === 0;
  const uniqueCode = generateUniqueCode();
  const totalAmount = price + uniqueCode;

  // ── NIAM lookup ──
  const handleNiamLookup = async () => {
    if (!niamInput.trim()) return;
    setIsLookingUp(true);
    setNiamError('');
    // Simulate API delay
    await new Promise(r => setTimeout(r, 800));
    const found = lookupNIAM(niamInput.trim());
    setIsLookingUp(false);
    if (found) {
      setNiamProfile(found);
      setFormData(prev => ({
        ...prev,
        path: 'NIAM',
        niam: found.niam,
        niamProfile: found,
        full_name: found.full_name,
        institution: found.institution,
      }));
    } else {
      setNiamError('NIAM tidak ditemukan. Pastikan nomor NIAM kamu benar.');
    }
  };

  const handleNiamConfirm = () => {
    if (event.custom_fields.length > 0) {
      setStep('FILL_FORM');
    } else if (isFree) {
      setStep('SUCCESS');
    } else {
      setStep('PAYMENT');
    }
  };

  // ── UMUM form ──
  const handleKtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, ktp_file: file }));
      const reader = new FileReader();
      reader.onload = () => setKtpPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFree) {
      setStep('SUCCESS');
    } else {
      setStep('PAYMENT');
    }
  };

  const handlePaymentProof = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      await new Promise(r => setTimeout(r, 500));
      setStep('SUCCESS');
    }
  };

  // ─── RENDER ────────────────────────────────────────────────────────────────

  // Step: PATH SELECT
  if (step === 'PATH_SELECT') {
    return (
      <div className="space-y-5">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-900">Pilih Jalur Pendaftaran</h2>
          <p className="text-slate-500 text-sm mt-1">Pilih jalur yang sesuai dengan status kamu</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* NIAM Path */}
          <button
            onClick={() => { setPath('NIAM'); setStep('NIAM_LOOKUP'); }}
            className="group relative p-6 rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left"
          >
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-200 transition-colors">
              <span className="text-2xl">🎫</span>
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">Jalur NIAM</h3>
            <p className="text-slate-500 text-sm mb-3">Anggota internal MPJ dengan Nomor Induk Anggota</p>
            <div className="flex items-center gap-2">
              {event.price_niam === 0 ? (
                <Badge className="bg-emerald-500 text-white text-xs">GRATIS</Badge>
              ) : (
                <Badge className="bg-emerald-100 text-emerald-700 text-xs">{formatRupiah(event.price_niam)}</Badge>
              )}
              <span className="text-xs text-emerald-600 font-medium">Harga Khusus</span>
            </div>
          </button>

          {/* UMUM Path */}
          <button
            onClick={() => { setPath('UMUM'); setStep('FILL_FORM'); }}
            className="group relative p-6 rounded-2xl border-2 border-slate-200 bg-slate-50/50 hover:border-slate-400 hover:bg-slate-50 transition-all text-left"
          >
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-slate-200 transition-colors">
              <span className="text-2xl">🌐</span>
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">Jalur Umum</h3>
            <p className="text-slate-500 text-sm mb-3">Pendaftar dari luar / belum menjadi anggota MPJ</p>
            <div className="flex items-center gap-2">
              <Badge className="bg-slate-100 text-slate-700 text-xs border border-slate-200">{formatRupiah(event.price_umum)}</Badge>
              <span className="text-xs text-slate-500 font-medium">Tarif Reguler</span>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // Step: NIAM LOOKUP
  if (step === 'NIAM_LOOKUP') {
    return (
      <div className="space-y-5">
        <button onClick={() => setStep('PATH_SELECT')} className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1">
          ← Kembali pilih jalur
        </button>

        <div>
          <h2 className="text-xl font-bold text-slate-900">Verifikasi NIAM</h2>
          <p className="text-slate-500 text-sm mt-1">Masukkan Nomor Induk Anggota (NIAM) kamu</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="niam-input">Nomor Induk Anggota (NIAM)</Label>
          <div className="flex gap-2">
            <Input
              id="niam-input"
              value={niamInput}
              onChange={e => { setNiamInput(e.target.value); setNiamError(''); }}
              placeholder="Contoh: AN260100101"
              className="rounded-xl font-mono"
              onKeyDown={e => e.key === 'Enter' && handleNiamLookup()}
            />
            <Button
              onClick={handleNiamLookup}
              disabled={isLookingUp || !niamInput.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 rounded-xl px-4"
            >
              {isLookingUp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>
          {niamError && (
            <p className="text-red-500 text-sm flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />{niamError}
            </p>
          )}
        </div>

        {/* Profile card after lookup */}
        {niamProfile && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-4">
              <img
                src={niamProfile.photo_url || 'https://placehold.co/80x80/166534/fff?text=?'}
                alt={niamProfile.full_name}
                className="w-16 h-16 rounded-xl object-cover ring-2 ring-emerald-300"
              />
              <div>
                <p className="font-bold text-slate-900 text-base">{niamProfile.full_name}</p>
                <p className="text-slate-600 text-sm">{niamProfile.jabatan}</p>
                <p className="text-emerald-700 text-xs font-medium mt-0.5">{niamProfile.institution}</p>
              </div>
            </div>
            <div className="flex items-center justify-between bg-white rounded-xl p-3 border border-emerald-100">
              <div className="text-sm">
                <span className="text-slate-500">Harga ticket:</span>
                <span className="font-bold text-emerald-700 ml-2 text-base">
                  {event.price_niam === 0 ? 'GRATIS' : formatRupiah(event.price_niam)}
                </span>
              </div>
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            </div>

            {event.custom_fields.length > 0 && (
              <p className="text-sm text-slate-500 text-center">Ada {event.custom_fields.length} pertanyaan tambahan</p>
            )}

            <Button
              onClick={handleNiamConfirm}
              className="w-full bg-emerald-600 hover:bg-emerald-700 rounded-xl h-11 font-semibold"
            >
              {event.custom_fields.length > 0 ? 'Lanjut Isi Pertanyaan →' : 'Konfirmasi Pendaftaran →'}
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Step: FILL FORM
  if (step === 'FILL_FORM') {
    const isUmum = path === 'UMUM';
    return (
      <form onSubmit={handleFormSubmit} className="space-y-5">
        <button type="button" onClick={() => setStep(isUmum ? 'PATH_SELECT' : 'NIAM_LOOKUP')} className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1">
          ← Kembali
        </button>

        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {isUmum ? 'Form Pendaftaran Umum' : 'Pertanyaan Tambahan'}
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            {isUmum ? 'Lengkapi data diri kamu' : `Pendaftaran sebagai ${niamProfile?.full_name}`}
          </p>
        </div>

        {/* Data diri (UMUM only) */}
        {isUmum && (
          <div className="space-y-4 bg-slate-50 rounded-2xl p-4">
            <p className="text-sm font-semibold text-slate-700 flex items-center gap-2"><User className="w-4 h-4 text-emerald-600" />Data Diri</p>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Nama Lengkap *</Label>
                <Input
                  required
                  value={formData.full_name || ''}
                  onChange={e => setFormData(p => ({ ...p, full_name: e.target.value }))}
                  placeholder="Nama sesuai KTP"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label>No. WhatsApp *</Label>
                <Input
                  required
                  type="tel"
                  value={formData.whatsapp || ''}
                  onChange={e => setFormData(p => ({ ...p, whatsapp: e.target.value }))}
                  placeholder="08xxxxxxxxxx"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Asal Instansi / Lembaga *</Label>
                <Input
                  required
                  value={formData.institution || ''}
                  onChange={e => setFormData(p => ({ ...p, institution: e.target.value }))}
                  placeholder="Pesantren / Kampus / Organisasi"
                  className="rounded-xl"
                />
              </div>
              {/* KTP Upload */}
              <div className="space-y-1.5">
                <Label>Foto KTP / Identitas *</Label>
                <input ref={ktpRef} type="file" accept="image/*" onChange={handleKtpChange} className="hidden" required />
                {ktpPreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-emerald-200">
                    <img src={ktpPreview} alt="KTP" className="w-full h-32 object-cover" />
                    <button
                      type="button"
                      onClick={() => { setKtpPreview(null); setFormData(p => ({ ...p, ktp_file: null })); }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => ktpRef.current?.click()}
                    className="w-full h-24 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all text-slate-400 hover:text-emerald-600"
                  >
                    <Upload className="w-5 h-5" />
                    <span className="text-sm font-medium">Unggah Foto KTP</span>
                    <span className="text-xs">JPG, PNG maks. 5MB</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Custom Fields */}
        {event.custom_fields.length > 0 && (
          <div className="space-y-4 bg-slate-50 rounded-2xl p-4">
            <p className="text-sm font-semibold text-slate-700 flex items-center gap-2"><Building className="w-4 h-4 text-emerald-600" />Pertanyaan Tambahan</p>
            {event.custom_fields.sort((a, b) => a.order - b.order).map(field => (
              <div key={field.id} className="space-y-1.5">
                <Label className="flex items-center gap-1">
                  {field.label}
                  {field.is_required && <span className="text-red-500 text-xs">*</span>}
                </Label>
                <CustomFieldInput
                  field={field}
                  value={formData.custom_answers?.[field.id] ?? ''}
                  onChange={val => setFormData(p => ({
                    ...p,
                    custom_answers: { ...p.custom_answers, [field.id]: val }
                  }))}
                />
              </div>
            ))}
          </div>
        )}

        <Button
          type="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-700 rounded-xl h-11 font-semibold"
        >
          {isFree ? 'Daftar Sekarang (Gratis) →' : `Lanjut ke Pembayaran (${formatRupiah(price)}) →`}
        </Button>
      </form>
    );
  }

  // Step: PAYMENT
  if (step === 'PAYMENT') {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Invoice Pembayaran</h2>
          <p className="text-slate-500 text-sm mt-1">Transfer ke rekening berikut dengan nominal UNIK</p>
        </div>

        {/* Invoice card */}
        <div className="bg-gradient-to-br from-emerald-700 to-teal-700 rounded-2xl p-5 text-white space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-emerald-200 text-sm">Bank Transfer</span>
            <Badge className="bg-white/20 text-white border-0">BSI</Badge>
          </div>
          <div>
            <p className="text-emerald-200 text-xs">Nomor Rekening</p>
            <p className="font-mono text-2xl font-bold tracking-wider">7100 1234 567</p>
            <p className="text-emerald-200 text-sm">a.n. Majelis Pimpinan Jatim</p>
          </div>
          <div className="border-t border-white/20 pt-3">
            <p className="text-emerald-200 text-xs mb-1">Total Transfer (Nominal UNIK)</p>
            <p className="text-3xl font-black">{formatRupiah(totalAmount)}</p>
            <p className="text-emerald-300 text-xs mt-1">
              = {formatRupiah(price)} + kode unik Rp{uniqueCode}
            </p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <p className="font-semibold mb-1">⚠️ Penting!</p>
          <p>Transfer TEPAT sesuai nominal di atas agar verifikasi otomatis berhasil. Nominal kode unik tidak dapat dikembalikan.</p>
        </div>

        {/* Upload proof */}
        <div className="space-y-2">
          <Label>Upload Bukti Transfer *</Label>
          <label className="block">
            <input type="file" accept="image/*" onChange={handlePaymentProof} className="hidden" />
            <div className="w-full h-24 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all text-slate-400 hover:text-emerald-600 cursor-pointer">
              <Upload className="w-5 h-5" />
              <span className="text-sm font-medium">Unggah Foto Bukti Transfer</span>
            </div>
          </label>
        </div>

        <p className="text-xs text-center text-slate-400">
          Setelah upload, pembayaran akan diverifikasi admin dalam 1×24 jam
        </p>
      </div>
    );
  }

  // Step: SUCCESS
  return (
    <div className="text-center py-6 space-y-5">
      <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-10 h-10 text-emerald-600" />
      </div>
      <div>
        <h2 className="text-2xl font-black text-slate-900">Pendaftaran Berhasil! 🎉</h2>
        <p className="text-slate-500 mt-2 text-sm">
          {isFree
            ? 'Kamu sudah terdaftar. E-tiket akan dikirim via WhatsApp.'
            : 'Bukti transfer diterima. Admin akan memverifikasi dalam 1×24 jam.'}
        </p>
      </div>

      <div className="bg-slate-50 rounded-2xl p-4 text-left space-y-2">
        <p className="text-sm text-slate-500">Kode tiket sementara:</p>
        <p className="font-mono text-lg font-bold text-emerald-700">TKT-EVT001-XXXX</p>
        <p className="text-xs text-slate-400">Simpan kode ini. QR Code akan tersedia setelah verifikasi.</p>
      </div>

      {onClose && (
        <Button onClick={onClose} className="w-full bg-emerald-600 hover:bg-emerald-700 rounded-xl h-11 font-semibold">
          Tutup
        </Button>
      )}
    </div>
  );
};

export default RegisterForm;
