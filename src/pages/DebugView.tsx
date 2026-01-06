import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Building2, 
  Users, 
  MapPin, 
  Shield,
  ArrowRight,
  Sparkles,
  Eye,
  Crown
} from "lucide-react";
import { VirtualIDCard } from "@/components/shared/VirtualIDCard";
import { ProfileLevelBadge, XPLevelBadge, VerifiedBadge } from "@/components/shared/LevelBadge";
import { formatNIP, formatNIAM } from "@/lib/id-utils";
import {
  MOCK_ADMIN_PUSAT,
  MOCK_ADMIN_REGIONAL_MALANG,
  MOCK_MEDIA_PLATINUM,
  MOCK_CREW_MILITAN,
  MOCK_PESANTREN,
  MOCK_CREWS,
  MOCK_CLAIMS,
  MOCK_PAYMENTS,
  MOCK_REGIONS,
  getDebugDataPackage,
  getAdminRegionalDebugData,
} from "@/lib/debug-mock-data";

const DebugView = () => {
  const navigate = useNavigate();
  const [activePreview, setActivePreview] = useState<'none' | 'regional' | 'media' | 'crew'>('none');

  const navigateWithState = (path: string, state: Record<string, unknown>) => {
    navigate(path, { state: { ...state, isDebugMode: true } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Shield className="h-8 w-8 text-emerald-600" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">
              MPJ Debug View
            </h1>
          </div>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto px-4">
            Halaman audit untuk menguji tampilan dashboard tanpa login. 
            Klik tombol di bawah untuk menavigasi ke dashboard dengan data simulasi.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge className="bg-amber-100 text-amber-700 border-amber-200">
              Development Mode Only
            </Badge>
            <Badge className="bg-blue-100 text-blue-700 border-blue-200">
              Mobile Friendly PWA
            </Badge>
          </div>
          <p className="text-xs text-slate-500">
            Tip: Gunakan tombol device di atas preview untuk menguji tampilan Mobile/Tablet/Desktop
          </p>
        </div>

        <Separator />

        {/* ID Format Examples */}
        <Card className="border-2 border-dashed border-emerald-200 bg-emerald-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-600" />
              Format ID Clean (Tanpa Titik/Pemisah)
            </CardTitle>
            <CardDescription>
              Format ID yang bersih dan profesional tanpa pemisah titik
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* NIP Example */}
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-800">NIP (Nomor Induk Pesantren)</h4>
                <div className="bg-white rounded-lg p-4 border border-emerald-200">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Format: [YY][RR][XXX]</p>
                  <p className="text-3xl font-mono font-bold text-emerald-700">
                    {formatNIP(MOCK_DATA.mediaPlatinum.nip, true)}
                  </p>
                  <p className="text-sm text-slate-600 mt-2">
                    26 = Tahun, 01 = Malang, 001 = Urutan
                  </p>
                </div>
              </div>
              
              {/* NIAM Example */}
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-800">NIAM (Nomor Induk Anggota Media)</h4>
                <div className="bg-white rounded-lg p-4 border border-emerald-200">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Format: [ROLE][YY][RR][XXX][KK]</p>
                  <p className="text-3xl font-mono font-bold text-emerald-700">
                    {formatNIAM(MOCK_DATA.crewMilitan.niam, true)}
                  </p>
                  <p className="text-sm text-slate-600 mt-2">
                    AN = Kru, 26 = Tahun, 01 = Malang, 001 = Pesantren, 02 = Urutan Kru
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leveling System */}
        <Card className="border-2 border-dashed border-amber-200 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-600" />
              Sistem Leveling 3 Tahap
            </CardTitle>
            <CardDescription>
              Visual tiering berdasarkan kelengkapan profil dan status akun
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Silver */}
              <div className="bg-white rounded-lg p-4 border border-slate-200 text-center">
                <ProfileLevelBadge level="silver" size="lg" className="mb-3" />
                <h4 className="font-semibold text-slate-800">Tier 1: SILVER</h4>
                <p className="text-sm text-slate-600 mt-1">
                  Akun aktif (status: active)
                </p>
              </div>
              
              {/* Gold */}
              <div className="bg-white rounded-lg p-4 border border-amber-200 text-center">
                <ProfileLevelBadge level="gold" size="lg" className="mb-3" />
                <h4 className="font-semibold text-slate-800">Tier 2: GOLD</h4>
                <p className="text-sm text-slate-600 mt-1">
                  Data profil tahap 2 lengkap
                </p>
              </div>
              
              {/* Platinum */}
              <div className="bg-white rounded-lg p-4 border border-cyan-200 text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <ProfileLevelBadge level="platinum" size="lg" />
                  <VerifiedBadge isVerified={true} size="lg" />
                </div>
                <h4 className="font-semibold text-slate-800">Tier 3: PLATINUM</h4>
                <p className="text-sm text-slate-600 mt-1">
                  Semua data ERD lengkap + Verified
                </p>
              </div>
            </div>
            
            {/* XP Kasta */}
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <h4 className="font-semibold text-slate-800 mb-3">Militansi XP Badges</h4>
              <div className="flex flex-wrap gap-3">
                <XPLevelBadge xp={100} size="md" showXP />
                <XPLevelBadge xp={700} size="md" showXP />
                <XPLevelBadge xp={2500} size="md" showXP />
                <XPLevelBadge xp={6000} size="md" showXP />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Navigation Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Admin Pusat Dashboard - COMMAND CENTER */}
          <Card className="hover:shadow-lg transition-shadow border-red-200 ring-2 ring-red-100 md:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center">
                  <Crown className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xl">Admin Pusat Dashboard</CardTitle>
                    <Badge className="bg-red-100 text-red-700 border-red-200">Command Center</Badge>
                  </div>
                  <CardDescription>Pusat Kendali Tertinggi MPJ Apps</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Role: admin_pusat</Badge>
                <Badge className="bg-emerald-100 text-emerald-700">Active</Badge>
                <Badge className="bg-amber-100 text-amber-700">Full Access</Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-600">
                <div className="space-y-1">
                  <p className="font-medium text-slate-800">Menu Utama:</p>
                  <p>• Beranda (Statistik Global)</p>
                  <p>• Administrasi (Approval Hub)</p>
                  <p>• Master Data (Full CRUD)</p>
                  <p>• Master Regional (Mapping)</p>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-slate-800">Fitur Testing:</p>
                  <p>• 10 Pesantren dari 4 Regional</p>
                  <p>• 10 Kru dengan XP bervariasi</p>
                  <p>• 9 Payment (Pending/Verified/Rejected)</p>
                  <p>• Filter Regional & Search</p>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                ✓ Verifikasi Pembayaran, ✓ Terbitkan NIP/NIAM, ✓ Edit/Hapus Data, ✓ Kode Jabatan, ✓ Setting Harga
              </p>
              <Button 
                className="w-full bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white py-6"
                onClick={() => navigateWithState('/admin-pusat', { 
                  debugProfile: MOCK_DATA.adminPusat,
                  debugData: {
                    pesantren: MOCK_DATA.pesantrenMultiRegion,
                    crews: MOCK_DATA.crewMultiPesantren,
                    regions: MOCK_DATA.regionsForFilter,
                    payments: MOCK_DATA.paymentsForVerification,
                    claims: MOCK_DATA.claimsRegionalApproved,
                  }
                })}
              >
                <Crown className="h-5 w-5 mr-2" />
                Buka Command Center
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Regional Dashboard */}
          <Card className="hover:shadow-lg transition-shadow border-emerald-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Regional Dashboard</CardTitle>
                  <CardDescription>Admin Regional Malang</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Role: admin_regional</Badge>
                <Badge className="bg-emerald-100 text-emerald-700">Active</Badge>
              </div>
              <p className="text-xs sm:text-sm text-slate-600">
                Menu: Beranda → Verifikasi → Data Regional → Event (Soon) → Regional Hub (Soon) → Militansi (Soon) → Pengaturan
              </p>
              <p className="text-xs text-slate-500 mt-1">
                ✓ Mobile Cards, Read-Only Data, Filter Akun Baru/Lama
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => setActivePreview(activePreview === 'regional' ? 'none' : 'regional')}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>
                <Button 
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => navigateWithState('/admin-regional', { 
                    debugProfile: MOCK_DATA.regionalAdmin 
                  })}
                >
                  Buka Dashboard
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Media Dashboard */}
          <Card className="hover:shadow-lg transition-shadow border-cyan-200 ring-2 ring-cyan-100">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-cyan-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">Media Dashboard</CardTitle>
                    <VerifiedBadge isVerified={true} size="sm" />
                  </div>
                  <CardDescription>Platinum Verified</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <ProfileLevelBadge level="platinum" size="sm" />
                <Badge variant="outline" className="font-mono text-xs">
                  NIP: {formatNIP(MOCK_DATA.mediaPlatinum.nip, true)}
                </Badge>
                <Badge className="bg-green-100 text-green-700">Paid</Badge>
              </div>
              <p className="text-xs sm:text-sm text-slate-600">
                Platinum: Paid, Slot 3/3, Card-based UI. 
                Urutan: Beranda → Identitas → Administrasi → Tim Media → E-ID & Aset → Event → MPJ HUB → Pengaturan.
              </p>
              <p className="text-xs text-slate-500 mt-1">
                ✓ Mobile Friendly: List Cards, Touch-friendly, Auto-save, Update Data button
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => setActivePreview(activePreview === 'media' ? 'none' : 'media')}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>
                <Button 
                  className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
                  onClick={() => navigateWithState('/user', { 
                    debugProfile: MOCK_DATA.mediaPlatinum 
                  })}
                >
                  Buka Dashboard
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Crew Dashboard */}
          <Card className="hover:shadow-lg transition-shadow border-amber-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Users className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Crew Dashboard</CardTitle>
                  <CardDescription>Kru Militan (Gold XP)</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <XPLevelBadge xp={MOCK_DATA.crewMilitan.xp_level} size="sm" />
                <Badge variant="outline" className="font-mono">
                  NIAM: {formatNIAM(MOCK_DATA.crewMilitan.niam, true)}
                </Badge>
              </div>
              <p className="text-sm text-slate-600">
                Mock data untuk menguji dashboard Crew dengan XP 2500 (Badge Gold).
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => setActivePreview(activePreview === 'crew' ? 'none' : 'crew')}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>
                <Button 
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-900"
                  onClick={() => navigateWithState('/user/crew', { 
                    debugCrew: MOCK_DATA.crewMilitan 
                  })}
                >
                  Buka Dashboard
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ID Card Preview */}
        {activePreview !== 'none' && (
          <Card className="border-2 border-dashed border-slate-300">
            <CardHeader>
              <CardTitle>Preview ID Card</CardTitle>
            </CardHeader>
            <CardContent>
              {activePreview === 'media' && (
                <VirtualIDCard 
                  type="institution"
                  nip={MOCK_DATA.mediaPlatinum.nip}
                  institutionName={MOCK_DATA.mediaPlatinum.nama_pesantren}
                  pengasuhName={MOCK_DATA.mediaPlatinum.nama_pengasuh}
                  isVerified={true}
                />
              )}
              {activePreview === 'crew' && (
                <VirtualIDCard 
                  type="crew"
                  niam={MOCK_DATA.crewMilitan.niam}
                  crewName={MOCK_DATA.crewMilitan.nama}
                  jabatan={MOCK_DATA.crewMilitan.jabatan}
                  xp={MOCK_DATA.crewMilitan.xp_level}
                />
              )}
              {activePreview === 'regional' && (
                <div className="text-center py-8 text-slate-500">
                  Regional Admin tidak memiliki ID Card personal.
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-slate-500 py-4">
          <p>
            Halaman ini hanya untuk development & audit. 
            Tidak tersedia di production.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DebugView;
