import { useState, useEffect } from "react";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface PendingProfile {
  id: string;
  nama_pesantren: string | null;
  region_name: string | null;
  no_wa_pendaftar: string | null;
  created_at: string;
  status_account: string;
}

const AdminPusatVerifikasi = () => {
  const [pendingProfiles, setPendingProfiles] = useState<PendingProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPendingProfiles = async () => {
      try {
        const { data } = await supabase
          .from("profiles")
          .select(`
            id,
            nama_pesantren,
            no_wa_pendaftar,
            status_account,
            created_at,
            regions!profiles_region_id_fkey (name)
          `)
          .eq("status_account", "pending")
          .order("created_at", { ascending: false });

        if (data) {
          setPendingProfiles(
            data.map((item: any) => ({
              id: item.id,
              nama_pesantren: item.nama_pesantren,
              region_name: item.regions?.name || "Unknown",
              no_wa_pendaftar: item.no_wa_pendaftar,
              created_at: item.created_at,
              status_account: item.status_account,
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching pending profiles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingProfiles();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

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
        <h1 className="text-2xl font-bold text-slate-900">Verifikasi</h1>
        <p className="text-slate-500 mt-1">Monitoring pendaftar yang menunggu approval dari Regional</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-yellow-700 font-medium">Pending</p>
              <p className="text-2xl font-bold text-yellow-800">{pendingProfiles.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-green-700 font-medium">Disetujui Hari Ini</p>
              <p className="text-2xl font-bold text-green-800">-</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-red-700 font-medium">Ditolak</p>
              <p className="text-2xl font-bold text-red-800">-</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Table */}
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-slate-900 font-semibold">
            Daftar Pending Approval
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-slate-600">Nama Pesantren</TableHead>
                  <TableHead className="text-slate-600">Wilayah</TableHead>
                  <TableHead className="text-slate-600">No. WA</TableHead>
                  <TableHead className="text-slate-600">Tanggal Daftar</TableHead>
                  <TableHead className="text-slate-600">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingProfiles.length > 0 ? (
                  pendingProfiles.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell className="font-medium text-slate-900">
                        {profile.nama_pesantren || "Belum diisi"}
                      </TableCell>
                      <TableCell className="text-slate-600">{profile.region_name}</TableCell>
                      <TableCell className="text-slate-600">{profile.no_wa_pendaftar || "-"}</TableCell>
                      <TableCell className="text-slate-500">{formatDate(profile.created_at)}</TableCell>
                      <TableCell>
                        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                          Menunggu
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                      Tidak ada pendaftar yang menunggu approval
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <p className="text-sm text-slate-500 text-center">
        * Approval dilakukan oleh Admin Regional masing-masing wilayah
      </p>
    </div>
  );
};

export default AdminPusatVerifikasi;
