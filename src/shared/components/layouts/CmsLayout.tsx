import { useEffect, useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  IdCard,
  ClipboardList,
  Users,
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
import { IS_DEV_AUTH_BYPASS_ENABLED } from '@/config/devAuth';

interface CmsMenuItem extends SidebarMenuItem {
  aksesKey: string;
}

// Dashboard IDs ditampilkan berdasarkan role, bukan akses.
const DASHBOARD_IDS = new Set([
  '',
  'user-beranda',
  'admin-pusat-dashboard',
  'admin-regional-dashboard',
  'admin-finance-dashboard',
]);

const ALL_MENUS: CmsMenuItem[] = [
  // Dashboards, satu per role, dipilih berdasarkan role.
  { id: 'user-beranda',             aksesKey: 'user-beranda',             label: 'BERANDA',   icon: LayoutDashboard },
  { id: 'admin-pusat-dashboard',    aksesKey: 'admin-pusat-dashboard',    label: 'DASHBOARD', icon: LayoutDashboard },
  { id: 'admin-regional-dashboard', aksesKey: 'admin-regional-dashboard', label: 'DASHBOARD', icon: LayoutDashboard },
  { id: 'admin-finance-dashboard',  aksesKey: 'admin-finance-dashboard',  label: 'DASHBOARD', icon: LayoutDashboard },
  { id: '',                         aksesKey: '',                         label: 'DASHBOARD', icon: LayoutDashboard },

  // Feature menus tampil jika akses[aksesKey].view === true dari API.
  { id: 'identitas',    aksesKey: 'identitas',   label: 'PROFIL PESANTREN', icon: IdCard },
  { id: 'pembayaran',   aksesKey: 'pembayaran',  label: 'ADMINISTRASI',     icon: ClipboardList },
  { id: 'tim',          aksesKey: 'tim',         label: 'KELOLA CREW',      icon: Users },
  { id: 'user-event',   aksesKey: 'user-event',  label: 'EVENT',               icon: CalendarDays },
  { id: 'hub',          aksesKey: 'hub',         label: 'MPJ HUB',             icon: Globe },

  { id: 'administrasi',               aksesKey: 'administrasi',               label: 'ADMINISTRASI',        icon: ClipboardList },
  { id: 'master-data',                aksesKey: 'master-data',                label: 'MASTER DATA',         icon: BarChart3 },
  { id: 'master-regional',            aksesKey: 'master-regional',            label: 'MASTER REGIONAL',     icon: Map },
  { id: 'admin-pusat-manajemen-event',aksesKey: 'admin-pusat-manajemen-event',label: 'KELOLA EVENT',        icon: CalendarDays },
  { id: 'militansi',                  aksesKey: 'militansi',                  label: 'MANAJEMEN MILITANSI', icon: Swords, soon: true },
  { id: 'mpj-hub',                    aksesKey: 'mpj-hub',                    label: 'MPJ HUB',             icon: Globe, soon: true },

  { id: 'data-master',               aksesKey: 'data-master',               label: 'DATA REGIONAL',         icon: BarChart3 },
  { id: 'validasi-pendaftar',        aksesKey: 'validasi-pendaftar',        label: 'VERIFIKASI',            icon: UserCheck },
  { id: 'admin-regional-manajemen-event', aksesKey: 'admin-regional-manajemen-event', label: 'KELOLA EVENT', icon: CalendarDays },
  { id: 'laporan',                   aksesKey: 'laporan',                   label: 'LAPORAN & DOKUMENTASI', icon: FileText },
  { id: 'late-payment',              aksesKey: 'late-payment',              label: 'LATE PAYMENT',          icon: AlertCircle },
  { id: 'download-center',           aksesKey: 'download-center',           label: 'DOWNLOAD CENTER',       icon: Download },

  { id: 'verifikasi',          aksesKey: 'verifikasi',          label: 'VERIFIKASI',          icon: UserCheck },
  { id: 'laporan-keuangan',    aksesKey: 'laporan-keuangan',    label: 'LAPORAN',             icon: FileText },
  { id: 'harga',               aksesKey: 'harga',               label: 'HARGA',               icon: Banknote },
  { id: 'clearing',            aksesKey: 'clearing',            label: 'CLEARING',            icon: CreditCard },
  { id: 'regional-monitoring', aksesKey: 'regional-monitoring', label: 'REGIONAL MONITORING', icon: MonitorDot, soon: true },

  { id: 'user-management', aksesKey: 'user-management', label: 'USER MANAGEMENT', icon: UserCog },
  { id: 'hierarchy',       aksesKey: 'hierarchy',       label: 'HIERARKI DATA',   icon: Layers },
  { id: 'finance',         aksesKey: 'finance',         label: 'FINANCE',         icon: DollarSign, soon: true },
  { id: 'hak-akses',       aksesKey: 'hak-akses',       label: 'HAK AKSES',       icon: Shield },

  // Shared, satu route untuk semua role.
  { id: 'pengaturan', aksesKey: 'pengaturan', label: 'PENGATURAN', icon: Settings },
];

function getActiveDashboardId(role: string, isSuperAdmin: boolean): string {
  if (isSuperAdmin)                return '';
  if (role === 'admin_pusat')      return 'admin-pusat-dashboard';
  if (role === 'admin_regional')   return 'admin-regional-dashboard';
  if (role === 'admin_finance')    return 'admin-finance-dashboard';
  return 'user-beranda';
}

function formatRoleLabel(role: string): string {
  if (!role) return 'User';
  return role.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

const CmsLayout = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();

  const akses = useMemo(() => profile?.akses ?? {}, [profile?.akses]);
  const isSuperAdmin = profile?.is_super_admin ?? false;
  const roleLabel = profile?.role ?? '';

  const activeDashboardId = useMemo(
    () => getActiveDashboardId(roleLabel, isSuperAdmin),
    [roleLabel, isSuperAdmin]
  );

  const isUserRole = activeDashboardId === 'user-beranda';
  const isCrewPreview = IS_DEV_AUTH_BYPASS_ENABLED && roleLabel === 'crew';
  const isMediaPreview = IS_DEV_AUTH_BYPASS_ENABLED && roleLabel === 'user';
  const roleDisplayLabel = isMediaPreview ? 'Dev Koordinator' : formatRoleLabel(roleLabel);
  const sidebarTitle = isCrewPreview
    ? (profile?.nama_pesantren ?? 'Dev Kru')
    : isMediaPreview
      ? (profile?.nama_pesantren ?? 'Dev Koordinator')
      : isUserRole
        ? (profile?.nama_pesantren ?? 'MPJ Media')
      : `MPJ ${roleDisplayLabel}`;
  const sidebarSubtitle = isCrewPreview ? 'Preview Kru' : isMediaPreview ? 'Preview Media' : isUserRole ? 'Dashboard Media Pesantren' : 'Admin Panel';

  // Filter murni berdasarkan akses dari API.
  const visibleMenus = useMemo(() => ALL_MENUS.filter((m) => {
    if (DASHBOARD_IDS.has(m.id)) return m.id === activeDashboardId;
    return akses[m.aksesKey]?.view === true;
  }), [akses, activeDashboardId]);

  const activeSlug = pathname.replace('/cms', '').replace(/^\//, '');

  // Redirect ke menu pertama jika landing di /cms
  useEffect(() => {
    if (activeSlug || visibleMenus.length === 0) return;
    const firstId = visibleMenus[0].id;
    navigate(firstId ? `/cms/${firstId}` : '/cms', { replace: true });
  }, [activeSlug, visibleMenus, navigate]);

  // Akses guard: redirect ke /403 jika route diblokir eksplisit
  useEffect(() => {
    if (!profile) return;
    if (DASHBOARD_IDS.has(activeSlug)) return;
    if (activeSlug && akses[activeSlug]?.view === false) {
      navigate('/403', { replace: true });
    }
  }, [activeSlug, akses, profile, navigate]);

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
      menuItems={visibleMenus}
      activeView={activeSlug}
      onViewChange={handleViewChange}
      onLogout={handleLogout}
      title={sidebarTitle}
      subtitle={sidebarSubtitle}
      sidebarBg="bg-[#166534]"
      collapsible
      headerLeft={
        <div>
          <p className="text-sm text-muted-foreground">Selamat datang kembali,</p>
          <h2 className="text-lg font-bold text-emerald-700">
            Halo, {displayName}
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
            <Avatar className="w-9 h-9 border-2 border-emerald-600">
              <AvatarImage src={profile?.logo_url || '/placeholder.svg'} />
              <AvatarFallback className="bg-emerald-600 text-white text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:block">
              <p className="text-sm font-medium">{displayName}</p>
              <p className="text-xs text-muted-foreground">{roleDisplayLabel}</p>
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
