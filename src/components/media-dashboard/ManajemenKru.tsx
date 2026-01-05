import { useState, useEffect } from "react";
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
import { UserPlus, Trash2, Users, AlertTriangle, Zap, Lock, Loader2, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface JabatanCode {
  id: string;
  name: string;
  code: string;
  description: string | null;
}

interface CrewMember {
  id: string;
  nama: string;
  jabatan: string | null;
  niam: string | null;
  xp_level: number;
  skill: string[] | null;
  jabatan_code_id: string | null;
}

interface ManajemenKruProps {
  paymentStatus: "paid" | "unpaid";
  debugProfile?: {
    nip?: string;
    nama_pesantren?: string;
  };
}

const ManajemenKru = ({ paymentStatus, debugProfile }: ManajemenKruProps) => {
  const { user } = useAuth();
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [jabatanCodes, setJabatanCodes] = useState<JabatanCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "",
    jabatan_code_id: "",
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

  // Fetch crew members and jabatan codes
  useEffect(() => {
    fetchData();
  }, [user?.id]);

  const fetchData = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      // Fetch jabatan codes
      const { data: jabatanData, error: jabatanError } = await supabase
        .from('jabatan_codes')
        .select('*')
        .order('name');

      if (jabatanError) throw jabatanError;
      setJabatanCodes(jabatanData || []);

      // Fetch crew members for this profile
      const { data: crewData, error: crewError } = await supabase
        .from('crews')
        .select('*')
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false });

      if (crewError) throw crewError;
      setCrewMembers(crewData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data kru",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!newMember.name || !newMember.jabatan_code_id || !newMember.skill) {
      toast({
        title: "Error",
        description: "Semua field harus diisi",
        variant: "destructive",
      });
      return;
    }

    if (!user?.id) return;

    setIsSaving(true);
    try {
      // Get jabatan name for the jabatan field
      const selectedJabatan = jabatanCodes.find(j => j.id === newMember.jabatan_code_id);

      // Insert new crew member
      const { data: newCrew, error: insertError } = await supabase
        .from('crews')
        .insert({
          profile_id: user.id,
          nama: newMember.name,
          jabatan: selectedJabatan?.name || '',
          jabatan_code_id: newMember.jabatan_code_id,
          skill: [newMember.skill],
          xp_level: 0,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Generate NIAM using the database function
      const { data: niamData, error: niamError } = await supabase
        .rpc('generate_niam', {
          p_crew_id: newCrew.id,
          p_profile_id: user.id,
          p_jabatan_code_id: newMember.jabatan_code_id
        });

      if (niamError) {
        console.error('NIAM generation error:', niamError);
        // Don't throw - crew was created, just NIAM failed (likely no NIP yet)
        toast({
          title: "Kru Ditambahkan",
          description: niamError.message.includes('NIP') 
            ? "NIAM belum bisa digenerate karena NIP Lembaga belum aktif" 
            : "NIAM belum bisa digenerate",
          variant: "default",
        });
      } else {
        toast({
          title: "Berhasil",
          description: `Anggota kru berhasil ditambahkan dengan NIAM: ${niamData}`,
        });
      }

      setNewMember({ name: "", jabatan_code_id: "", skill: "" });
      setIsDialogOpen(false);
      fetchData();
    } catch (error: any) {
      console.error('Error adding crew:', error);
      toast({
        title: "Error",
        description: error.message || "Gagal menambahkan anggota kru",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMember = async (id: string) => {
    try {
      const { error } = await supabase
        .from('crews')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCrewMembers(crewMembers.filter((m) => m.id !== id));
      toast({
        title: "Dihapus",
        description: "Anggota kru berhasil dihapus",
      });
    } catch (error) {
      console.error('Error deleting crew:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus anggota kru",
        variant: "destructive",
      });
    }
  };

  const handleUpdateJabatan = async (crewId: string, newJabatanCodeId: string) => {
    try {
      const selectedJabatan = jabatanCodes.find(j => j.id === newJabatanCodeId);
      
      const { error } = await supabase
        .from('crews')
        .update({
          jabatan: selectedJabatan?.name || '',
          jabatan_code_id: newJabatanCodeId,
        })
        .eq('id', crewId);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Jabatan dan NIAM diperbarui",
      });
      
      fetchData();
    } catch (error) {
      console.error('Error updating jabatan:', error);
      toast({
        title: "Error",
        description: "Gagal memperbarui jabatan",
        variant: "destructive",
      });
    }
  };

  const FREE_SLOT_LIMIT = 3;
  const isSlotLimitReached = crewMembers.length >= FREE_SLOT_LIMIT;
  const isAddDisabled = paymentStatus === "unpaid" || isSlotLimitReached;
  const getAvatarInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manajemen Crew</h1>
          <p className="text-muted-foreground">
            Kelola anggota tim media pesantren Anda ({crewMembers.length}/{FREE_SLOT_LIMIT} slot gratis)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
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
                            value={newMember.jabatan_code_id}
                            onValueChange={(value) => setNewMember({ ...newMember, jabatan_code_id: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih jabatan" />
                            </SelectTrigger>
                            <SelectContent>
                              {jabatanCodes.map((jabatan) => (
                                <SelectItem key={jabatan.id} value={jabatan.id}>
                                  <span className="font-mono text-xs mr-2 text-muted-foreground">[{jabatan.code}]</span>
                                  {jabatan.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">
                            Kode jabatan akan digunakan dalam NIAM
                          </p>
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
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Menyimpan...
                            </>
                          ) : (
                            "Tambah Anggota"
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </span>
              </TooltipTrigger>
              {isAddDisabled && (
                <TooltipContent>
                  <p>
                    {paymentStatus === "unpaid" 
                      ? "Fitur terkunci (Unpaid) - Lunasi tagihan untuk membuka"
                      : `Batas slot gratis tercapai (${FREE_SLOT_LIMIT} anggota)`
                    }
                  </p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Slot Limit Alert */}
      {isSlotLimitReached && paymentStatus === "paid" && (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 flex items-center justify-between">
            <span>
              <strong>Slot Gratis Penuh:</strong> Anda telah menggunakan {FREE_SLOT_LIMIT} slot gratis.
            </span>
            <Button size="sm" variant="outline" className="ml-4 border-amber-300 text-amber-700 hover:bg-amber-100" disabled>
              <Lock className="h-3 w-3 mr-1" />
              Beli Slot Tambahan (Coming Soon)
            </Button>
          </AlertDescription>
        </Alert>
      )}

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
                <TableHead>NIAM</TableHead>
                <TableHead>XP Level</TableHead>
                <TableHead>Skills</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {crewMembers.length > 0 ? (
                crewMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                          {getAvatarInitials(member.nama)}
                        </div>
                        <span className="font-medium text-foreground">{member.nama}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={member.jabatan_code_id || ""}
                        onValueChange={(value) => handleUpdateJabatan(member.id, value)}
                        disabled={paymentStatus === "unpaid"}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue>
                            {member.jabatan || "Pilih jabatan"}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {jabatanCodes.map((jabatan) => (
                            <SelectItem key={jabatan.id} value={jabatan.id}>
                              <span className="font-mono text-xs mr-2">[{jabatan.code}]</span>
                              {jabatan.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {member.niam ? (
                        <Badge variant="outline" className="font-mono text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                          {member.niam}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Belum terbit
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Zap className="h-4 w-4 text-accent" />
                        <span className="font-semibold text-accent">{member.xp_level || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {member.skill?.map((skill) => (
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
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteMember(member.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Belum ada anggota kru. Klik "Tambah Kru Baru" untuk memulai.
                  </TableCell>
                </TableRow>
              )}
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
              {crewMembers.reduce((acc, m) => acc + (m.xp_level || 0), 0)}
            </p>
            <p className="text-sm text-muted-foreground">Total XP Tim</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-6 text-center">
            <Badge className="bg-green-500 text-white mb-2">ACTIVE</Badge>
            <p className="text-3xl font-bold text-foreground">
              {crewMembers.filter(m => m.niam).length}
            </p>
            <p className="text-sm text-muted-foreground">Kru Ber-NIAM</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManajemenKru;