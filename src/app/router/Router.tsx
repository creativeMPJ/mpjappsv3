import { lazy } from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';
import Loadable from '@/shared/components/common/Loadable';
import { ROUTES } from '@/app/constants/router';
import ComingSoonOverlay from '@/components/shared/ComingSoonOverlay';
import CmsLayout from '@/shared/components/layouts/CmsLayout';

// Public pages
const Index = Loadable(lazy(() => import('@/pages/Index')));
const Login = Loadable(lazy(() => import('@/pages/Login')));
const ForgotPassword = Loadable(lazy(() => import('@/pages/ForgotPassword')));
const ClaimAccount = Loadable(lazy(() => import('@/pages/ClaimAccount')));
const ClaimSuccess = Loadable(lazy(() => import('@/pages/ClaimSuccess')));
const VerifyOTP = Loadable(lazy(() => import('@/pages/VerifyOTP')));
const Payment = Loadable(lazy(() => import('@/pages/Payment')));
const PaymentPending = Loadable(lazy(() => import('@/pages/PaymentPending')));
const CheckInstitution = Loadable(lazy(() => import('@/pages/CheckInstitution')));
const InstitutionSubmission = Loadable(lazy(() => import('@/pages/InstitutionSubmission')));
const DebugView = Loadable(lazy(() => import('@/pages/DebugView')));
const PublicPesantrenProfile = Loadable(lazy(() => import('@/pages/PublicPesantrenProfile')));
const PublicCrewProfile = Loadable(lazy(() => import('@/pages/PublicCrewProfile')));
const PublicDirektori = Loadable(lazy(() => import('@/pages/PublicDirektori')));

// Error pages
const VerificationPending = Loadable(lazy(() => import('@/pages/VerificationPending')));
const AccountRejected = Loadable(lazy(() => import('@/pages/AccountRejected')));
const Forbidden = Loadable(lazy(() => import('@/pages/Forbidden')));
const NotFound = Loadable(lazy(() => import('@/pages/NotFound')));

// CMS - User (Media Pesantren)
const MediaDashboardHome = Loadable(lazy(() => import('@/components/media-dashboard/MediaDashboardHome')));
const IdentitasPesantren = Loadable(lazy(() => import('@/components/media-dashboard/IdentitasPesantren')));
const Administrasi = Loadable(lazy(() => import('@/components/media-dashboard/Administrasi')));
const ManajemenKru = Loadable(lazy(() => import('@/components/media-dashboard/ManajemenKru')));
const EIDAsetPage = Loadable(lazy(() => import('@/components/media-dashboard/EIDAsetPage')));
const EventPage = Loadable(lazy(() => import('@/components/media-dashboard/EventPage')));
const MPJHub = Loadable(lazy(() => import('@/components/media-dashboard/MPJHub')));
const MediaPengaturan = Loadable(lazy(() => import('@/components/media-dashboard/Pengaturan')));

// CMS - Admin Pusat
const AdminPusatHome = Loadable(lazy(() => import('@/components/admin-pusat/AdminPusatHome')));
const AdminPusatAdministrasi = Loadable(lazy(() => import('@/components/admin-pusat/AdminPusatAdministrasi')));
const AdminPusatMasterData = Loadable(lazy(() => import('@/components/admin-pusat/AdminPusatMasterData')));
const AdminPusatRegional = Loadable(lazy(() => import('@/components/admin-pusat/AdminPusatRegional')));
const AdminPusatEvent = Loadable(lazy(() => import('@/components/admin-pusat/AdminPusatEvent')));
const AdminPusatPengaturan = Loadable(lazy(() => import('@/components/admin-pusat/AdminPusatPengaturan')));
const AdminRegionalDetail = Loadable(lazy(() => import('@/pages/AdminRegionalDetail')));

// CMS - Admin Regional
const RegionalDashboardHome = Loadable(lazy(() => import('@/components/regional-dashboard/RegionalDashboardHome')));
const DataMasterRegional = Loadable(lazy(() => import('@/components/regional-dashboard/DataMasterRegional')));
const ValidasiPendaftar = Loadable(lazy(() => import('@/components/regional-dashboard/ValidasiPendaftar')));
const ManajemenEvent = Loadable(lazy(() => import('@/components/regional-dashboard/ManajemenEvent')));
const LaporanDokumentasi = Loadable(lazy(() => import('@/components/regional-dashboard/LaporanDokumentasi')));
const LatePaymentFollowUp = Loadable(lazy(() => import('@/components/regional-dashboard/LatePaymentFollowUp')));
const DownloadCenter = Loadable(lazy(() => import('@/components/regional-dashboard/DownloadCenter')));
const RegionalPengaturan = Loadable(lazy(() => import('@/components/regional-dashboard/Pengaturan')));

// CMS - Admin Finance
const FinanceBeranda = Loadable(lazy(() => import('@/components/finance-dashboard/FinanceBeranda')));
const FinanceVerifikasi = Loadable(lazy(() => import('@/components/finance-dashboard/FinanceVerifikasi')));
const FinanceLaporan = Loadable(lazy(() => import('@/components/finance-dashboard/FinanceLaporan')));
const FinanceHarga = Loadable(lazy(() => import('@/components/finance-dashboard/FinanceHarga')));
const FinanceRiwayat = Loadable(lazy(() => import('@/components/finance-dashboard/FinanceRiwayat')));

// CMS - Super Admin
const SuperAdminDashboard = Loadable(lazy(() => import('@/pages/SuperAdminDashboard')));
const UserManagement = Loadable(lazy(() => import('@/components/super-admin/UserManagement')));
const SuperAdminSettings = Loadable(lazy(() => import('@/components/super-admin/SuperAdminSettings')));
const MajelisOverview = Loadable(lazy(() => import('@/components/majelis-dashboard/MajelisOverview')));
const HakAkses = Loadable(lazy(() => import('@/pages/HakAkses')));

const router = createBrowserRouter([
  // Error pages
  { path: ROUTES.ERROR.FORBIDDEN, element: <Forbidden /> },
  { path: ROUTES.ERROR.NOT_FOUND, element: <NotFound /> },
  { path: ROUTES.ERROR.VERIFICATION_PENDING, element: <VerificationPending /> },
  { path: ROUTES.ERROR.ACCOUNT_REJECTED, element: <AccountRejected /> },

  // Public routes
  { path: ROUTES.ROOT, element: <Index /> },
  { path: ROUTES.AUTH.LOGIN, element: <Login /> },
  { path: ROUTES.AUTH.FORGOT_PASSWORD, element: <ForgotPassword /> },
  { path: ROUTES.AUTH.REGISTER, element: <InstitutionSubmission /> },
  { path: ROUTES.PUBLIC.CHECK_INSTITUTION, element: <CheckInstitution /> },
  { path: ROUTES.PUBLIC.INSTITUTION_SUBMISSION, element: <InstitutionSubmission /> },
  { path: ROUTES.PUBLIC.CLAIM_ACCOUNT, element: <ClaimAccount /> },
  { path: ROUTES.PUBLIC.LEGACY_CLAIM, element: <ClaimAccount /> },
  { path: ROUTES.PUBLIC.VERIFY_OTP, element: <VerifyOTP /> },
  { path: ROUTES.PUBLIC.CLAIM_SUCCESS, element: <ClaimSuccess /> },
  { path: ROUTES.PUBLIC.PAYMENT, element: <Payment /> },
  { path: ROUTES.PUBLIC.PAYMENT_PENDING, element: <PaymentPending /> },
  { path: ROUTES.PUBLIC.DEBUG_VIEW, element: <DebugView /> },

  // Public verification routes
  { path: ROUTES.VERIFICATION.DIREKTORI, element: <PublicDirektori /> },
  { path: ROUTES.VERIFICATION.PESANTREN_PROFILE, element: <PublicPesantrenProfile /> },
  { path: ROUTES.VERIFICATION.CREW_PROFILE, element: <PublicCrewProfile /> },

  // CMS - semua route di-wrap CmsLayout
  {
    path: '/cms',
    element: <CmsLayout />,
    children: [
      // User (Media Pesantren)
      { path: 'user-beranda', element: <MediaDashboardHome /> },
      { path: 'user-identitas', element: <IdentitasPesantren /> },
      { path: 'user-administrasi', element: <Administrasi /> },
      { path: 'user-tim', element: <ManajemenKru /> },
      { path: 'user-eid', element: <EIDAsetPage /> },
      { path: 'user-event', element: <EventPage /> },
      { path: 'user-hub', element: <MPJHub /> },
      { path: 'user-pengaturan', element: <MediaPengaturan /> },

      // Admin Pusat
      { path: 'admin-pusat-dashboard', element: <AdminPusatHome /> },
      { path: 'admin-pusat-administrasi', element: <AdminPusatAdministrasi /> },
      { path: 'admin-pusat-master-data', element: <AdminPusatMasterData /> },
      { path: 'admin-pusat-master-regional', element: <AdminPusatRegional /> },
      { path: 'admin-pusat-manajemen-event', element: <AdminPusatEvent /> },
      { path: 'admin-pusat-manajemen-militansi', element: <ComingSoonOverlay title="Manajemen Militansi" description="Leaderboard dan sistem gamifikasi XP" /> },
      { path: 'admin-pusat-mpj-hub', element: <ComingSoonOverlay title="MPJ HUB" description="Pusat kolaborasi dan resource sharing" /> },
      { path: 'admin-pusat-pengaturan', element: <AdminPusatPengaturan /> },
      { path: 'admin-pusat/regional/:id', element: <AdminRegionalDetail /> },

      // Admin Regional
      { path: 'admin-regional-dashboard', element: <RegionalDashboardHome /> },
      { path: 'admin-regional-data-master', element: <DataMasterRegional /> },
      { path: 'admin-regional-validasi-pendaftar', element: <ValidasiPendaftar /> },
      { path: 'admin-regional-manajemen-event', element: <ManajemenEvent /> },
      { path: 'admin-regional-laporan-dokumentasi', element: <LaporanDokumentasi /> },
      { path: 'admin-regional-late-payment', element: <LatePaymentFollowUp /> },
      { path: 'admin-regional-download-center', element: <DownloadCenter /> },
      { path: 'admin-regional-pengaturan', element: <RegionalPengaturan /> },

      // Admin Finance
      { path: 'admin-finance-dashboard', element: <FinanceBeranda /> },
      { path: 'admin-finance-verifikasi', element: <FinanceVerifikasi /> },
      { path: 'admin-finance-laporan', element: <FinanceLaporan /> },
      { path: 'admin-finance-harga', element: <FinanceHarga /> },
      { path: 'admin-finance-clearing', element: <FinanceRiwayat /> },
      { path: 'admin-finance-regional-monitoring', element: <ComingSoonOverlay title="Regional Monitoring" description="Monitoring pembayaran per wilayah" /> },
      { path: 'admin-finance-pengaturan', element: <ComingSoonOverlay title="Pengaturan Finance" description="Konfigurasi sistem keuangan" /> },

      // Super Admin
      { path: '', element: <SuperAdminDashboard /> },
      { path: 'super-admin-user-management', element: <UserManagement /> },
      { path: 'super-admin-settings', element: <SuperAdminSettings /> },
      { path: 'super-admin-hierarchy', element: <MajelisOverview onNavigate={() => {}} /> },
      { path: 'super-admin-finance', element: <ComingSoonOverlay title="Finance" description="Laporan keuangan super admin" /> },
      { path: 'super-admin-hak-akses', element: <HakAkses /> },
    ],
  },

  // Fallback
  { path: '*', element: <Navigate to={ROUTES.ERROR.NOT_FOUND} replace /> },
]);

export default router;
