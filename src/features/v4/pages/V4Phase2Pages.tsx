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
  status?: "Aktif" | "Segera Hadir" | "Belum dikonfigurasi";
};

type HargaSkuReadinessItem = {
  name: string;
  invoiceType: string;
  description: string;
  status: string;
};

const hargaSkuReadinessItems: HargaSkuReadinessItem[] = [
  {
    name: "Aktivasi Akun Pesantren",
    invoiceType: "account_activation",
    description: "Item biaya untuk proses aktivasi akun pesantren.",
    status: "Belum dikonfigurasi",
  },
  {
    name: "Aktivasi Kru",
    invoiceType: "crew_activation",
    description: "Item biaya untuk aktivasi akses kru.",
    status: "Belum dikonfigurasi",
  },
  {
    name: "Tambah Slot Kru",
    invoiceType: "slot_addon",
    description: "Item biaya untuk penambahan kapasitas slot kru.",
    status: "Belum dikonfigurasi",
  },
  {
    name: "Tiket Event",
    invoiceType: "event_ticket",
    description: "Item biaya untuk tiket event jika dibutuhkan.",
    status: "Segera Hadir",
  },
  {
    name: "Layanan Lainnya",
    invoiceType: "service_item",
    description: "Item biaya untuk layanan atau produk lain yang bisa ditagihkan.",
    status: "Segera Hadir",
  },
];

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
  const getStatusBadgeClass = (status: RouteCard["status"]) => {
    if (status === "Aktif") return "border-emerald-200 bg-emerald-50 text-emerald-700";
    if (status === "Belum dikonfigurasi") return "border-slate-200 bg-slate-50 text-slate-700";
    return "border-amber-200 bg-amber-50 text-amber-700";
  };

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
                  {card.status && (
                    <Badge variant="outline" className={getStatusBadgeClass(card.status)}>
                      {card.status}
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
          status: "Segera Hadir",
        },
        {
          title: "Klaim Akun",
          description: "Tinjau klaim akun yang masuk ke sistem.",
          path: "/pusat/administrasi/klaim-akun",
          status: "Segera Hadir",
        },
        {
          title: "Verifikasi Payment",
          description: "Monitor pembayaran yang menunggu verifikasi.",
          path: "/pusat/administrasi/verifikasi-payment",
          status: "Aktif",
        },
        {
          title: "Monitoring Aktivasi",
          description: "Pantau aktivasi akun yang sedang diproses sistem.",
          path: "/pusat/administrasi/monitoring-aktivasi",
          status: "Segera Hadir",
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
          status: "Aktif",
        },
        {
          title: "Media",
          description: "Data media resmi dari pesantren aktif.",
          path: "/pusat/master-data/media",
          status: "Aktif",
        },
        {
          title: "Kru",
          description: "Data kru resmi yang sudah tervalidasi.",
          path: "/pusat/master-data/kru",
          status: "Aktif",
        },
      ]}
      note="Regional, Kode Khodim, Leveling, dan Harga & SKU dikelola di Pengaturan."
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
      description="Kelola konfigurasi sistem MPJ, cakupan wilayah, role, leveling, dan katalog harga."
      cards={[
        {
          title: "Regional",
          description: "Kelola cakupan wilayah, kota/kabupaten, dan admin regional.",
          path: "/pusat/pengaturan/regional",
          status: "Aktif",
        },
        {
          title: "Kode Khodim",
          description: "Kelola role khodim resmi untuk NIAM dan struktur organisasi.",
          path: "/pusat/pengaturan/kode-khodim",
          status: "Segera Hadir",
        },
        {
          title: "Leveling",
          description: "Atur level profil, benefit, dan syarat peningkatan level.",
          path: "/pusat/pengaturan/leveling",
          status: "Segera Hadir",
        },
        {
          title: "Harga & SKU",
          description: "Kelola katalog harga, item invoice, dan konfigurasi biaya sistem MPJ.",
          path: "/pusat/pengaturan/harga-sku",
          status: "Belum dikonfigurasi",
        },
        {
          title: "Admin & Role",
          description: "Kelola akses admin, role, dan permission dashboard.",
          path: "/pusat/pengaturan/admin-role",
          status: "Segera Hadir",
        },
      ]}
    />
  );
}

export function PusatPengaturanRegionalPage() {
  return <AdminPusatRegional />;
}

export function PusatPengaturanKodeKhodimPage() {
  return (
    <PlaceholderPage
      title="Pengaturan Kode Khodim"
      description="Kelola role khodim resmi untuk struktur NIAM."
    />
  );
}

export function PusatPengaturanLevelingPage() {
  return (
    <PlaceholderPage
      title="Pengaturan Leveling"
      description="Atur level profil, benefit, dan syarat peningkatan level."
    />
  );
}

export function PusatPengaturanHargaSkuPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengaturan Harga & SKU"
        description="Kelola katalog harga, item invoice, dan konfigurasi biaya sistem MPJ."
      />
      <DataTableShell
        title="Fitur akan segera tersedia"
        description="Konsep SKU readiness untuk konfigurasi sistem oleh Admin Pusat."
        columns={["Nama SKU", "Tipe invoice", "Deskripsi singkat", "Status"]}
        rows={hargaSkuReadinessItems}
        renderRow={(row) => {
          const item = row as HargaSkuReadinessItem;

          return (
            <TableRow key={item.invoiceType}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>{item.invoiceType}</TableCell>
              <TableCell>{item.description}</TableCell>
              <TableCell>
                <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                  {item.status}
                </Badge>
              </TableCell>
            </TableRow>
          );
        }}
        headerRight={<Button disabled>Segera Hadir</Button>}
      />
    </div>
  );
}

export function PusatPengaturanAdminRolePage() {
  return (
    <PlaceholderPage
      title="Pengaturan Admin & Role"
      description="Kelola akses admin dan permission dashboard."
    />
  );
}
