import { useEffect, useMemo, useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { DataTableShell, PageHeader, StatusBadge } from "../components/v4-components";
import {
  getPusatMasterData,
  getRegionalMasterData,
  type V4MasterCrew,
  type V4MasterProfile,
} from "../services/master-data.service";

type MasterScope = "pusat" | "regional";
type MasterType = "pesantren" | "media" | "kru";

interface MasterDataState {
  profiles: V4MasterProfile[];
  crews: V4MasterCrew[];
}

function formatText(value: string | number | null | undefined) {
  if (typeof value === "number") return String(value);
  return value && value.trim() ? value : "-";
}

function normalizeLabel(value: string | null | undefined) {
  return formatText(value).replace(/_/g, " ");
}

function getTitle(scope: MasterScope, type: MasterType) {
  const prefix = scope === "pusat" ? "Pusat" : "Regional";
  if (type === "pesantren") return `Master Pesantren ${prefix}`;
  if (type === "media") return `Master Media ${prefix}`;
  return `Master Kru ${prefix}`;
}

function getDescription(scope: MasterScope, type: MasterType) {
  const source = scope === "pusat" ? "/api/admin/master-data" : "/api/regional/master-data";
  if (type === "pesantren") return `Data pesantren read-only dari ${source}.`;
  if (type === "media") return `Data media read-only dari ${source}.`;
  return `Data kru read-only dari ${source}.`;
}

function V4MasterDataPage({ scope, type }: { scope: MasterScope; type: MasterType }) {
  const [data, setData] = useState<MasterDataState>({ profiles: [], crews: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loader = scope === "pusat" ? getPusatMasterData : getRegionalMasterData;

    loader().then((result) => {
      setData({
        profiles: result.data?.profiles ?? [],
        crews: result.data?.crews ?? [],
      });
      setError(result.error);
      setLoading(false);
    });
  }, [scope]);

  const rows = useMemo(() => {
    if (type === "kru") return data.crews;
    if (type === "media") return data.profiles.filter((profile) => Boolean(profile.nama_media));
    return data.profiles;
  }, [data.crews, data.profiles, type]);

  const title = getTitle(scope, type);

  return (
    <div className="space-y-6">
      <PageHeader title={title} description={getDescription(scope, type)} />
      {type === "kru" ? (
        <DataTableShell
          title="Daftar Kru"
          description="Mode read-only. Create, edit, dan delete belum diaktifkan."
          columns={["Nama", "NIAM", "Jabatan", "Pesantren", "Wilayah", "XP"]}
          rows={rows}
          loading={loading}
          error={error}
          renderRow={(row, index) => {
            const crew = row as V4MasterCrew;

            return (
              <TableRow key={crew.id || index}>
                <TableCell className="font-medium">{formatText(crew.nama)}</TableCell>
                <TableCell>{formatText(crew.niam)}</TableCell>
                <TableCell>{formatText(crew.jabatan)}</TableCell>
                <TableCell>{formatText(crew.pesantren_name)}</TableCell>
                <TableCell>{formatText(crew.region_name)}</TableCell>
                <TableCell>{formatText(crew.xp_level)}</TableCell>
              </TableRow>
            );
          }}
        />
      ) : (
        <DataTableShell
          title={type === "media" ? "Daftar Media" : "Daftar Pesantren"}
          description="Mode read-only. Create, edit, dan delete belum diaktifkan."
          columns={type === "media"
            ? ["Nama Media", "Pesantren", "NIP", "Wilayah/Kota", "Status", "Kontak"]
            : ["Nama Pesantren", "NIP", "Pengasuh", "Wilayah/Kota", "Level", "Status", "Kontak"]}
          rows={rows}
          loading={loading}
          error={error}
          renderRow={(row, index) => {
            const profile = row as V4MasterProfile;
            const location = [profile.region_name, profile.city_name].filter(Boolean).join(" / ");

            if (type === "media") {
              return (
                <TableRow key={profile.id || index}>
                  <TableCell className="font-medium">{formatText(profile.nama_media)}</TableCell>
                  <TableCell>{formatText(profile.nama_pesantren)}</TableCell>
                  <TableCell>{formatText(profile.nip)}</TableCell>
                  <TableCell>{formatText(location)}</TableCell>
                  <TableCell><StatusBadge status={profile.status_account} /></TableCell>
                  <TableCell>{formatText(profile.no_wa_pendaftar)}</TableCell>
                </TableRow>
              );
            }

            return (
              <TableRow key={profile.id || index}>
                <TableCell className="font-medium">{formatText(profile.nama_pesantren)}</TableCell>
                <TableCell>{formatText(profile.nip)}</TableCell>
                <TableCell>{formatText(profile.nama_pengasuh)}</TableCell>
                <TableCell>{formatText(location)}</TableCell>
                <TableCell className="capitalize">{normalizeLabel(profile.profile_level)}</TableCell>
                <TableCell><StatusBadge status={profile.status_account} /></TableCell>
                <TableCell>{formatText(profile.no_wa_pendaftar)}</TableCell>
              </TableRow>
            );
          }}
        />
      )}
    </div>
  );
}

export function PusatMasterPesantrenPage() {
  return <V4MasterDataPage scope="pusat" type="pesantren" />;
}

export function PusatMasterMediaPage() {
  return <V4MasterDataPage scope="pusat" type="media" />;
}

export function PusatMasterKruPage() {
  return <V4MasterDataPage scope="pusat" type="kru" />;
}

export function RegionalMasterPesantrenPage() {
  return <V4MasterDataPage scope="regional" type="pesantren" />;
}

export function RegionalMasterMediaPage() {
  return <V4MasterDataPage scope="regional" type="media" />;
}

export function RegionalMasterKruPage() {
  return <V4MasterDataPage scope="regional" type="kru" />;
}
