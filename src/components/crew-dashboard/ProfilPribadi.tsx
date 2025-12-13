import { useState } from "react";
import { Upload, Camera, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const availableSkills = [
  "Videographer",
  "Editor",
  "Desainer",
  "Ilustrator",
  "Writer",
  "Photographer",
  "Social Media",
  "Motion Graphic",
];

const ProfilPribadi = () => {
  const [name, setName] = useState("Muhammad Rizki");
  const [whatsapp, setWhatsapp] = useState("081234567890");
  const [selectedSkills, setSelectedSkills] = useState<string[]>(["Writer", "Social Media"]);
  const { toast } = useToast();

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleSave = () => {
    toast({
      title: "Profil Disimpan",
      description: "Data profil Anda berhasil diperbarui.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Edit Profil Saya</h1>
        <p className="text-muted-foreground">Perbarui informasi pribadi dan keahlian Anda</p>
      </div>

      {/* Avatar Section */}
      <Card>
        <CardHeader>
          <CardTitle>Foto Profil</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src="https://i.pravatar.cc/150?img=12" />
              <AvatarFallback>MR</AvatarFallback>
            </Avatar>
            <Button
              size="icon"
              className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-emerald-600 hover:bg-emerald-700"
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>
          <div>
            <p className="font-medium text-foreground">Ubah Foto Profil</p>
            <p className="text-sm text-muted-foreground">JPG, PNG maks. 2MB</p>
          </div>
        </CardContent>
      </Card>

      {/* Identity Section */}
      <Card>
        <CardHeader>
          <CardTitle>Identitas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama lengkap"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">Nomor WhatsApp</Label>
              <Input
                id="whatsapp"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="08xxxxxxxxxx"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skill Set Section */}
      <Card>
        <CardHeader>
          <CardTitle>Keahlian (Skill Tags)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Pilih keahlian yang akan ditampilkan di kartu tim Anda
          </p>
          <div className="flex flex-wrap gap-2">
            {availableSkills.map((skill) => (
              <Badge
                key={skill}
                variant={selectedSkills.includes(skill) ? "default" : "outline"}
                className={`cursor-pointer transition-all ${
                  selectedSkills.includes(skill)
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "hover:bg-emerald-50 hover:border-emerald-300"
                }`}
                onClick={() => toggleSkill(skill)}
              >
                {skill}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Document Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Arsip Legalitas (Opsional)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-emerald-300 transition-colors">
            <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="font-medium text-foreground">Upload Surat Tugas / SK Personal</p>
            <p className="text-sm text-muted-foreground mt-1">
              Simpan arsip surat tugas pribadi Anda di sini
            </p>
            <Button variant="outline" className="mt-4">
              Pilih File
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          className="bg-emerald-600 hover:bg-emerald-700 px-8"
        >
          <Save className="h-4 w-4 mr-2" />
          Simpan Profil
        </Button>
      </div>
    </div>
  );
};

export default ProfilPribadi;
