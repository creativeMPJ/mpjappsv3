import { TableCell, TableRow } from "@/components/ui/table";
import { DataTableShell, PageHeader, StatusBadge } from "../components/v4-components";

type SekretariatScope = "pusat" | "regional";

interface SuratKeluarItem {
  id: string;
  nomorSurat: string | null;
  perihal: string | null;
  jenisNaskah: string | null;
  penandatangan: string | null;
  scope: string | null;
  tanggal: string | null;
  status: string | null;
  fileFinal: string | null;
}

interface SuratMasukItem {
  id: string;
  nomorSuratAsal: string | null;
  pengirim: string | null;
  perihal: string | null;
  tanggalSurat: string | null;
  tanggalDiterima: string | null;
  fileScan: string | null;
  status: string | null;
}

interface AssetTtdItem {
  id: string;
  namaPimpinan: string | null;
  jabatan: string | null;
  scope: string | null;
  previewPng: string | null;
  status: string | null;
}

interface TemplateSuratItem {
  id: string;
  jenisNaskah: string | null;
  nomorPosition: string | null;
  ttdPosition: string | null;
  qrPosition: string | null;
  ukuranFont: string | null;
  halamanTarget: string | null;
}

function scopeLabel(scope: SekretariatScope) {
  return scope === "pusat" ? "Pusat" : "Regional";
}

function formatText(value: string | null | undefined) {
  return value && value.trim() ? value : "-";
}

function V4SekretariatRingkasanPage({ scope }: { scope: SekretariatScope }) {
  const label = scopeLabel(scope);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Ringkasan Surat ${label}`}
        description="Shell sekretariat untuk monitoring arsip surat. Data akan tampil setelah endpoint tersedia."
      />
      <DataTableShell
        title="Aktivitas Surat"
        description="Ringkasan surat masuk, surat keluar, asset TTD, dan template."
        columns={["Modul", "Terakhir Diperbarui", "Status"]}
        rows={[]}
        renderRow={(row, index) => {
          const item = row as { modul?: string; updatedAt?: string; status?: string };

          return (
            <TableRow key={`${item.modul ?? "ringkasan"}-${index}`}>
              <TableCell className="font-medium">{formatText(item.modul)}</TableCell>
              <TableCell>{formatText(item.updatedAt)}</TableCell>
              <TableCell><StatusBadge status={item.status} /></TableCell>
            </TableRow>
          );
        }}
      />
    </div>
  );
}

function V4SuratKeluarPage({ scope }: { scope: SekretariatScope }) {
  const label = scopeLabel(scope);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Surat Keluar ${label}`}
        description="Shell read-only untuk daftar surat keluar. PDF stamping dan QR validasi belum diaktifkan."
      />
      <DataTableShell
        title="Daftar Surat Keluar"
        description="Data akan dihubungkan ke endpoint sekretariat setelah tersedia."
        columns={["Nomor Surat", "Perihal", "Jenis Naskah", "Penandatangan", "Scope", "Tanggal", "Status", "File Final", "Aksi"]}
        rows={[]}
        renderRow={(row, index) => {
          const item = row as SuratKeluarItem;

          return (
            <TableRow key={item.id || index}>
              <TableCell className="font-medium">{formatText(item.nomorSurat)}</TableCell>
              <TableCell>{formatText(item.perihal)}</TableCell>
              <TableCell>{formatText(item.jenisNaskah)}</TableCell>
              <TableCell>{formatText(item.penandatangan)}</TableCell>
              <TableCell>{formatText(item.scope)}</TableCell>
              <TableCell>{formatText(item.tanggal)}</TableCell>
              <TableCell><StatusBadge status={item.status} /></TableCell>
              <TableCell>{formatText(item.fileFinal)}</TableCell>
              <TableCell>Detail</TableCell>
            </TableRow>
          );
        }}
      />
    </div>
  );
}

function V4SuratMasukPage({ scope }: { scope: SekretariatScope }) {
  const label = scopeLabel(scope);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Surat Masuk ${label}`}
        description="Shell read-only untuk arsip surat masuk. Upload scan real belum diaktifkan."
      />
      <DataTableShell
        title="Daftar Surat Masuk"
        description="Data akan tampil setelah endpoint sekretariat tersedia."
        columns={["Nomor Surat Asal", "Pengirim", "Perihal", "Tanggal Surat", "Tanggal Diterima", "File Scan", "Status", "Aksi"]}
        rows={[]}
        renderRow={(row, index) => {
          const item = row as SuratMasukItem;

          return (
            <TableRow key={item.id || index}>
              <TableCell className="font-medium">{formatText(item.nomorSuratAsal)}</TableCell>
              <TableCell>{formatText(item.pengirim)}</TableCell>
              <TableCell>{formatText(item.perihal)}</TableCell>
              <TableCell>{formatText(item.tanggalSurat)}</TableCell>
              <TableCell>{formatText(item.tanggalDiterima)}</TableCell>
              <TableCell>{formatText(item.fileScan)}</TableCell>
              <TableCell><StatusBadge status={item.status} /></TableCell>
              <TableCell>Detail</TableCell>
            </TableRow>
          );
        }}
      />
    </div>
  );
}

function V4AssetTtdPage({ scope }: { scope: SekretariatScope }) {
  const label = scopeLabel(scope);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Asset TTD ${label}`}
        description="Shell read-only untuk asset tanda tangan. Upload asset real belum diaktifkan."
      />
      <DataTableShell
        title="Daftar Asset TTD"
        description="Preview PNG akan tampil setelah data asset tersedia."
        columns={["Nama Pimpinan", "Jabatan", "Scope", "Preview PNG", "Status Aktif", "Aksi"]}
        rows={[]}
        renderRow={(row, index) => {
          const item = row as AssetTtdItem;

          return (
            <TableRow key={item.id || index}>
              <TableCell className="font-medium">{formatText(item.namaPimpinan)}</TableCell>
              <TableCell>{formatText(item.jabatan)}</TableCell>
              <TableCell>{formatText(item.scope)}</TableCell>
              <TableCell>{formatText(item.previewPng)}</TableCell>
              <TableCell><StatusBadge status={item.status} /></TableCell>
              <TableCell>Detail</TableCell>
            </TableRow>
          );
        }}
      />
    </div>
  );
}

function V4TemplateSuratPage({ scope }: { scope: SekretariatScope }) {
  const label = scopeLabel(scope);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Pengaturan Template ${label}`}
        description="Shell read-only untuk koordinat template surat. Preview PDF dan QR belum diaktifkan."
      />
      <DataTableShell
        title="Daftar Template Surat"
        description="Koordinat nomor, TTD, dan QR akan dikelola setelah endpoint tersedia."
        columns={["Jenis Naskah", "Nomor X/Y", "TTD X/Y", "QR X/Y", "Ukuran Font", "Halaman Target", "Preview Posisi"]}
        rows={[]}
        renderRow={(row, index) => {
          const item = row as TemplateSuratItem;

          return (
            <TableRow key={item.id || index}>
              <TableCell className="font-medium">{formatText(item.jenisNaskah)}</TableCell>
              <TableCell>{formatText(item.nomorPosition)}</TableCell>
              <TableCell>{formatText(item.ttdPosition)}</TableCell>
              <TableCell>{formatText(item.qrPosition)}</TableCell>
              <TableCell>{formatText(item.ukuranFont)}</TableCell>
              <TableCell>{formatText(item.halamanTarget)}</TableCell>
              <TableCell>Preview</TableCell>
            </TableRow>
          );
        }}
      />
    </div>
  );
}

export function PusatSekretariatPage() {
  return <V4SekretariatRingkasanPage scope="pusat" />;
}

export function PusatSuratKeluarPage() {
  return <V4SuratKeluarPage scope="pusat" />;
}

export function PusatSuratMasukPage() {
  return <V4SuratMasukPage scope="pusat" />;
}

export function PusatAssetTtdPage() {
  return <V4AssetTtdPage scope="pusat" />;
}

export function PusatPengaturanTemplatePage() {
  return <V4TemplateSuratPage scope="pusat" />;
}

export function RegionalSekretariatPage() {
  return <V4SekretariatRingkasanPage scope="regional" />;
}

export function RegionalSuratKeluarPage() {
  return <V4SuratKeluarPage scope="regional" />;
}

export function RegionalSuratMasukPage() {
  return <V4SuratMasukPage scope="regional" />;
}

export function RegionalAssetTtdPage() {
  return <V4AssetTtdPage scope="regional" />;
}

export function RegionalPengaturanTemplatePage() {
  return <V4TemplateSuratPage scope="regional" />;
}
