import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  IdCard,
  ClipboardList,
  Users,
  Image,
  CalendarDays,
  Globe,
  Settings,
  BarChart3,
  Map,
  Shield,
  DollarSign,
  FileText,
  Layers,
  UserCheck,
  Download,
  AlertCircle,
  Swords,
  CreditCard,
  Banknote,
  MonitorDot,
  UserCog,
  Bell,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Sidebar, { SidebarMenuItem } from '@/components/shared/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import type { AppRole, AuthProfile } from '@/contexts/AuthContext';

const ALL_MENUS: SidebarMenuItem[] = [
  // User (Media Pesantren)
  { id: 'user-beranda', label: 'BERANDA', icon: LayoutDashboard },
  { id: 'user-identitas', label: 'IDENTITAS PESANTREN', icon: IdCard },
  { id: 'user-administrasi', label: 'ADMINISTRASI', icon: ClipboardList },
  { id: 'user-tim', label: 'MANAJEMEN KRU', icon: Users },
  { id: 'user-eid', label: 'EID ASET', icon: Image },
  { id: 'user-event', label: 'EVENT', icon: CalendarDays },
  { id: 'user-hub', label: 'MPJ HUB', icon: Globe },
  { id: 'user-pengaturan', label: 'PENGATURAN', icon: Settings },

  // Admin Pusat
  { id: 'admin-pusat-dashboard', label: 'DASHBOARD', icon: LayoutDashboard },
  { id: 'admin-pusat-administrasi', label: 'ADMINISTRASI', icon: ClipboardList },
  { id: 'admin-pusat-master-data', label: 'MASTER DATA', icon: BarChart3 },
  { id: 'admin-pusat-master-regional', label: 'MASTER REGIONAL', icon: Map },
  { id: 'admin-pusat-manajemen-event', label: 'MANAJEMEN EVENT', icon: CalendarDays },
  { id: 'admin-pusat-manajemen-militansi', label: 'MANAJEMEN MILITANSI', icon: Swords, soon: true },
  { id: 'admin-pusat-mpj-hub', label: 'MPJ HUB', icon: Globe, soon: true },
  { id: 'admin-pusat-pengaturan', label: 'PENGATURAN', icon: Settings },

  // Admin Regional
  { id: 'admin-regional-dashboard', label: 'DASHBOARD', icon: LayoutDashboard },
  { id: 'admin-regional-data-master', label: 'DATA MASTER', icon: BarChart3 },
  { id: 'admin-regional-validasi-pendaftar', label: 'VALIDASI PENDAFTAR', icon: UserCheck },
  { id: 'admin-regional-manajemen-event', label: 'MANAJEMEN EVENT', icon: CalendarDays },
  { id: 'admin-regional-laporan-dokumentasi', label: 'LAPORAN & DOKUMENTASI', icon: FileText },
  { id: 'admin-regional-late-payment', label: 'LATE PAYMENT', icon: AlertCircle },
  { id: 'admin-regional-download-center', label: 'DOWNLOAD CENTER', icon: Download },
  { id: 'admin-regional-pengaturan', label: 'PENGATURAN', icon: Settings },

  // Admin Finance
  { id: 'admin-finance-dashboard', label: 'DASHBOARD', icon: LayoutDashboard },
  { id: 'admin-finance-verifikasi', label: 'VERIFIKASI', icon: UserCheck },
  { id: 'admin-finance-laporan', label: 'LAPORAN', icon: FileText },
  { id: 'admin-finance-harga', label: 'HARGA', icon: Banknote },
  { id: 'admin-finance-clearing', label: 'CLEARING', icon: CreditCard },
  { id: 'admin-finance-regional-monitoring', label: 'REGIONAL MONITORING', icon: MonitorDot, soon: true },
  { id: 'admin-finance-pengaturan', label: 'PENGATURAN', icon: Settings, soon: true },

  // Super Admin
  { id: '', label: 'DASHBOARD', icon: LayoutDashboard },
  { id: 'super-admin-user-management', label: 'USER MANAGEMENT', icon: UserCog },
  { id: 'super-admin-hierarchy', label: 'HIERARKI DATA', icon: Layers },
  { id: 'super-admin-finance', label: 'FINANCE', icon: DollarSign, soon: true },
  { id: 'super-admin-hak-akses', label: 'HAK AKSES', icon: Shield },
  { id: 'super-admin-settings', label: 'SETTINGS', icon: Settings },
];

interface SectionMeta {
  getTitle: (p: AuthProfile | null) => string;
  getSubtitle: (p: AuthProfile | null) => string;
  sidebarBg: string;
  accentColor: string;
  roleLabel: string;
  avatarBorder: string;
  avatarBg: string;
}

const SECTION_META: Record<string, SectionMeta> = {
  user: {
    getTitle: (p) => p?.nama_pesantren ?? 'MPJ Media',
    getSubtitle: () => 'Dashboard Media Pesantren',
    sidebarBg: 'bg-[#166534]',
    accentColor: 'text-emerald-700',
    roleLabel: 'Media Pesantren',
    avatarBorder: 'border-emerald-600',
    avatarBg: 'bg-emerald-600',
  },
  admin_regional: {
    getTitle: () => 'MPJ REGIONAL',
    getSubtitle: () => 'Admin Panel',
    sidebarBg: 'bg-[#166534]',
    accentColor: 'text-emerald-700',
    roleLabel: 'Admin Regional',
    avatarBorder: 'border-emerald-600',
    avatarBg: 'bg-emerald-600',
  },
  admin_pusat: {
    getTitle: () => 'MPJ PUSAT',
    getSubtitle: () => 'Admin Panel',
    sidebarBg: 'bg-[#166534]',
    accentColor: 'text-emerald-700',
    roleLabel: 'Admin Pusat',
    avatarBorder: 'border-emerald-600',
    avatarBg: 'bg-emerald-600',
  },
  admin_finance: {
    getTitle: () => 'MPJ FINANCE',
    getSubtitle: () => 'Admin Panel',
    sidebarBg: 'bg-[#166534]',
    accentColor: 'text-emerald-700',
    roleLabel: 'Admin Finance',
    avatarBorder: 'border-emerald-600',
    avatarBg: 'bg-emerald-600',
  },
};

const DEFAULT_META: SectionMeta = {
  getTitle: () => 'MPJ SUPER ADMIN',
  getSubtitle: () => 'Admin Panel',
  sidebarBg: 'bg-[#166534]',
  accentColor: 'text-emerald-700',
  roleLabel: 'Super Admin',
  avatarBorder: 'border-emerald-600',
  avatarBg: 'bg-emerald-600',
};

const CmsLayout = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();

  const role: AppRole | undefined = profile?.role;
  const meta = (role && SECTION_META[role]) ?? DEFAULT_META;

  const activeSlug = pathname.replace('/cms', '').replace(/^\//, '');
  const displayName = profile?.nama_pesantren || 'Admin';
  const initials = displayName.substring(0, 2).toUpperCase();

  const handleViewChange = (id: string) => {
    navigate(id ? `/cms/${id}` : '/cms');
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <Sidebar
      menuItems={ALL_MENUS}
      activeView={activeSlug}
      onViewChange={handleViewChange}
      onLogout={handleLogout}
      title={meta.getTitle(profile)}
      subtitle={meta.getSubtitle(profile)}
      sidebarBg={meta.sidebarBg}
      collapsible
      headerLeft={
        <div>
          <p className="text-sm text-muted-foreground">Selamat datang kembali,</p>
          <h2 className={`text-lg font-bold ${meta.accentColor}`}>
            Halo, {displayName} 👋
          </h2>
        </div>
      }
      headerRight={
        <>
          <button className="relative p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted min-h-[44px] min-w-[44px] flex items-center justify-center">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <div className="flex items-center gap-2">
            <Avatar className={`w-9 h-9 border-2 ${meta.avatarBorder}`}>
              <AvatarImage src={profile?.logo_url || '/placeholder.svg'} />
              <AvatarFallback className={`${meta.avatarBg} text-white text-sm`}>
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:block">
              <p className="text-sm font-medium">{displayName}</p>
              <p className="text-xs text-muted-foreground">{meta.roleLabel}</p>
            </div>
          </div>
        </>
      }
    >
      <Outlet />
    </Sidebar>
  );
};

export default CmsLayout;
