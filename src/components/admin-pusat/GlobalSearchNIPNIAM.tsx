import { useState } from "react";
import { Search, Building2, User, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

interface SearchResult {
  type: "pesantren" | "crew";
  id: string;
  nomorId: string;
  nama: string;
  jabatan?: string;
  status?: string;
  lembagaInduk?: string;
  region?: string;
}

const GlobalSearchNIPNIAM = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    setResults([]);

    try {
      const searchResults: SearchResult[] = [];

      // Search for NIP in pesantren_claims
      const { data: pesantrenData } = await supabase
        .from("pesantren_claims")
        .select(`
          id,
          mpj_id_number,
          pesantren_name,
          status,
          region_id,
          regions:region_id (name)
        `)
        .ilike("mpj_id_number", `%${query}%`)
        .limit(10);

      if (pesantrenData) {
        pesantrenData.forEach((item: any) => {
          if (item.mpj_id_number) {
            searchResults.push({
              type: "pesantren",
              id: item.id,
              nomorId: item.mpj_id_number,
              nama: item.pesantren_name,
              status: item.status,
              region: item.regions?.name,
            });
          }
        });
      }

      // Search for NIAM in crews
      const { data: crewData } = await supabase
        .from("crews")
        .select(`
          id,
          niam,
          nama,
          jabatan,
          profile_id,
          profiles:profile_id (
            nama_pesantren,
            status_account
          )
        `)
        .ilike("niam", `%${query}%`)
        .limit(10);

      if (crewData) {
        crewData.forEach((item: any) => {
          if (item.niam) {
            searchResults.push({
              type: "crew",
              id: item.id,
              nomorId: item.niam,
              nama: item.nama,
              jabatan: item.jabatan,
              lembagaInduk: item.profiles?.nama_pesantren,
              status: item.profiles?.status_account,
            });
          }
        });
      }

      setResults(searchResults);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "active":
      case "approved":
        return <Badge className="bg-emerald-500">Active</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status || "Unknown"}</Badge>;
    }
  };

  return (
    <div className="relative">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari NIP atau NIAM... (contoh: 25.07.001)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-10 pr-10"
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => {
                setQuery("");
                setResults([]);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Button onClick={handleSearch} disabled={isSearching}>
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Cari"
          )}
        </Button>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <Card className="mt-4">
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">
              Hasil Pencarian ({results.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {results.map((result) => (
                <div
                  key={`${result.type}-${result.id}`}
                  className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => {
                    setSelectedResult(result);
                    setIsOpen(true);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      result.type === "pesantren" ? "bg-emerald-100" : "bg-blue-100"
                    }`}>
                      {result.type === "pesantren" ? (
                        <Building2 className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <User className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-mono font-semibold text-sm">{result.nomorId}</p>
                      <p className="text-sm text-muted-foreground">{result.nama}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {result.type === "pesantren" ? "NIP" : "NIAM"}
                    </Badge>
                    {getStatusBadge(result.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {query && !isSearching && results.length === 0 && (
        <Card className="mt-4">
          <CardContent className="py-8 text-center text-muted-foreground">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Tidak ditemukan hasil untuk "{query}"</p>
          </CardContent>
        </Card>
      )}

      {/* Detail Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedResult?.type === "pesantren" ? (
                <Building2 className="h-5 w-5 text-emerald-600" />
              ) : (
                <User className="h-5 w-5 text-blue-600" />
              )}
              Detail {selectedResult?.type === "pesantren" ? "Pesantren" : "Personil"}
            </DialogTitle>
          </DialogHeader>
          {selectedResult && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  {selectedResult.type === "pesantren" ? "NIP" : "NIAM"}
                </p>
                <p className="font-mono text-xl font-bold">{selectedResult.nomorId}</p>
              </div>
              
              <div className="grid gap-3">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    {selectedResult.type === "pesantren" ? "Nama Pesantren" : "Nama Personil"}
                  </p>
                  <p className="font-medium">{selectedResult.nama}</p>
                </div>
                
                {selectedResult.jabatan && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Jabatan</p>
                    <p className="font-medium">{selectedResult.jabatan}</p>
                  </div>
                )}
                
                {selectedResult.lembagaInduk && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Lembaga Induk</p>
                    <p className="font-medium">{selectedResult.lembagaInduk}</p>
                  </div>
                )}
                
                {selectedResult.region && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Regional</p>
                    <p className="font-medium">{selectedResult.region}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Status</p>
                  {getStatusBadge(selectedResult.status)}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GlobalSearchNIPNIAM;
