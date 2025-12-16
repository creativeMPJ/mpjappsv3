import { useState } from "react";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Filter,
  Calendar
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Demo data
const incomeData = [
  { month: "Jan", pemasukan: 45000000, pengeluaran: 12000000 },
  { month: "Feb", pemasukan: 52000000, pengeluaran: 15000000 },
  { month: "Mar", pemasukan: 48000000, pengeluaran: 18000000 },
  { month: "Apr", pemasukan: 61000000, pengeluaran: 14000000 },
  { month: "May", pemasukan: 58000000, pengeluaran: 20000000 },
  { month: "Jun", pemasukan: 72000000, pengeluaran: 22000000 },
];

const categoryData = [
  { name: "Registrasi Baru", value: 180000000, color: "#10B981" },
  { name: "Upgrade Gold", value: 95000000, color: "#3B82F6" },
  { name: "Event", value: 45000000, color: "#8B5CF6" },
  { name: "Merchandise", value: 16000000, color: "#F59E0B" },
];

const expenseCategory = [
  { name: "Operasional", value: 45000000, color: "#EF4444" },
  { name: "Event", value: 30000000, color: "#F97316" },
  { name: "Marketing", value: 15000000, color: "#EC4899" },
  { name: "Lainnya", value: 11000000, color: "#6B7280" },
];

const recentTransactions = [
  { id: 1, desc: "Registrasi PP Al-Hidayah", type: "income", amount: 50000, date: "2024-01-15", regional: "Malang" },
  { id: 2, desc: "Upgrade Gold PP Nurul Iman", type: "income", amount: 200000, date: "2024-01-15", regional: "Surabaya" },
  { id: 3, desc: "Event Kopdar Regional Jember", type: "expense", amount: 1500000, date: "2024-01-14", regional: "Jember" },
  { id: 4, desc: "Registrasi PP Darul Falah", type: "income", amount: 50000, date: "2024-01-14", regional: "Kediri" },
  { id: 5, desc: "Biaya Server Bulanan", type: "expense", amount: 500000, date: "2024-01-13", regional: "Pusat" },
  { id: 6, desc: "Upgrade Gold PP Miftahul Ulum", type: "income", amount: 200000, date: "2024-01-13", regional: "Blitar" },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatShortCurrency = (value: number) => {
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}M`;
  if (value >= 1000000) return `${(value / 1000000).toFixed(0)}Jt`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}Rb`;
  return value.toString();
};

const KeuanganMPJ = () => {
  const [period, setPeriod] = useState("6bulan");

  const totalIncome = incomeData.reduce((sum, item) => sum + item.pemasukan, 0);
  const totalExpense = incomeData.reduce((sum, item) => sum + item.pengeluaran, 0);
  const netIncome = totalIncome - totalExpense;
  const profitMargin = ((netIncome / totalIncome) * 100).toFixed(1);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-slate-800">Keuangan MPJ</h1>
            <p className="text-xs md:text-sm text-slate-500">Laporan Pemasukan & Pengeluaran</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[130px] h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1bulan">1 Bulan</SelectItem>
              <SelectItem value="3bulan">3 Bulan</SelectItem>
              <SelectItem value="6bulan">6 Bulan</SelectItem>
              <SelectItem value="1tahun">1 Tahun</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="h-9">
            <Download className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" />
              </div>
              <Badge className="bg-emerald-100 text-emerald-700 text-[10px] md:text-xs hover:bg-emerald-100">+15.2%</Badge>
            </div>
            <div className="text-lg md:text-2xl font-bold text-slate-800">{formatShortCurrency(totalIncome)}</div>
            <div className="text-xs md:text-sm text-slate-500">Total Pemasukan</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-red-50 flex items-center justify-center">
                <ArrowDownRight className="w-4 h-4 md:w-5 md:h-5 text-red-600" />
              </div>
              <Badge className="bg-red-100 text-red-700 text-[10px] md:text-xs hover:bg-red-100">+8.5%</Badge>
            </div>
            <div className="text-lg md:text-2xl font-bold text-slate-800">{formatShortCurrency(totalExpense)}</div>
            <div className="text-xs md:text-sm text-slate-500">Total Pengeluaran</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
              </div>
              <Badge className="bg-blue-100 text-blue-700 text-[10px] md:text-xs hover:bg-blue-100">+22.8%</Badge>
            </div>
            <div className="text-lg md:text-2xl font-bold text-emerald-600">{formatShortCurrency(netIncome)}</div>
            <div className="text-xs md:text-sm text-slate-500">Laba Bersih</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
              </div>
            </div>
            <div className="text-lg md:text-2xl font-bold text-slate-800">{profitMargin}%</div>
            <div className="text-xs md:text-sm text-slate-500">Profit Margin</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm md:text-base font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Arus Kas Bulanan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={incomeData}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94A3B8" />
              <YAxis tickFormatter={(v) => formatShortCurrency(v)} tick={{ fontSize: 11 }} stroke="#94A3B8" />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Area type="monotone" dataKey="pemasukan" stroke="#10B981" strokeWidth={2} fill="url(#colorIncome)" name="Pemasukan" />
              <Area type="monotone" dataKey="pengeluaran" stroke="#EF4444" strokeWidth={2} fill="url(#colorExpense)" name="Pengeluaran" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Income Category */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm md:text-base font-semibold text-emerald-700">Sumber Pemasukan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center gap-4">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap md:flex-col justify-center gap-2 md:gap-3 w-full md:w-auto">
                {categoryData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-slate-600 whitespace-nowrap">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expense Category */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm md:text-base font-semibold text-red-700">Kategori Pengeluaran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center gap-4">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={expenseCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {expenseCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap md:flex-col justify-center gap-2 md:gap-3 w-full md:w-auto">
                {expenseCategory.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-slate-600 whitespace-nowrap">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm md:text-base font-semibold flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-600" />
            Transaksi Terbaru
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-4 md:mx-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Deskripsi</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">Regional</TableHead>
                  <TableHead className="text-xs">Tipe</TableHead>
                  <TableHead className="text-xs text-right">Nominal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-xs md:text-sm font-medium">
                      <div>
                        <span className="block">{item.desc}</span>
                        <span className="text-[10px] text-slate-400 sm:hidden">{item.regional}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs md:text-sm hidden sm:table-cell">{item.regional}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={`text-[10px] md:text-xs ${
                          item.type === 'income' 
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700' 
                            : 'border-red-200 bg-red-50 text-red-700'
                        }`}
                      >
                        {item.type === 'income' ? 'Masuk' : 'Keluar'}
                      </Badge>
                    </TableCell>
                    <TableCell className={`text-xs md:text-sm text-right font-medium ${
                      item.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KeuanganMPJ;
