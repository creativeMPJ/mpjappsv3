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

export interface V4NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  enabled?: boolean;
}

export interface V4NavGroup {
  label: string;
  items: V4NavItem[];
}

export const pusatNav: V4NavGroup[] = [
  { label: "Utama", items: [{ label: "Beranda", path: "/pusat/beranda", icon: Home, enabled: true }] },
  {
    label: "Administrasi",
    items: [
      { label: "Monitoring Regional", path: "/pusat/administrasi/monitoring-regional", icon: BarChart3 },
      { label: "Verifikasi Payment", path: "/pusat/administrasi/verifikasi-payment", icon: WalletCards, enabled: true },
      { label: "Leveling", path: "/pusat/administrasi/leveling", icon: Medal },
      { label: "Kode Khodim", path: "/pusat/administrasi/kode-khodim", icon: IdCard },
    ],
  },
  {
    label: "Sekretariat",
    items: [
      { label: "Ringkasan Surat", path: "/pusat/sekretariat", icon: FileText },
      { label: "Surat Masuk", path: "/pusat/sekretariat/surat-masuk", icon: Archive },
      { label: "Surat Keluar", path: "/pusat/sekretariat/surat-keluar", icon: FileSignature },
      { label: "Asset TTD", path: "/pusat/sekretariat/asset-ttd", icon: Upload },
      { label: "Pengaturan Template", path: "/pusat/sekretariat/pengaturan-template", icon: Settings },
    ],
  },
  {
    label: "Master Data",
    items: [
      { label: "Pesantren", path: "/pusat/master-data/pesantren", icon: Building2, enabled: true },
      { label: "Media", path: "/pusat/master-data/media", icon: Globe, enabled: true },
      { label: "Kru", path: "/pusat/master-data/kru", icon: Users, enabled: true },
      { label: "Surat", path: "/pusat/master-data/surat", icon: FileText },
      { label: "Event", path: "/pusat/master-data/event", icon: CalendarDays },
    ],
  },
  {
    label: "Manajemen Event",
    items: [
      { label: "Daftar Event", path: "/pusat/event/daftar", icon: CalendarDays },
      { label: "Narasumber", path: "/pusat/event/narasumber", icon: Users },
      { label: "Peserta", path: "/pusat/event/peserta", icon: Users },
      { label: "Scan", path: "/pusat/event/scan", icon: QrCode },
    ],
  },
  {
    label: "Manajemen Militansi",
    items: [
      { label: "Daftar Level", path: "/pusat/militansi/level", icon: Medal },
      { label: "Daftar XP", path: "/pusat/militansi/xp", icon: ShieldCheck },
      { label: "Pengaturan Level/XP", path: "/pusat/militansi/pengaturan", icon: Settings },
    ],
  },
  {
    label: "MPJ Hub",
    items: [
      { label: "Daftar File", path: "/pusat/hub/file", icon: FolderOpen },
      { label: "Upload File", path: "/pusat/hub/upload", icon: Upload },
      { label: "Pengaturan", path: "/pusat/hub/pengaturan", icon: Settings },
    ],
  },
  {
    label: "Pengaturan",
    items: [
      { label: "Profil", path: "/pusat/pengaturan/profil", icon: Settings },
      { label: "Tim Pusat", path: "/pusat/pengaturan/tim-pusat", icon: Users },
      { label: "Tim Regional", path: "/pusat/pengaturan/tim-regional", icon: Users },
    ],
  },
];

export const regionalNav: V4NavGroup[] = [
  { label: "Utama", items: [{ label: "Beranda", path: "/regional/beranda", icon: Home, enabled: true }] },
  {
    label: "Administrasi",
    items: [
      { label: "Monitoring Pendaftaran", path: "/regional/administrasi/monitoring-pendaftaran", icon: BarChart3, enabled: true },
      { label: "Monitoring Lembaga", path: "/regional/administrasi/monitoring-lembaga", icon: Building2 },
      { label: "Leveling Wilayah", path: "/regional/administrasi/leveling-wilayah", icon: Medal },
    ],
  },
  {
    label: "Sekretariat",
    items: [
      { label: "Ringkasan Surat", path: "/regional/sekretariat", icon: FileText },
      { label: "Surat Masuk", path: "/regional/sekretariat/surat-masuk", icon: Archive },
      { label: "Surat Keluar", path: "/regional/sekretariat/surat-keluar", icon: FileSignature },
      { label: "Asset TTD", path: "/regional/sekretariat/asset-ttd", icon: Upload },
      { label: "Pengaturan Template", path: "/regional/sekretariat/pengaturan-template", icon: Settings },
    ],
  },
  {
    label: "Master Data",
    items: [
      { label: "Pesantren", path: "/regional/master-data/pesantren", icon: Building2, enabled: true },
      { label: "Media", path: "/regional/master-data/media", icon: Globe, enabled: true },
      { label: "Kru", path: "/regional/master-data/kru", icon: Users, enabled: true },
    ],
  },
  {
    label: "Manajemen Event",
    items: [
      { label: "Daftar Event", path: "/regional/event/daftar", icon: CalendarDays },
      { label: "Peserta", path: "/regional/event/peserta", icon: Users },
      { label: "Scan", path: "/regional/event/scan", icon: QrCode },
    ],
  },
  {
    label: "Monitoring Militansi",
    items: [
      { label: "Daftar XP", path: "/regional/militansi/xp", icon: ShieldCheck },
      { label: "Peringkat Wilayah", path: "/regional/militansi/peringkat", icon: Medal },
    ],
  },
  {
    label: "MPJ Hub",
    items: [
      { label: "Daftar File", path: "/regional/hub/file", icon: FolderOpen },
      { label: "Upload File", path: "/regional/hub/upload", icon: Upload },
    ],
  },
  {
    label: "Pengaturan",
    items: [
      { label: "Profil", path: "/regional/pengaturan/profil", icon: Settings },
      { label: "Tim Regional", path: "/regional/pengaturan/tim-regional", icon: Users },
    ],
  },
];

export function findV4NavItem(role: V4Role, pathname: string) {
  const groups = role === "pusat" ? pusatNav : regionalNav;
  return groups.flatMap((group) => group.items).find((item) => item.path === pathname);
}
