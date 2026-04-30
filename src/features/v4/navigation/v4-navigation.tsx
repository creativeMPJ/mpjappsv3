import {
  Archive,
  BarChart3,
  Building2,
  CalendarDays,
  FileSignature,
  FileText,
  FolderOpen,
  Globe,
  Home,
  IdCard,
  Medal,
  QrCode,
  Settings,
  ShieldCheck,
  Upload,
  Users,
  WalletCards,
} from "lucide-react";

export type V4Role = "pusat" | "regional";

export interface NavItem {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  path?: string;
  children?: NavItem[];
  enabled?: boolean;
}

export interface V4NavGroup {
  label: string;
  items: NavItem[];
}

export const pusatNav: V4NavGroup[] = [
  {
    label: "Utama",
    items: [{ label: "Beranda", path: "/pusat/beranda", icon: Home, enabled: true }],
  },
  {
    label: "Administrasi",
    items: [
      {
        label: "Administrasi",
        icon: BarChart3,
        children: [
          { label: "Monitoring Regional", path: "/pusat/administrasi/monitoring-regional", icon: BarChart3 },
          { label: "Verifikasi Payment", path: "/pusat/administrasi/verifikasi-payment", icon: WalletCards, enabled: true },
          { label: "Leveling", path: "/pusat/administrasi/leveling", icon: Medal },
          { label: "Kode Khodim", path: "/pusat/administrasi/kode-khodim", icon: IdCard },
        ],
      },
    ],
  },
  {
    label: "Sekretariat",
    items: [
      {
        label: "Sekretariat",
        path: "/pusat/sekretariat",
        icon: FileText,
        enabled: true,
        children: [
          { label: "Ringkasan Surat", path: "/pusat/sekretariat", icon: FileText, enabled: true },
          { label: "Surat Masuk", path: "/pusat/sekretariat/surat-masuk", icon: Archive, enabled: true },
          { label: "Surat Keluar", path: "/pusat/sekretariat/surat-keluar", icon: FileSignature, enabled: true },
          { label: "Asset TTD", path: "/pusat/sekretariat/asset-ttd", icon: Upload, enabled: true },
          { label: "Pengaturan Template", path: "/pusat/sekretariat/pengaturan-template", icon: Settings, enabled: true },
        ],
      },
    ],
  },
  {
    label: "Master Data",
    items: [
      {
        label: "Master Data",
        icon: Building2,
        children: [
          { label: "Pesantren", path: "/pusat/master-data/pesantren", icon: Building2, enabled: true },
          { label: "Media", path: "/pusat/master-data/media", icon: Globe, enabled: true },
          { label: "Kru", path: "/pusat/master-data/kru", icon: Users, enabled: true },
          { label: "Surat", path: "/pusat/master-data/surat", icon: FileText },
          { label: "Event", path: "/pusat/master-data/event", icon: CalendarDays },
        ],
      },
    ],
  },
  {
    label: "Manajemen Event",
    items: [
      {
        label: "Manajemen Event",
        icon: CalendarDays,
        children: [
          { label: "Daftar Event", path: "/pusat/event/daftar", icon: CalendarDays, enabled: true },
          { label: "Narasumber", path: "/pusat/event/narasumber", icon: Users },
          { label: "Peserta", path: "/pusat/event/peserta", icon: Users },
          { label: "Scan", path: "/pusat/event/scan", icon: QrCode },
        ],
      },
    ],
  },
  {
    label: "Manajemen Militansi",
    items: [
      {
        label: "Manajemen Militansi",
        icon: Medal,
        children: [
          { label: "Daftar Level", path: "/pusat/militansi/level", icon: Medal },
          { label: "Daftar XP", path: "/pusat/militansi/xp", icon: ShieldCheck },
          { label: "Pengaturan Level/XP", path: "/pusat/militansi/pengaturan", icon: Settings },
        ],
      },
    ],
  },
  {
    label: "MPJ Hub",
    items: [
      {
        label: "MPJ Hub",
        icon: FolderOpen,
        children: [
          { label: "Daftar File", path: "/pusat/hub/file", icon: FolderOpen },
          { label: "Upload File", path: "/pusat/hub/upload", icon: Upload },
          { label: "Pengaturan", path: "/pusat/hub/pengaturan", icon: Settings },
        ],
      },
    ],
  },
  {
    label: "Pengaturan",
    items: [
      {
        label: "Pengaturan",
        icon: Settings,
        children: [
          { label: "Profil", path: "/pusat/pengaturan/profil", icon: Settings },
          { label: "Tim Pusat", path: "/pusat/pengaturan/tim-pusat", icon: Users },
          { label: "Tim Regional", path: "/pusat/pengaturan/tim-regional", icon: Users },
        ],
      },
    ],
  },
];

export const regionalNav: V4NavGroup[] = [
  {
    label: "Utama",
    items: [{ label: "Beranda", path: "/regional/beranda", icon: Home, enabled: true }],
  },
  {
    label: "Administrasi",
    items: [
      {
        label: "Administrasi",
        icon: BarChart3,
        children: [
          { label: "Monitoring Pendaftaran", path: "/regional/administrasi/monitoring-pendaftaran", icon: BarChart3, enabled: true },
          { label: "Monitoring Lembaga", path: "/regional/administrasi/monitoring-lembaga", icon: Building2 },
          { label: "Leveling Wilayah", path: "/regional/administrasi/leveling-wilayah", icon: Medal },
        ],
      },
    ],
  },
  {
    label: "Sekretariat",
    items: [
      {
        label: "Sekretariat",
        path: "/regional/sekretariat",
        icon: FileText,
        enabled: true,
        children: [
          { label: "Ringkasan Surat", path: "/regional/sekretariat", icon: FileText, enabled: true },
          { label: "Surat Masuk", path: "/regional/sekretariat/surat-masuk", icon: Archive, enabled: true },
          { label: "Surat Keluar", path: "/regional/sekretariat/surat-keluar", icon: FileSignature, enabled: true },
          { label: "Asset TTD", path: "/regional/sekretariat/asset-ttd", icon: Upload, enabled: true },
          { label: "Pengaturan Template", path: "/regional/sekretariat/pengaturan-template", icon: Settings, enabled: true },
        ],
      },
    ],
  },
  {
    label: "Master Data",
    items: [
      {
        label: "Master Data",
        icon: Building2,
        children: [
          { label: "Pesantren", path: "/regional/master-data/pesantren", icon: Building2, enabled: true },
          { label: "Media", path: "/regional/master-data/media", icon: Globe, enabled: true },
          { label: "Kru", path: "/regional/master-data/kru", icon: Users, enabled: true },
        ],
      },
    ],
  },
  {
    label: "Manajemen Event",
    items: [
      {
        label: "Manajemen Event",
        icon: CalendarDays,
        children: [
          { label: "Daftar Event", path: "/regional/event/daftar", icon: CalendarDays, enabled: true },
          { label: "Peserta", path: "/regional/event/peserta", icon: Users },
          { label: "Scan", path: "/regional/event/scan", icon: QrCode },
        ],
      },
    ],
  },
  {
    label: "Monitoring Militansi",
    items: [
      {
        label: "Monitoring Militansi",
        icon: ShieldCheck,
        children: [
          { label: "Daftar XP", path: "/regional/militansi/xp", icon: ShieldCheck },
          { label: "Peringkat Wilayah", path: "/regional/militansi/peringkat", icon: Medal },
        ],
      },
    ],
  },
  {
    label: "MPJ Hub",
    items: [
      {
        label: "MPJ Hub",
        icon: FolderOpen,
        children: [
          { label: "Daftar File", path: "/regional/hub/file", icon: FolderOpen },
          { label: "Upload File", path: "/regional/hub/upload", icon: Upload },
        ],
      },
    ],
  },
  {
    label: "Pengaturan",
    items: [
      {
        label: "Pengaturan",
        icon: Settings,
        children: [
          { label: "Profil", path: "/regional/pengaturan/profil", icon: Settings },
          { label: "Tim Regional", path: "/regional/pengaturan/tim-regional", icon: Users },
        ],
      },
    ],
  },
];

export function isV4NavItemActive(item: NavItem, pathname: string): boolean {
  const selfActive = item.path ? pathname === item.path || pathname.startsWith(`${item.path}/`) : false;
  return selfActive || Boolean(item.children?.some((child) => isV4NavItemActive(child, pathname)));
}

export function findV4NavItem(role: V4Role, pathname: string): NavItem | undefined {
  const groups = role === "pusat" ? pusatNav : regionalNav;
  const matches = groups
    .flatMap((group) => group.items)
    .flatMap((item) => findMatchingItems(item, pathname));

  return matches.sort((a, b) => getPathLength(b) - getPathLength(a))[0];
}

function findMatchingItems(item: NavItem, pathname: string): NavItem[] {
  const matches = isV4NavItemActive(item, pathname) ? [item] : [];
  const childMatches = item.children?.flatMap((child) => findMatchingItems(child, pathname)) ?? [];
  return [...matches, ...childMatches];
}

function getPathLength(item: NavItem) {
  return item.path?.length ?? 0;
}
