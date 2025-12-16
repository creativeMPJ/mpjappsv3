import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  ChevronRight, 
  ArrowLeft,
  MapPin,
  Users,
  Building2,
  MessageCircle
} from "lucide-react";

// Mock data for drill-down
const regionData = [
  { id: 1, name: "Malang Raya", omset: 500000000, paidMembers: 2000, pendingMembers: 45 },
  { id: 2, name: "Surabaya", omset: 300000000, paidMembers: 1500, pendingMembers: 32 },
  { id: 3, name: "Jember", omset: 150000000, paidMembers: 800, pendingMembers: 18 },
  { id: 4, name: "Kediri", omset: 120000000, paidMembers: 650, pendingMembers: 12 },
  { id: 5, name: "Blitar", omset: 80000000, paidMembers: 400, pendingMembers: 8 },
];

const pesantrenData: Record<number, Array<{ id: number; name: string; paidCount: number; pendingCount: number }>> = {
  1: [
    { id: 101, name: "Pesantren Al-Hikam", paidCount: 150, pendingCount: 5 },
    { id: 102, name: "Pesantren Darul Ulum", paidCount: 120, pendingCount: 8 },
    { id: 103, name: "Pesantren An-Nur", paidCount: 200, pendingCount: 3 },
  ],
  2: [
    { id: 201, name: "Pesantren Al-Falah", paidCount: 180, pendingCount: 10 },
    { id: 202, name: "Pesantren Hidayatullah", paidCount: 95, pendingCount: 4 },
  ],
  3: [
    { id: 301, name: "Pesantren Nurul Jadid", paidCount: 250, pendingCount: 6 },
  ],
};

const userData: Record<number, Array<{ id: number; name: string; phone: string; status: string }>> = {
  101: [
    { id: 1001, name: "Ahmad Fauzi", phone: "082123456789", status: "paid" },
    { id: 1002, name: "Siti Aminah", phone: "082234567890", status: "pending" },
    { id: 1003, name: "Budi Santoso", phone: "082345678901", status: "paid" },
  ],
  102: [
    { id: 1004, name: "Dewi Lestari", phone: "082456789012", status: "pending" },
    { id: 1005, name: "Rudi Hartono", phone: "082567890123", status: "paid" },
  ],
  201: [
    { id: 2001, name: "Andi Wijaya", phone: "082678901234", status: "pending" },
  ],
};

const formatCurrency = (value: number) => {
  if (value >= 1000000000) {
    return `Rp ${(value / 1000000000).toFixed(1)}M`;
  }
  if (value >= 1000000) {
    return `Rp ${(value / 1000000).toFixed(0)}jt`;
  }
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

type DrillLevel = "region" | "pesantren" | "user";

const RegionalMonitoring = () => {
  const [drillLevel, setDrillLevel] = useState<DrillLevel>("region");
  const [selectedRegion, setSelectedRegion] = useState<number | null>(null);
  const [selectedPesantren, setSelectedPesantren] = useState<number | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<string[]>(["Provinsi"]);

  const handleRegionClick = (regionId: number, regionName: string) => {
    setSelectedRegion(regionId);
    setDrillLevel("pesantren");
    setBreadcrumb(["Provinsi", regionName]);
  };

  const handlePesantrenClick = (pesantrenId: number, pesantrenName: string) => {
    setSelectedPesantren(pesantrenId);
    setDrillLevel("user");
    setBreadcrumb([...breadcrumb, pesantrenName]);
  };

  const handleBack = () => {
    if (drillLevel === "user") {
      setDrillLevel("pesantren");
      setSelectedPesantren(null);
      setBreadcrumb(breadcrumb.slice(0, 2));
    } else if (drillLevel === "pesantren") {
      setDrillLevel("region");
      setSelectedRegion(null);
      setBreadcrumb(["Provinsi"]);
    }
  };

  const handleWhatsApp = (phone: string, name: string) => {
    const message = encodeURIComponent(`Halo ${name}, kami dari MPJ Apps ingin mengingatkan pembayaran Anda yang masih pending. Silakan segera selesaikan pembayaran untuk mengaktifkan akun Anda.`);
    window.open(`https://wa.me/62${phone.substring(1)}?text=${message}`, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Monitoring Regional</h1>
          <p className="text-muted-foreground">Drill-down data keuangan per wilayah</p>
        </div>
      </div>

      {/* Breadcrumb & Back Button */}
      <div className="flex items-center gap-3">
        {drillLevel !== "region" && (
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Kembali
          </Button>
        )}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {breadcrumb.map((item, index) => (
            <span key={index} className="flex items-center gap-2">
              {index > 0 && <ChevronRight className="w-4 h-4" />}
              <span className={index === breadcrumb.length - 1 ? "text-foreground font-medium" : ""}>
                {item}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            {drillLevel === "region" && <MapPin className="w-5 h-5 text-amber-500" />}
            {drillLevel === "pesantren" && <Building2 className="w-5 h-5 text-amber-500" />}
            {drillLevel === "user" && <Users className="w-5 h-5 text-amber-500" />}
            {drillLevel === "region" && "Data Per Wilayah"}
            {drillLevel === "pesantren" && "Data Per Pesantren"}
            {drillLevel === "user" && "Data Per User"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {/* Region Level */}
            {drillLevel === "region" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Wilayah</TableHead>
                    <TableHead>Total Omset</TableHead>
                    <TableHead>Paid Members</TableHead>
                    <TableHead>Pending</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {regionData.map((region) => (
                    <TableRow 
                      key={region.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleRegionClick(region.id, region.name)}
                    >
                      <TableCell className="font-medium">{region.name}</TableCell>
                      <TableCell className="font-semibold text-amber-600">
                        {formatCurrency(region.omset)}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-emerald-500 text-white">
                          {region.paidMembers.toLocaleString()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-orange-100 text-orange-600">
                          {region.pendingMembers}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {/* Pesantren Level */}
            {drillLevel === "pesantren" && selectedRegion && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Pesantren</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Pending</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(pesantrenData[selectedRegion] || []).map((pesantren) => (
                    <TableRow 
                      key={pesantren.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handlePesantrenClick(pesantren.id, pesantren.name)}
                    >
                      <TableCell className="font-medium">{pesantren.name}</TableCell>
                      <TableCell>
                        <Badge className="bg-emerald-500 text-white">
                          {pesantren.paidCount}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-orange-100 text-orange-600">
                          {pesantren.pendingCount}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {/* User Level */}
            {drillLevel === "user" && selectedPesantren && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama User</TableHead>
                    <TableHead>No. HP</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(userData[selectedPesantren] || []).map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell className="text-muted-foreground">{user.phone}</TableCell>
                      <TableCell>
                        {user.status === "paid" ? (
                          <Badge className="bg-emerald-500 text-white">Paid</Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-orange-100 text-orange-600">
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.status === "pending" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleWhatsApp(user.phone, user.name);
                            }}
                          >
                            <MessageCircle className="w-4 h-4" />
                            WhatsApp
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Card */}
      {drillLevel === "region" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Omset Jawa Timur</p>
              <p className="text-2xl font-bold text-amber-600">
                {formatCurrency(regionData.reduce((acc, r) => acc + r.omset, 0))}
              </p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-emerald-500">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Paid Members</p>
              <p className="text-2xl font-bold text-emerald-600">
                {regionData.reduce((acc, r) => acc + r.paidMembers, 0).toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Pending</p>
              <p className="text-2xl font-bold text-orange-600">
                {regionData.reduce((acc, r) => acc + r.pendingMembers, 0)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default RegionalMonitoring;
