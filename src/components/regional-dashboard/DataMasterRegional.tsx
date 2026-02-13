import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";

interface PesantrenData {
  id: string;
  nama_pesantren: string | null;
  nama_pengasuh: string | null;
  status_account: string;
  status_payment: string;
  profile_level: string;
  nip: string | null;
}

interface CrewData {
  id: string;
  nama: string;
  jabatan: string | null;
  niam: string | null;
  pesantren_name: string | null;
}

interface DataMasterRegionalProps {
  isDebugMode?: boolean;
}

const DataMasterRegional = ({ isDebugMode = false }: DataMasterRegionalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [profiles, setProfiles] = useState<PesantrenData[]>([]);
  const [crews, setCrews] = useState<CrewData[]>([]);

  useEffect(() => {
    const load = async () => {
      if (isDebugMode) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await apiRequest<{ profiles: PesantrenData[]; crews: CrewData[] }>("/api/regional/master-data");
        setProfiles(data.profiles || []);
        setCrews(data.crews || []);
      } catch (error: any) {
        toast({ title: "Gagal", description: error.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isDebugMode]);

  const filteredProfiles = useMemo(
    () => profiles.filter((p) => (p.nama_pesantren || "").toLowerCase().includes(search.toLowerCase()) || (p.nip || "").includes(search)),
    [profiles, search]
  );

  const filteredCrews = useMemo(
    () => crews.filter((c) => c.nama.toLowerCase().includes(search.toLowerCase()) || (c.niam || "").includes(search)),
    [crews, search]
  );

  return (
    <div className="space-y-4">
      <Input placeholder="Cari nama atau NIP/NIAM..." value={search} onChange={(e) => setSearch(e.target.value)} />
      {loading ? (
        <p className="text-sm text-muted-foreground">Memuat data...</p>
      ) : (
        <Tabs defaultValue="pesantren">
          <TabsList>
            <TabsTrigger value="pesantren">Pesantren</TabsTrigger>
            <TabsTrigger value="kru">Kru</TabsTrigger>
          </TabsList>
          <TabsContent value="pesantren">
            <Card>
              <CardHeader><CardTitle>Pesantren Regional ({filteredProfiles.length})</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pesantren</TableHead>
                      <TableHead>NIP</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Level</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProfiles.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>{p.nama_pesantren || "-"}</TableCell>
                        <TableCell className="font-mono text-xs">{p.nip || "-"}</TableCell>
                        <TableCell><Badge variant="outline">{p.status_account}</Badge></TableCell>
                        <TableCell><Badge>{p.profile_level}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="kru">
            <Card>
              <CardHeader><CardTitle>Kru Regional ({filteredCrews.length})</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>NIAM</TableHead>
                      <TableHead>Jabatan</TableHead>
                      <TableHead>Pesantren</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCrews.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell>{c.nama}</TableCell>
                        <TableCell className="font-mono text-xs">{c.niam || "-"}</TableCell>
                        <TableCell>{c.jabatan || "-"}</TableCell>
                        <TableCell>{c.pesantren_name || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default DataMasterRegional;