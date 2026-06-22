import type { AdminRole } from "./admin.types";

export interface PagePermission {
  path: string;
  label: string;
  roles: AdminRole[];
  icon?: string;
}

export const PAGE_PERMISSIONS: Record<string, AdminRole[]> = {
  "/admins": ["SUPER_ADMIN"],
  "/agents": ["SUPER_ADMIN", "OPS", "TREASURY"],
  "/users": ["SUPER_ADMIN", "OPS"],
  "/kyc": ["SUPER_ADMIN", "COMPLIANCE"],
  "/partners": ["SUPER_ADMIN", "OPS"],
  "/treasury": ["SUPER_ADMIN", "TREASURY"],
  "/payouts": ["SUPER_ADMIN", "OPS"],
  "/cases": ["SUPER_ADMIN", "COMPLIANCE"],
  "/fraud": ["SUPER_ADMIN", "COMPLIANCE"],
  "/": ["SUPER_ADMIN", "COMPLIANCE", "OPS", "TREASURY"],
  "/live": ["SUPER_ADMIN", "COMPLIANCE", "OPS", "TREASURY"],
  "/system": ["SUPER_ADMIN", "COMPLIANCE", "OPS", "TREASURY"],
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
