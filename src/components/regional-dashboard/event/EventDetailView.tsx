import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Calendar, Upload, Plus, Trash2, Search, Download, UserPlus, FileText, Lock, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EventData, EventStatus } from "./EventCard";

interface Participant {
  id: string;
  nama: string;
  asalPesantren: string;
  waktuKlaim: string;
  metode: "App Token" | "Manual Admin";
}

interface EventDetailViewProps {
  event: EventData;
  onBack: () => void;
  onUpdateEvent: (event: EventData) => void;
}

// Mock data
const pesantrenList = [
  "Pondok Pesantren Nurul Huda",
  "Pondok Pesantren Al-Hikam",
  "Pondok Pesantren Darul Ulum",
  "Pondok Pesantren Salafiyah",
  "Pondok Pesantren Al-Amin",
];

const userList = [
  { id: "1", nama: "Ahmad Fauzi", pesantren: "PP Nurul Huda" },
  { id: "2", nama: "Siti Aminah", pesantren: "PP Al-Hikam" },
  { id: "3", nama: "Muhammad Rizki", pesantren: "PP Darul Ulum" },
  { id: "4", nama: "Fatimah Zahra", pesantren: "PP Salafiyah" },
];

const mockParticipants: Participant[] = [
  { id: "1", nama: "Ahmad Fauzi", asalPesantren: "PP Nurul Huda", waktuKlaim: "2024-01-15 10:30", metode: "App Token" },
  { id: "2", nama: "Siti Aminah", asalPesantren: "PP Al-Hikam", waktuKlaim: "2024-01-15 11:00", metode: "Manual Admin" },
  { id: "3", nama: "Muhammad Rizki", asalPesantren: "PP Darul Ulum", waktuKlaim: "2024-01-15 11:30", metode: "App Token" },
];

const EventDetailView = ({ event, onBack, onUpdateEvent }: EventDetailViewProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("proposal");
  const [currentEvent, setCurrentEvent] = useState<EventData>(event);

  // Form states
  const [proposalForm, setProposalForm] = useState({
    poster: null as File | null,
    posterPreview: event.poster || "",
    judul: event.judul,
    waktu: event.waktu,
    lokasi: event.lokasi,
    lokasiManual: "",
    linkPendaftaran: "",
    estimasiBiaya: "",
    panitia: [{ role: "", users: [] as string[] }],
  });

  const [laporanForm, setLaporanForm] = useState({
    realisasiAnggaran: "",
    dokumentasiUrl: "",
    fileLpj: null as File | null,
  });

  const [sertifikatForm, setSertifikatForm] = useState({
    tokenCode: "",
    templateFile: null as File | null,
    claimEnabled: false,
  });

  const [participants, setParticipants] = useState<Participant[]>(mockParticipants);
  const [searchParticipant, setSearchParticipant] = useState("");
  const [manualUserSearch, setManualUserSearch] = useState("");
  const [selectedManualUser, setSelectedManualUser] = useState<typeof userList[0] | null>(null);
  const [manualModalOpen, setManualModalOpen] = useState(false);

  const [lokasiSearch, setLokasiSearch] = useState(event.lokasi);
  const [showLokasiDropdown, setShowLokasiDropdown] = useState(false);

  const filteredPesantren = pesantrenList.filter((p) =>
    p.toLowerCase().includes(lokasiSearch.toLowerCase())
  );

  const filteredUsers = userList.filter((u) =>
    u.nama.toLowerCase().includes(manualUserSearch.toLowerCase()) ||
    u.pesantren.toLowerCase().includes(manualUserSearch.toLowerCase())
  );

  const handlePosterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProposalForm({
        ...proposalForm,
        poster: file,
        posterPreview: URL.createObjectURL(file),
      });
    }
  };

  const handleAddPanitia = () => {
    setProposalForm({
      ...proposalForm,
      panitia: [...proposalForm.panitia, { role: "", users: [] }],
    });
  };

  const handleRemovePanitia = (index: number) => {
    const newPanitia = proposalForm.panitia.filter((_, i) => i !== index);
    setProposalForm({ ...proposalForm, panitia: newPanitia });
  };

  const handleSubmitProposal = () => {
    if (!proposalForm.judul || !proposalForm.waktu) {
      toast({
        title: "Form tidak lengkap",
        description: "Mohon lengkapi judul dan waktu event.",
        variant: "destructive",
      });
      return;
    }

    if (proposalForm.linkPendaftaran && 
        !proposalForm.linkPendaftaran.includes("forms.google.com") &&
        !proposalForm.linkPendaftaran.includes("forms.gle")) {
      toast({
        title: "Link tidak valid",
        description: "Link pendaftaran harus menggunakan Google Forms.",
        variant: "destructive",
      });
      return;
    }

    const updatedEvent = {
      ...currentEvent,
      judul: proposalForm.judul,
      waktu: proposalForm.waktu,
      lokasi: proposalForm.lokasi || proposalForm.lokasiManual,
      poster: proposalForm.posterPreview,
    };

    setCurrentEvent(updatedEvent);
    onUpdateEvent(updatedEvent);

    toast({
      title: "Proposal berhasil disimpan",
      description: "Data event telah diperbarui.",
    });
  };

  const handleSubmitLaporan = () => {
    if (!laporanForm.realisasiAnggaran) {
      toast({
        title: "Form tidak lengkap",
        description: "Mohon isi realisasi anggaran.",
        variant: "destructive",
      });
      return;
    }

    const updatedEvent = { ...currentEvent, status: "COMPLETED" as EventStatus };
    setCurrentEvent(updatedEvent);
    onUpdateEvent(updatedEvent);

    toast({
      title: "Laporan tersimpan",
      description: "Status event diubah ke COMPLETED. Tab Sertifikat dan Data Peserta telah dibuka.",
    });
  };

  const handleSaveSertifikat = () => {
    if (!sertifikatForm.tokenCode) {
      toast({
        title: "Token diperlukan",
        description: "Mohon isi kode token sertifikat.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Setting sertifikat tersimpan",
      description: `Token: ${sertifikatForm.tokenCode}, Klaim: ${sertifikatForm.claimEnabled ? "Aktif" : "Nonaktif"}`,
    });
  };

  const handleManualCheckIn = () => {
    if (!selectedManualUser) return;

    const newParticipant: Participant = {
      id: Date.now().toString(),
      nama: selectedManualUser.nama,
      asalPesantren: selectedManualUser.pesantren,
      waktuKlaim: new Date().toLocaleString("id-ID"),
      metode: "Manual Admin",
    };

    setParticipants([...participants, newParticipant]);
    setManualModalOpen(false);
    setSelectedManualUser(null);
    setManualUserSearch("");

    toast({
      title: "Peserta ditambahkan",
      description: `${selectedManualUser.nama} berhasil ditambahkan ke daftar hadir.`,
    });
  };

  const isTabLocked = (tab: string) => {
    if (tab === "sertifikat" || tab === "peserta") {
      return currentEvent.status !== "COMPLETED";
    }
    return false;
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={onBack} className="gap-2 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Galeri
      </Button>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{currentEvent.judul}</h1>
          <p className="text-muted-foreground">Kelola event dari perencanaan hingga distribusi sertifikat</p>
        </div>
        <Badge variant={currentEvent.status === "COMPLETED" ? "default" : "secondary"} className={currentEvent.status === "COMPLETED" ? "bg-emerald-600" : ""}>
          Status: {currentEvent.status}
        </Badge>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="overflow-x-auto -mx-6 px-6 mb-6">
              <TabsList className="inline-flex w-auto min-w-full sm:w-full justify-start sm:justify-center">
                <TabsTrigger value="proposal" className="flex-shrink-0">
                  <FileText className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Proposal Event</span>
                  <span className="sm:hidden">Proposal</span>
                </TabsTrigger>
                <TabsTrigger value="laporan" className="flex-shrink-0">
                  <FileText className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Laporan Kegiatan</span>
                  <span className="sm:hidden">Laporan</span>
                </TabsTrigger>
                <TabsTrigger value="sertifikat" className="flex-shrink-0" disabled={isTabLocked("sertifikat")}>
                  {isTabLocked("sertifikat") ? <Lock className="h-4 w-4 mr-2" /> : <Image className="h-4 w-4 mr-2" />}
                  <span className="hidden sm:inline">Setting Sertifikat</span>
                  <span className="sm:hidden">Sertifikat</span>
                </TabsTrigger>
                <TabsTrigger value="peserta" className="flex-shrink-0" disabled={isTabLocked("peserta")}>
                  {isTabLocked("peserta") ? <Lock className="h-4 w-4 mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
                  <span className="hidden sm:inline">Data Peserta</span>
                  <span className="sm:hidden">Peserta</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* TAB 1: PROPOSAL EVENT */}
            <TabsContent value="proposal" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Poster Event (4:5 Portrait)</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                    {proposalForm.posterPreview ? (
                      <div className="relative aspect-[4/5] max-w-[200px] mx-auto">
                        <img
                          src={proposalForm.posterPreview}
                          alt="Poster preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-2 right-2"
                          onClick={() => setProposalForm({ ...proposalForm, poster: null, posterPreview: "" })}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <div className="aspect-[4/5] max-w-[200px] mx-auto bg-muted rounded-lg flex flex-col items-center justify-center">
                          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                          <span className="text-sm text-muted-foreground">Upload Poster</span>
                        </div>
                        <input type="file" accept="image/*" className="hidden" onChange={handlePosterUpload} />
                      </label>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="judul">Judul Event *</Label>
                    <Input
                      id="judul"
                      placeholder="Masukkan judul event"
                      value={proposalForm.judul}
                      onChange={(e) => setProposalForm({ ...proposalForm, judul: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="waktu">Waktu Pelaksanaan *</Label>
                    <Input
                      id="waktu"
                      type="datetime-local"
                      value={proposalForm.waktu}
                      onChange={(e) => setProposalForm({ ...proposalForm, waktu: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Lokasi (Pesantren / Manual)</Label>
                    <div className="relative">
                      <Input
                        placeholder="Cari pesantren atau ketik lokasi manual..."
                        value={lokasiSearch}
                        onChange={(e) => {
                          setLokasiSearch(e.target.value);
                          setShowLokasiDropdown(true);
                          setProposalForm({ ...proposalForm, lokasiManual: e.target.value, lokasi: "" });
                        }}
                        onFocus={() => setShowLokasiDropdown(true)}
                        onBlur={() => setTimeout(() => setShowLokasiDropdown(false), 200)}
                      />
                      {showLokasiDropdown && lokasiSearch && (
                        <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-40 overflow-y-auto">
                          {filteredPesantren.length > 0 ? (
                            filteredPesantren.map((p) => (
                              <div
                                key={p}
                                className="px-3 py-2 hover:bg-muted cursor-pointer text-sm"
                                onClick={() => {
                                  setLokasiSearch(p);
                                  setProposalForm({ ...proposalForm, lokasi: p, lokasiManual: "" });
                                  setShowLokasiDropdown(false);
                                }}
                              >
                                {p}
                              </div>
                            ))
                          ) : (
                            <div className="px-3 py-2 text-sm text-muted-foreground">
                              Tidak ditemukan - akan menggunakan input manual
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="link">Link Pendaftaran (Google Forms)</Label>
                    <Input
                      id="link"
                      type="url"
                      placeholder="https://forms.google.com/..."
                      value={proposalForm.linkPendaftaran}
                      onChange={(e) => setProposalForm({ ...proposalForm, linkPendaftaran: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="biaya">Estimasi Biaya (Rp)</Label>
                    <Input
                      id="biaya"
                      type="number"
                      placeholder="500000"
                      value={proposalForm.estimasiBiaya}
                      onChange={(e) => setProposalForm({ ...proposalForm, estimasiBiaya: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Susunan Panitia */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Susunan Panitia (Jobdesk)</Label>
                  <Button variant="outline" size="sm" onClick={handleAddPanitia}>
                    <Plus className="h-4 w-4 mr-1" /> Tambah
                  </Button>
                </div>
                <div className="space-y-3">
                  {proposalForm.panitia.map((item, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-2">
                      <Input
                        placeholder="Jabatan (e.g., Ketua)"
                        className="sm:w-1/3"
                        value={item.role}
                        onChange={(e) => {
                          const newPanitia = [...proposalForm.panitia];
                          newPanitia[index].role = e.target.value;
                          setProposalForm({ ...proposalForm, panitia: newPanitia });
                        }}
                      />
                      <Select>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Pilih anggota..." />
                        </SelectTrigger>
                        <SelectContent>
                          {userList.map((u) => (
                            <SelectItem key={u.id} value={u.id}>
                              {u.nama} - {u.pesantren}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {proposalForm.panitia.length > 1 && (
                        <Button variant="ghost" size="icon" onClick={() => handleRemovePanitia(index)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={handleSubmitProposal} className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700">
                Simpan Perubahan
              </Button>
            </TabsContent>

            {/* TAB 2: LAPORAN KEGIATAN */}
            <TabsContent value="laporan" className="space-y-6">
              <Card className="bg-muted/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{currentEvent.judul}</CardTitle>
                  <CardDescription>
                    {currentEvent.waktu} • {currentEvent.lokasi}
                  </CardDescription>
                </CardHeader>
              </Card>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="realisasi">Realisasi Anggaran (Rp) *</Label>
                  <Input
                    id="realisasi"
                    type="number"
                    placeholder="Masukkan realisasi anggaran"
                    value={laporanForm.realisasiAnggaran}
                    onChange={(e) => setLaporanForm({ ...laporanForm, realisasiAnggaran: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dokumentasi">Link Dokumentasi (Google Drive)</Label>
                  <Input
                    id="dokumentasi"
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={laporanForm.dokumentasiUrl}
                    onChange={(e) => setLaporanForm({ ...laporanForm, dokumentasiUrl: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>File LPJ (PDF)</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <label className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">
                      {laporanForm.fileLpj ? laporanForm.fileLpj.name : "Upload File LPJ"}
                    </span>
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => setLaporanForm({ ...laporanForm, fileLpj: e.target.files?.[0] || null })}
                    />
                  </label>
                </div>
              </div>

              <Button onClick={handleSubmitLaporan} className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700">
                Simpan Laporan
              </Button>
            </TabsContent>

            {/* TAB 3: SETTING SERTIFIKAT */}
            <TabsContent value="sertifikat" className="space-y-6">
              {isTabLocked("sertifikat") ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Lock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Tab ini terkunci.</p>
                  <p className="text-sm">Selesaikan Laporan Kegiatan untuk membuka fitur ini.</p>
                </div>
              ) : (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="token">Kode Token Sertifikat *</Label>
                      <Input
                        id="token"
                        placeholder="e.g., MPJ-01"
                        value={sertifikatForm.tokenCode}
                        onChange={(e) => setSertifikatForm({ ...sertifikatForm, tokenCode: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground">Token unik untuk klaim sertifikat oleh peserta.</p>
                    </div>

                    <div className="space-y-2">
                      <Label>Template Sertifikat</Label>
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                        <label className="cursor-pointer">
                          <Image className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                          <span className="text-sm text-muted-foreground">
                            {sertifikatForm.templateFile ? sertifikatForm.templateFile.name : "Upload Template"}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              setSertifikatForm({ ...sertifikatForm, templateFile: e.target.files?.[0] || null })
                            }
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 border rounded-lg">
                    <Switch
                      checked={sertifikatForm.claimEnabled}
                      onCheckedChange={(checked) => setSertifikatForm({ ...sertifikatForm, claimEnabled: checked })}
                    />
                    <div>
                      <Label>Aktifkan Klaim Sertifikat</Label>
                      <p className="text-sm text-muted-foreground">
                        {sertifikatForm.claimEnabled
                          ? "Peserta dapat mengklaim sertifikat melalui aplikasi."
                          : "Klaim sertifikat dinonaktifkan."}
                      </p>
                    </div>
                  </div>

                  <Button onClick={handleSaveSertifikat} className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700">
                    Simpan Setting
                  </Button>
                </>
              )}
            </TabsContent>

            {/* TAB 4: DATA PESERTA */}
            <TabsContent value="peserta" className="space-y-6">
              {isTabLocked("peserta") ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Lock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Tab ini terkunci.</p>
                  <p className="text-sm">Selesaikan Laporan Kegiatan untuk membuka fitur ini.</p>
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Cari peserta..."
                        className="pl-10"
                        value={searchParticipant}
                        onChange={(e) => setSearchParticipant(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Dialog open={manualModalOpen} onOpenChange={setManualModalOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline">
                            <UserPlus className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Input Peserta Manual</span>
                            <span className="sm:hidden">Manual</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Input Peserta Manual</DialogTitle>
                            <DialogDescription>
                              Cari dan tambahkan peserta yang tidak bisa klaim via aplikasi.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="Cari nama atau pesantren..."
                                className="pl-10"
                                value={manualUserSearch}
                                onChange={(e) => setManualUserSearch(e.target.value)}
                              />
                            </div>
                            <div className="max-h-60 overflow-y-auto space-y-2">
                              {filteredUsers.map((user) => (
                                <div
                                  key={user.id}
                                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                    selectedManualUser?.id === user.id
                                      ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20"
                                      : "hover:bg-muted"
                                  }`}
                                  onClick={() => setSelectedManualUser(user)}
                                >
                                  <p className="font-medium">{user.nama}</p>
                                  <p className="text-sm text-muted-foreground">{user.pesantren}</p>
                                </div>
                              ))}
                            </div>
                            <Button
                              className="w-full bg-emerald-600 hover:bg-emerald-700"
                              disabled={!selectedManualUser}
                              onClick={handleManualCheckIn}
                            >
                              Tambahkan ke Daftar Hadir
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Export Excel</span>
                        <span className="sm:hidden">Export</span>
                      </Button>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">No</TableHead>
                          <TableHead>Nama Peserta</TableHead>
                          <TableHead className="hidden sm:table-cell">Asal Pesantren</TableHead>
                          <TableHead className="hidden md:table-cell">Waktu Klaim</TableHead>
                          <TableHead>Metode</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {participants
                          .filter(
                            (p) =>
                              p.nama.toLowerCase().includes(searchParticipant.toLowerCase()) ||
                              p.asalPesantren.toLowerCase().includes(searchParticipant.toLowerCase())
                          )
                          .map((participant, index) => (
                            <TableRow key={participant.id}>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{participant.nama}</p>
                                  <p className="text-sm text-muted-foreground sm:hidden">{participant.asalPesantren}</p>
                                </div>
                              </TableCell>
                              <TableCell className="hidden sm:table-cell">{participant.asalPesantren}</TableCell>
                              <TableCell className="hidden md:table-cell">{participant.waktuKlaim}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={participant.metode === "App Token" ? "default" : "secondary"}
                                  className={participant.metode === "App Token" ? "bg-emerald-600" : ""}
                                >
                                  {participant.metode}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Total: {participants.length} peserta terdaftar
                  </p>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventDetailView;
