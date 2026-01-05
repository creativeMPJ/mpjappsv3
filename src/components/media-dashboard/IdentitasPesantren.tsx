import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Upload, 
  MapPin, 
  Save, 
  Award, 
  CheckCircle2, 
  Lock,
  Download,
  Building2,
  Image,
  Globe,
  History,
  GraduationCap
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { VirtualCharter } from "@/components/shared/VirtualCharter";
import { formatNIP } from "@/lib/id-utils";
import { cn } from "@/lib/utils";

interface IdentitasPesantrenProps {
  paymentStatus: "paid" | "unpaid";
  profileLevel: "basic" | "silver" | "gold" | "platinum";
  onProfileLevelChange: (level: "basic" | "silver" | "gold" | "platinum") => void;
  debugProfile?: {
    nama_pesantren?: string;
    nama_pengasuh?: string;
    alamat_singkat?: string;
    nip?: string;
    region_name?: string;
    city_name?: string;
  };
}

const IdentitasPesantren = ({ 
  paymentStatus, 
  profileLevel,
  onProfileLevelChange,
  debugProfile 
}: IdentitasPesantrenProps) => {
  // Form state based on ERD pesantren table
  const [formData, setFormData] = useState({
    // Basic/Silver Level - Read Only Region
    namaPesantren: debugProfile?.nama_pesantren || "Pondok Pesantren Al-Hikmah",
    namaPengasuh: debugProfile?.nama_pengasuh || "KH. Ahmad Dahlan",
    alamatSingkat: debugProfile?.alamat_singkat || "Jl. Raya No. 123, Malang",
    region: debugProfile?.region_name || "Malang Raya",
    city: debugProfile?.city_name || "Kota Malang",
    
    // Gold Level Fields
    logoPesantrenUrl: "",
    namaMedia: "",
    socialLinks: {
      instagram: "",
      youtube: "",
      tiktok: "",
      website: ""
    },
    fotoPengasuhUrl: "",
    dawuhPengasuh: "",
    jumlahSantriTerbaru: "",
    tahunBerdiriPesantren: "",
    latitude: "",
    longitude: "",
    
    // Platinum Level Fields
    visiMisi: "",
    sejarahSingkat: "",
    tipePesantren: "",
    jenjangPendidikan: [] as string[],
    programUnggulan: "",
    fotoGedungPesantren: "",
    logoMediaPesantren: "",
  });

  const calculateProgress = () => {
    let progress = 0;
    // Basic data (25%)
    if (formData.namaPesantren && formData.namaPengasuh && formData.alamatSingkat) progress += 25;
    // Silver achieved (25%)
    if (profileLevel !== "basic") progress += 25;
    // Gold achieved (25%)
    if (profileLevel === "gold" || profileLevel === "platinum") progress += 25;
    // Platinum achieved (25%)
    if (profileLevel === "platinum") progress += 25;
    return progress;
  };

  const handleSaveStep = (step: number) => {
    if (step === 1) {
      onProfileLevelChange("silver");
      toast({ title: "Level Silver Tercapai!", description: "Data dasar berhasil disimpan." });
    } else if (step === 2) {
      onProfileLevelChange("gold");
      toast({ title: "Level Gold Tercapai!", description: "Data media dan kelengkapan tersimpan." });
    } else if (step === 3) {
      onProfileLevelChange("platinum");
      toast({ title: "Level Platinum Tercapai!", description: "Selamat! Profil Anda sudah lengkap." });
    }
  };

  const isStepComplete = (step: number) => {
    if (step === 1) return profileLevel !== "basic";
    if (step === 2) return profileLevel === "gold" || profileLevel === "platinum";
    if (step === 3) return profileLevel === "platinum";
    return false;
  };

  // Get highest level for charter display
  const getHighestLevel = (): "silver" | "gold" | "platinum" => {
    if (profileLevel === "platinum") return "platinum";
    if (profileLevel === "gold") return "gold";
    return "silver";
  };

  const displayNIP = debugProfile?.nip || "2601001";
  const isPlatinum = profileLevel === "platinum";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Identitas Pesantren</h1>
          <p className="text-slate-500">Misi Leveling Database - Lengkapi profil untuk naik level</p>
        </div>
        <Badge className={cn(
          "text-white",
          profileLevel === "platinum" ? "bg-gradient-to-r from-cyan-500 to-blue-500" :
          profileLevel === "gold" ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900" :
          profileLevel === "silver" ? "bg-slate-400" : "bg-slate-300"
        )}>
          Level: {profileLevel.charAt(0).toUpperCase() + profileLevel.slice(1)}
        </Badge>
      </div>

      {/* Progress Bar */}
      <Card className="bg-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Kelengkapan Profil</span>
            <span className="text-sm font-bold text-[#166534]">{calculateProgress()}%</span>
          </div>
          <Progress value={calculateProgress()} className="h-3" />
        </CardContent>
      </Card>

      <Tabs defaultValue="profil" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-100">
          <TabsTrigger value="profil" className="data-[state=active]:bg-[#166534] data-[state=active]:text-white">
            Update Profil
          </TabsTrigger>
          <TabsTrigger value="piagam" className="data-[state=active]:bg-[#166534] data-[state=active]:text-white">
            Piagam Pesantren
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Update Profil - Leveling Form */}
        <TabsContent value="profil" className="space-y-4">
          <Accordion type="single" collapsible defaultValue="step1" className="space-y-4">
            
            {/* Step 1: Silver - Data Dasar (Region Locked) */}
            <AccordionItem value="step1" className="border rounded-lg bg-white">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  {isStepComplete(1) ? (
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600">1</div>
                  )}
                  <div className="text-left">
                    <h3 className="font-semibold text-slate-800">Data Dasar Pesantren</h3>
                    <p className="text-sm text-slate-500">Nama, Pengasuh, Alamat, Wilayah (Terkunci)</p>
                  </div>
                  <Badge className="bg-slate-400 text-white ml-2">Silver</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nama Pesantren</Label>
                    <Input
                      value={formData.namaPesantren}
                      onChange={(e) => setFormData({ ...formData, namaPesantren: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nama Pengasuh</Label>
                    <Input
                      value={formData.namaPengasuh}
                      onChange={(e) => setFormData({ ...formData, namaPengasuh: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Alamat Singkat</Label>
                    <Textarea
                      value={formData.alamatSingkat}
                      onChange={(e) => setFormData({ ...formData, alamatSingkat: e.target.value })}
                    />
                  </div>
                  
                  {/* Locked Region Fields */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Lock className="h-3 w-3 text-slate-400" />
                      Smart Region (Terkunci)
                    </Label>
                    <Input
                      value={formData.region}
                      disabled
                      className="bg-slate-100 text-slate-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Lock className="h-3 w-3 text-slate-400" />
                      Kota/Kabupaten (Terkunci)
                    </Label>
                    <Input
                      value={formData.city}
                      disabled
                      className="bg-slate-100 text-slate-500"
                    />
                  </div>
                </div>
                <Button 
                  className="mt-4 bg-[#166534] hover:bg-[#14532d]"
                  onClick={() => handleSaveStep(1)}
                  disabled={isStepComplete(1)}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isStepComplete(1) ? "Tersimpan" : "Simpan & Naik ke Silver"}
                </Button>
              </AccordionContent>
            </AccordionItem>

            {/* Step 2: Gold - Media & Kelengkapan */}
            <AccordionItem value="step2" className="border rounded-lg bg-white">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  {isStepComplete(2) ? (
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600">2</div>
                  )}
                  <div className="text-left">
                    <h3 className="font-semibold text-slate-800">Identitas Media & Kelengkapan</h3>
                    <p className="text-sm text-slate-500">Logo, Media Sosial, Foto Pengasuh, Koordinat</p>
                  </div>
                  <Badge className="bg-[#f59e0b] text-white ml-2">Gold</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Logo Upload */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Image className="h-4 w-4" />
                      Logo Pesantren
                    </Label>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                      <p className="text-sm text-slate-500">PNG/JPG</p>
                    </div>
                  </div>
                  
                  {/* Nama Media */}
                  <div className="space-y-2">
                    <Label>Nama Media Pesantren</Label>
                    <Input
                      placeholder="Contoh: Media Al-Hikmah TV"
                      value={formData.namaMedia}
                      onChange={(e) => setFormData({ ...formData, namaMedia: e.target.value })}
                    />
                  </div>
                  
                  {/* Foto Pengasuh */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Image className="h-4 w-4" />
                      Foto Pengasuh
                    </Label>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                      <p className="text-sm text-slate-500">PNG/JPG</p>
                    </div>
                  </div>
                  
                  {/* Social Links */}
                  <div className="space-y-2 md:col-span-2 lg:col-span-3">
                    <Label className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Akun Media Sosial
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <Input
                        placeholder="@instagram"
                        value={formData.socialLinks.instagram}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          socialLinks: { ...formData.socialLinks, instagram: e.target.value }
                        })}
                      />
                      <Input
                        placeholder="YouTube Channel"
                        value={formData.socialLinks.youtube}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          socialLinks: { ...formData.socialLinks, youtube: e.target.value }
                        })}
                      />
                      <Input
                        placeholder="@tiktok"
                        value={formData.socialLinks.tiktok}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          socialLinks: { ...formData.socialLinks, tiktok: e.target.value }
                        })}
                      />
                      <Input
                        placeholder="Website"
                        value={formData.socialLinks.website}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          socialLinks: { ...formData.socialLinks, website: e.target.value }
                        })}
                      />
                    </div>
                  </div>
                  
                  {/* Dawuh Pengasuh */}
                  <div className="space-y-2 md:col-span-2 lg:col-span-3">
                    <Label>Dawuh / Pesan Pengasuh</Label>
                    <Textarea
                      placeholder="Tulis pesan inspiratif dari pengasuh..."
                      value={formData.dawuhPengasuh}
                      onChange={(e) => setFormData({ ...formData, dawuhPengasuh: e.target.value })}
                    />
                  </div>
                  
                  {/* Jumlah Santri & Tahun Berdiri */}
                  <div className="space-y-2">
                    <Label>Jumlah Santri Terbaru</Label>
                    <Input
                      type="number"
                      placeholder="250"
                      value={formData.jumlahSantriTerbaru}
                      onChange={(e) => setFormData({ ...formData, jumlahSantriTerbaru: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tahun Berdiri Pesantren</Label>
                    <Input
                      type="number"
                      placeholder="1980"
                      value={formData.tahunBerdiriPesantren}
                      onChange={(e) => setFormData({ ...formData, tahunBerdiriPesantren: e.target.value })}
                    />
                  </div>
                  
                  {/* Koordinat */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Koordinat Lokasi
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Latitude"
                        value={formData.latitude}
                        onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                      />
                      <Input
                        placeholder="Longitude"
                        value={formData.longitude}
                        onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <Button 
                  className="mt-4 bg-[#166534] hover:bg-[#14532d]"
                  onClick={() => handleSaveStep(2)}
                  disabled={!isStepComplete(1) || isStepComplete(2)}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isStepComplete(2) ? "Tersimpan" : "Simpan & Naik ke Gold"}
                </Button>
              </AccordionContent>
            </AccordionItem>

            {/* Step 3: Platinum - Ensiklopedia Lengkap */}
            <AccordionItem value="step3" className={cn(
              "border rounded-lg",
              isPlatinum ? "bg-gradient-to-br from-slate-50 to-cyan-50 border-cyan-200" : "bg-white"
            )}>
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  {isStepComplete(3) ? (
                    <CheckCircle2 className="h-6 w-6 text-cyan-500" />
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600">3</div>
                  )}
                  <div className="text-left">
                    <h3 className="font-semibold text-slate-800">Ensiklopedia Pesantren</h3>
                    <p className="text-sm text-slate-500">Visi Misi, Sejarah, Tipe, Jenjang, Program Unggulan</p>
                  </div>
                  <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white ml-2">Platinum</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="space-y-4">
                  {/* Visi Misi */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      Visi & Misi
                    </Label>
                    <Textarea
                      rows={4}
                      placeholder="Tulis visi dan misi pesantren..."
                      value={formData.visiMisi}
                      onChange={(e) => setFormData({ ...formData, visiMisi: e.target.value })}
                    />
                  </div>
                  
                  {/* Sejarah */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <History className="h-4 w-4" />
                      Sejarah Singkat
                    </Label>
                    <Textarea
                      rows={4}
                      placeholder="Ceritakan sejarah berdirinya pesantren..."
                      value={formData.sejarahSingkat}
                      onChange={(e) => setFormData({ ...formData, sejarahSingkat: e.target.value })}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Tipe Pesantren */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Tipe Pesantren
                      </Label>
                      <Select
                        value={formData.tipePesantren}
                        onValueChange={(value) => setFormData({ ...formData, tipePesantren: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih tipe pesantren" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="salaf">Salaf</SelectItem>
                          <SelectItem value="modern">Modern</SelectItem>
                          <SelectItem value="kombinasi">Kombinasi</SelectItem>
                          <SelectItem value="tahfidz">Tahfidz</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Jenjang Pendidikan */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        Jenjang Pendidikan
                      </Label>
                      <Select
                        value={formData.jenjangPendidikan[0] || ""}
                        onValueChange={(value) => setFormData({ ...formData, jenjangPendidikan: [value] })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jenjang" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sd-mi">SD/MI</SelectItem>
                          <SelectItem value="smp-mts">SMP/MTs</SelectItem>
                          <SelectItem value="sma-ma">SMA/MA</SelectItem>
                          <SelectItem value="perguruan-tinggi">Perguruan Tinggi</SelectItem>
                          <SelectItem value="all">Semua Jenjang</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Program Unggulan */}
                  <div className="space-y-2">
                    <Label>Program Unggulan</Label>
                    <Textarea
                      rows={3}
                      placeholder="Deskripsi program unggulan pesantren..."
                      value={formData.programUnggulan}
                      onChange={(e) => setFormData({ ...formData, programUnggulan: e.target.value })}
                    />
                  </div>
                  
                  {/* Foto Gedung & Logo Media */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Foto Gedung Pesantren</Label>
                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-cyan-400 transition-colors cursor-pointer">
                        <Upload className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                        <p className="text-sm text-slate-500">PNG/JPG</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Logo Media Pesantren</Label>
                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-cyan-400 transition-colors cursor-pointer">
                        <Upload className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                        <p className="text-sm text-slate-500">PNG/JPG</p>
                      </div>
                    </div>
                  </div>
                </div>
                <Button 
                  className={cn(
                    "mt-4",
                    isPlatinum 
                      ? "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600" 
                      : "bg-[#166534] hover:bg-[#14532d]"
                  )}
                  onClick={() => handleSaveStep(3)}
                  disabled={!isStepComplete(2) || isStepComplete(3)}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isStepComplete(3) ? "Tersimpan - Platinum Achieved!" : "Simpan & Naik ke Platinum"}
                </Button>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>

        {/* Tab 2: Piagam Pesantren - Single Charter (Highest Level) */}
        <TabsContent value="piagam" className="space-y-6">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Award className="h-5 w-5 text-[#166534]" />
                Piagam Keanggotaan Virtual
              </CardTitle>
              <p className="text-sm text-slate-500">
                Piagam digital YouTube Style sesuai level tertinggi yang dicapai
              </p>
            </CardHeader>
            <CardContent>
              <div className="max-w-sm mx-auto">
                <VirtualCharter
                  level={getHighestLevel()}
                  noId={displayNIP}
                  namaMedia={formData.namaMedia || formData.namaPesantren}
                  alamat={formData.alamatSingkat}
                />
              </div>
              <div className="flex justify-center mt-6">
                <Button 
                  className="bg-[#166534] hover:bg-[#14532d]"
                  disabled={paymentStatus === "unpaid"}
                  onClick={() => toast({ title: "Download Piagam", description: "Fitur sedang dikembangkan" })}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Piagam (PDF)
                </Button>
              </div>
              {paymentStatus === "unpaid" && (
                <p className="text-center text-sm text-red-600 mt-2">
                  * Lunasi administrasi untuk mengunduh piagam
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IdentitasPesantren;
