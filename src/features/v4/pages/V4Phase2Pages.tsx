import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataTableShell, DisabledActionCell, EmptyState, PageHeader, StatusBadge } from "../components/v4-components";
import { getPaymentList, type V4PaymentItem } from "../services/payment.service";
import { getPendingRegistrations, type V4PendingRegistrationItem } from "../services/regional.service";
import { FileLink, formatCurrency, formatDate, formatText, getPaymentStateLabel } from "../utils";
import AdminPusatRegional from "@/components/admin-pusat/AdminPusatRegional";

type RouteCard = {
  title: string;
  description: string;
  path: string;
  badge?: string;
};

function RouteHubPage({
  title,
  description,
  cards,
  note,
}: {
  title: string;
  description: string;
  cards: RouteCard[];
  note?: string;
}) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.path} className="border-border shadow-sm">
            <CardContent className="flex h-full flex-col gap-4 p-5">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-semibold text-foreground">{card.title}</h3>
                  {card.badge && (
                    <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                      {card.badge}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{card.description}</p>
              </div>
              <div className="mt-auto">
                <Button asChild className="w-full">
                  <Link to={card.path}>Buka</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {note && (
        <div className="rounded-lg border border-dashed bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
          {note}
        </div>
      )}
    </div>
  );
}

function PlaceholderPage({
  title,
  description,
  actionLabel = "Segera Hadir",
}: {
  title: string;
  description: string;
  actionLabel?: string;
}) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />
      <EmptyState
        title="Belum ada data"
        description="Data akan tampil setelah tersedia"
        action={<Button disabled>{actionLabel}</Button>}
      />
    </div>
  );
}

export function PusatVerifikasiPaymentPage() {
  const [payments, setPayments] = useState<V4PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPaymentList().then((result) => {
      setPayments(result.data ?? []);
      setError(result.error);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Verifikasi Payment"
        description="Monitoring pembayaran untuk review pusat."
      />
      <DataTableShell
        title="Daftar Pembayaran"
        description="Aksi dilakukan di dashboard operasional yang sudah tersedia."
        columns={["Pesantren", "Pengelola", "Jenis Pengajuan", "Total", "Status", "Bukti", "Tanggal", "Aksi"]}
        rows={payments}
        loading={loading}
        error={error}
        renderRow={(row, index) => {
          const payment = row as V4PaymentItem;

          return (
            <TableRow key={payment.id || index}>
              <TableCell className="font-medium">{formatText(payment.pesantren_claims?.pesantren_name)}</TableCell>
              <TableCell>{formatText(payment.pesantren_claims?.nama_pengelola)}</TableCell>
              <TableCell className="capitalize">{formatText(payment.pesantren_claims?.jenis_pengajuan)?.replace(/_/g, " ")}</TableCell>
              <TableCell>{formatCurrency(payment.total_amount)}</TableCell>
              <TableCell><StatusBadge status={getPaymentStateLabel(payment.status)} /></TableCell>
              <TableCell><FileLink href={payment.proof_file_url} label="Unduh" /></TableCell>
              <TableCell>{formatDate(payment.created_at)}</TableCell>
              <DisabledActionCell label="Segera Hadir" />
            </TableRow>
          );
        }}
      />
    </div>
  );
}

export function RegionalMonitoringPendaftaranPage() {
  const [registrations, setRegistrations] = useState<V4PendingRegistrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPendingRegistrations().then((result) => {
      setRegistrations(result.data ?? []);
      setError(result.error);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Monitoring Pendaftaran"
        description="Monitoring klaim atau pendaftaran yang menunggu tindak lanjut regional."
      />
      <DataTableShell
        title="Pengajuan Menunggu Tindak Lanjut"
        description="Aksi dilakukan di dashboard operasional yang sudah tersedia."
        columns={["Pesantren", "Pengelola", "Jenis Pengajuan", "Kecamatan", "Kontak", "Status", "Dokumen", "Tanggal", "Aksi"]}
        rows={registrations}
        loading={loading}
        error={error}
        renderRow={(row, index) => {
          const registration = row as V4PendingRegistrationItem;

          return (
            <TableRow key={registration.id || index}>
              <TableCell className="font-medium">{formatText(registration.pesantren_name)}</TableCell>
              <TableCell>{formatText(registration.nama_pengelola)}</TableCell>
              <TableCell className="capitalize">{formatText(registration.jenis_pengajuan)?.replace(/_/g, " ")}</TableCell>
              <TableCell>{formatText(registration.kecamatan)}</TableCell>
              <TableCell>{formatText(registration.no_wa_pendaftar)}</TableCell>
              <TableCell><StatusBadge status={registration.status} /></TableCell>
              <TableCell><FileLink href={registration.dokumen_bukti_url} label="Unduh" /></TableCell>
              <TableCell>{formatDate(registration.created_at)}</TableCell>
              <DisabledActionCell label="Segera Hadir" />
            </TableRow>
          );
        }}
      />
    </div>
  );
}

export function PusatAdministrasiOverviewPage() {
  return (
    <RouteHubPage
      title="Administrasi"
      description="Kelola pengajuan dan proses aktivasi akun."
      cards={[
        {
          title: "Pendaftaran Pesantren",
          description: "Kelola pengajuan pendaftaran sebelum data aktif.",
          path: "/pusat/administrasi/pendaftaran",
          badge: "Proses Awal",
        },
        {
          title: "Klaim Akun",
          description: "Tinjau klaim akun yang masuk ke sistem.",
          path: "/pusat/administrasi/klaim-akun",
          badge: "Tindak Lanjut",
        },
        {
          title: "Verifikasi Payment",
          description: "Monitor pembayaran yang menunggu verifikasi.",
          path: "/pusat/administrasi/verifikasi-payment",
          badge: "Aktif",
        },
        {
          title: "Monitoring Aktivasi",
          description: "Pantau aktivasi akun yang sedang diproses sistem.",
          path: "/pusat/administrasi/monitoring-aktivasi",
          badge: "Aktif",
        },
      ]}
    />
  );
}

export function PusatAdministrasiPendaftaranPage() {
  return (
    <PlaceholderPage
      title="Pendaftaran Pesantren"
      description="Data pendaftaran akan tampil setelah tersedia."
    />
  );
}

export function PusatAdministrasiKlaimAkunPage() {
  return (
    <PlaceholderPage
      title="Klaim Akun"
      description="Data klaim akun akan tampil setelah tersedia."
    />
  );
}

export function PusatAdministrasiMonitoringAktivasiPage() {
  return (
    <PlaceholderPage
      title="Monitoring Aktivasi"
      description="Data aktivasi akan tampil setelah tersedia."
    />
  );
}

export function PusatMasterDataOverviewPage() {
  return (
    <RouteHubPage
      title="Master Data"
      description="Master Data adalah data resmi yang sudah sah dan aktif."
      cards={[
        {
          title: "Pesantren",
          description: "Data lembaga resmi yang sudah aktif.",
          path: "/pusat/master-data/pesantren",
          badge: "Resmi",
        },
        {
          title: "Media",
          description: "Data media resmi dari pesantren aktif.",
          path: "/pusat/master-data/media",
          badge: "Resmi",
        },
        {
          title: "Kru",
          description: "Data kru resmi yang sudah tervalidasi.",
          path: "/pusat/master-data/kru",
          badge: "Resmi",
        },
      ]}
      note="Regional, Kode Khodim, Leveling, dan Paket / Slot dikelola di Pengaturan."
    />
  );
}

export function PusatEventOverviewPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Event" description="Kelola event pusat dan daftar event yang tersedia." />
      <EmptyState
        title="Belum ada data"
        description="Data akan tampil setelah tersedia"
        action={<Button asChild><Link to="/pusat/event/daftar">Lihat Daftar Event</Link></Button>}
      />
    </div>
  );
}

export function PusatMilitansiPage() {
  return (
    <PlaceholderPage
      title="Militansi"
      description="Fitur akan segera tersedia."
    />
  );
}

export function PusatHubPage() {
  return (
    <PlaceholderPage
      title="MPJ Hub"
      description="Fitur akan segera tersedia."
    />
  );
}

export function PusatPengaturanOverviewPage() {
  return (
    <RouteHubPage
      title="Pengaturan"
      description="Konfigurasi sistem dikelola oleh Admin Pusat."
      cards={[
        {
          title: "Regional",
          description: "Kelola cakupan wilayah, kota/kabupaten, dan admin regional MPJ.",
          path: "/pusat/pengaturan/regional",
          badge: "Penting",
        },
        {
          title: "Kode Khodim",
          description: "Atur kode jabatan yang dipakai sistem anggota.",
          path: "/pusat/pengaturan/kode-khodim",
          badge: "Konfigurasi",
        },
        {
          title: "Leveling",
          description: "Atur level profil dan aturan peningkatan.",
          path: "/pusat/pengaturan/leveling",
          badge: "Konfigurasi",
        },
        {
          title: "Paket / Slot",
          description: "Atur paket gratis dan add-on slot untuk tim.",
          path: "/pusat/pengaturan/paket-slot",
          badge: "Konfigurasi",
        },
        {
          title: "Admin & Role",
          description: "Kelola admin pusat, regional, finance, dan role operasional.",
          path: "/pusat/pengaturan/admin-role",
          badge: "Konfigurasi",
        },
      ]}
      note="Pengaturan ini akan segera tersedia. Data akan tampil setelah tersedia."
    />
  );
}

export function PusatPengaturanRegionalPage() {
  return <AdminPusatRegional />;
}

export function PusatPengaturanKodeKhodimPage() {
  return (
    <PlaceholderPage
      title="Kode Khodim"
      description="Pengaturan ini akan segera tersedia."
    />
  );
}

export function PusatPengaturanLevelingPage() {
  return (
    <PlaceholderPage
      title="Leveling"
      description="Pengaturan ini akan segera tersedia."
    />
  );
}

export function PusatPengaturanPaketSlotPage() {
  return (
    <PlaceholderPage
      title="Paket / Slot"
      description="Pengaturan ini akan segera tersedia."
    />
  );
}

export function PusatPengaturanAdminRolePage() {
  return (
    <PlaceholderPage
      title="Admin & Role"
      description="Pengaturan ini akan segera tersedia."
    />
  );
}
