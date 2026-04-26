import { useState } from "react";
import {
  ExternalLink, Phone, Plus, Search, Users2,
  Mail, Star, Tag, Upload, Camera
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

// ─── Types ────────────────────────────────────────────────────────────────────

type SpeakerCategory = "Tech" | "Bisnis" | "Desain" | "Jurnalistik" | "Keagamaan" | "Lainnya";

interface Speaker {
  id: string;
  nama_lengkap: string;
  bio: string;
  alamat: string;
  no_telp: string;
  foto_url: string;
  kategori: SpeakerCategory;
  keahlian: string[];
  portfolio_url?: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_SPEAKERS: Speaker[] = [
  {
    id: "sp-001",
    nama_lengkap: "Ust. Ahmad Khalid",
    bio: "Videografer profesional dengan pengalaman 10 tahun di bidang dokumentasi pesantren dan konten Islami. Telah melatih lebih dari 500 santri di berbagai pesantren.",
    alamat: "Malang, Jawa Timur",
    no_telp: "08123456789",
    foto_url: "https://placehold.co/200x200/166534/fff?text=AK",
    kategori: "Tech",
    keahlian: ["Videografi", "DaVinci Resolve", "Storytelling"],
    portfolio_url: "https://youtube.com",
  },
  {
    id: "sp-002",
    nama_lengkap: "Kak Dewi Kartika",
    bio: "Editor video & Social Media Strategist MPJ. Spesialis konten viral pesantren dengan total 2 juta lebih pengikut di semua platform.",
    alamat: "Surabaya, Jawa Timur",
    no_telp: "08234567890",
    foto_url: "https://placehold.co/200x200/166534/fff?text=DK",
    kategori: "Desain",
    keahlian: ["CapCut", "Adobe Premiere", "Social Media"],
    portfolio_url: "https://instagram.com",
  },
  {
    id: "sp-003",
    nama_lengkap: "KH. Zaini Murtadho",
    bio: "Ketua Majelis Pimpinan Pusat MPJ. Pakar komunikasi Islami dan strategi media pesantren nasional.",
    alamat: "Jombang, Jawa Timur",
    no_telp: "08345678901",
    foto_url: "https://placehold.co/200x200/1e40af/fff?text=ZM",
    kategori: "Keagamaan",
    keahlian: ["Public Speaking", "Dakwah Digital", "Kepemimpinan"],
  },
  {
    id: "sp-004",
    nama_lengkap: "Ust. Bachtiar Nasir",
    bio: "Dai & Content Creator Nasional. Dikenal dengan gaya konten Islami yang modern dan mudah dipahami generasi muda.",
    alamat: "Jakarta",
    no_telp: "08456789012",
    foto_url: "https://placehold.co/200x200/374151/fff?text=BN",
    kategori: "Keagamaan",
    keahlian: ["Dakwah Digital", "YouTube", "Podcast"],
    portfolio_url: "https://youtube.com",
  },
];

const CATEGORY_COLORS: Record<SpeakerCategory, string> = {
  Tech: "bg-blue-100 text-blue-700",
  Bisnis: "bg-amber-100 text-amber-700",
  Desain: "bg-purple-100 text-purple-700",
  Jurnalistik: "bg-emerald-100 text-emerald-700",
  Keagamaan: "bg-teal-100 text-teal-700",
  Lainnya: "bg-gray-100 text-gray-600",
};

// ─── Component ────────────────────────────────────────────────────────────────

const EventNarasumber = () => {
  const { toast } = useToast();
  const [speakers, setSpeakers] = useState<Speaker[]>(MOCK_SPEAKERS);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [addOpen, setAddOpen] = useState(false);

  const filtered = speakers.filter((s) => {
    const matchSearch =
      s.nama_lengkap.toLowerCase().includes(search.toLowerCase()) ||
      s.alamat.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "ALL" || s.kategori === categoryFilter;
    return matchSearch && matchCat;
  });


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Narasumber</h1>
          <p className="text-slate-500 text-sm mt-0.5">Kelola daftar pembicara & narasumber event</p>
        </div>
        <Button
          onClick={() => setAddOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-9 text-sm gap-1.5"
        >
          <Plus className="w-4 h-4" /> Tambah Narasumber
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-3">
        {[
          { label: "Total Narasumber Terdaftar", value: speakers.length, color: "text-slate-900" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-slate-100 p-4 text-center shadow-sm">
            <p className={`text-2xl font-extrabold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau lokasi..."
            className="pl-9 h-9 rounded-xl border-slate-200 text-sm"
          />
        </div>
        <Select value={categoryFilter} onValueChange={(v) => v !== null && setCategoryFilter(v)}>
          <SelectTrigger className="h-9 w-full sm:w-44 rounded-xl border-slate-200 text-sm">
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua Kategori</SelectItem>
            {(["Tech", "Bisnis", "Desain", "Jurnalistik", "Keagamaan", "Lainnya"] as SpeakerCategory[]).map((k) => (
              <SelectItem key={k} value={k}>{k}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Cards Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 py-16 text-center text-slate-400 text-sm">
          <Users2 className="w-10 h-10 mx-auto mb-3 text-slate-200" />
          Tidak ada narasumber ditemukan.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((speaker) => (
            <div key={speaker.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4 hover:shadow-md transition-shadow">
              {/* Speaker header */}
              <div className="flex items-start gap-3">
                <img
                  src={speaker.foto_url}
                  alt={speaker.nama_lengkap}
                  className="w-14 h-14 rounded-xl object-cover bg-slate-100 flex-shrink-0 ring-2 ring-emerald-100"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 text-sm line-clamp-1">{speaker.nama_lengkap}</p>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">{speaker.alamat}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1.5 inline-block ${CATEGORY_COLORS[speaker.kategori]}`}>
                    {speaker.kategori}
                  </span>
                </div>
              </div>

              {/* Bio */}
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{speaker.bio}</p>

              {/* Keahlian tags */}
              <div className="flex flex-wrap gap-1.5">
                {speaker.keahlian.map((k) => (
                  <span key={k} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium flex items-center gap-0.5">
                    <Tag className="w-2.5 h-2.5" />{k}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-50">
                <a
                  href={`tel:${speaker.no_telp}`}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-600 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" /> {speaker.no_telp}
                </a>
                <div className="flex-1" />
                {speaker.portfolio_url && (
                  <a
                    href={speaker.portfolio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Dialog (placeholder) */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Narasumber</DialogTitle>
            <DialogDescription>Data narasumber akan tersedia untuk dipilih saat membuat event.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex flex-col items-center justify-center space-y-2 mb-4">
              <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:bg-slate-50 cursor-pointer transition-colors relative overflow-hidden group">
                <Camera className="w-8 h-8" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Upload className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Upload Foto Profil (1:1)</p>
            </div>
            <div className="space-y-1.5">
              <Label>Nama Lengkap *</Label>
              <Input placeholder="Nama narasumber" className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label>Kategori *</Label>
              <Select>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {(["Tech", "Bisnis", "Desain", "Jurnalistik", "Keagamaan", "Lainnya"] as SpeakerCategory[]).map((k) => (
                    <SelectItem key={k} value={k}>{k}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>No. Telepon</Label>
                <Input placeholder="08xxxxxxxxxx" className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label>Kota / Alamat</Label>
                <Input placeholder="Kota asal" className="rounded-xl" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Bio / Profil Singkat</Label>
              <Textarea placeholder="Deskripsi singkat tentang narasumber..." rows={3} className="rounded-xl resize-none" />
            </div>
            <div className="space-y-1.5">
              <Label>Portfolio / Website</Label>
              <Input placeholder="https://..." className="rounded-xl" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Batal</Button>
            <Button
              onClick={() => {
                toast({ title: "Narasumber ditambahkan", description: "Data berhasil disimpan." });
                setAddOpen(false);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
            >
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventNarasumber;
