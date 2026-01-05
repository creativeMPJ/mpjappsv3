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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Upload, 
  MapPin, 
  Save, 
  Award, 
  CheckCircle2, 
  Lock,
  Download,
  Eye,
  QrCode,
  IdCard
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface IdentitasPesantrenProps {
  paymentStatus: "paid" | "unpaid";
  profileLevel: "basic" | "silver" | "gold" | "platinum";
  onProfileLevelChange: (level: "basic" | "silver" | "gold" | "platinum") => void;
  debugProfile?: {
    nama_pesantren?: string;
    nama_pengasuh?: string;
    alamat_singkat?: string;
    nip?: string;
  };
}

const IdentitasPesantren = ({ 
  paymentStatus, 
  profileLevel,
  onProfileLevelChange,
  debugProfile 
}: IdentitasPesantrenProps) => {
  const [formData, setFormData] = useState({
    namaPesantren: debugProfile?.nama_pesantren || "Pondok Pesantren Al-Hikmah",
    pengasuh: debugProfile?.nama_pengasuh || "KH. Ahmad Dahlan",
    alamat: debugProfile?.alamat_singkat || "Jl. Raya No. 123, Malang",
    smartRegion: "",
    sejarah: "",
    visiMisi: "",
    programUnggulan: "",
  });

  const regions = [
    "Surabaya Raya",
    "Malang Raya",
    "Kediri Raya",
    "Madiun Raya",
    "Jember Raya",
  ];

  const calculateProgress = () => {
    let progress = 0;
    if (formData.namaPesantren && formData.pengasuh && formData.alamat && formData.smartRegion) progress += 33;
    if (profileLevel === "silver" || profileLevel === "gold" || profileLevel === "platinum") progress += 33;
    if (profileLevel === "gold" || profileLevel === "platinum") progress += 17;
    if (profileLevel === "platinum") progress += 17;
    return Math.min(progress, 100);
  };

  const handleSaveStep = (step: number) => {
    if (step === 1) {
      onProfileLevelChange("silver");
      toast({ title: "Step 1 Selesai!", description: "Anda naik ke level Silver." });
    } else if (step === 2) {
      onProfileLevelChange("gold");
      toast({ title: "Step 2 Selesai!", description: "Anda naik ke level Gold." });
    } else if (step === 3) {
      onProfileLevelChange("platinum");
      toast({ title: "Step 3 Selesai!", description: "Selamat! Anda mencapai level Platinum." });
    }
  };

  const isStepComplete = (step: number) => {
    if (step === 1) return profileLevel !== "basic";
    if (step === 2) return profileLevel === "gold" || profileLevel === "platinum";
    if (step === 3) return profileLevel === "platinum";
    return false;
  };

  const canDownloadCertificate = paymentStatus === "paid" && (profileLevel === "gold" || profileLevel === "platinum");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Identitas Pesantren</h1>
          <p className="text-slate-500">Kelola profil dan aset digital lembaga Anda</p>
        </div>
        <Badge className={`${
          profileLevel === "platinum" ? "bg-purple-500" :
          profileLevel === "gold" ? "bg-[#f59e0b]" :
          profileLevel === "silver" ? "bg-slate-400" : "bg-slate-300"
        } text-white`}>
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
            Piagam & Aset Digital
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Update Profil */}
        <TabsContent value="profil" className="space-y-4">
          <Accordion type="single" collapsible defaultValue="step1" className="space-y-4">
            {/* Step 1: Silver */}
            <AccordionItem value="step1" className="border rounded-lg bg-white">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  {isStepComplete(1) ? (
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600">1</div>
                  )}
                  <div className="text-left">
                    <h3 className="font-semibold text-slate-800">Data Dasar</h3>
                    <p className="text-sm text-slate-500">Nama, Pengasuh, Alamat, Region</p>
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
                      value={formData.pengasuh}
                      onChange={(e) => setFormData({ ...formData, pengasuh: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Alamat Lengkap</Label>
                    <Textarea
                      value={formData.alamat}
                      onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Smart Region</Label>
                    <Select
                      value={formData.smartRegion}
                      onValueChange={(value) => setFormData({ ...formData, smartRegion: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Region" />
                      </SelectTrigger>
                      <SelectContent>
                        {regions.map((region) => (
                          <SelectItem key={region} value={region}>{region}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button 
                  className="mt-4 bg-[#166534] hover:bg-[#14532d]"
                  onClick={() => handleSaveStep(1)}
                  disabled={isStepComplete(1)}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isStepComplete(1) ? "Tersimpan" : "Simpan & Naik Level"}
                </Button>
              </AccordionContent>
            </AccordionItem>

            {/* Step 2: Gold */}
            <AccordionItem value="step2" className="border rounded-lg bg-white">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  {isStepComplete(2) ? (
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600">2</div>
                  )}
                  <div className="text-left">
                    <h3 className="font-semibold text-slate-800">Dokumen & Media</h3>
                    <p className="text-sm text-slate-500">Logo, SK Pesantren, Foto Pengasuh</p>
                  </div>
                  <Badge className="bg-[#f59e0b] text-white ml-2">Gold</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Upload Logo</Label>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                      <p className="text-sm text-slate-500">PNG/JPG</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>SK Pesantren</Label>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                      <p className="text-sm text-slate-500">PDF</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Foto Pengasuh</Label>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                      <p className="text-sm text-slate-500">PNG/JPG</p>
                    </div>
                  </div>
                </div>
                <Button 
                  className="mt-4 bg-[#166534] hover:bg-[#14532d]"
                  onClick={() => handleSaveStep(2)}
                  disabled={!isStepComplete(1) || isStepComplete(2)}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isStepComplete(2) ? "Tersimpan" : "Simpan & Naik Level"}
                </Button>
              </AccordionContent>
            </AccordionItem>

            {/* Step 3: Platinum */}
            <AccordionItem value="step3" className="border rounded-lg bg-white">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  {isStepComplete(3) ? (
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600">3</div>
                  )}
                  <div className="text-left">
                    <h3 className="font-semibold text-slate-800">Ensiklopedia</h3>
                    <p className="text-sm text-slate-500">Sejarah, Visi Misi, Program</p>
                  </div>
                  <Badge className="bg-purple-500 text-white ml-2">Platinum</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Sejarah Pesantren</Label>
                    <Textarea
                      rows={4}
                      placeholder="Ceritakan sejarah berdirinya pesantren..."
                      value={formData.sejarah}
                      onChange={(e) => setFormData({ ...formData, sejarah: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Visi & Misi</Label>
                    <Textarea
                      rows={3}
                      placeholder="Visi dan misi pesantren..."
                      value={formData.visiMisi}
                      onChange={(e) => setFormData({ ...formData, visiMisi: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Program Unggulan</Label>
                    <Textarea
                      rows={3}
                      placeholder="Deskripsi program unggulan..."
                      value={formData.programUnggulan}
                      onChange={(e) => setFormData({ ...formData, programUnggulan: e.target.value })}
                    />
                  </div>
                </div>
                <Button 
                  className="mt-4 bg-[#166534] hover:bg-[#14532d]"
                  onClick={() => handleSaveStep(3)}
                  disabled={!isStepComplete(2) || isStepComplete(3)}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isStepComplete(3) ? "Tersimpan" : "Simpan & Naik Level"}
                </Button>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>

        {/* Tab 2: Piagam & Aset Digital */}
        <TabsContent value="piagam" className="space-y-6">
          {/* Section 1: Piagam Keanggotaan */}
          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Piagam Keanggotaan (Lembaga)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Virtual Plaque */}
              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-br from-slate-100 to-slate-200 pb-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Award className="h-5 w-5 text-[#f59e0b]" />
                    Virtual Plaque (A4 Portrait)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {/* Plaque Preview */}
                  <div className={`aspect-[3/4] relative ${
                    profileLevel === "gold" || profileLevel === "platinum"
                      ? "bg-gradient-to-br from-[#f59e0b] via-amber-400 to-yellow-300"
                      : profileLevel === "silver"
                        ? "bg-gradient-to-br from-slate-400 via-slate-300 to-slate-200"
                        : "bg-gradient-to-br from-slate-300 to-slate-200"
                  }`}>
                    {/* 3D Embossed Effect */}
                    <div className="absolute inset-4 bg-white/90 rounded-lg shadow-[inset_0_2px_4px_rgba(0,0,0,0.1),_0_4px_12px_rgba(0,0,0,0.15)] flex flex-col items-center justify-center p-6 text-center">
                      <div className="h-16 w-16 bg-[#166534] rounded-full flex items-center justify-center mb-4 shadow-lg">
                        <Award className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 mb-1">PIAGAM KEANGGOTAAN</h3>
                      <p className="text-sm text-slate-600 mb-4">Media Pondok Jawa Timur</p>
                      <div className="border-t border-b border-slate-300 py-3 my-2 w-full">
                        <p className="font-semibold text-slate-800">{formData.namaPesantren}</p>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        Level: {profileLevel.charAt(0).toUpperCase() + profileLevel.slice(1)}
                      </p>
                    </div>
                    {profileLevel === "basic" && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="text-center text-white">
                          <Lock className="h-10 w-10 mx-auto mb-2" />
                          <p className="text-sm">Lengkapi Step 1</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Legal Certificate */}
              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-br from-slate-100 to-slate-200 pb-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Award className="h-5 w-5 text-[#166534]" />
                    Sertifikat Resmi (A4 Landscape)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {/* Certificate Preview */}
                  <div className="aspect-[4/3] bg-white relative border-8 border-double border-[#166534]">
                    <div className="absolute inset-4 flex flex-col items-center justify-center text-center p-4">
                      <p className="text-xs text-slate-500 mb-2 font-serif">MEDIA PONDOK JAWA TIMUR</p>
                      <h3 className="text-lg font-bold text-slate-800 mb-1 font-serif">SERTIFIKAT KEANGGOTAAN</h3>
                      <div className="h-0.5 w-24 bg-[#f59e0b] my-3"></div>
                      <p className="text-sm text-slate-600 mb-2">Diberikan kepada:</p>
                      <p className="font-bold text-[#166534] text-lg font-serif">{formData.namaPesantren}</p>
                      <p className="text-xs text-slate-500 mt-4">Sebagai anggota resmi</p>
                      <div className="mt-6 flex gap-12">
                        <div className="text-center">
                          <div className="w-16 border-b border-slate-400 mb-1"></div>
                          <p className="text-xs text-slate-500">Ketua Umum</p>
                        </div>
                        <div className="text-center">
                          <div className="w-16 border-b border-slate-400 mb-1"></div>
                          <p className="text-xs text-slate-500">Sekretaris</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>
                            <Button 
                              className="w-full bg-[#166534] hover:bg-[#14532d]"
                              disabled={!canDownloadCertificate}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download PDF Resmi
                            </Button>
                          </span>
                        </TooltipTrigger>
                        {!canDownloadCertificate && (
                          <TooltipContent>
                            <p>Lengkapi Data (Gold) & Lunasi Tagihan</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Section 2: Preview ID Card Kru */}
          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Preview ID Card Kru</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Virtual ID - Landscape */}
              <Card className="overflow-hidden">
                <CardHeader className="bg-slate-100 pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <IdCard className="h-5 w-5 text-[#166534]" />
                      Virtual ID (Landscape)
                    </CardTitle>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Available for Crew
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="aspect-[1.6/1] bg-gradient-to-br from-[#166534] to-[#14532d] rounded-xl p-4 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                      <Award className="w-full h-full" />
                    </div>
                    <div className="flex flex-col h-full justify-between">
                      <div>
                        <p className="text-xs opacity-80">No. ID</p>
                        <p className="font-mono font-bold">200100101</p>
                      </div>
                      <div>
                        <p className="font-bold">Ahmad Fauzi</p>
                        <p className="text-sm opacity-80">PP Al-Hikmah</p>
                        <p className="text-xs opacity-60 mt-1">Jl. Raya No. 123, Malang</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-3 text-center">* Tanpa foto & barcode untuk tampilan aplikasi</p>
                </CardContent>
              </Card>

              {/* Physical ID - Portrait */}
              <Card className="overflow-hidden relative">
                <CardHeader className="bg-slate-100 pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <IdCard className="h-5 w-5 text-[#166534]" />
                      Physical ID (Portrait)
                    </CardTitle>
                    <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                      Print Only
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="aspect-[2/3] bg-white rounded-xl border-2 border-[#166534] p-3 relative overflow-hidden">
                    {/* Header */}
                    <div className="bg-[#166534] text-white text-center py-2 rounded-t-lg -mx-3 -mt-3 mb-3">
                      <p className="text-xs font-bold">MEDIA PONDOK JAWA TIMUR</p>
                    </div>
                    {/* Photo */}
                    <div className="w-20 h-20 mx-auto bg-slate-200 rounded-full flex items-center justify-center mb-3">
                      <span className="text-2xl font-bold text-slate-400">AF</span>
                    </div>
                    {/* Info */}
                    <div className="text-center mb-3">
                      <p className="font-bold text-sm text-slate-800">Ahmad Fauzi</p>
                      <p className="text-xs text-slate-600">PP Al-Hikmah</p>
                      <p className="text-xs text-slate-500 mt-1">Jl. Raya No. 123</p>
                    </div>
                    {/* QR Code */}
                    <div className="flex flex-col items-center mt-auto">
                      <div className="w-16 h-16 bg-slate-100 flex items-center justify-center rounded">
                        <QrCode className="h-12 w-12 text-slate-400" />
                      </div>
                      <p className="text-xs font-mono text-slate-600 mt-1">200100101</p>
                    </div>
                  </div>
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center pointer-events-none">
                    <div className="bg-white/90 px-4 py-2 rounded-lg text-center">
                      <Lock className="h-5 w-5 mx-auto text-slate-600 mb-1" />
                      <p className="text-sm font-medium text-slate-800">Hanya dapat dicetak</p>
                      <p className="text-xs text-slate-600">oleh Admin Pusat</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IdentitasPesantren;