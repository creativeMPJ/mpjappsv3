import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, MapPin, Save, Award } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const ProfilPesantren = () => {
  const [formData, setFormData] = useState({
    namaMedia: "",
    tahunBerdiri: "",
    alamat: "",
    namaPendiri: "",
    sejarah: "",
    visiMisi: "",
  });
  const [selectedJenjang, setSelectedJenjang] = useState<string[]>([]);

  const jenjangOptions = [
    "TK/RA",
    "SD/MI",
    "SMP/MTs",
    "SMA/MA/SMK",
    "Perguruan Tinggi",
    "Tahfidz",
    "Diniyah",
  ];

  const handleSave = () => {
    toast({
      title: "Data Tersimpan",
      description: "Profil pesantren berhasil disimpan via Node.js API",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Profil Pesantren</h1>
          <p className="text-slate-500">Kelola data dan informasi pesantren Anda</p>
        </div>
      </div>

      <Tabs defaultValue="media" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="media" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Media & Lokasi
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Target: Gold</span>
          </TabsTrigger>
          <TabsTrigger value="ensiklopedia" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Ensiklopedia
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Target: Platinum</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Media & Lokasi */}
        <TabsContent value="media" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informasi Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="namaMedia">Nama Media</Label>
                  <Input
                    id="namaMedia"
                    placeholder="Masukkan nama media"
                    value={formData.namaMedia}
                    onChange={(e) => setFormData({ ...formData, namaMedia: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tahunBerdiri">Tahun Berdiri Media</Label>
                  <Input
                    id="tahunBerdiri"
                    type="number"
                    placeholder="2020"
                    value={formData.tahunBerdiri}
                    onChange={(e) => setFormData({ ...formData, tahunBerdiri: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Lokasi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="alamat">Alamat Lengkap</Label>
                <Textarea
                  id="alamat"
                  placeholder="Masukkan alamat lengkap pesantren"
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                />
              </div>
              
              {/* Map Picker Simulation */}
              <div className="space-y-2">
                <Label>Peta Lokasi</Label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center bg-slate-50">
                  <MapPin className="h-12 w-12 mx-auto text-slate-400 mb-3" />
                  <p className="text-slate-500 mb-3">Klik untuk menentukan lokasi di peta</p>
                  <Button variant="outline">
                    <MapPin className="h-4 w-4 mr-2" />
                    Pilih Lokasi
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dokumen Pendukung</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Upload SK Pengurus/Surat Tugas (Kolektif)</Label>
                <p className="text-sm text-slate-500 mb-3">
                  Dokumen ini penting untuk verifikasi lembaga Anda
                </p>
                <div className="border-2 border-dashed border-emerald-300 rounded-lg p-8 text-center bg-emerald-50/50 hover:bg-emerald-50 transition-colors cursor-pointer">
                  <Upload className="h-12 w-12 mx-auto text-emerald-500 mb-3" />
                  <p className="text-emerald-700 font-medium mb-1">
                    Klik atau drag file untuk upload
                  </p>
                  <p className="text-sm text-slate-500">PDF, JPG, atau PNG (Max 5MB)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Ensiklopedia */}
        <TabsContent value="ensiklopedia" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sejarah Pesantren</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="namaPendiri">Nama Pendiri</Label>
                <Input
                  id="namaPendiri"
                  placeholder="Nama pendiri pesantren"
                  value={formData.namaPendiri}
                  onChange={(e) => setFormData({ ...formData, namaPendiri: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sejarah">Sejarah Pesantren</Label>
                <Textarea
                  id="sejarah"
                  rows={5}
                  placeholder="Ceritakan sejarah berdirinya pesantren..."
                  value={formData.sejarah}
                  onChange={(e) => setFormData({ ...formData, sejarah: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="visiMisi">Visi & Misi</Label>
                <Textarea
                  id="visiMisi"
                  rows={4}
                  placeholder="Visi dan misi pesantren..."
                  value={formData.visiMisi}
                  onChange={(e) => setFormData({ ...formData, visiMisi: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Jenjang Pendidikan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {jenjangOptions.map((jenjang) => (
                  <div key={jenjang} className="flex items-center space-x-2">
                    <Checkbox
                      id={jenjang}
                      checked={selectedJenjang.includes(jenjang)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedJenjang([...selectedJenjang, jenjang]);
                        } else {
                          setSelectedJenjang(selectedJenjang.filter((j) => j !== jenjang));
                        }
                      }}
                    />
                    <Label htmlFor={jenjang} className="text-sm cursor-pointer">
                      {jenjang}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Floating Save Button */}
      <div className="fixed bottom-20 right-20 z-50">
        <Button
          size="lg"
          className="bg-emerald-600 hover:bg-emerald-700 shadow-lg"
          onClick={handleSave}
        >
          <Save className="h-5 w-5 mr-2" />
          Simpan Data
        </Button>
      </div>
    </div>
  );
};

export default ProfilPesantren;
