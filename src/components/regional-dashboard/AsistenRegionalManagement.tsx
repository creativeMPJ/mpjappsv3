import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Users } from "lucide-react";
import { apiRequest } from "@/lib/api-client";

interface AsistenRegionalManagementProps {
  isDebugMode?: boolean;
}

interface RegionalCrewItem {
  id: string;
  nama: string;
  jabatan: string | null;
  niam: string | null;
  xp_level: number;
  pesantren_name: string | null;
}

const AsistenRegionalManagement = ({ isDebugMode = false }: AsistenRegionalManagementProps) => {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [crews, setCrews] = useState<RegionalCrewItem[]>([]);

  useEffect(() => {
    if (isDebugMode) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        const data = await apiRequest<{ crews?: RegionalCrewItem[] }>("/api/regional/master-data");
        setCrews(data.crews || []);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isDebugMode]);

  const filtered = useMemo(() => {
    if (!search.trim()) return crews;
    const query = search.toLowerCase();
    return crews.filter((item) => {
      return (
        item.nama.toLowerCase().includes(query) ||
        (item.jabatan || "").toLowerCase().includes(query) ||
        (item.niam || "").toLowerCase().includes(query) ||
        (item.pesantren_name || "").toLowerCase().includes(query)
      );
    });
  }, [crews, search]);

  return (
    <Card className="bg-card border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-emerald-600" />
          Bank Kru Regional
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            {isDebugMode
              ? "Mode debug: daftar kru tidak memuat data live."
              : `Total kru regional: ${crews.length}`}
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-9"
              placeholder="Cari nama / NIAM / jabatan..."
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-md border bg-muted/20 p-6 text-center text-sm text-muted-foreground">
            Tidak ada data kru yang cocok.
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.slice(0, 50).map((crew) => (
              <div key={crew.id} className="flex items-center justify-between rounded-md border bg-background p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{crew.nama}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {crew.pesantren_name || "-"} - {crew.jabatan || "Kru"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="font-mono text-[11px]">
                    {crew.niam || "Tanpa NIAM"}
                  </Badge>
                  <Badge variant="outline" className="text-[11px]">
                    XP {crew.xp_level}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AsistenRegionalManagement;
