import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DataTableShell, DisabledActionCell, PageHeader, StatusBadge } from "../components/v4-components";
import {
  getPusatMasterData,
  getRegionalMasterData,
  type V4MasterCrew,
  type V4MasterProfile,
} from "../services/master-data.service";
import { formatText } from "../utils";

type MasterScope = "pusat" | "regional";
type MasterType = "pesantren" | "media" | "kru";

interface V4InstitutionRow {
  id: string;
  nip: string | null;
  name: string | null;
  regional: string | null;
  city: string | null;
  status: string | null;
  paymentStatus: string | null;
  profileLevel: string | null;
}

interface V4CrewRow {
  id: string;
  niam: string | null;
  name: string | null;
  roleCode: string | null;
  jabatan: string | null;
  xpLevel: number | null;
  institutionName: string | null;
  regional: string | null;
  status: string | null;
}

interface V4MediaRow {
  id: string;
  name: string | null;
  institutionName: string | null;
  coordinatorCrewId: string | null;
  coordinatorName: string | null;
  regional: string | null;
  status: string | null;
}

type MasterRow = V4InstitutionRow | V4CrewRow | V4MediaRow;

const statusOptions = ["all", "active", "pending", "inactive", "verified", "paid"];

function normalizeLabel(value: string | number | null | undefined) {
  return formatText(value).replace(/_/g, " ");
}

function RelationLink({
  scope,
  id,
  children,
}: {
  scope: MasterScope;
  id: string;
  children: string;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to={`/${scope}/master-data/kru?crew=${id}`}
            className="font-medium text-primary underline-offset-4 transition-colors hover:text-primary/80 hover:underline"
          >
            {children}
          </Link>
        </TooltipTrigger>
        <TooltipContent>Lihat profil kru</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function MasterFilterSelect({
  value,
  onValueChange,
  options,
  label,
  placeholder,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: string[];
  label: string;
  placeholder: string;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="h-9 w-full sm:w-44">
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option === "all" ? placeholder : normalizeLabel(option)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function getTitle(scope: MasterScope, type: MasterType) {
  const prefix = scope === "pusat" ? "Pusat" : "Regional";
  if (type === "pesantren") return `Master Pesantren ${prefix}`;
  if (type === "media") return `Master Media ${prefix}`;
  return `Master Kru ${prefix}`;
}

function mapInstitution(profile: V4MasterProfile): V4InstitutionRow {
  return {
    id: profile.id,
    nip: profile.nip,
    name: profile.nama_pesantren,
    regional: profile.region_name ?? null,
    city: profile.city_name ?? null,
    status: profile.status_account,
    paymentStatus: profile.status_payment ?? null,
    profileLevel: profile.profile_level,
  };
}

function mapCrew(crew: V4MasterCrew): V4CrewRow {
  return {
    id: crew.id,
    niam: crew.niam,
    name: crew.nama,
    roleCode: crew.jabatan,
    jabatan: crew.jabatan,
    xpLevel: crew.xp_level,
    institutionName: crew.pesantren_name,
    regional: crew.region_name ?? null,
    status: crew.niam ? "active" : "pending",
  };
}

function findCoordinator(profile: V4MasterProfile, crews: V4MasterCrew[]) {
  const pesantrenName = profile.nama_pesantren?.toLowerCase();
  if (!pesantrenName) return null;

  return (
    crews.find((crew) => {
      const sameInstitution = crew.pesantren_name?.toLowerCase() === pesantrenName;
      const isCoordinator = crew.jabatan?.toLowerCase().includes("koordinator") ?? false;
      return sameInstitution && isCoordinator;
    }) ?? null
  );
}

function mapMedia(profile: V4MasterProfile, crews: V4MasterCrew[]): V4MediaRow | null {
  if (!profile.nama_media) return null;

  const coordinator = findCoordinator(profile, crews);

  return {
    id: profile.id,
    name: profile.nama_media,
    institutionName: profile.nama_pesantren,
    coordinatorCrewId: coordinator?.id ?? null,
    coordinatorName: coordinator?.nama ?? null,
    regional: profile.region_name ?? null,
    status: profile.status_account,
  };
}

function rowMatchesSearch(row: MasterRow, search: string) {
  if (!search) return true;

  const normalizedSearch = search.toLowerCase();
  return Object.values(row).some((value) => String(value ?? "").toLowerCase().includes(normalizedSearch));
}

function getRowStatus(row: MasterRow) {
  return row.status;
}

function getRowRegional(row: MasterRow) {
  return row.regional;
}

function getRows(type: MasterType, profiles: V4MasterProfile[], crews: V4MasterCrew[]) {
  if (type === "kru") {
    return crews.map(mapCrew);
  }

  if (type === "media") {
    return profiles.map((profile) => mapMedia(profile, crews)).filter((row): row is V4MediaRow => Boolean(row));
  }

  return profiles.map(mapInstitution);
}

function V4MasterDataPage({ scope, type }: { scope: MasterScope; type: MasterType }) {
  const [searchParams] = useSearchParams();
  const activeCrewRowRef = useRef<HTMLTableRowElement | null>(null);
  const [profiles, setProfiles] = useState<V4MasterProfile[]>([]);
  const [crews, setCrews] = useState<V4MasterCrew[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [regionalFilter, setRegionalFilter] = useState("all");
  const activeCrewId = searchParams.get("crew");
  const title = getTitle(scope, type);

  const loadData = useCallback(() => {
    setLoading(true);
    setError(null);

    const request = scope === "pusat" ? getPusatMasterData() : getRegionalMasterData();

    request.then((result) => {
      setProfiles(result.data?.profiles ?? []);
      setCrews(result.data?.crews ?? []);
      setError(result.error);
      setLoading(false);
    });
  }, [scope]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const baseRows = useMemo(() => getRows(type, profiles, crews), [crews, profiles, type]);
  const regionalOptions = useMemo(
    () => [
      "all",
      ...Array.from(
        new Set(
          profiles
            .map((profile) => profile.region_name)
            .filter((region): region is string => Boolean(region)),
        ),
      ),
    ],
    [profiles],
  );
  const rows = useMemo(
    () =>
      baseRows.filter((row) => {
        const matchesSearch = rowMatchesSearch(row, search);
        const matchesStatus = statusFilter === "all" || getRowStatus(row) === statusFilter;
        const matchesRegional = scope !== "pusat" || regionalFilter === "all" || getRowRegional(row) === regionalFilter;

        return matchesSearch && matchesStatus && matchesRegional;
      }),
    [baseRows, regionalFilter, scope, search, statusFilter],
  );

  useEffect(() => {
    if (type !== "kru" || !activeCrewId) {
      return;
    }

    activeCrewRowRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [activeCrewId, rows, type]);

  const filters = (
    <>
      <MasterFilterSelect
        value={statusFilter}
        onValueChange={setStatusFilter}
        options={statusOptions}
        label="Filter Status"
        placeholder="Semua"
      />
      {scope === "pusat" && (
        <MasterFilterSelect
          value={regionalFilter}
          onValueChange={setRegionalFilter}
          options={regionalOptions}
          label="Filter Regional"
          placeholder="Semua"
        />
      )}
    </>
  );

  return (
    <div className="space-y-6">
      <PageHeader title={title} description="Data master untuk monitoring dan validasi." />
      {type === "kru" ? (
        <DataTableShell
          title="Daftar Kru"
          description="Aksi lanjutan akan segera tersedia."
          columns={["NIAM", "Nama", "Jabatan", "Pesantren", "Regional", "XP", "Status", "Aksi"]}
          rows={rows}
          loading={loading}
          error={error}
          onRetry={loadData}
          enableSearch
          searchPlaceholder="Cari kru"
          searchValue={search}
          onSearchChange={setSearch}
          headerRight={filters}
          emptyType="no_data"
          renderRow={(row, index) => {
            const item = row as V4CrewRow;
            const isActiveCrew = activeCrewId === item.id;

            return (
              <TableRow
                ref={isActiveCrew ? activeCrewRowRef : undefined}
                key={item.id || index}
                className={isActiveCrew ? "bg-primary/10 ring-1 ring-inset ring-primary/20" : undefined}
              >
                <TableCell className="font-medium">{formatText(item.niam)}</TableCell>
                <TableCell>
                  <RelationLink scope={scope} id={item.id}>{formatText(item.name)}</RelationLink>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-muted/40 text-xs font-medium">
                    {formatText(item.roleCode)}
                  </Badge>
                </TableCell>
                <TableCell>{formatText(item.institutionName)}</TableCell>
                <TableCell>{formatText(item.regional)}</TableCell>
                <TableCell>{formatText(item.xpLevel)}</TableCell>
                <TableCell>
                  <StatusBadge status={item.status} />
                </TableCell>
                <DisabledActionCell />
              </TableRow>
            );
          }}
        />
      ) : type === "media" ? (
        <DataTableShell
          title="Daftar Media"
          description="Aksi lanjutan akan segera tersedia."
          columns={["Nama Media", "Pesantren", "Koordinator", "Regional", "Status", "Aksi"]}
          rows={rows}
          loading={loading}
          error={error}
          onRetry={loadData}
          enableSearch
          searchPlaceholder="Cari media"
          searchValue={search}
          onSearchChange={setSearch}
          headerRight={filters}
          emptyType="no_data"
          renderRow={(row, index) => {
            const item = row as V4MediaRow;

            return (
              <TableRow key={item.id || index}>
                <TableCell className="font-medium">{formatText(item.name)}</TableCell>
                <TableCell>{formatText(item.institutionName)}</TableCell>
                <TableCell>
                  {item.coordinatorCrewId ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <RelationLink scope={scope} id={item.coordinatorCrewId}>{formatText(item.coordinatorName)}</RelationLink>
                      <Badge variant="outline" className="bg-primary/10 text-xs font-medium text-primary">
                        Koordinator
                      </Badge>
                    </div>
                  ) : (
                    formatText(null)
                  )}
                </TableCell>
                <TableCell>{formatText(item.regional)}</TableCell>
                <TableCell>
                  <StatusBadge status={item.status} />
                </TableCell>
                <DisabledActionCell />
              </TableRow>
            );
          }}
        />
      ) : (
        <DataTableShell
          title="Daftar Pesantren"
          description="Aksi lanjutan akan segera tersedia."
          columns={["NIP", "Nama", "Regional", "Kota", "Status Akun", "Status Payment", "Level", "Aksi"]}
          rows={rows}
          loading={loading}
          error={error}
          onRetry={loadData}
          enableSearch
          searchPlaceholder="Cari pesantren"
          searchValue={search}
          onSearchChange={setSearch}
          headerRight={filters}
          emptyType="no_data"
          renderRow={(row, index) => {
            const item = row as V4InstitutionRow;

            return (
              <TableRow key={item.id || index}>
                <TableCell>{formatText(item.nip)}</TableCell>
                <TableCell className="font-medium">{formatText(item.name)}</TableCell>
                <TableCell>{formatText(item.regional)}</TableCell>
                <TableCell>{formatText(item.city)}</TableCell>
                <TableCell>
                  <StatusBadge status={item.status} />
                </TableCell>
                <TableCell>
                  <StatusBadge status={item.paymentStatus} />
                </TableCell>
                <TableCell className="capitalize">{normalizeLabel(item.profileLevel)}</TableCell>
                <DisabledActionCell />
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
