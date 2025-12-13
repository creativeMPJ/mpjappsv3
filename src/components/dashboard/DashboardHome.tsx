import { TrendingUp, Clock, Building2, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

const statsData = [
  {
    title: "Total Omzet",
    value: "Rp 15.500.000",
    icon: TrendingUp,
    color: "text-amber-500",
    bgColor: "bg-amber-50",
  },
  {
    title: "Menunggu Validasi",
    value: "12 Request",
    icon: Clock,
    color: "text-red-500",
    bgColor: "bg-red-50",
    badge: true,
  },
  {
    title: "Total Pesantren",
    value: "850",
    icon: Building2,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  {
    title: "Regional Teraktif",
    value: "Malang Raya",
    icon: MapPin,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
  },
];

const chartData = [
  { month: "Jan", registrasi: 65 },
  { month: "Feb", registrasi: 85 },
  { month: "Mar", registrasi: 120 },
  { month: "Apr", registrasi: 95 },
  { month: "Mei", registrasi: 140 },
  { month: "Jun", registrasi: 110 },
  { month: "Jul", registrasi: 150 },
  { month: "Agu", registrasi: 130 },
  { month: "Sep", registrasi: 180 },
  { month: "Okt", registrasi: 160 },
  { month: "Nov", registrasi: 200 },
  { month: "Des", registrasi: 175 },
];

const DashboardHome = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Control Center</h1>
        <p className="text-slate-500">Overview keseluruhan platform MPJ Apps</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat, index) => (
          <Card key={index} className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                {stat.badge && (
                  <span className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                    Urgent
                  </span>
                )}
              </div>
              <div className="mt-4">
                <p className="text-sm text-slate-500">{stat.title}</p>
                <p className={`text-2xl font-bold mt-1 ${stat.title === "Total Omzet" ? "text-amber-500" : "text-slate-800"}`}>
                  {stat.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart Section */}
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-slate-800">Registrasi per Bulan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: 'none', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Bar 
                  dataKey="registrasi" 
                  fill="#166534" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardHome;
