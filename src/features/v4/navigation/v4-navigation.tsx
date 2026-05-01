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
          { label: "Monitoring Regional", icon: BarChart3 },
          { label: "Verifikasi Payment", path: "/pusat/administrasi/verifikasi-payment", icon: WalletCards, enabled: true },
          { label: "Leveling", icon: Medal },
          { label: "Kode Khodim", icon: IdCard },
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
          { label: "QR Validasi", icon: QrCode },
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
          { label: "Surat", icon: FileText },
          { label: "Event", icon: CalendarDays },
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
          { label: "Narasumber", icon: Users },
          { label: "Peserta", icon: Users },
          { label: "Scan", icon: QrCode },
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
          { label: "Daftar Level", icon: Medal },
          { label: "Daftar XP", icon: ShieldCheck },
          { label: "Pengaturan Level/XP", icon: Settings },
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
          { label: "Daftar File", icon: FolderOpen },
          { label: "Upload File", icon: Upload },
          { label: "Pengaturan", icon: Settings },
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
          { label: "Profil", icon: Settings },
          { label: "Tim Pusat", icon: Users },
          { label: "Tim Regional", icon: Users },
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
          { label: "Monitoring Lembaga", icon: Building2 },
          { label: "Leveling Wilayah", icon: Medal },
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
          { label: "QR Validasi", icon: QrCode },
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
          { label: "Peserta", icon: Users },
          { label: "Scan", icon: QrCode },
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
          { label: "Daftar XP", icon: ShieldCheck },
          { label: "Peringkat Wilayah", icon: Medal },
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
          { label: "Daftar File", icon: FolderOpen },
          { label: "Upload File", icon: Upload },
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
          { label: "Profil", icon: Settings },
          { label: "Tim Regional", icon: Users },
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
