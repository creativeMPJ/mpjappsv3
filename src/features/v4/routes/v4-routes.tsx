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

const pusatChildren: RouteObject[] = [
  { index: true, element: <Navigate to="/pusat/beranda" replace /> },
  { path: "beranda", element: <PusatBerandaPage /> },
  { path: "administrasi/verifikasi-payment", element: <PusatVerifikasiPaymentPage /> },
  { path: "master-data/pesantren", element: <PusatMasterPesantrenPage /> },
  { path: "master-data/media", element: <PusatMasterMediaPage /> },
  { path: "master-data/kru", element: <PusatMasterKruPage /> },
];

const regionalChildren: RouteObject[] = [
  { index: true, element: <Navigate to="/regional/beranda" replace /> },
  { path: "beranda", element: <RegionalBerandaPage /> },
  { path: "administrasi/monitoring-pendaftaran", element: <RegionalMonitoringPendaftaranPage /> },
  { path: "master-data/pesantren", element: <RegionalMasterPesantrenPage /> },
  { path: "master-data/media", element: <RegionalMasterMediaPage /> },
  { path: "master-data/kru", element: <RegionalMasterKruPage /> },
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
