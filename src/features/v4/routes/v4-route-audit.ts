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

const PUSAT_PARENT_ROUTE_POLICIES: Record<string, ParentRoutePolicy> = {
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
    status: "PLACEHOLDER_COMING_SOON",
    message: "Parent route Militansi adalah placeholder Segera Hadir yang aman.",
  },
};

export function auditPusatNavigationRoutes(routes: RouteObject[]): V4RouteAuditResult[] {
  return auditNavigationRoutes(pusatNav, collectRegisteredPaths(routes));
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
