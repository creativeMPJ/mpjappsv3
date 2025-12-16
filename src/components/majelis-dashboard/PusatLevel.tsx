import { 
  Shield, 
  Users, 
  Building2, 
  DollarSign,
  TrendingUp,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const monthlyGrowth = [
  { month: "Jan", anggota: 4200, pesantren: 280 },
  { month: "Feb", anggota: 5100, pesantren: 295 },
  { month: "Mar", anggota: 5800, pesantren: 310 },
  { month: "Apr", anggota: 7200, pesantren: 318 },
  { month: "May", anggota: 9500, pesantren: 328 },
  { month: "Jun", anggota: 12500, pesantren: 340 },
];

const paymentStats = [
  { status: "Verified", count: 285, percentage: 84 },
  { status: "Pending", count: 38, percentage: 11 },
  { status: "Rejected", count: 17, percentage: 5 },
];

const recentValidations = [
  { id: 1, name: "PP Darul Ulum", regional: "Jombang", type: "Gold Upgrade", status: "pending", date: "2024-01-15" },
  { id: 2, name: "PP Al-Falah", regional: "Surabaya", type: "New Registration", status: "approved", date: "2024-01-15" },
  { id: 3, name: "PP Nurul Jadid", regional: "Probolinggo", type: "Gold Upgrade", status: "pending", date: "2024-01-14" },
  { id: 4, name: "PP Mambaul Hikam", regional: "Blitar", type: "New Registration", status: "rejected", date: "2024-01-14" },
  { id: 5, name: "PP Tebuireng", regional: "Jombang", type: "Platinum Upgrade", status: "approved", date: "2024-01-13" },
];

const stats = [
  { label: "Total Anggota", value: "12,500", icon: Users, trend: "+12.5%", color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Total Pesantren", value: "340", icon: Building2, trend: "+18", color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Wilayah Aktif", value: "28", icon: Shield, trend: "+3", color: "text-purple-600", bg: "bg-purple-50" },
  { label: "Total Omset", value: "Rp 336Jt", icon: DollarSign, trend: "+15.2%", color: "text-amber-600", bg: "bg-amber-50" },
];

const PusatLevel = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
          <Shield className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Report Level Pusat</h1>
          <p className="text-sm text-slate-500">Monitoring data dan aktivitas dari Super Admin MPJ</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <span className="text-xs font-medium text-emerald-600">{stat.trend}</span>
                </div>
                <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Growth Chart */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Pertumbuhan Bulanan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={monthlyGrowth}>
                <defs>
                  <linearGradient id="colorAnggota" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94A3B8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94A3B8" />
                <Tooltip />
                <Area type="monotone" dataKey="anggota" stroke="#10B981" strokeWidth={2} fill="url(#colorAnggota)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Status */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-500" />
              Status Verifikasi Payment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paymentStats.map((item) => (
                <div key={item.status} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">{item.status}</span>
                    <span className="text-sm font-medium text-slate-800">{item.count}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        item.status === 'Verified' ? 'bg-emerald-500' : 
                        item.status === 'Pending' ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-slate-50 rounded-lg">
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600">84%</div>
                <div className="text-sm text-slate-500">Tingkat Verifikasi</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Validations Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-600" />
            Validasi Terbaru
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Pesantren</TableHead>
                  <TableHead>Regional</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentValidations.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.regional}</TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-600">{item.type}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        item.status === 'approved' ? 'default' : 
                        item.status === 'pending' ? 'secondary' : 'destructive'
                      } className={
                        item.status === 'approved' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : 
                        item.status === 'pending' ? 'bg-amber-100 text-amber-700 hover:bg-amber-100' : ''
                      }>
                        {item.status === 'approved' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {item.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                        {item.status === 'rejected' && <AlertCircle className="w-3 h-3 mr-1" />}
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-500">{item.date}</TableCell>
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

export default PusatLevel;
