import { useEffect, useState } from "react";
import { Building2, Medal, Users, WalletCards } from "lucide-react";
import { DataTableShell, MetricCard, PageHeader } from "../components/v4-components";
import { v4AdminService, v4RegionalService, type PusatHomeSummary, type RegionalPerformance } from "../services/v4-services";

export function PusatBerandaPage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<PusatHomeSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    v4AdminService.homeSummary().then((result) => {
      setSummary(result.data);
      setError(result.error);
      setLoading(false);
    });
  }, []);

  const stats = summary?.stats ?? {};

  return (
    <div className="space-y-6">
      <PageHeader
        title="Beranda Pusat"
        description="Ringkasan nasional untuk monitoring pesantren, kru, wilayah, dan pembayaran."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Pesantren Aktif" value={stats.totalPesantren ?? 0} icon={Building2} loading={loading} />
        <MetricCard title="Total Kru" value={stats.totalKru ?? 0} icon={Users} loading={loading} />
        <MetricCard title="Total Wilayah" value={stats.totalWilayah ?? 0} icon={Medal} loading={loading} />
        <MetricCard
          title="Pending Payment"
          value={stats.pendingPayments ?? 0}
          description={stats.totalIncome ? `Kas terverifikasi Rp ${stats.totalIncome.toLocaleString("id-ID")}` : undefined}
          icon={WalletCards}
          loading={loading}
        />
      </div>
      <DataTableShell
        title="Aktivitas Terkini"
        description="Ringkasan aktivitas terbaru."
        columns={["Aktivitas"]}
        rows={summary?.recentUsers ?? []}
        loading={loading}
        error={error}
      />
    </div>
  );
}

export function RegionalBerandaPage() {
  const [loading, setLoading] = useState(true);
  const [performance, setPerformance] = useState<RegionalPerformance | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    v4RegionalService.performance().then((result) => {
      setPerformance(result.data);
      setError(result.error);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Beranda Regional"
        description="Monitoring wilayah untuk pendaftaran, lembaga, kru, dan performa pembayaran."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Pending Validasi" value={performance?.pendingClaims ?? 0} icon={WalletCards} loading={loading} />
        <MetricCard title="Total Lembaga" value={performance?.totalProfiles ?? 0} icon={Building2} loading={loading} />
        <MetricCard title="Total Kru" value={performance?.totalCrews ?? 0} icon={Users} loading={loading} />
        <MetricCard title="Payment Verified" value={performance?.verifiedPayments ?? 0} icon={Medal} loading={loading} />
      </div>
      <DataTableShell
        title="Ringkasan Wilayah"
        description="Ringkasan performa regional."
        columns={["Metrik"]}
        rows={performance ? [performance] : []}
        loading={loading}
        error={error}
      />
    </div>
  );
}
