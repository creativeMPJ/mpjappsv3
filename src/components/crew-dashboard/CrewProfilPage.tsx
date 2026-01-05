import { useState } from "react";
import { Camera, IdCard, Lock, X, Plus, Upload, FileText, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";

type ViewType = "beranda" | "event" | "sertifikat" | "eid" | "profil";

interface CrewProfilPageProps {
  onNavigate: (view: ViewType) => void;
  debugCrew?: {
    nama?: string;
    niam?: string;
    jabatan?: string;
    xp_level?: number;
    skill?: string[];
  };
}

const availableSkills = [
  "Videography", "Photography", "Video Editing", "Desain Grafis",
  "Ilustrator", "Social Media", "Writing", "Content Creator",
  "Motion Graphics", "Drone Pilot", "Live Streaming", "Audio Editing"
];

const teamMembers = [
  { id: 1, name: "Siti Aisyah", avatar: "https://i.pravatar.cc/150?img=44" },
  { id: 2, name: "Muhammad Rizki", avatar: "https://i.pravatar.cc/150?img=12" },
  { id: 3, name: "Nurul Hidayah", avatar: "https://i.pravatar.cc/150?img=32" },
];

const CrewProfilPage = ({ onNavigate, debugCrew }: CrewProfilPageProps) => {
  // Use debug data if available
  const [name] = useState(debugCrew?.nama || "Ahmad Fauzi");
  const niam = debugCrew?.niam || null;
  const xpLevel = debugCrew?.xp_level || 150;
  const [whatsapp, setWhatsapp] = useState("081234567890");
  const [selectedSkills, setSelectedSkills] = useState<string[]>(debugCrew?.skill || ["Video Editing", "Desain Grafis", "Videography"]);
  const [showSkillPicker, setShowSkillPicker] = useState(false);

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else if (selectedSkills.length < 5) {
      setSelectedSkills([...selectedSkills, skill]);
    } else {
      toast({
        title: "Maksimal 5 Skill",
        description: "Hapus skill lain untuk menambahkan skill baru",
        variant: "destructive",
      });
    }
  };

  const handleSave = () => {
    toast({
      title: "Profil Disimpan",
      description: "Perubahan data profil berhasil disimpan",
    });
  };

  const handleUploadDocument = () => {
    toast({
      title: "Upload Dokumen",
      description: "Fitur upload dokumen akan segera tersedia",
    });
  };

  return (
    <ScrollArea className="h-[calc(100vh-140px)]">
      <div className="p-4 space-y-4 pb-8">
        {/* Avatar Section */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="https://i.pravatar.cc/150?img=12" />
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-primary hover:bg-primary/90"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <h2 className="mt-4 text-xl font-bold text-foreground">{name}</h2>
              <Badge className="mt-1 bg-primary/10 text-primary">{debugCrew?.jabatan || 'Kru Media'}</Badge>
              {/* NIAM Display - Professional Typography */}
              {niam && (
                <div className="mt-3 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <p className="text-xs text-emerald-600 uppercase tracking-wider">NIAM</p>
                  <p className="text-lg font-mono font-bold text-emerald-800 tracking-wide">{niam}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* E-ID Card Access */}
        <Card 
          className="bg-gradient-to-r from-primary/10 to-accent/10 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onNavigate("eid")}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <IdCard className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">E-ID Card</h3>
                <p className="text-sm text-muted-foreground">Lihat & download ID Card digital</p>
              </div>
              <Badge className="bg-accent text-accent-foreground text-xs">BARU</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Identity Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Data Identitas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Nama Lengkap</Label>
              <Input value={name} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">* Hubungi admin untuk mengubah nama</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">No. WhatsApp</Label>
              <Input 
                value={whatsapp} 
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="Contoh: 081234567890"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Ubah Password</Label>
              <Button variant="outline" className="w-full justify-start">
                <Lock className="h-4 w-4 mr-2" />
                Ganti Password
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Skills Section */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Skill Tags</CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowSkillPicker(!showSkillPicker)}
                className="text-primary"
              >
                <Plus className="h-4 w-4 mr-1" />
                Tambah
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedSkills.map((skill) => (
                <Badge 
                  key={skill} 
                  variant="secondary"
                  className="bg-primary/10 text-primary pr-1 cursor-pointer hover:bg-primary/20"
                  onClick={() => toggleSkill(skill)}
                >
                  {skill}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
              {selectedSkills.length === 0 && (
                <p className="text-sm text-muted-foreground">Belum ada skill dipilih</p>
              )}
            </div>

            {showSkillPicker && (
              <div className="pt-3 border-t">
                <p className="text-xs text-muted-foreground mb-2">Pilih skill (max 5):</p>
                <div className="flex flex-wrap gap-2">
                  {availableSkills.filter(s => !selectedSkills.includes(s)).map((skill) => (
                    <Badge
                      key={skill}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary/10 hover:border-primary"
                      onClick={() => toggleSkill(skill)}
                    >
                      + {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-3">
              * Skill akan ditampilkan di E-ID Card
            </p>
          </CardContent>
        </Card>

        {/* Document Upload Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Arsip Legal</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={handleUploadDocument}
            >
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                <Upload className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">Upload SK / Surat Tugas</p>
              <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG (Max 5MB)</p>
            </div>

            {/* Uploaded Documents */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">SK_Kru_Media_2024.pdf</p>
                  <p className="text-xs text-muted-foreground">Diupload: 15 Nov 2024</p>
                </div>
                <Badge variant="secondary" className="text-xs">Aktif</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Section */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">Tim Saya</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">Rekan satu tim (read-only)</p>
            <div className="flex flex-wrap gap-4">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex flex-col items-center gap-1">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground text-center max-w-[60px] truncate">
                    {member.name.split(" ")[0]}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button 
          className="w-full bg-primary hover:bg-primary/90"
          onClick={handleSave}
        >
          Simpan Perubahan
        </Button>
      </div>
    </ScrollArea>
  );
};

export default CrewProfilPage;
