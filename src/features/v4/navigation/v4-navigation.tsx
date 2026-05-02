import {
  Archive,
  BarChart3,
  Building2,
  CalendarDays,
  ClipboardList,
  FileSignature,
  FileText,
  FolderOpen,
  Globe,
  Home,
  IdCard,
  Medal,
  Map,
  QrCode,
  Settings,
  ShieldCheck,
  User,
  UserCog,
  Users,
  WalletCards,
  Upload,
} from "lucide-react";

export type V4Role = "pusat" | "regional" | "finance" | "media" | "crew";

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
        path: "/pusat/administrasi",
        icon: ClipboardList,
        enabled: true,
        children: [
          { label: "Pendaftaran Pesantren", path: "/pusat/administrasi/pendaftaran", icon: Building2, enabled: true },
          { label: "Klaim Akun", path: "/pusat/administrasi/klaim-akun", icon: IdCard, enabled: true },
          { label: "Verifikasi Payment", path: "/pusat/administrasi/verifikasi-payment", icon: WalletCards, enabled: true },
          { label: "Monitoring Aktivasi", path: "/pusat/administrasi/monitoring-aktivasi", icon: ShieldCheck, enabled: true },
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
        path: "/pusat/master-data",
        icon: Building2,
        enabled: true,
        children: [
          { label: "Pesantren", path: "/pusat/master-data/pesantren", icon: Building2, enabled: true },
          { label: "Media", path: "/pusat/master-data/media", icon: Globe, enabled: true },
          { label: "Kru", path: "/pusat/master-data/kru", icon: Users, enabled: true },
        ],
      },
    ],
  },
  {
    label: "Event",
    items: [{ label: "Event", path: "/pusat/event", icon: CalendarDays, enabled: true }],
  },
  {
    label: "Militansi",
    items: [
      {
        label: "Militansi",
        path: "/pusat/militansi",
        icon: Medal,
        enabled: true,
        children: [
          { label: "Daftar Level", icon: Medal, enabled: false },
          { label: "Daftar XP", icon: ShieldCheck, enabled: false },
          { label: "Pengaturan Level/XP", icon: Settings, enabled: false },
        ],
      },
    ],
  },
  {
    label: "MPJ Hub",
    items: [
      {
        label: "MPJ Hub",
        path: "/pusat/mpj-hub",
        icon: FolderOpen,
        enabled: true,
        children: [
          { label: "Daftar File", icon: FolderOpen, enabled: false },
          { label: "Upload File", icon: Upload, enabled: false },
          { label: "Pengaturan", icon: Settings, enabled: false },
        ],
      },
    ],
  },
  {
    label: "Pengaturan",
    items: [
      {
        label: "Pengaturan",
        path: "/pusat/pengaturan",
        icon: Settings,
        enabled: true,
        children: [
          { label: "Regional", path: "/pusat/pengaturan/regional", icon: Map, enabled: true },
          { label: "Kode Khodim", path: "/pusat/pengaturan/kode-khodim", icon: IdCard, enabled: true },
          { label: "Leveling", path: "/pusat/pengaturan/leveling", icon: Medal, enabled: true },
          { label: "Paket / Slot", path: "/pusat/pengaturan/paket-slot", icon: WalletCards, enabled: true },
          { label: "Admin & Role", path: "/pusat/pengaturan/admin-role", icon: UserCog, enabled: true },
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

export const financeNav: V4NavGroup[] = [
  {
    label: "Utama",
    items: [{ label: "Beranda", path: "/finance/beranda", icon: Home, enabled: true }],
  },
  {
    label: "Verifikasi",
    items: [
      {
        label: "Verifikasi Pembayaran",
        path: "/finance/verifikasi",
        icon: WalletCards,
        enabled: true,
      },
    ],
  },
  {
    label: "Laporan",
    items: [
      {
        label: "Laporan Keuangan",
        path: "/finance/laporan",
        icon: FileText,
        enabled: true,
      },
    ],
  },
];

export const mediaNav: V4NavGroup[] = [
  {
    label: "Utama",
    items: [{ label: "Dashboard", path: "/media/beranda", icon: Home, enabled: true }],
  },
  {
    label: "Administrasi",
    items: [{ label: "Administrasi", path: "/media/administrasi", icon: WalletCards, enabled: true }],
  },
  {
    label: "Profil Pesantren",
    items: [{ label: "Profil Pesantren", path: "/media/identitas", icon: Building2, enabled: true }],
  },
  {
    label: "Kelola Crew",
    items: [{ label: "Kelola Crew", path: "/media/tim", icon: Users, enabled: true }],
  },
  {
    label: "Event",
    items: [{ label: "Event", path: "/media/event", icon: CalendarDays, enabled: true }],
  },
  {
    label: "MPJ Hub",
    items: [{ label: "MPJ Hub", path: "/media/hub", icon: FolderOpen, enabled: true }],
  },
  {
    label: "Pengaturan",
    items: [{ label: "Pengaturan", path: "/media/pengaturan", icon: Settings, enabled: true }],
  },
];

export const crewNav: V4NavGroup[] = [
  {
    label: "Utama",
    items: [{ label: "Beranda", path: "/crew/beranda", icon: Home, enabled: true }],
  },
  {
    label: "Profil",
    items: [{ label: "Profil", path: "/crew/profil", icon: User, enabled: true }],
  },
  {
    label: "Kegiatan",
    items: [
      { label: "Event", path: "/crew/event", icon: CalendarDays, enabled: true },
    ],
  },
  {
    label: "Militansi",
    items: [
      { label: "Militansi", path: "/crew/militansi", icon: ShieldCheck, enabled: true },
    ],
  },
  {
    label: "MPJ-Hub",
    items: [
      { label: "MPJ-Hub", path: "/crew/hub", icon: FolderOpen, enabled: true },
    ],
  },
];

export function isV4NavItemActive(item: NavItem, pathname: string): boolean {
  const selfActive = item.path ? pathname === item.path || pathname.startsWith(`${item.path}/`) : false;
  return selfActive || Boolean(item.children?.some((child) => isV4NavItemActive(child, pathname)));
}

export function findV4NavItem(role: V4Role, pathname: string): NavItem | undefined {
  const navByRole: Record<V4Role, V4NavGroup[]> = {
    pusat: pusatNav,
    regional: regionalNav,
    finance: financeNav,
    media: mediaNav,
    crew: crewNav,
  };
  const groups = navByRole[role];
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
