import { useState } from "react";
import { 
  Building2, 
  Users, 
  Share2, 
  Eye, 
  Search,
  CheckCircle,
  Clock,
  Instagram,
  Youtube,
  Facebook
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// Types
interface Pesantren {
  id: string;
  name: string;
  kyai: string;
  address: string;
  regional: string;
  status: "active" | "pending";
  santriCount: number;
}

interface Media {
  id: string;
  pesantrenId: string;
  pesantrenName: string;
  platform: "instagram" | "youtube" | "facebook" | "tiktok";
  handle: string;
  followerCount: number;
  isVerified: boolean;
}

interface Kru {
  id: string;
  name: string;
  pesantrenName: string;
  position: string;
  skills: string[];
  xp: number;
  level: string;
}

// Mock Data
const pesantrenData: Pesantren[] = [
  { id: "PP-001", name: "PP Al-Hikmah", kyai: "KH. Ahmad Fauzi", address: "Jl. Raya Malang No. 123", regional: "Malang Raya", status: "active", santriCount: 450 },
  { id: "PP-002", name: "PP Nurul Jadid", kyai: "KH. Muhammad Hasan", address: "Jl. Paiton No. 45", regional: "Probolinggo Raya", status: "active", santriCount: 1200 },
  { id: "PP-003", name: "PP Salafiyah Syafi'iyah", kyai: "KH. Abdul Hamid", address: "Jl. Situbondo Raya No. 78", regional: "Tapal Kuda", status: "pending", santriCount: 800 },
  { id: "PP-004", name: "PP Darul Ulum", kyai: "KH. Cholil Bisri", address: "Jl. Rejoso Peterongan", regional: "Jombang Raya", status: "active", santriCount: 950 },
  { id: "PP-005", name: "PP Lirboyo", kyai: "KH. Anwar Manshur", address: "Jl. Lirboyo Kediri", regional: "Kediri Raya", status: "active", santriCount: 1500 },
  { id: "PP-006", name: "PP Sidogiri", kyai: "KH. Nawawi Abdul Jalil", address: "Jl. Sidogiri Pasuruan", regional: "Pasuruan Raya", status: "active", santriCount: 2000 },
  { id: "PP-007", name: "PP Tebuireng", kyai: "KH. Salahuddin Wahid", address: "Jl. Tebuireng Jombang", regional: "Jombang Raya", status: "active", santriCount: 1800 },
];

const mediaData: Media[] = [
  { id: "M-001", pesantrenId: "PP-001", pesantrenName: "PP Al-Hikmah", platform: "instagram", handle: "@alhikmah_official", followerCount: 25000, isVerified: true },
  { id: "M-002", pesantrenId: "PP-001", pesantrenName: "PP Al-Hikmah", platform: "youtube", handle: "Al-Hikmah Channel", followerCount: 15000, isVerified: false },
  { id: "M-003", pesantrenId: "PP-002", pesantrenName: "PP Nurul Jadid", platform: "instagram", handle: "@nuruljadid_id", followerCount: 85000, isVerified: true },
  { id: "M-004", pesantrenId: "PP-004", pesantrenName: "PP Darul Ulum", platform: "youtube", handle: "Darul Ulum TV", followerCount: 120000, isVerified: true },
  { id: "M-005", pesantrenId: "PP-005", pesantrenName: "PP Lirboyo", platform: "instagram", handle: "@lirboyo_official", followerCount: 200000, isVerified: true },
  { id: "M-006", pesantrenId: "PP-006", pesantrenName: "PP Sidogiri", platform: "facebook", handle: "Sidogiri Pasuruan", followerCount: 180000, isVerified: true },
];

const kruData: Kru[] = [
  { id: "K-001", name: "Ahmad Ridwan", pesantrenName: "PP Al-Hikmah", position: "Koordinator Media", skills: ["Video Editor", "Content Creator"], xp: 4500, level: "Khodim" },
  { id: "K-002", name: "Siti Maryam", pesantrenName: "PP Nurul Jadid", position: "Admin", skills: ["Graphic Design", "Social Media"], xp: 3200, level: "Aktivis" },
  { id: "K-003", name: "Muhammad Yusuf", pesantrenName: "PP Darul Ulum", position: "Videographer", skills: ["Videography", "Drone Pilot"], xp: 5800, level: "Tokoh" },
  { id: "K-004", name: "Fatimah Azzahra", pesantrenName: "PP Lirboyo", position: "Content Writer", skills: ["Copywriting", "SEO"], xp: 2100, level: "Penggerak" },
  { id: "K-005", name: "Abdullah Hamid", pesantrenName: "PP Sidogiri", position: "Photographer", skills: ["Photography", "Photo Editor"], xp: 3900, level: "Khodim" },
];

const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case "instagram": return <Instagram className="h-4 w-4 text-pink-500" />;
    case "youtube": return <Youtube className="h-4 w-4 text-red-500" />;
    case "facebook": return <Facebook className="h-4 w-4 text-blue-600" />;
    default: return <Share2 className="h-4 w-4 text-slate-500" />;
  }
};

const formatFollowers = (count: number) => {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
};

const DatabasePesantren = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPesantren, setSelectedPesantren] = useState<Pesantren | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const filteredPesantren = pesantrenData.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.kyai.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMedia = mediaData.filter(m =>
    m.pesantrenName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.handle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredKru = kruData.filter(k =>
    k.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    k.pesantrenName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Database Pesantren</h1>
          <p className="text-slate-500">Kelola data pesantren, media sosial, dan kru se-Jawa Timur</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Cari pesantren, media, atau kru..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Pesantren</p>
                <p className="text-2xl font-bold text-slate-800">{pesantrenData.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                <Share2 className="h-5 w-5 text-pink-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Akun Media</p>
                <p className="text-2xl font-bold text-slate-800">{mediaData.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Kru</p>
                <p className="text-2xl font-bold text-slate-800">{kruData.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pesantren" className="space-y-6">
        <TabsList className="bg-slate-100">
          <TabsTrigger value="pesantren" className="data-[state=active]:bg-white">
            <Building2 className="h-4 w-4 mr-2" />
            Data Pesantren
          </TabsTrigger>
          <TabsTrigger value="media" className="data-[state=active]:bg-white">
            <Share2 className="h-4 w-4 mr-2" />
            Data Media
          </TabsTrigger>
          <TabsTrigger value="kru" className="data-[state=active]:bg-white">
            <Users className="h-4 w-4 mr-2" />
            Data Kru
          </TabsTrigger>
        </TabsList>

        {/* Data Pesantren Tab */}
        <TabsContent value="pesantren">
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-slate-800">Daftar Pesantren</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Nama Pesantren</TableHead>
                      <TableHead>Pengasuh/Kyai</TableHead>
                      <TableHead>Alamat</TableHead>
                      <TableHead>Regional</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPesantren.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono text-sm">{item.id}</TableCell>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.kyai}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{item.address}</TableCell>
                        <TableCell>
                          <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs">
                            {item.regional}
                          </span>
                        </TableCell>
                        <TableCell>
                          {item.status === "active" ? (
                            <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                              <CheckCircle className="h-3 w-3" />
                              Aktif
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs">
                              <Clock className="h-3 w-3" />
                              Pending
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedPesantren(item);
                              setIsDetailOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Media Tab */}
        <TabsContent value="media">
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-slate-800">Akun Media Sosial</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Platform</TableHead>
                      <TableHead>Handle/Nama</TableHead>
                      <TableHead>Pesantren</TableHead>
                      <TableHead>Followers</TableHead>
                      <TableHead>Verified</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMedia.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getPlatformIcon(item.platform)}
                            <span className="capitalize">{item.platform}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{item.handle}</TableCell>
                        <TableCell>{item.pesantrenName}</TableCell>
                        <TableCell>
                          <span className="font-semibold text-slate-700">
                            {formatFollowers(item.followerCount)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {item.isVerified ? (
                            <CheckCircle className="h-5 w-5 text-blue-500" />
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Kru Tab */}
        <TabsContent value="kru">
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-slate-800">Daftar Kru/Anggota</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Pesantren</TableHead>
                      <TableHead>Posisi</TableHead>
                      <TableHead>Skills</TableHead>
                      <TableHead>XP</TableHead>
                      <TableHead>Level</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredKru.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.pesantrenName}</TableCell>
                        <TableCell>{item.position}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {item.skills.map((skill, i) => (
                              <span key={i} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-amber-600">{item.xp.toLocaleString()}</span>
                        </TableCell>
                        <TableCell>
                          <span className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium text-white",
                            item.level === "Tokoh" && "bg-amber-500",
                            item.level === "Khodim" && "bg-purple-500",
                            item.level === "Aktivis" && "bg-blue-500",
                            item.level === "Penggerak" && "bg-green-500",
                          )}>
                            {item.level}
                          </span>
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

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-800">Detail Pesantren</DialogTitle>
          </DialogHeader>
          {selectedPesantren && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">ID</p>
                  <p className="font-mono font-medium">{selectedPesantren.id}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Status</p>
                  {selectedPesantren.status === "active" ? (
                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                      <CheckCircle className="h-3 w-3" />
                      Aktif
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs">
                      <Clock className="h-3 w-3" />
                      Pending
                    </span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-500">Nama Pesantren</p>
                <p className="font-semibold text-lg">{selectedPesantren.name}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Pengasuh/Kyai</p>
                <p className="font-medium">{selectedPesantren.kyai}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Alamat</p>
                <p>{selectedPesantren.address}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Regional</p>
                  <p className="font-medium">{selectedPesantren.regional}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Jumlah Santri</p>
                  <p className="font-medium">{selectedPesantren.santriCount.toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DatabasePesantren;
