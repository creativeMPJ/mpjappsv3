import { 
  Shield, 
  MapPin, 
  Building2, 
  Users, 
  TrendingUp, 
  TrendingDown,
  Activity,
  ArrowRight,
  Wallet,
  DollarSign
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

interface MajelisOverviewProps {
  onNavigate: (view: "pusat" | "regional" | "pesantren" | "user" | "keuangan") => void;
}

// Demo data for all levels
const pusatData = [
  { month: "Jan", value: 4500 },
  { month: "Feb", value: 5200 },
  { month: "Mar", value: 4800 },
  { month: "Apr", value: 6100 },
  { month: "May", value: 5900 },
  { month: "Jun", value: 7200 },
];

const regionalData = [
  { name: "Malang Raya", members: 2500, pesantren: 45 },
  { name: "Surabaya", members: 3200, pesantren: 62 },
  { name: "Jember", members: 1800, pesantren: 32 },
  { name: "Kediri", members: 1500, pesantren: 28 },
  { name: "Madiun", members: 1200, pesantren: 22 },
];

const pesantrenActivityData = [
  { week: "W1", active: 280, inactive: 60 },
  { week: "W2", active: 295, inactive: 45 },
  { week: "W3", active: 310, inactive: 30 },
  { week: "W4", active: 305, inactive: 35 },
];

const userEngagementData = [
  { name: "Active", value: 8500, color: "#10B981" },
  { name: "Inactive", value: 2800, color: "#EF4444" },
  { name: "Pending", value: 1200, color: "#F59E0B" },
];

// Finance data for overview
const incomeData = [
  { month: "Jan", pemasukan: 45, pengeluaran: 12 },
  { month: "Feb", pemasukan: 52, pengeluaran: 15 },
  { month: "Mar", pemasukan: 48, pengeluaran: 18 },
  { month: "Apr", pemasukan: 61, pengeluaran: 14 },
  { month: "May", pemasukan: 58, pengeluaran: 20 },
  { month: "Jun", pemasukan: 72, pengeluaran: 22 },
];

const levelCards = [
  {
    id: "pusat" as const,
    title: "Level Pusat",
    icon: Shield,
    value: "12,500",
    label: "Total Anggota",
    trend: "+12.5%",
    trendUp: true,
    color: "bg-emerald-500",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-600"
  },
  {
    id: "regional" as const,
    title: "Level Regional",
    icon: MapPin,
    value: "28",
    label: "Wilayah Aktif",
    trend: "+3",
    trendUp: true,
    color: "bg-blue-500",
    bgColor: "bg-blue-50",
    textColor: "text-blue-600"
  },
  {
    id: "pesantren" as const,
    title: "Level Pesantren",
    icon: Building2,
    value: "340",
    label: "Pesantren Terdaftar",
    trend: "+18",
    trendUp: true,
    color: "bg-purple-500",
    bgColor: "bg-purple-50",
    textColor: "text-purple-600"
  },
  {
    id: "keuangan" as const,
    title: "Keuangan MPJ",
    icon: Wallet,
    value: "336Jt",
    label: "Total Omset",
    trend: "+15.2%",
    trendUp: true,
    color: "bg-amber-500",
    bgColor: "bg-amber-50",
    textColor: "text-amber-600"
  },
];

const MajelisOverview = ({ onNavigate }: MajelisOverviewProps) => {
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Level Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {levelCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card 
              key={card.id}
              className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 border-0 shadow-sm"
              onClick={() => onNavigate(card.id)}
            >
              <CardContent className="p-3 md:p-5">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${card.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 md:w-6 md:h-6 ${card.textColor}`} />
                  </div>
                  <div className={`flex items-center gap-1 text-[10px] md:text-xs font-medium ${card.trendUp ? 'text-emerald-600' : 'text-red-500'}`}>
                    {card.trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {card.trend}
                  </div>
                </div>
                <div className="text-xl md:text-2xl font-bold text-slate-800 mb-1">{card.value}</div>
                <div className="text-xs md:text-sm text-slate-500">{card.label}</div>
                <div className="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] md:text-xs font-medium text-slate-600">{card.title}</span>
                  <ArrowRight className="w-3 h-3 md:w-4 md:h-4 text-slate-400" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Income Chart - NEW */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-amber-600" />
              </div>
              <CardTitle className="text-sm md:text-base font-semibold text-slate-800">Arus Kas MPJ</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate("keuangan")} className="text-xs">
              Detail <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={incomeData}>
              <defs>
                <linearGradient id="colorPemasukan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPengeluaran" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94A3B8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94A3B8" tickFormatter={(v) => `${v}Jt`} />
              <Tooltip formatter={(value: number) => [`Rp ${value} Juta`, '']} />
              <Area type="monotone" dataKey="pemasukan" stroke="#10B981" strokeWidth={2} fill="url(#colorPemasukan)" name="Pemasukan" />
              <Area type="monotone" dataKey="pengeluaran" stroke="#EF4444" strokeWidth={2} fill="url(#colorPengeluaran)" name="Pengeluaran" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-xs text-slate-600">Pemasukan</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-xs text-slate-600">Pengeluaran</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Pusat - Pertumbuhan Anggota */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-emerald-600" />
                </div>
                <CardTitle className="text-sm md:text-base font-semibold text-slate-800">Pertumbuhan Pusat</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onNavigate("pusat")} className="text-xs">
                Detail <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={pusatData}>
                <defs>
                  <linearGradient id="colorPusat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94A3B8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94A3B8" />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2} fill="url(#colorPusat)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Regional - Bar Chart */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-blue-600" />
                </div>
                <CardTitle className="text-sm md:text-base font-semibold text-slate-800">Distribusi Regional</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onNavigate("regional")} className="text-xs">
                Detail <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={regionalData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94A3B8" />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={70} stroke="#94A3B8" />
                <Tooltip />
                <Bar dataKey="members" fill="#3B82F6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pesantren - Activity Trend */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-purple-600" />
                </div>
                <CardTitle className="text-sm md:text-base font-semibold text-slate-800">Aktivitas Pesantren</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onNavigate("pesantren")} className="text-xs">
                Detail <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={pesantrenActivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="#94A3B8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94A3B8" />
                <Tooltip />
                <Line type="monotone" dataKey="active" stroke="#8B5CF6" strokeWidth={2} dot={{ fill: "#8B5CF6" }} />
                <Line type="monotone" dataKey="inactive" stroke="#EF4444" strokeWidth={2} dot={{ fill: "#EF4444" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User - Engagement Pie */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Users className="w-4 h-4 text-slate-600" />
                </div>
                <CardTitle className="text-sm md:text-base font-semibold text-slate-800">Engagement User</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onNavigate("user")} className="text-xs">
                Detail <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={userEngagementData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {userEngagementData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 md:gap-6 mt-2">
              {userEngagementData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-slate-600">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Feed */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 md:w-5 md:h-5 text-slate-600" />
            <CardTitle className="text-sm md:text-base font-semibold text-slate-800">Aktivitas Terkini</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 md:space-y-3">
            {[
              { time: "2 menit lalu", text: "Admin Malang menambahkan 5 anggota baru", level: "Regional", color: "bg-blue-500" },
              { time: "15 menit lalu", text: "PP Al-Hidayah melengkapi profil Gold", level: "Pesantren", color: "bg-purple-500" },
              { time: "1 jam lalu", text: "User Ahmad Fauzi mendapatkan badge Contributor", level: "User", color: "bg-slate-500" },
              { time: "2 jam lalu", text: "Verifikasi pembayaran 12 pesantren selesai", level: "Pusat", color: "bg-emerald-500" },
              { time: "3 jam lalu", text: "Event Kopdar Surabaya dibuat oleh Regional", level: "Regional", color: "bg-blue-500" },
            ].map((activity, index) => (
              <div key={index} className="flex items-start gap-2 md:gap-3 p-2 md:p-3 bg-slate-50 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${activity.color} mt-1.5 md:mt-2 flex-shrink-0`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm text-slate-700">{activity.text}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] md:text-xs text-slate-400">{activity.time}</span>
                    <span className="text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 bg-slate-200 text-slate-600 rounded-full">{activity.level}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MajelisOverview;
