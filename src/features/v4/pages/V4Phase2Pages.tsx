import { useEffect, useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { DataTableShell, DisabledActionCell, PageHeader, StatusBadge } from "../components/v4-components";
import { getPaymentList, type V4PaymentItem } from "../services/payment.service";
import { getPendingRegistrations, type V4PendingRegistrationItem } from "../services/regional.service";
import { FileLink, formatCurrency, formatDate, formatText, getPaymentStateLabel } from "../utils";

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
