import { useState, useEffect } from "react";
import { Search, Download, Building2, Users, UserCircle, Loader2 } from "lucide-react";
import { maskPhoneNumber, maskEmail, maskName } from "@/lib/privacy-utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface PesantrenData {
  id: string;
  nama_pesantren: string | null;
  nama_pengasuh: string | null;
  alamat_singkat: string | null;
  status_account: string;
  no_wa_pendaftar: string | null;
}

interface CrewData {
  id: string;
  nama: string;
  jabatan: string | null;
  niam: string | null;
  profile_id: string;
}

const DataMasterRegional = () => {
  const { profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("pesantren");
  const [loading, setLoading] = useState(true);
  
  const [pesantrenList, setPesantrenList] = useState<PesantrenData[]>([]);
  const [crewList, setCrewList] = useState<CrewData[]>([]);

  // Fetch real data from Supabase with region filter
  useEffect(() => {
    const fetchData = async () => {
      if (!profile?.region_id) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      
      // Fetch pesantren/koordinator data (profiles with role = 'user')
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, nama_pesantren, nama_pengasuh, alamat_singkat, status_account, no_wa_pendaftar')
        .eq('region_id', profile.region_id)
        .eq('role', 'user');
      
      if (!profilesError && profiles) {
        setPesantrenList(profiles);
      }
      
      // Fetch crew data for all profiles in this region
      const { data: crews, error: crewsError } = await supabase
        .from('crews')
        .select(`
          id,
          nama,
          jabatan,
          niam,
          profile_id
        `);
      
      if (!crewsError && crews) {
        // Filter crews by region - we need to check if their profile is in our region
        const profileIds = profiles?.map(p => p.id) || [];
        const filteredCrews = crews.filter(crew => profileIds.includes(crew.profile_id));
        setCrewList(filteredCrews);
      }
      
      setLoading(false);
    };
    
    fetchData();
  }, [profile?.region_id]);

  const getStatusBadge = (status: string) => {
    if (status === "active") {
      return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Aktif</Badge>;
    }
    if (status === "pending") {
      return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Pending</Badge>;
    }
    return <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100">Ditolak</Badge>;
  };

  // Filter data based on search query
  const filteredPesantren = pesantrenList.filter(item =>
    item.nama_pesantren?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.nama_pengasuh?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCrews = crewList.filter(item =>
    item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.jabatan?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Data Master Regional</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola data pesantren, koordinator, dan kru di wilayah Anda</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 sm:flex-none sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari data..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
          <Button 
            variant="outline" 
            className="h-11 gap-2 min-h-[44px]"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <TabsList className="inline-flex h-12 items-center justify-start rounded-lg bg-muted p-1 w-auto min-w-full md:min-w-0">
            <TabsTrigger 
              value="pesantren" 
              className="flex items-center gap-2 px-4 py-2.5 min-h-[40px] whitespace-nowrap data-[state=active]:bg-sidebar data-[state=active]:text-white"
            >
              <Building2 className="w-4 h-4" />
              <span>Data Pesantren ({filteredPesantren.length})</span>
            </TabsTrigger>
            <TabsTrigger 
              value="kru" 
              className="flex items-center gap-2 px-4 py-2.5 min-h-[40px] whitespace-nowrap data-[state=active]:bg-sidebar data-[state=active]:text-white"
            >
              <UserCircle className="w-4 h-4" />
              <span>Data Kru ({filteredCrews.length})</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Content: Pesantren */}
        <TabsContent value="pesantren" className="mt-6">
          <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-12 font-semibold">No</TableHead>
                    <TableHead className="font-semibold min-w-[200px]">Nama Pesantren</TableHead>
                    <TableHead className="font-semibold min-w-[150px]">Pengasuh</TableHead>
                    <TableHead className="font-semibold min-w-[130px]">WhatsApp</TableHead>
                    <TableHead className="font-semibold min-w-[200px]">Alamat</TableHead>
                    <TableHead className="font-semibold w-24">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPesantren.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Belum ada data pesantren di wilayah ini
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPesantren.map((item, index) => (
                      <TableRow key={item.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell className="font-medium text-foreground">{item.nama_pesantren || '-'}</TableCell>
                        <TableCell>{maskName(item.nama_pengasuh)}</TableCell>
                        <TableCell className="text-sidebar">
                          {maskPhoneNumber(item.no_wa_pendaftar)}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate" title={item.alamat_singkat || ''}>
                          {item.alamat_singkat || '-'}
                        </TableCell>
                        <TableCell>{getStatusBadge(item.status_account)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        {/* Tab Content: Kru */}
        <TabsContent value="kru" className="mt-6">
          <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-12 font-semibold">No</TableHead>
                    <TableHead className="font-semibold min-w-[150px]">Nama</TableHead>
                    <TableHead className="font-semibold min-w-[120px]">Jabatan</TableHead>
                    <TableHead className="font-semibold min-w-[150px]">NIAM</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCrews.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        Belum ada data kru di wilayah ini
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCrews.map((item, index) => (
                      <TableRow key={item.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell className="font-medium text-foreground">{maskName(item.nama)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-primary/10 text-sidebar hover:bg-primary/10">
                            {item.jabatan || '-'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{item.niam || '-'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataMasterRegional;