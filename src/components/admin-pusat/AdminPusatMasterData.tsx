import { useState, useEffect } from "react";
import { Building2, Users, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

interface Pesantren {
  id: string;
  nama_pesantren: string | null;
  region_name: string | null;
  status_account: string;
  profile_level: string;
}

interface Crew {
  id: string;
  nama: string;
  jabatan: string | null;
  pesantren_name: string | null;
}

const AdminPusatMasterData = () => {
  const [activeTab, setActiveTab] = useState("lembaga");
  const [pesantrenList, setPesantrenList] = useState<Pesantren[]>([]);
  const [crewList, setCrewList] = useState<Crew[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all pesantren
        const { data: pesantrenData } = await supabase
          .from("profiles")
          .select(`
            id,
            nama_pesantren,
            status_account,
            profile_level,
            regions!profiles_region_id_fkey (name)
          `)
          .order("nama_pesantren", { ascending: true });

        // Fetch all crews
        const { data: crewData } = await supabase
          .from("crews")
          .select(`
            id,
            nama,
            jabatan,
            profiles!crews_profile_id_fkey (nama_pesantren)
          `)
          .order("nama", { ascending: true });

        if (pesantrenData) {
          setPesantrenList(
            pesantrenData.map((item: any) => ({
              id: item.id,
              nama_pesantren: item.nama_pesantren,
              region_name: item.regions?.name || "Unknown",
              status_account: item.status_account,
              profile_level: item.profile_level,
            }))
          );
        }

        if (crewData) {
          setCrewList(
            crewData.map((item: any) => ({
              id: item.id,
              nama: item.nama,
              jabatan: item.jabatan,
              pesantren_name: item.profiles?.nama_pesantren || "Unknown",
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching master data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Aktif</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Ditolak</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getLevelBadge = (level: string) => {
    const colors: Record<string, string> = {
      basic: "bg-slate-100 text-slate-800",
      silver: "bg-gray-200 text-gray-800",
      gold: "bg-yellow-100 text-yellow-800",
      platinum: "bg-purple-100 text-purple-800",
    };
    return <Badge className={colors[level] || colors.basic}>{level.toUpperCase()}</Badge>;
  };

  // Dummy ID Card queue for MVP
  const idCardQueue = [
    { id: "1", nama_pesantren: "PP Al-Hikmah Surabaya", jumlah_kru: 5, status: "Siap Cetak" },
    { id: "2", nama_pesantren: "PP Darul Ulum Jombang", jumlah_kru: 8, status: "Siap Cetak" },
    { id: "3", nama_pesantren: "PP Lirboyo Kediri", jumlah_kru: 12, status: "Siap Cetak" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#166534]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Master Data</h1>
        <p className="text-slate-500 mt-1">Database lengkap pesantren dan kru MPJ (Read-Only)</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-100">
          <TabsTrigger value="lembaga" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Data Lembaga
          </TabsTrigger>
          <TabsTrigger value="kru" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Data Kru
          </TabsTrigger>
          <TabsTrigger value="logistik" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Logistik ID Card
          </TabsTrigger>
        </TabsList>

        {/* Data Lembaga Tab */}
        <TabsContent value="lembaga">
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-slate-900 font-semibold">
                Daftar Pesantren ({pesantrenList.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-slate-600">Nama Pesantren</TableHead>
                      <TableHead className="text-slate-600">Wilayah</TableHead>
                      <TableHead className="text-slate-600">Status</TableHead>
                      <TableHead className="text-slate-600">Level</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pesantrenList.length > 0 ? (
                      pesantrenList.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium text-slate-900">
                            {item.nama_pesantren || "Belum diisi"}
                          </TableCell>
                          <TableCell className="text-slate-600">{item.region_name}</TableCell>
                          <TableCell>{getStatusBadge(item.status_account)}</TableCell>
                          <TableCell>{getLevelBadge(item.profile_level)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-slate-500 py-8">
                          Belum ada data pesantren
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Kru Tab */}
        <TabsContent value="kru">
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-slate-900 font-semibold">
                Daftar Kru ({crewList.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-slate-600">Nama Kru</TableHead>
                      <TableHead className="text-slate-600">Jabatan</TableHead>
                      <TableHead className="text-slate-600">Pesantren</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {crewList.length > 0 ? (
                      crewList.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium text-slate-900">{item.nama}</TableCell>
                          <TableCell className="text-slate-600">{item.jabatan || "-"}</TableCell>
                          <TableCell className="text-slate-600">{item.pesantren_name}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-slate-500 py-8">
                          Belum ada data kru
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logistik ID Card Tab */}
        <TabsContent value="logistik">
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-slate-900 font-semibold">
                Antrian Cetak ID Card
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-slate-600">Pesantren</TableHead>
                      <TableHead className="text-slate-600">Jumlah Kru</TableHead>
                      <TableHead className="text-slate-600">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {idCardQueue.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium text-slate-900">{item.nama_pesantren}</TableCell>
                        <TableCell className="text-slate-600">{item.jumlah_kru} Orang</TableCell>
                        <TableCell>
                          <Badge className="bg-blue-100 text-blue-800">{item.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPusatMasterData;
