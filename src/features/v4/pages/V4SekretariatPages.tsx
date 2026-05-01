import { useEffect, useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { DataTableShell, DisabledActionCell, PageHeader, StatusBadge } from "../components/v4-components";
import {
  getIncomingLetters,
  getOutgoingLetters,
  getSignatures,
  getTemplates,
  type V4LetterItem,
  type V4SekretariatScope,
  type V4SignatureItem,
  type V4TemplatePositionItem,
} from "../services/sekretariat.service";
import { FileLink, formatDate, formatText } from "../utils";

interface SummaryItem {
  modul: string;
  total: number;
  status: string;
}

function scopeLabel(scope: V4SekretariatScope) {
  return scope === "pusat" ? "Pusat" : "Regional";
}

function formatPosition(x: number | string | null | undefined, y: number | string | null | undefined) {
  if (x === null || x === undefined || y === null || y === undefined) return "-";
  return `${x}/${y}`;
}

function V4SekretariatRingkasanPage({ scope }: { scope: V4SekretariatScope }) {
  const label = scopeLabel(scope);
  const [rows, setRows] = useState<SummaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getIncomingLetters(scope),
      getOutgoingLetters(scope),
      getSignatures(scope),
      getTemplates(scope),
    ]).then(([incoming, outgoing, signatures, templates]) => {
      const nextError = [incoming.error, outgoing.error, signatures.error, templates.error].filter(Boolean).join(", ");
      const nextRows = [
        { modul: "Surat Masuk", total: incoming.data?.length ?? 0, status: "tersedia" },
        { modul: "Surat Keluar", total: outgoing.data?.length ?? 0, status: "tersedia" },
        { modul: "Asset TTD", total: signatures.data?.length ?? 0, status: "tersedia" },
        { modul: "Template Surat", total: templates.data?.length ?? 0, status: "tersedia" },
      ].filter((item) => item.total > 0);

      setRows(nextRows);
      setError(nextError || null);
      setLoading(false);
    });
  }, [scope]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Ringkasan Surat ${label}`}
        description="Ringkasan aktivitas sekretariat."
      />
      <DataTableShell
        title="Aktivitas Surat"
        description="Ringkasan surat masuk, surat keluar, asset TTD, dan template."
        columns={["Modul", "Total Data", "Status", "Aksi"]}
        rows={rows}
        loading={loading}
        error={error}
        renderRow={(row, index) => {
          const item = row as SummaryItem;

          return (
            <TableRow key={`${item.modul ?? "ringkasan"}-${index}`}>
              <TableCell className="font-medium">{formatText(item.modul)}</TableCell>
              <TableCell>{item.total}</TableCell>
              <TableCell><StatusBadge status={item.status} /></TableCell>
              <DisabledActionCell />
            </TableRow>
          );
        }}
      />
    </div>
  );
}

function V4SuratKeluarPage({ scope }: { scope: V4SekretariatScope }) {
  const label = scopeLabel(scope);
  const [letters, setLetters] = useState<V4LetterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getOutgoingLetters(scope).then((result) => {
      setLetters(result.data ?? []);
      setError(result.error);
      setLoading(false);
    });
  }, [scope]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Surat Keluar ${label}`}
        description="Daftar surat keluar untuk monitoring sekretariat."
      />
      <DataTableShell
        title="Daftar Surat Keluar"
        description="Aksi lanjutan akan segera tersedia."
        columns={["Nomor Surat", "Perihal", "Jenis Naskah", "Penandatangan", "Scope", "Tanggal", "Status", "File Final", "Aksi"]}
        rows={letters}
        loading={loading}
        error={error}
        renderRow={(row, index) => {
          const item = row as V4LetterItem;

          return (
            <TableRow key={item.id || index}>
              <TableCell className="font-medium">{formatText(item.letterNumber)}</TableCell>
              <TableCell>{formatText(item.subject)}</TableCell>
              <TableCell>{formatText(item.documentType)}</TableCell>
              <TableCell>{formatText(item.signerName)}</TableCell>
              <TableCell>{formatText(item.scope)}</TableCell>
              <TableCell>{formatDate(item.letterDate)}</TableCell>
              <TableCell><StatusBadge status={item.status} /></TableCell>
              <TableCell><FileLink href={item.finalFileUrl} label="Unduh" /></TableCell>
              <DisabledActionCell />
            </TableRow>
          );
        }}
      />
    </div>
  );
}

function V4SuratMasukPage({ scope }: { scope: V4SekretariatScope }) {
  const label = scopeLabel(scope);
  const [letters, setLetters] = useState<V4LetterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getIncomingLetters(scope).then((result) => {
      setLetters(result.data ?? []);
      setError(result.error);
      setLoading(false);
    });
  }, [scope]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Surat Masuk ${label}`}
        description="Arsip surat masuk untuk monitoring sekretariat."
      />
      <DataTableShell
        title="Daftar Surat Masuk"
        description="Aksi lanjutan akan segera tersedia."
        columns={["Nomor Surat Asal", "Pengirim", "Perihal", "Tanggal Surat", "Tanggal Diterima", "File Scan", "Status", "Aksi"]}
        rows={letters}
        loading={loading}
        error={error}
        renderRow={(row, index) => {
          const item = row as V4LetterItem;

          return (
            <TableRow key={item.id || index}>
              <TableCell className="font-medium">{formatText(item.originNumber)}</TableCell>
              <TableCell>{formatText(item.senderName)}</TableCell>
              <TableCell>{formatText(item.subject)}</TableCell>
              <TableCell>{formatDate(item.letterDate)}</TableCell>
              <TableCell>{formatDate(item.receivedAt)}</TableCell>
              <TableCell><FileLink href={item.scanFileUrl} label="Unduh" /></TableCell>
              <TableCell><StatusBadge status={item.status} /></TableCell>
              <DisabledActionCell />
            </TableRow>
          );
        }}
      />
    </div>
  );
}

function V4AssetTtdPage({ scope }: { scope: V4SekretariatScope }) {
  const label = scopeLabel(scope);
  const [signatures, setSignatures] = useState<V4SignatureItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getSignatures(scope).then((result) => {
      setSignatures(result.data ?? []);
      setError(result.error);
      setLoading(false);
    });
  }, [scope]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Asset TTD ${label}`}
        description="Daftar asset tanda tangan sekretariat."
      />
      <DataTableShell
        title="Daftar Asset TTD"
        description="Aksi lanjutan akan segera tersedia."
        columns={["Nama Pimpinan", "Jabatan", "Scope", "Preview PNG", "Status Aktif", "Aksi"]}
        rows={signatures}
        loading={loading}
        error={error}
        renderRow={(row, index) => {
          const item = row as V4SignatureItem;

          return (
            <TableRow key={item.id || index}>
              <TableCell className="font-medium">{formatText(item.leaderName)}</TableCell>
              <TableCell>{formatText(item.positionName)}</TableCell>
              <TableCell>{formatText(item.scope)}</TableCell>
              <TableCell><FileLink href={item.imageUrl} label="Unduh" /></TableCell>
              <TableCell><StatusBadge status={item.isActive ? "aktif" : "nonaktif"} /></TableCell>
              <DisabledActionCell />
            </TableRow>
          );
        }}
      />
    </div>
  );
}

function V4TemplateSuratPage({ scope }: { scope: V4SekretariatScope }) {
  const label = scopeLabel(scope);
  const [templates, setTemplates] = useState<V4TemplatePositionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getTemplates(scope).then((result) => {
      setTemplates(result.data ?? []);
      setError(result.error);
      setLoading(false);
    });
  }, [scope]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Pengaturan Template ${label}`}
        description="Pengaturan posisi template surat."
      />
      <DataTableShell
        title="Daftar Template Surat"
        description="Aksi lanjutan akan segera tersedia."
        columns={["Jenis Naskah", "Nomor X/Y", "TTD X/Y", "QR X/Y", "Ukuran Font", "Halaman Target", "Preview Posisi", "Aksi"]}
        rows={templates}
        loading={loading}
        error={error}
        renderRow={(row, index) => {
          const item = row as V4TemplatePositionItem;

          return (
            <TableRow key={item.id || index}>
              <TableCell className="font-medium">{formatText(item.documentType)}</TableCell>
              <TableCell>{formatPosition(item.numberX, item.numberY)}</TableCell>
              <TableCell>{formatPosition(item.signatureX, item.signatureY)}</TableCell>
              <TableCell>{formatPosition(item.qrX, item.qrY)}</TableCell>
              <TableCell>{item.fontSize}</TableCell>
              <TableCell>{item.targetPage}</TableCell>
              <TableCell><StatusBadge status={item.isActive ? "aktif" : "nonaktif"} /></TableCell>
              <DisabledActionCell />
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
