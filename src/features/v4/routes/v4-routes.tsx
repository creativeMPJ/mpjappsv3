import { Navigate, type RouteObject } from "react-router-dom";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import V4DashboardLayout from "../layout/V4DashboardLayout";
import { PusatBerandaPage, RegionalBerandaPage } from "../pages/V4HomePages";
import {
  PusatAdministrasiKlaimAkunPage,
  PusatAdministrasiMonitoringAktivasiPage,
  PusatAdministrasiOverviewPage,
  PusatAdministrasiPendaftaranPage,
  PusatEventOverviewPage,
  PusatHubPage,
  PusatMasterDataOverviewPage,
  PusatMilitansiPage,
  PusatPengaturanAdminRolePage,
  PusatPengaturanKodeKhodimPage,
  PusatPengaturanLevelingPage,
  PusatPengaturanOverviewPage,
  PusatPengaturanPaketSlotPage,
  PusatPengaturanRegionalPage,
  PusatVerifikasiPaymentPage,
  RegionalMonitoringPendaftaranPage,
} from "../pages/V4Phase2Pages";
import {
  PusatMasterKruPage,
  PusatMasterMediaPage,
  PusatMasterPesantrenPage,
  RegionalMasterKruPage,
  RegionalMasterMediaPage,
  RegionalMasterPesantrenPage,
} from "../pages/V4MasterDataPages";
import { PusatEventDaftarPage, RegionalEventDaftarPage } from "../pages/V4EventPages";
import {
  PusatAssetTtdPage,
  PusatPengaturanTemplatePage,
  PusatSekretariatPage,
  PusatSuratKeluarPage,
  PusatSuratMasukPage,
  RegionalAssetTtdPage,
  RegionalPengaturanTemplatePage,
  RegionalSekretariatPage,
  RegionalSuratKeluarPage,
  RegionalSuratMasukPage,
} from "../pages/V4SekretariatPages";
import {
  CrewBerandaPageView,
  CrewEIDPageView,
  CrewEventPageView,
  CrewHubPageView,
  CrewMilitansiPageView,
  CrewProfilPageView,
  CrewSertifikatPageView,
  FinanceBerandaPage,
  FinanceLaporanPage,
  FinanceVerifikasiPage,
  MediaBerandaPage,
  MediaAdministrasiPage,
  MediaEIDPage,
  MediaEventPage,
  MediaHubPage,
  MediaIdentitasPage,
  MediaPengaturanPage,
  MediaTimPage,
} from "../pages/V4RoleDashboardPages";
import { auditPusatNavigationRoutes } from "./v4-route-audit";

const pusatChildren: RouteObject[] = [
  { index: true, element: <Navigate to="/pusat/beranda" replace /> },
  { path: "beranda", element: <PusatBerandaPage /> },
  { path: "administrasi", element: <PusatAdministrasiOverviewPage /> },
  { path: "administrasi/pendaftaran", element: <PusatAdministrasiPendaftaranPage /> },
  { path: "administrasi/klaim-akun", element: <PusatAdministrasiKlaimAkunPage /> },
  { path: "administrasi/verifikasi-payment", element: <PusatVerifikasiPaymentPage /> },
  { path: "administrasi/monitoring-aktivasi", element: <PusatAdministrasiMonitoringAktivasiPage /> },
  { path: "master-data", element: <PusatMasterDataOverviewPage /> },
  { path: "sekretariat", element: <PusatSekretariatPage /> },
  { path: "sekretariat/surat-keluar", element: <PusatSuratKeluarPage /> },
  { path: "sekretariat/surat-masuk", element: <PusatSuratMasukPage /> },
  { path: "sekretariat/asset-ttd", element: <PusatAssetTtdPage /> },
  { path: "sekretariat/pengaturan-template", element: <PusatPengaturanTemplatePage /> },
  { path: "master-data/pesantren", element: <PusatMasterPesantrenPage /> },
  { path: "master-data/media", element: <PusatMasterMediaPage /> },
  { path: "master-data/kru", element: <PusatMasterKruPage /> },
  { path: "event", element: <PusatEventOverviewPage /> },
  { path: "event/daftar", element: <PusatEventDaftarPage /> },
  { path: "mpj-hub", element: <PusatHubPage /> },
  { path: "militansi", element: <PusatMilitansiPage /> },
  { path: "pengaturan", element: <PusatPengaturanOverviewPage /> },
  { path: "pengaturan/regional", element: <PusatPengaturanRegionalPage /> },
  { path: "pengaturan/kode-khodim", element: <PusatPengaturanKodeKhodimPage /> },
  { path: "pengaturan/leveling", element: <PusatPengaturanLevelingPage /> },
  { path: "pengaturan/paket-slot", element: <PusatPengaturanPaketSlotPage /> },
  { path: "pengaturan/admin-role", element: <PusatPengaturanAdminRolePage /> },
  { path: "master-regional", element: <Navigate to="/pusat/pengaturan/regional" replace /> },
];

const regionalChildren: RouteObject[] = [
  { index: true, element: <Navigate to="/regional/beranda" replace /> },
  { path: "beranda", element: <RegionalBerandaPage /> },
  { path: "administrasi/monitoring-pendaftaran", element: <RegionalMonitoringPendaftaranPage /> },
  { path: "sekretariat", element: <RegionalSekretariatPage /> },
  { path: "sekretariat/surat-keluar", element: <RegionalSuratKeluarPage /> },
  { path: "sekretariat/surat-masuk", element: <RegionalSuratMasukPage /> },
  { path: "sekretariat/asset-ttd", element: <RegionalAssetTtdPage /> },
  { path: "sekretariat/pengaturan-template", element: <RegionalPengaturanTemplatePage /> },
  { path: "master-data/pesantren", element: <RegionalMasterPesantrenPage /> },
  { path: "master-data/media", element: <RegionalMasterMediaPage /> },
  { path: "master-data/kru", element: <RegionalMasterKruPage /> },
  { path: "event/daftar", element: <RegionalEventDaftarPage /> },
];

const financeChildren: RouteObject[] = [
  { index: true, element: <Navigate to="/finance/beranda" replace /> },
  { path: "beranda", element: <FinanceBerandaPage /> },
  { path: "verifikasi", element: <FinanceVerifikasiPage /> },
  { path: "laporan", element: <FinanceLaporanPage /> },
];

const mediaChildren: RouteObject[] = [
  { index: true, element: <Navigate to="/media/beranda" replace /> },
  { path: "beranda", element: <MediaBerandaPage /> },
  { path: "administrasi", element: <MediaAdministrasiPage /> },
  { path: "pembayaran", element: <Navigate to="/media/administrasi" replace /> },
  { path: "identitas", element: <MediaIdentitasPage /> },
  { path: "profil", element: <Navigate to="/media/identitas" replace /> },
  { path: "tim", element: <MediaTimPage /> },
  { path: "eid", element: <MediaEIDPage /> },
  { path: "event", element: <MediaEventPage /> },
  { path: "hub", element: <MediaHubPage /> },
  { path: "pengaturan", element: <MediaPengaturanPage /> },
];

const crewChildren: RouteObject[] = [
  { index: true, element: <Navigate to="/crew/beranda" replace /> },
  { path: "beranda", element: <CrewBerandaPageView /> },
  { path: "profil", element: <CrewProfilPageView /> },
  { path: "eid", element: <CrewEIDPageView /> },
  { path: "event", element: <CrewEventPageView /> },
  { path: "militansi", element: <CrewMilitansiPageView /> },
  { path: "hub", element: <CrewHubPageView /> },
  { path: "sertifikat", element: <CrewSertifikatPageView /> },
];

export const v4Routes: RouteObject[] = [
  {
    path: "/pusat",
    element: (
      <ProtectedRoute allowedRoles={["admin_pusat"]}>
        <V4DashboardLayout role="pusat" />
      </ProtectedRoute>
    ),
    children: pusatChildren,
  },
  {
    path: "/regional",
    element: (
      <ProtectedRoute allowedRoles={["admin_regional"]}>
        <V4DashboardLayout role="regional" />
      </ProtectedRoute>
    ),
    children: regionalChildren,
  },
  {
    path: "/finance",
    element: (
      <ProtectedRoute allowedRoles={["admin_finance"]}>
        <V4DashboardLayout role="finance" />
      </ProtectedRoute>
    ),
    children: financeChildren,
  },
  {
    path: "/media",
    element: (
      <ProtectedRoute allowedRoles={["user"]}>
        <V4DashboardLayout role="media" />
      </ProtectedRoute>
    ),
    children: mediaChildren,
  },
  {
    path: "/crew",
    element: (
      <ProtectedRoute allowedRoles={["crew"]}>
        <V4DashboardLayout role="crew" />
      </ProtectedRoute>
    ),
    children: crewChildren,
  },
];

export function getPusatRouteAuditReport() {
  return auditPusatNavigationRoutes(v4Routes);
}
