import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Eye, 
  Check, 
  X, 
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock verification queue data
const initialQueueData = [
  {
    id: 1,
    timestamp: "10:30 AM",
    user: { name: "Ahmad", location: "Malang", avatar: "" },
    sku: "E-ID Card",
    nominal: 50000,
    status: "waiting",
    buktiUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400",
  },
  {
    id: 2,
    timestamp: "10:45 AM",
    user: { name: "Siti", location: "Surabaya", avatar: "" },
    sku: "Cetak ID",
    nominal: 25000,
    status: "waiting",
    buktiUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400",
  },
  {
    id: 3,
    timestamp: "11:00 AM",
    user: { name: "Rudi", location: "Jember", avatar: "" },
    sku: "Crew Upgrade",
    nominal: 100000,
    status: "waiting",
    buktiUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400",
  },
];

const historyData = [
  {
    id: 4,
    timestamp: "09:15 AM",
    user: { name: "Dewi", location: "Kediri", avatar: "" },
    sku: "E-ID Card",
    nominal: 50000,
    status: "verified",
    verifiedAt: "09:20 AM",
  },
  {
    id: 5,
    timestamp: "09:00 AM",
    user: { name: "Budi", location: "Blitar", avatar: "" },
    sku: "Cetak ID",
    nominal: 25000,
    status: "rejected",
    verifiedAt: "09:05 AM",
  },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

const getSkuBadgeColor = (sku: string) => {
  switch (sku) {
    case "E-ID Card":
      return "bg-blue-500";
    case "Cetak ID":
      return "bg-purple-500";
    case "Crew Upgrade":
      return "bg-amber-500";
    default:
      return "bg-muted";
  }
};

const ClearingHouse = () => {
  const [queueData, setQueueData] = useState(initialQueueData);
  const [selectedBukti, setSelectedBukti] = useState<string | null>(null);
  const { toast } = useToast();

  const pendingCount = queueData.filter(item => item.status === "waiting").length;
  const verifiedCount = historyData.filter(item => item.status === "verified").length;

  const handleVerify = (id: number) => {
    setQueueData(prev => prev.filter(item => item.id !== id));
    toast({
      title: "Pembayaran Diverifikasi",
      description: "Status pengguna telah diperbarui dan notifikasi dikirim.",
    });
  };

  const handleReject = (id: number) => {
    setQueueData(prev => prev.filter(item => item.id !== id));
    toast({
      title: "Pembayaran Ditolak",
      description: "Pengguna akan diberitahu untuk mengunggah ulang bukti.",
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Clearing House</h1>
        <p className="text-muted-foreground">Verifikasi pembayaran dan kelola antrian</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
                <p className="text-sm text-muted-foreground">Menunggu Verifikasi</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
              <div>
                <p className="text-2xl font-bold text-foreground">{verifiedCount}</p>
                <p className="text-sm text-muted-foreground">Terverifikasi Hari Ini</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="queue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="queue" className="gap-2">
            Antrian Verifikasi
            {pendingCount > 0 && (
              <Badge className="bg-orange-500 text-white">{pendingCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history">Riwayat</TabsTrigger>
        </TabsList>

        <TabsContent value="queue">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Antrian Pembayaran</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Waktu</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Nominal</TableHead>
                      <TableHead>Bukti</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {queueData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          Tidak ada antrian verifikasi
                        </TableCell>
                      </TableRow>
                    ) : (
                      queueData.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="text-muted-foreground">
                            {item.timestamp}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={item.user.avatar} />
                                <AvatarFallback className="bg-sidebar text-white text-xs">
                                  {item.user.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{item.user.name}</p>
                                <p className="text-xs text-muted-foreground">{item.user.location}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getSkuBadgeColor(item.sku)} text-white`}>
                              {item.sku}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrency(item.nominal)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedBukti(item.buktiUrl)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Lihat
                            </Button>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                className="bg-emerald-500 hover:bg-emerald-600"
                                onClick={() => handleVerify(item.id)}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleReject(item.id)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Riwayat Verifikasi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Waktu</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Nominal</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Diverifikasi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historyData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="text-muted-foreground">
                          {item.timestamp}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={item.user.avatar} />
                              <AvatarFallback className="bg-sidebar text-white text-xs">
                                {item.user.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{item.user.name}</p>
                              <p className="text-xs text-muted-foreground">{item.user.location}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getSkuBadgeColor(item.sku)} text-white`}>
                            {item.sku}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(item.nominal)}
                        </TableCell>
                        <TableCell>
                          {item.status === "verified" ? (
                            <Badge className="bg-emerald-500 text-white gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="gap-1">
                              <XCircle className="w-3 h-3" />
                              Rejected
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {item.verifiedAt}
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

      {/* Bukti Modal */}
      <Dialog open={!!selectedBukti} onOpenChange={() => setSelectedBukti(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Bukti Transfer</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <img
              src={selectedBukti || ""}
              alt="Bukti Transfer"
              className="w-full rounded-lg border"
            />
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Gambar terkompresi (max 100KB) untuk loading cepat
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClearingHouse;
