import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { DataTableShell, PageHeader, StatusBadge } from "../components/v4-components";
import { formatText } from "../utils";

type MasterScope = "pusat" | "regional";
type MasterType = "pesantren" | "media" | "kru";

interface V4Institution {
  id: string;
  nip: string;
  name: string;
  regional: string;
  status: string;
  profileLevel: string;
}

interface V4Crew {
  id: string;
  niam: string;
  name: string;
  roleCode: string;
  jabatan: string;
  status: string;
  institutionId: string;
  regional: string;
}

interface V4Media {
  id: string;
  name: string;
  institutionId: string;
  institutionName: string;
  coordinatorCrewId: string;
  status: string;
  regional: string;
}

const ACTIVE_REGIONAL = "Jawa Timur 1";

const institution: V4Institution[] = [
  {
    id: "inst-001",
    nip: "3525010001",
    name: "Pesantren Al Hikmah",
    regional: "Jawa Timur 1",
    status: "active",
    profileLevel: "gold",
  },
  {
    id: "inst-002",
    nip: "3578010002",
    name: "Pesantren Nurul Falah",
    regional: "Jawa Timur 1",
    status: "pending",
    profileLevel: "silver",
  },
  {
    id: "inst-003",
    nip: "3204010003",
    name: "Pesantren Darussalam",
    regional: "Jawa Barat",
    status: "active",
    profileLevel: "platinum",
  },
  {
    id: "inst-004",
    nip: "3374010004",
    name: "Pesantren Miftahul Ulum",
    regional: "Jawa Tengah",
    status: "inactive",
    profileLevel: "basic",
  },
];

const crew: V4Crew[] = [
  {
    id: "crew-001",
    niam: "NIAM-352501-001",
    name: "Ahmad Fauzi",
    roleCode: "media_lead",
    jabatan: "Koordinator Media",
    status: "active",
    institutionId: "inst-001",
    regional: "Jawa Timur 1",
  },
  {
    id: "crew-002",
    niam: "NIAM-352501-002",
    name: "Siti Aminah",
    roleCode: "content_creator",
    jabatan: "Kreator Konten",
    status: "active",
    institutionId: "inst-001",
    regional: "Jawa Timur 1",
  },
  {
    id: "crew-003",
    niam: "NIAM-357801-003",
    name: "Muhammad Rizqi",
    roleCode: "editor",
    jabatan: "Editor",
    status: "pending",
    institutionId: "inst-002",
    regional: "Jawa Timur 1",
  },
  {
    id: "crew-004",
    niam: "NIAM-320401-004",
    name: "Hasan Basri",
    roleCode: "media_lead",
    jabatan: "Koordinator Media",
    status: "active",
    institutionId: "inst-003",
    regional: "Jawa Barat",
  },
];

const media: V4Media[] = [
  {
    id: "media-001",
    name: "Al Hikmah Media",
    institutionId: "inst-001",
    institutionName: "Pesantren Al Hikmah",
    coordinatorCrewId: "crew-001",
    status: "active",
    regional: "Jawa Timur 1",
  },
  {
    id: "media-002",
    name: "Nurul Falah TV",
    institutionId: "inst-002",
    institutionName: "Pesantren Nurul Falah",
    coordinatorCrewId: "crew-003",
    status: "pending",
    regional: "Jawa Timur 1",
  },
  {
    id: "media-003",
    name: "Darussalam Channel",
    institutionId: "inst-003",
    institutionName: "Pesantren Darussalam",
    coordinatorCrewId: "crew-004",
    status: "active",
    regional: "Jawa Barat",
  },
];

const statusOptions = ["all", "active", "pending", "inactive"];

function normalizeLabel(value: string | null | undefined) {
  return formatText(value).replace(/_/g, " ");
}

function ActionCell() {
  return (
    <TableCell className="text-right">
      <div className="flex justify-end gap-2">
        <Button size="sm" disabled>
          Segera Hadir
        </Button>
      </div>
    </TableCell>
  );
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

function getRows(scope: MasterScope, type: MasterType) {
  const isRegional = scope === "regional";

  if (type === "kru") {
    return isRegional ? crew.filter((item) => item.regional === ACTIVE_REGIONAL) : crew;
  }

  if (type === "media") {
    return isRegional ? [] : media;
  }

  return isRegional ? institution.filter((item) => item.regional === ACTIVE_REGIONAL) : institution;
}

function rowMatchesSearch(row: V4Institution | V4Crew | V4Media, search: string) {
  if (!search) return true;

  const normalizedSearch = search.toLowerCase();
  return Object.values(row).some((value) => String(value).toLowerCase().includes(normalizedSearch));
}

function getRowStatus(row: V4Institution | V4Crew | V4Media) {
  return row.status;
}

function getRowRegional(row: V4Institution | V4Crew | V4Media) {
  return row.regional;
}

function getCrewById(id: string) {
  return crew.find((item) => item.id === id) ?? null;
}

function V4MasterDataPage({ scope, type }: { scope: MasterScope; type: MasterType }) {
  const [searchParams] = useSearchParams();
  const activeCrewRowRef = useRef<HTMLTableRowElement | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [regionalFilter, setRegionalFilter] = useState("all");
  const activeCrewId = searchParams.get("crew");
  const isInactiveRegionalMedia = scope === "regional" && type === "media";
  const title = getTitle(scope, type);

  const baseRows = useMemo(() => getRows(scope, type), [scope, type]);
  const regionalOptions = useMemo(
    () => ["all", ...Array.from(new Set(institution.map((item) => item.regional)))],
    [],
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

  if (isInactiveRegionalMedia) {
    return (
      <div className="space-y-6">
        <PageHeader title={title} description="Master Media Regional belum tersedia pada V4." />
        <DataTableShell
          title="Daftar Media"
          description="Fitur ini belum aktif untuk admin regional."
          columns={["Nama Media", "Pesantren", "Koordinator", "Status", "Aksi"]}
          rows={[]}
          emptyType="not_active"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={title} description="Data mock V4 read-only. Siap disambungkan ke backend." />
      {type === "kru" ? (
        <DataTableShell
          title="Daftar Kru"
          description="Source data: crew"
          columns={["NIAM", "Nama", "RoleCode", "Jabatan", "Status", "Aksi"]}
          rows={rows}
          enableSearch
          searchPlaceholder="Cari kru"
          searchValue={search}
          onSearchChange={setSearch}
          headerRight={filters}
          emptyType="no_data"
          renderRow={(row, index) => {
            const item = row as V4Crew;
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
                <TableCell>{formatText(item.jabatan)}</TableCell>
                <TableCell>
                  <StatusBadge status={item.status} />
                </TableCell>
                <ActionCell />
              </TableRow>
            );
          }}
        />
      ) : type === "media" ? (
        <DataTableShell
          title="Daftar Media"
          description="Source data: media"
          columns={["Nama Media", "Pesantren", "Koordinator", "Status", "Aksi"]}
          rows={rows}
          enableSearch
          searchPlaceholder="Cari media"
          searchValue={search}
          onSearchChange={setSearch}
          headerRight={filters}
          emptyType="no_data"
          renderRow={(row, index) => {
            const item = row as V4Media;
            const coordinator = getCrewById(item.coordinatorCrewId);

            return (
              <TableRow key={item.id || index}>
                <TableCell className="font-medium text-muted-foreground">{formatText(item.name)}</TableCell>
                <TableCell>{formatText(item.institutionName)}</TableCell>
                <TableCell>
                  {coordinator ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <RelationLink scope={scope} id={coordinator.id}>{formatText(coordinator.name)}</RelationLink>
                      <Badge variant="outline" className="bg-primary/10 text-xs font-medium text-primary">
                        Koordinator
                      </Badge>
                    </div>
                  ) : (
                    formatText(null)
                  )}
                </TableCell>
                <TableCell>
                  <StatusBadge status={item.status} />
                </TableCell>
                <ActionCell />
              </TableRow>
            );
          }}
        />
      ) : (
        <DataTableShell
          title="Daftar Pesantren"
          description="Source data: institution"
          columns={["NIP", "Nama", "Regional", "Status", "Level", "Aksi"]}
          rows={rows}
          enableSearch
          searchPlaceholder="Cari pesantren"
          searchValue={search}
          onSearchChange={setSearch}
          headerRight={filters}
          emptyType="no_data"
          renderRow={(row, index) => {
            const item = row as V4Institution;

            return (
              <TableRow key={item.id || index}>
                <TableCell>{formatText(item.nip)}</TableCell>
                <TableCell className="font-medium">{formatText(item.name)}</TableCell>
                <TableCell>{formatText(item.regional)}</TableCell>
                <TableCell>
                  <StatusBadge status={item.status} />
                </TableCell>
                <TableCell className="capitalize">{normalizeLabel(item.profileLevel)}</TableCell>
                <ActionCell />
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
