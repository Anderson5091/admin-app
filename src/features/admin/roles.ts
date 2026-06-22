import type { AdminRole } from "./admin.types";

export interface PagePermission {
  path: string;
  label: string;
  roles: AdminRole[];
  icon?: string;
}

export const PAGE_PERMISSIONS: Record<string, AdminRole[]> = {
  "/": ["SUPER_ADMIN", "COMPLIANCE", "OPS", "TREASURY"],
  "/live": ["SUPER_ADMIN", "COMPLIANCE", "OPS", "TREASURY"],
  "/users": ["SUPER_ADMIN", "OPS"],
  "/kyc": ["SUPER_ADMIN", "COMPLIANCE"],
  "/cases": ["SUPER_ADMIN", "COMPLIANCE"],
  "/payouts": ["SUPER_ADMIN", "OPS"],
  "/fraud": ["SUPER_ADMIN", "COMPLIANCE"],
  "/system": ["SUPER_ADMIN", "COMPLIANCE", "OPS", "TREASURY"],
  "/treasury": ["SUPER_ADMIN", "TREASURY"],
  "/partners": ["SUPER_ADMIN", "OPS"],
  "/agents": ["SUPER_ADMIN", "OPS", "TREASURY"],
  "/admins": ["SUPER_ADMIN"],
  "/notifications": ["SUPER_ADMIN", "COMPLIANCE", "OPS", "TREASURY"],
};

export function canAccess(path: string, role: AdminRole | undefined): boolean {
  if (!role) return false;
  if (role === "SUPER_ADMIN") return true;
  const allowed = PAGE_PERMISSIONS[path];
  return allowed ? allowed.includes(role) : false;
}

export function getAccessiblePages(role: AdminRole | undefined): string[] {
  if (!role) return [];
  if (role === "SUPER_ADMIN") return Object.keys(PAGE_PERMISSIONS);
  return Object.entries(PAGE_PERMISSIONS)
    .filter(([_, roles]) => roles.includes(role))
    .map(([path]) => path);
}
