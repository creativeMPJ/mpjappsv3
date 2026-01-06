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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UserPlus, Trash2, Users, AlertTriangle, Zap, Lock, Loader2, RefreshCw, Mail, Phone } from "lucide-react";
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
  email?: string;
  whatsapp?: string;
}

interface ManajemenKruProps {
  paymentStatus: "paid" | "unpaid";
  debugProfile?: {
    nip?: string;
    nama_pesantren?: string;
  };
}

const FREE_SLOT_LIMIT = 3;

// Jabatan options based on ERD
const jabatanOptions = [
  { value: "admin_media", label: "Admin Media" },
  { value: "fotografer", label: "Fotografer" },
  { value: "videografer", label: "Videografer" },
  { value: "editor", label: "Editor" },
  { value: "penulis", label: "Penulis/Reporter" },
];

// Skeleton loader for cards
const CardSkeleton = memo(() => (
  <Card className="bg-card">
    <CardContent className="p-4">
      <div className="flex items-start gap-4">
        <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
    </CardContent>
  </Card>
));
CardSkeleton.displayName = 'CardSkeleton';

// Memoized crew card component for mobile view
const CrewCard = memo(({ 
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
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg flex-shrink-0">
            {getAvatarInitials}
          </div>
          
          {/* Info */}
          <div className="flex-1 min-w-0">
            {/* Name - Large and prominent */}
            <h3 className="font-bold text-foreground text-lg truncate">{member.nama}</h3>
            
            {/* Jabatan */}
            <p className="text-sm text-muted-foreground font-medium mt-0.5">
              {member.jabatan || "Belum ada jabatan"}
            </p>
            
            {/* NIAM Badge - Prominent */}
            <div className="mt-2">
              {member.niam ? (
                <Badge className="font-mono text-sm bg-emerald-100 text-emerald-700 border-emerald-200">
                  {member.niam}
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  NIAM Belum Terbit
                </Badge>
              )}
            </div>
            
            {/* XP Level */}
            <div className="flex items-center gap-1 mt-2">
              <Zap className="h-4 w-4 text-accent" />
              <span className="font-semibold text-accent text-sm">{member.xp_level || 0} XP</span>
            </div>
          </div>

          {/* Delete Button */}
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:bg-destructive/10 flex-shrink-0"
            onClick={() => onDelete(member.id)}
            disabled={paymentStatus === "unpaid"}
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>

        {/* Skills */}
        {member.skill && member.skill.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border">
            {member.skill.map((skill) => (
              <Badge
                key={skill}
                variant="secondary"
                className="bg-primary/10 text-primary text-xs"
              >
                {skill}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
});
CrewCard.displayName = 'CrewCard';

// Empty state component
const EmptyState = memo(() => (
  <Card className="bg-card border-border">
    <CardContent className="py-12 text-center">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
          <Users className="h-8 w-8" />
        </div>
        <p className="text-lg font-medium">Belum ada anggota kru</p>
        <p className="text-sm">Klik tombol "Tambah Kru Baru" untuk memulai</p>
      </div>
    </CardContent>
  </Card>
));
EmptyState.displayName = 'EmptyState';

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
    return <EmptyState />;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {crewMembers.map((member) => (
        <CrewCard
          key={member.id}
          member={member}
          jabatanCodes={jabatanCodes}
          paymentStatus={paymentStatus}
          onUpdateJabatan={onUpdateJabatan}
          onDelete={onDelete}
        />
      ))}
    </div>
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
    jabatan: "",
    email: "",
    whatsapp: "",
  });
  const [emailError, setEmailError] = useState("");

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

  // Email validation
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleEmailChange = (value: string) => {
    setNewMember(prev => ({ ...prev, email: value }));
    if (value && !validateEmail(value)) {
      setEmailError("Format email tidak valid");
    } else {
      setEmailError("");
    }
  };

  const handleAddMember = useCallback(async () => {
    if (!newMember.name || !newMember.jabatan || !newMember.email || !newMember.whatsapp) {
      toast({
        title: "Error",
        description: "Semua field harus diisi",
        variant: "destructive",
      });
      return;
    }

    if (!validateEmail(newMember.email)) {
      toast({
        title: "Error",
        description: "Format email tidak valid",
        variant: "destructive",
      });
      return;
    }

    if (!user?.id) return;

    setIsSaving(true);
    try {
      const selectedJabatan = jabatanOptions.find(j => j.value === newMember.jabatan);
      const jabatanCode = jabatanCodes.find(j => j.name.toLowerCase().includes(selectedJabatan?.label.toLowerCase().split("/")[0] || ""));

      const { data: newCrew, error: insertError } = await supabase
        .from('crews')
        .insert({
          profile_id: user.id,
          nama: newMember.name,
          jabatan: selectedJabatan?.label || '',
          jabatan_code_id: jabatanCode?.id || null,
          skill: [],
          xp_level: 0,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      if (jabatanCode) {
        const { data: niamData, error: niamError } = await supabase
          .rpc('generate_niam', {
            p_crew_id: newCrew.id,
            p_profile_id: user.id,
            p_jabatan_code_id: jabatanCode.id
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
      } else {
        toast({
          title: "Berhasil",
          description: "Anggota kru berhasil ditambahkan",
        });
      }

      setNewMember({ name: "", jabatan: "", email: "", whatsapp: "" });
      setEmailError("");
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
    <div className="space-y-4 md:space-y-6">
      {/* Header - Mobile optimized */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Tim Media</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Kelola anggota tim media pesantren ({slotStatus.used}/{slotStatus.limit} slot gratis)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchData} disabled={isLoading} className="h-10 px-3">
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            <span className="ml-2 hidden sm:inline">Refresh</span>
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        className={cn(
                          "h-10 px-4",
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
                        <span className="hidden sm:inline">Tambah Kru Baru</span>
                        <span className="sm:hidden">Tambah</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md mx-4">
                      <DialogHeader>
                        <DialogTitle className="text-lg">Tambah Anggota Kru</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        {/* Nama Lengkap */}
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-base">Nama Lengkap</Label>
                          <Input
                            id="name"
                            placeholder="Masukkan nama lengkap"
                            value={newMember.name}
                            onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                            className="h-12 text-base"
                          />
                        </div>
                        
                        {/* Jabatan - Dropdown */}
                        <div className="space-y-2">
                          <Label htmlFor="jabatan" className="text-base">Jabatan</Label>
                          <Select
                            value={newMember.jabatan}
                            onValueChange={(value) => setNewMember({ ...newMember, jabatan: value })}
                          >
                            <SelectTrigger className="h-12 text-base">
                              <SelectValue placeholder="Pilih jabatan" />
                            </SelectTrigger>
                            <SelectContent>
                              {jabatanOptions.map((jabatan) => (
                                <SelectItem key={jabatan.value} value={jabatan.value} className="text-base py-3">
                                  {jabatan.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {/* Email */}
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-base flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Email
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="contoh@email.com"
                            value={newMember.email}
                            onChange={(e) => handleEmailChange(e.target.value)}
                            className={cn("h-12 text-base", emailError && "border-destructive")}
                          />
                          {emailError && (
                            <p className="text-sm text-destructive">{emailError}</p>
                          )}
                        </div>
                        
                        {/* WhatsApp */}
                        <div className="space-y-2">
                          <Label htmlFor="whatsapp" className="text-base flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            WhatsApp
                          </Label>
                          <Input
                            id="whatsapp"
                            type="tel"
                            placeholder="08xxxxxxxxxx"
                            value={newMember.whatsapp}
                            onChange={(e) => setNewMember({ ...newMember, whatsapp: e.target.value })}
                            className="h-12 text-base"
                          />
                        </div>
                        
                        <Button 
                          className="w-full h-12 text-base bg-primary hover:bg-primary/90" 
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
          <AlertDescription className="text-amber-800">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span>
                <strong>Slot Gratis Penuh:</strong> Anda telah menggunakan {slotStatus.limit} slot gratis.
              </span>
              <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100 w-full sm:w-auto" disabled>
                <Lock className="h-3 w-3 mr-1" />
                Beli Slot (Coming Soon)
              </Button>
            </div>
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

      {/* Crew Cards - Mobile optimized */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <CrewList
          crewMembers={crewMembers}
          jabatanCodes={jabatanCodes}
          paymentStatus={paymentStatus}
          onUpdateJabatan={handleUpdateJabatan}
          onDelete={handleDeleteMember}
        />
      )}

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
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManajemenKru;
