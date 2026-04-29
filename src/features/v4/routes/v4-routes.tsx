import { Navigate, type RouteObject } from "react-router-dom";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import V4DashboardLayout from "../layout/V4DashboardLayout";
import { PusatBerandaPage, RegionalBerandaPage } from "../pages/V4HomePages";

const pusatChildren: RouteObject[] = [
  { index: true, element: <Navigate to="/pusat/beranda" replace /> },
  { path: "beranda", element: <PusatBerandaPage /> },
];

const regionalChildren: RouteObject[] = [
  { index: true, element: <Navigate to="/regional/beranda" replace /> },
  { path: "beranda", element: <RegionalBerandaPage /> },
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
