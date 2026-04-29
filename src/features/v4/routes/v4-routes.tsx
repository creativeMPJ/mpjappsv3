import { Navigate, type RouteObject } from "react-router-dom";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import V4DashboardLayout from "../layout/V4DashboardLayout";
import { PusatBerandaPage, RegionalBerandaPage } from "../pages/V4HomePages";
import { PusatVerifikasiPaymentPage, RegionalMonitoringPendaftaranPage } from "../pages/V4Phase2Pages";
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

const pusatChildren: RouteObject[] = [
  { index: true, element: <Navigate to="/pusat/beranda" replace /> },
  { path: "beranda", element: <PusatBerandaPage /> },
  { path: "administrasi/verifikasi-payment", element: <PusatVerifikasiPaymentPage /> },
  { path: "sekretariat", element: <PusatSekretariatPage /> },
  { path: "sekretariat/surat-keluar", element: <PusatSuratKeluarPage /> },
  { path: "sekretariat/surat-masuk", element: <PusatSuratMasukPage /> },
  { path: "sekretariat/asset-ttd", element: <PusatAssetTtdPage /> },
  { path: "sekretariat/pengaturan-template", element: <PusatPengaturanTemplatePage /> },
  { path: "master-data/pesantren", element: <PusatMasterPesantrenPage /> },
  { path: "master-data/media", element: <PusatMasterMediaPage /> },
  { path: "master-data/kru", element: <PusatMasterKruPage /> },
  { path: "event/daftar", element: <PusatEventDaftarPage /> },
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
];
