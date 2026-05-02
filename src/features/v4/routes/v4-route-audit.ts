import type { RouteObject } from "react-router-dom";
import { pusatNav, type NavItem, type V4NavGroup } from "../navigation/v4-navigation";

export type V4RouteAuditStatus =
  | "OK"
  | "PLACEHOLDER_COMING_SOON"
  | "SAFE_REDIRECT_TO_FIRST_CHILD"
  | "ERROR";

export interface V4RouteAuditResult {
  path: string;
  label: string;
  status: V4RouteAuditStatus;
  message: string;
  firstChildPath?: string;
}

type ParentRoutePolicy = {
  status: Exclude<V4RouteAuditStatus, "ERROR">;
  message: string;
};

type ExplicitRouteAuditPolicy = ParentRoutePolicy & {
  label: string;
  path: string;
  firstChildPath?: string;
};

const PUSAT_PARENT_ROUTE_POLICIES: Record<string, ParentRoutePolicy> = {
  "/pusat/pengaturan": {
    status: "OK",
    message: "Parent route Pengaturan punya overview langsung dan child route aman.",
  },
  "/pusat/pengaturan/regional": {
    status: "OK",
    message: "Pengaturan Regional aktif dan render halaman pengelolaan regional.",
  },
  "/pusat/pengaturan/profil": {
    status: "PLACEHOLDER_COMING_SOON",
    message: "Profil Pusat adalah readiness safe untuk identitas resmi MPJ Pusat.",
  },
  "/pusat/pengaturan/tim-pusat": {
    status: "PLACEHOLDER_COMING_SOON",
    message: "Tim Pusat adalah readiness safe untuk struktur tim dan akses internal.",
  },
  "/pusat/pengaturan/harga-sku": {
    status: "PLACEHOLDER_COMING_SOON",
    message: "Harga & SKU adalah placeholder Segera Hadir yang aman.",
  },
  "/pusat/event": {
    status: "OK",
    message: "Parent route punya overview langsung dan child route aktif.",
  },
  "/pusat/sekretariat": {
    status: "OK",
    message: "Parent route punya ringkasan langsung dan child route aktif.",
  },
  "/pusat/mpj-hub": {
    status: "PLACEHOLDER_COMING_SOON",
    message: "Parent route resmi MPJ Hub adalah placeholder Segera Hadir yang aman.",
  },
  "/pusat/militansi": {
    status: "OK",
    message: "Militansi adalah monitoring readiness safe untuk XP, level, dan aktivitas.",
  },
  "/pusat/militansi/leveling": {
    status: "OK",
    message: "Pengaturan Leveling adalah setting readiness safe di modul Militansi.",
  },
};

const EXTRA_PUSAT_ROUTE_AUDIT_POLICIES: ExplicitRouteAuditPolicy[] = [
  {
    path: "/pusat/pengaturan/admin-role",
    label: "Tim Pusat Legacy",
    status: "SAFE_REDIRECT_TO_FIRST_CHILD",
    message: "Legacy route aman dan redirect ke /pusat/pengaturan/tim-pusat.",
    firstChildPath: "/pusat/pengaturan/tim-pusat",
  },
  {
    path: "/pusat/pengaturan/leveling",
    label: "Pengaturan Leveling Legacy",
    status: "SAFE_REDIRECT_TO_FIRST_CHILD",
    message: "Legacy route aman dan redirect ke /pusat/militansi/leveling.",
    firstChildPath: "/pusat/militansi/leveling",
  },
  {
    path: "/pusat/pengaturan/paket-slot",
    label: "Harga & SKU Legacy",
    status: "SAFE_REDIRECT_TO_FIRST_CHILD",
    message: "Legacy route aman dan redirect ke /pusat/pengaturan/harga-sku.",
    firstChildPath: "/pusat/pengaturan/harga-sku",
  },
];

export function auditPusatNavigationRoutes(routes: RouteObject[]): V4RouteAuditResult[] {
  const registeredPaths = collectRegisteredPaths(routes);
  const navAudit = auditNavigationRoutes(pusatNav, registeredPaths);
  const extraAudit = EXTRA_PUSAT_ROUTE_AUDIT_POLICIES
    .filter((policy) => registeredPaths.has(policy.path))
    .map((policy) => ({
      path: policy.path,
      label: policy.label,
      status: policy.status,
      message: policy.message,
      firstChildPath: policy.firstChildPath,
    }));

  return [...navAudit, ...extraAudit];
}

export function auditNavigationRoutes(groups: V4NavGroup[], registeredPaths: Set<string>): V4RouteAuditResult[] {
  return groups.flatMap((group) => group.items.flatMap((item) => auditNavItem(item, registeredPaths)));
}

function auditNavItem(item: NavItem, registeredPaths: Set<string>): V4RouteAuditResult[] {
  if (item.enabled === false) return [];

  const current = item.path ? [classifyNavItemRoute(item, registeredPaths)] : [];
  const children = item.children?.flatMap((child) => auditNavItem(child, registeredPaths)) ?? [];

  return [...current, ...children];
}

function classifyNavItemRoute(item: NavItem, registeredPaths: Set<string>): V4RouteAuditResult {
  const path = item.path as string;
  const label = item.label;
  const policy = PUSAT_PARENT_ROUTE_POLICIES[path];
  const firstChildPath = findFirstEnabledChildPath(item);

  if (policy) {
    return {
      path,
      label,
      status: policy.status,
      message: policy.message,
      firstChildPath,
    };
  }

  if (registeredPaths.has(path)) {
    return {
      path,
      label,
      status: "OK",
      message: "Route terdaftar dan aman.",
      firstChildPath,
    };
  }

  if (firstChildPath && registeredPaths.has(firstChildPath)) {
    return {
      path,
      label,
      status: "SAFE_REDIRECT_TO_FIRST_CHILD",
      message: "Parent belum punya page index langsung, tetapi child route pertama aman.",
      firstChildPath,
    };
  }

  return {
    path,
    label,
    status: "ERROR",
    message: "Route belum terdaftar dan tidak punya child route aktif yang aman.",
    firstChildPath,
  };
}

function findFirstEnabledChildPath(item: NavItem): string | undefined {
  return item.children?.find((child) => child.enabled !== false && child.path)?.path;
}

function collectRegisteredPaths(routes: RouteObject[]): Set<string> {
  const paths = new Set<string>();

  for (const route of routes) {
    collectRoutePaths(route, "", paths);
  }

  return paths;
}

function collectRoutePaths(route: RouteObject, parentPath: string, paths: Set<string>) {
  const routePath = route.path ? joinRoutePath(parentPath, route.path) : parentPath;

  if (routePath) {
    paths.add(routePath);
  }

  route.children?.forEach((child) => collectRoutePaths(child, routePath, paths));
}

function joinRoutePath(parentPath: string, childPath: string) {
  if (childPath.startsWith("/")) return normalizePath(childPath);
  if (!parentPath) return normalizePath(childPath);

  return normalizePath(`${parentPath}/${childPath}`);
}

function normalizePath(path: string) {
  const normalized = path.replace(/\/+/g, "/");
  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}
