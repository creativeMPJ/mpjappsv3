import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  Clock, 
  Wallet, 
  Target,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Mock data for stats
const statsData = {
  totalOmset: 1250000000,
  pendingPayment: 15,
  todayInflow: 3500000,
  leadRate: 85,
};

// Mock data for chart
const dailyData = [
  { date: "Sen", amount: 2500000 },
  { date: "Sel", amount: 3200000 },
  { date: "Rab", amount: 2800000 },
  { date: "Kam", amount: 4100000 },
  { date: "Jum", amount: 3500000 },
  { date: "Sab", amount: 2100000 },
  { date: "Min", amount: 1800000 },
];

const weeklyData = [
  { date: "W1", amount: 18000000 },
  { date: "W2", amount: 22000000 },
  { date: "W3", amount: 19500000 },
  { date: "W4", amount: 25000000 },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatShortCurrency = (value: number) => {
  if (value >= 1000000000) {
    return `Rp ${(value / 1000000000).toFixed(1)}M`;
  }
  if (value >= 1000000) {
    return `Rp ${(value / 1000000).toFixed(1)}jt`;
  }
  return formatCurrency(value);
};

const FinanceOverview = () => {
  const [timeFilter, setTimeFilter] = useState("daily");
  const [skuFilter, setSkuFilter] = useState("all");

  const chartData = timeFilter === "daily" ? dailyData : weeklyData;

  const statCards = [
    {
      title: "Total Omset",
      value: formatShortCurrency(statsData.totalOmset),
      subValue: formatCurrency(statsData.totalOmset),
      icon: Wallet,
      trend: "+12.5%",
      trendUp: true,
      color: "bg-amber-500",
    },
    {
      title: "Pending Payment",
      value: `${statsData.pendingPayment} Transaksi`,
      subValue: "Butuh Verifikasi",
      icon: Clock,
      trend: null,
      trendUp: false,
      color: "bg-orange-500",
    },
    {
      title: "Omset Hari Ini",
      value: formatShortCurrency(statsData.todayInflow),
      subValue: formatCurrency(statsData.todayInflow),
      icon: TrendingUp,
      trend: "+8.2%",
      trendUp: true,
      color: "bg-emerald-500",
    },
    {
      title: "Lead Rate",
      value: `${statsData.leadRate}%`,
      subValue: "Conversion Rate",
      icon: Target,
      trend: "+2.1%",
      trendUp: true,
      color: "bg-blue-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard Overview</h1>
        <p className="text-muted-foreground">Monitor keuangan dan transaksi MPJ Apps</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="relative overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.subValue}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-xl`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                {stat.trend && (
                  <div className="flex items-center gap-1 mt-3">
                    {stat.trendUp ? (
                      <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-sm font-medium ${stat.trendUp ? "text-emerald-500" : "text-red-500"}`}>
                      {stat.trend}
                    </span>
                    <span className="text-xs text-muted-foreground">vs last period</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Chart Section */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-lg">Arus Kas Harian</CardTitle>
            <p className="text-sm text-muted-foreground">Grafik pendapatan periode terkini</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
            <Select value={skuFilter} onValueChange={setSkuFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="SKU" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua SKU</SelectItem>
                <SelectItem value="eid">E-ID Card</SelectItem>
                <SelectItem value="cetak">Cetak ID</SelectItem>
                <SelectItem value="upgrade">Crew Upgrade</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D97706" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#D97706" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(value) => `${(value / 1000000).toFixed(0)}jt`}
                />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), "Pendapatan"]}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#D97706"
                  strokeWidth={2}
                  fill="url(#colorAmount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Aktivitas Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { time: "10:30", user: "Ahmad - Malang", action: "Pembayaran E-ID Card", amount: 50000, status: "pending" },
              { time: "10:15", user: "Siti - Surabaya", action: "Pembayaran Cetak ID", amount: 25000, status: "verified" },
              { time: "09:45", user: "Rudi - Jember", action: "Upgrade Crew", amount: 100000, status: "pending" },
              { time: "09:30", user: "Dewi - Kediri", action: "Pembayaran E-ID Card", amount: 50000, status: "verified" },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground w-14">{activity.time}</span>
                  <div>
                    <p className="font-medium text-foreground">{activity.user}</p>
                    <p className="text-sm text-muted-foreground">{activity.action}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-foreground">{formatCurrency(activity.amount)}</span>
                  <Badge 
                    variant={activity.status === "verified" ? "default" : "secondary"}
                    className={activity.status === "verified" ? "bg-emerald-500" : "bg-orange-500 text-white"}
                  >
                    {activity.status === "verified" ? "Verified" : "Pending"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinanceOverview;
