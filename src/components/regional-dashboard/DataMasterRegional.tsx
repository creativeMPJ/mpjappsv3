import { useState } from "react";
import { Search, Download, Building2, Users, UserCircle } from "lucide-react";
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

// Mock Data
const pesantrenData = [
  { no: 1, nama: "PP Al Hikmah Malang", pengasuh: "KH. Abdul Rahman", alamat: "Jl. Raya Tlogomas No. 12, Malang", status: "active" },
  { no: 2, nama: "PP Darul Ulum Jombang", pengasuh: "KH. Muhammad Hasan", alamat: "Jl. KH. Wahid Hasyim No. 45, Jombang", status: "active" },
  { no: 3, nama: "PP Nurul Jadid Paiton", pengasuh: "KH. Zuhri Zaini", alamat: "Jl. KH. Zaini Mun'im, Paiton", status: "pending" },
  { no: 4, nama: "PP Miftahul Ulum Pamekasan", pengasuh: "KH. Ahmad Fauzi", alamat: "Jl. Raya Pamekasan No. 78", status: "active" },
  { no: 5, nama: "PP Salafiyah Syafi'iyah", pengasuh: "KH. Hafidz Utsman", alamat: "Jl. Raya Sukorejo No. 23, Situbondo", status: "active" },
];

const koordinatorData = [
  { no: 1, nama: "Ahmad Fauzan", asalPesantren: "PP Al Hikmah Malang", wa: "081234567890", email: "ahmad@alhikmah.id" },
  { no: 2, nama: "Muhammad Rizki", asalPesantren: "PP Darul Ulum Jombang", wa: "082345678901", email: "rizki@darululum.id" },
  { no: 3, nama: "Siti Aisyah", asalPesantren: "PP Nurul Jadid Paiton", wa: "083456789012", email: "aisyah@nuruljadid.id" },
  { no: 4, nama: "Abdullah Hakim", asalPesantren: "PP Miftahul Ulum", wa: "084567890123", email: "hakim@miftahul.id" },
  { no: 5, nama: "Fatimah Zahra", asalPesantren: "PP Salafiyah", wa: "085678901234", email: "fatimah@salafiyah.id" },
];

const kruData = [
  { no: 1, nama: "Umar Faruq", jabatan: "Editor", status: "active" },
  { no: 2, nama: "Zainab Putri", jabatan: "Desainer", status: "active" },
  { no: 3, nama: "Hasan Basri", jabatan: "Videographer", status: "inactive" },
  { no: 4, nama: "Khadijah Nur", jabatan: "Writer", status: "active" },
  { no: 5, nama: "Ali Imran", jabatan: "Photographer", status: "active" },
];

const DataMasterRegional = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("pesantren");

  const getStatusBadge = (status: string) => {
    if (status === "active") {
      return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Aktif</Badge>;
    }
    if (status === "pending") {
      return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Pending</Badge>;
    }
    return <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100">Tidak Aktif</Badge>;
  };

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
              <span>Data Pesantren</span>
            </TabsTrigger>
            <TabsTrigger 
              value="koordinator" 
              className="flex items-center gap-2 px-4 py-2.5 min-h-[40px] whitespace-nowrap data-[state=active]:bg-sidebar data-[state=active]:text-white"
            >
              <Users className="w-4 h-4" />
              <span>Data Koordinator</span>
            </TabsTrigger>
            <TabsTrigger 
              value="kru" 
              className="flex items-center gap-2 px-4 py-2.5 min-h-[40px] whitespace-nowrap data-[state=active]:bg-sidebar data-[state=active]:text-white"
            >
              <UserCircle className="w-4 h-4" />
              <span>Data Kru</span>
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
                    <TableHead className="font-semibold min-w-[200px]">Alamat</TableHead>
                    <TableHead className="font-semibold w-24">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pesantrenData.map((item) => (
                    <TableRow key={item.no} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{item.no}</TableCell>
                      <TableCell className="font-medium text-foreground">{item.nama}</TableCell>
                      <TableCell>{item.pengasuh}</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={item.alamat}>
                        {item.alamat}
                      </TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        {/* Tab Content: Koordinator */}
        <TabsContent value="koordinator" className="mt-6">
          <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-12 font-semibold">No</TableHead>
                    <TableHead className="font-semibold min-w-[150px]">Nama</TableHead>
                    <TableHead className="font-semibold min-w-[180px]">Asal Pesantren</TableHead>
                    <TableHead className="font-semibold min-w-[130px]">WhatsApp</TableHead>
                    <TableHead className="font-semibold min-w-[180px]">Email</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                {koordinatorData.map((item) => (
                    <TableRow key={item.no} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{item.no}</TableCell>
                      <TableCell className="font-medium text-foreground">{maskName(item.nama)}</TableCell>
                      <TableCell>{item.asalPesantren}</TableCell>
                      <TableCell className="text-sidebar">
                        {maskPhoneNumber(item.wa)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{maskEmail(item.email)}</TableCell>
                    </TableRow>
                  ))}
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
                    <TableHead className="font-semibold w-24">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {kruData.map((item) => (
                    <TableRow key={item.no} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{item.no}</TableCell>
                      <TableCell className="font-medium text-foreground">{item.nama}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-primary/10 text-sidebar hover:bg-primary/10">
                          {item.jabatan}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                    </TableRow>
                  ))}
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