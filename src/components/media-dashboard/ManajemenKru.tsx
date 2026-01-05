import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
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

const FREE_SLOT_LIMIT = 3;

const skillOptions = [
  "Editor Video",
  "Desainer Grafis",
  "Fotografer",
  "Content Writer",
  "Social Media",
  "Videografi",
];

// Skeleton loader for table rows
const TableRowSkeleton = memo(() => (
  <TableRow>
    <TableCell>
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>
    </TableCell>
    <TableCell><Skeleton className="h-8 w-32" /></TableCell>
    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
  </TableRow>
));
TableRowSkeleton.displayName = 'TableRowSkeleton';

// Memoized crew row component for performance
const CrewRow = memo(({ 
  member, 
  jabatanCodes, 
  paymentStatus, 
  onUpdateJabatan, 
  onDelete 
}: {
  member: CrewMember;
  jabatanCodes: JabatanCode[];
  paymentStatus: "paid" | "unpaid";
  onUpdateJabatan: (id: string, jabatanCodeId: string) => void;
  onDelete: (id: string) => void;
}) => {
  const getAvatarInitials = useMemo(() => {
    return member.nama.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  }, [member.nama]);

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
            {getAvatarInitials}
          </div>
          <span className="font-medium text-foreground">{member.nama}</span>
        </div>
      </TableCell>
      <TableCell>
        <Select
          value={member.jabatan_code_id || ""}
          onValueChange={(value) => onUpdateJabatan(member.id, value)}
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
          className="text-destructive hover:bg-destructive/10"
          onClick={() => onDelete(member.id)}
          disabled={paymentStatus === "unpaid"}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
});

CrewRow.displayName = 'CrewRow';

// Memoized crew list component
const CrewList = memo(({ 
  crewMembers, 
  jabatanCodes, 
  paymentStatus, 
  onUpdateJabatan, 
  onDelete 
}: {
  crewMembers: CrewMember[];
  jabatanCodes: JabatanCode[];
  paymentStatus: "paid" | "unpaid";
  onUpdateJabatan: (id: string, jabatanCodeId: string) => void;
  onDelete: (id: string) => void;
}) => {
  if (crewMembers.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={6} className="h-32 text-center">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Users className="h-8 w-8" />
            <p>Belum ada anggota kru</p>
            <p className="text-sm">Klik tombol "Tambah Kru Baru" untuk memulai</p>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <>
      {crewMembers.map((member) => (
        <CrewRow
          key={member.id}
          member={member}
          jabatanCodes={jabatanCodes}
          paymentStatus={paymentStatus}
          onUpdateJabatan={onUpdateJabatan}
          onDelete={onDelete}
        />
      ))}
    </>
  );
});

CrewList.displayName = 'CrewList';

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

  // Memoized computed values for slot logic (The Golden 3)
  const slotStatus = useMemo(() => {
    const used = crewMembers.length;
    const isLimitReached = used >= FREE_SLOT_LIMIT;
    const isAddDisabled = paymentStatus === "unpaid" || isLimitReached;
    
    return {
      used,
      limit: FREE_SLOT_LIMIT,
      isLimitReached,
      isAddDisabled,
      remaining: FREE_SLOT_LIMIT - used,
    };
  }, [crewMembers.length, paymentStatus]);

  // Fetch crew members and jabatan codes
  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const [jabatanResult, crewResult] = await Promise.all([
        supabase.from('jabatan_codes').select('*').order('name'),
        supabase.from('crews').select('*').eq('profile_id', user.id).order('created_at', { ascending: false })
      ]);

      if (jabatanResult.error) throw jabatanResult.error;
      if (crewResult.error) throw crewResult.error;

      setJabatanCodes(jabatanResult.data || []);
      setCrewMembers(crewResult.data || []);
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
  }, [user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddMember = useCallback(async () => {
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
      const selectedJabatan = jabatanCodes.find(j => j.id === newMember.jabatan_code_id);

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

      const { data: niamData, error: niamError } = await supabase
        .rpc('generate_niam', {
          p_crew_id: newCrew.id,
          p_profile_id: user.id,
          p_jabatan_code_id: newMember.jabatan_code_id
        });

      if (niamError) {
        console.error('NIAM generation error:', niamError);
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
  }, [newMember, user?.id, jabatanCodes, fetchData]);

  const handleDeleteMember = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('crews')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCrewMembers(prev => prev.filter((m) => m.id !== id));
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
  }, []);

  const handleUpdateJabatan = useCallback(async (crewId: string, newJabatanCodeId: string) => {
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
  }, [jabatanCodes, fetchData]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tim Media</h1>
          <p className="text-muted-foreground">
            Kelola anggota tim media pesantren Anda ({slotStatus.used}/{slotStatus.limit} slot gratis)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchData} disabled={isLoading}>
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
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
                          slotStatus.isAddDisabled 
                            ? "bg-muted text-muted-foreground cursor-not-allowed" 
                            : "bg-primary hover:bg-primary/90"
                        )}
                        disabled={slotStatus.isAddDisabled}
                      >
                        {slotStatus.isAddDisabled ? (
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
              {slotStatus.isAddDisabled && (
                <TooltipContent>
                  <p>
                    {paymentStatus === "unpaid" 
                      ? "Fitur terkunci (Unpaid) - Lunasi tagihan untuk membuka"
                      : `Batas slot gratis tercapai (${slotStatus.limit} anggota)`
                    }
                  </p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Slot Limit Alert */}
      {slotStatus.isLimitReached && paymentStatus === "paid" && (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 flex items-center justify-between">
            <span>
              <strong>Slot Gratis Penuh:</strong> Anda telah menggunakan {slotStatus.limit} slot gratis.
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
              {isLoading ? (
                <>
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                </>
              ) : (
                <CrewList
                  crewMembers={crewMembers}
                  jabatanCodes={jabatanCodes}
                  paymentStatus={paymentStatus}
                  onUpdateJabatan={handleUpdateJabatan}
                  onDelete={handleDeleteMember}
                />
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-emerald-50/50 border-emerald-100">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <Users className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h4 className="font-semibold text-emerald-800">Aturan The Golden 3</h4>
              <p className="text-sm text-emerald-700 mt-1">
                Setiap pesantren mendapat <strong>{FREE_SLOT_LIMIT} slot gratis</strong> untuk anggota kru media. 
                Slot tambahan dapat dibeli melalui menu Administrasi (fitur segera hadir).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManajemenKru;
