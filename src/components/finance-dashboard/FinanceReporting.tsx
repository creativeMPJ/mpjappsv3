import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  CalendarIcon, 
  Download, 
  FileSpreadsheet,
  Filter
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// Mock report data
const reportData = [
  { date: "2024-12-10", sku: "E-ID Card", count: 45, total: 2250000, region: "Malang" },
  { date: "2024-12-10", sku: "Cetak ID", count: 30, total: 750000, region: "Surabaya" },
  { date: "2024-12-09", sku: "Crew Upgrade", count: 12, total: 1200000, region: "Jember" },
  { date: "2024-12-09", sku: "E-ID Card", count: 38, total: 1900000, region: "Kediri" },
  { date: "2024-12-08", sku: "Cetak ID", count: 22, total: 550000, region: "Blitar" },
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

const FinanceReporting = () => {
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [skuFilter, setSkuFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const { toast } = useToast();

  const filteredData = reportData.filter((item) => {
    if (skuFilter !== "all" && item.sku !== skuFilter) return false;
    if (regionFilter !== "all" && item.region !== regionFilter) return false;
    return true;
  });

  const totalAmount = filteredData.reduce((acc, item) => acc + item.total, 0);
  const totalCount = filteredData.reduce((acc, item) => acc + item.count, 0);

  const handleDownload = () => {
    toast({
      title: "Laporan Diunduh",
      description: "File Excel berhasil diunduh ke perangkat Anda.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reporting</h1>
          <p className="text-muted-foreground">Generate dan download laporan keuangan</p>
        </div>
        <Button 
          className="bg-amber-500 hover:bg-amber-600 gap-2"
          onClick={handleDownload}
        >
          <Download className="w-4 h-4" />
          Download Excel
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5 text-amber-500" />
            Filter Laporan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date From */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Dari Tanggal</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, "PPP", { locale: id }) : "Pilih tanggal"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Date To */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Sampai Tanggal</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, "PPP", { locale: id }) : "Pilih tanggal"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* SKU Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">SKU</label>
              <Select value={skuFilter} onValueChange={setSkuFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih SKU" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua SKU</SelectItem>
                  <SelectItem value="E-ID Card">E-ID Card</SelectItem>
                  <SelectItem value="Cetak ID">Cetak ID</SelectItem>
                  <SelectItem value="Crew Upgrade">Crew Upgrade</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Region Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Wilayah</label>
              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Wilayah" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Wilayah</SelectItem>
                  <SelectItem value="Malang">Malang</SelectItem>
                  <SelectItem value="Surabaya">Surabaya</SelectItem>
                  <SelectItem value="Jember">Jember</SelectItem>
                  <SelectItem value="Kediri">Kediri</SelectItem>
                  <SelectItem value="Blitar">Blitar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Pendapatan</p>
            <p className="text-2xl font-bold text-amber-600">{formatCurrency(totalAmount)}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Transaksi</p>
            <p className="text-2xl font-bold text-emerald-600">{totalCount} Transaksi</p>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-amber-500" />
            Detail Transaksi
          </CardTitle>
          <Badge variant="secondary">{filteredData.length} Data</Badge>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Wilayah</TableHead>
                  <TableHead className="text-right">Jumlah</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Tidak ada data untuk filter yang dipilih
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(item.date), "dd MMM yyyy", { locale: id })}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getSkuBadgeColor(item.sku)} text-white`}>
                          {item.sku}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.region}</TableCell>
                      <TableCell className="text-right">{item.count}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(item.total)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinanceReporting;
