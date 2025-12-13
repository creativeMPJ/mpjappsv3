import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, Trash2, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface CrewMember {
  id: string;
  name: string;
  whatsapp: string;
  role: string;
  skills: string[];
  avatar: string;
}

const ManajemenKru = () => {
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([
    {
      id: "1",
      name: "Ahmad Fauzi",
      whatsapp: "081234567890",
      role: "Koordinator",
      skills: ["Videografi", "Editor"],
      avatar: "AF",
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "",
    whatsapp: "",
    skill: "",
  });

  const skillOptions = [
    "Editor Video",
    "Desainer Grafis",
    "Fotografer",
    "Content Writer",
    "Social Media",
    "Videografi",
  ];

  const handleAddMember = () => {
    if (!newMember.name || !newMember.whatsapp || !newMember.skill) {
      toast({
        title: "Error",
        description: "Semua field harus diisi",
        variant: "destructive",
      });
      return;
    }

    const member: CrewMember = {
      id: Date.now().toString(),
      name: newMember.name,
      whatsapp: newMember.whatsapp,
      role: "Anggota",
      skills: [newMember.skill],
      avatar: newMember.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2),
    };

    setCrewMembers([...crewMembers, member]);
    setNewMember({ name: "", whatsapp: "", skill: "" });
    setIsDialogOpen(false);
    toast({
      title: "Berhasil",
      description: "Anggota kru berhasil ditambahkan via Node.js API",
    });
  };

  const handleDeleteMember = (id: string) => {
    setCrewMembers(crewMembers.filter((m) => m.id !== id));
    toast({
      title: "Dihapus",
      description: "Anggota kru berhasil dihapus",
    });
  };

  const remainingSlots = 3 - crewMembers.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tim Media Saya</h1>
          <p className="text-slate-500">
            Kelola anggota tim media pesantren Anda ({crewMembers.length}/3 slot terpakai)
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={remainingSlots <= 0}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Tambah Anggota
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Anggota Kru</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input
                  id="name"
                  placeholder="Masukkan nama lengkap"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">Nomor WhatsApp</Label>
                <Input
                  id="whatsapp"
                  placeholder="08xxxxxxxxxx"
                  value={newMember.whatsapp}
                  onChange={(e) => setNewMember({ ...newMember, whatsapp: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="skill">Skill Utama</Label>
                <Select
                  value={newMember.skill}
                  onValueChange={(value) => setNewMember({ ...newMember, skill: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih skill" />
                  </SelectTrigger>
                  <SelectContent>
                    {skillOptions.map((skill) => (
                      <SelectItem key={skill} value={skill}>
                        {skill}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={handleAddMember}>
                Tambah Anggota
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Info Card */}
      {crewMembers.length < 2 && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="h-5 w-5 text-amber-600" />
            <p className="text-sm text-amber-800">
              <strong>Tips:</strong> Tambahkan minimal 1 anggota kru untuk memenuhi syarat Badge Gold!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Crew List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {crewMembers.map((member) => (
          <Card key={member.id} className="bg-white hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg">
                    {member.avatar}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{member.name}</h3>
                    <p className="text-sm text-slate-500">{member.role}</p>
                    <p className="text-xs text-slate-400">{member.whatsapp}</p>
                  </div>
                </div>
                {member.role !== "Koordinator" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDeleteMember(member.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {member.skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="bg-emerald-100 text-emerald-700"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Empty Slot Cards */}
        {Array.from({ length: remainingSlots }).map((_, index) => (
          <Card key={`empty-${index}`} className="bg-slate-50 border-dashed border-2 border-slate-200">
            <CardContent className="p-6 flex flex-col items-center justify-center min-h-[180px] text-center">
              <div className="h-14 w-14 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 mb-3">
                <UserPlus className="h-6 w-6" />
              </div>
              <p className="text-slate-400 text-sm">Slot Tersedia</p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-emerald-600 hover:text-emerald-700"
                onClick={() => setIsDialogOpen(true)}
              >
                + Tambah Kru
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ManajemenKru;
