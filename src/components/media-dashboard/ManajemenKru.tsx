import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UserPlus, Trash2, Users, AlertTriangle, Zap, Lock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface CrewMember {
  id: string;
  name: string;
  jabatan: string;
  nip: string;
  xpLevel: number;
  skills: string[];
  avatar: string;
}

interface ManajemenKruProps {
  paymentStatus: "paid" | "unpaid";
}

const ManajemenKru = ({ paymentStatus }: ManajemenKruProps) => {
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([
    {
      id: "1",
      name: "Ahmad Fauzi",
      jabatan: "Koordinator",
      nip: "MPJ-2024-001",
      xpLevel: 150,
      skills: ["Videografi", "Editor"],
      avatar: "AF",
    },
    {
      id: "2",
      name: "Siti Aisyah",
      jabatan: "Content Creator",
      nip: "MPJ-2024-002",
      xpLevel: 80,
      skills: ["Writing", "Social Media"],
      avatar: "SA",
    },
    {
      id: "3",
      name: "Budi Santoso",
      jabatan: "Fotografer",
      nip: "MPJ-2024-003",
      xpLevel: 120,
      skills: ["Fotografi", "Editing"],
      avatar: "BS",
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "",
    jabatan: "",
    skill: "",
  });

  const jabatanOptions = [
    "Koordinator",
    "Content Creator",
    "Fotografer",
    "Videografer",
    "Desainer Grafis",
    "Editor Video",
  ];

  const skillOptions = [
    "Editor Video",
    "Desainer Grafis",
    "Fotografer",
    "Content Writer",
    "Social Media",
    "Videografi",
  ];

  const handleAddMember = () => {
    if (!newMember.name || !newMember.jabatan || !newMember.skill) {
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
      jabatan: newMember.jabatan,
      nip: `MPJ-2024-${String(crewMembers.length + 1).padStart(3, "0")}`,
      xpLevel: 0,
      skills: [newMember.skill],
      avatar: newMember.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2),
    };

    setCrewMembers([...crewMembers, member]);
    setNewMember({ name: "", jabatan: "", skill: "" });
    setIsDialogOpen(false);
    toast({
      title: "Berhasil",
      description: "Anggota kru berhasil ditambahkan",
    });
  };

  const handleDeleteMember = (id: string) => {
    setCrewMembers(crewMembers.filter((m) => m.id !== id));
    toast({
      title: "Dihapus",
      description: "Anggota kru berhasil dihapus",
    });
  };

  const isAddDisabled = paymentStatus === "unpaid";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manajemen Crew</h1>
          <p className="text-muted-foreground">
            Kelola anggota tim media pesantren Anda ({crewMembers.length} anggota)
          </p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      className={cn(
                        isAddDisabled 
                          ? "bg-muted text-muted-foreground cursor-not-allowed" 
                          : "bg-primary hover:bg-primary/90"
                      )}
                      disabled={isAddDisabled}
                    >
                      {isAddDisabled ? (
                        <Lock className="h-4 w-4 mr-2" />
                      ) : (
                        <UserPlus className="h-4 w-4 mr-2" />
                      )}
                      + Tambah Kru Baru
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
                        <Label htmlFor="jabatan">Jabatan</Label>
                        <Select
                          value={newMember.jabatan}
                          onValueChange={(value) => setNewMember({ ...newMember, jabatan: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih jabatan" />
                          </SelectTrigger>
                          <SelectContent>
                            {jabatanOptions.map((jabatan) => (
                              <SelectItem key={jabatan} value={jabatan}>
                                {jabatan}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                      <Button 
                        className="w-full bg-primary hover:bg-primary/90" 
                        onClick={handleAddMember}
                      >
                        Tambah Anggota
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </span>
            </TooltipTrigger>
            {isAddDisabled && (
              <TooltipContent>
                <p>Fitur terkunci (Unpaid) - Lunasi tagihan untuk membuka</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Payment Warning */}
      {paymentStatus === "unpaid" && (
        <Alert className="bg-accent/10 border-accent/30">
          <AlertTriangle className="h-4 w-4 text-accent" />
          <AlertDescription className="text-foreground">
            <strong>Perhatian:</strong> Fitur tambah kru baru tidak tersedia. Silakan lunasi tagihan terlebih dahulu.
          </AlertDescription>
        </Alert>
      )}

      {/* Crew Table */}
      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Nama</TableHead>
                <TableHead>Jabatan</TableHead>
                <TableHead>NIP</TableHead>
                <TableHead>XP Level</TableHead>
                <TableHead>Skills</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {crewMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                        {member.avatar}
                      </div>
                      <span className="font-medium text-foreground">{member.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-muted">
                      {member.jabatan}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {member.nip}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Zap className="h-4 w-4 text-accent" />
                      <span className="font-semibold text-accent">{member.xpLevel}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {member.skills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="bg-primary/10 text-primary text-xs"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {member.jabatan !== "Koordinator" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteMember(member.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 mx-auto text-primary mb-2" />
            <p className="text-3xl font-bold text-foreground">{crewMembers.length}</p>
            <p className="text-sm text-muted-foreground">Total Anggota</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-6 text-center">
            <Zap className="h-8 w-8 mx-auto text-accent mb-2" />
            <p className="text-3xl font-bold text-accent">
              {crewMembers.reduce((acc, m) => acc + m.xpLevel, 0)}
            </p>
            <p className="text-sm text-muted-foreground">Total XP Tim</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-6 text-center">
            <Badge className="bg-green-500 text-white mb-2">ACTIVE</Badge>
            <p className="text-3xl font-bold text-foreground">{crewMembers.length}</p>
            <p className="text-sm text-muted-foreground">Kru Aktif</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManajemenKru;