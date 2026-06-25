import type { AdminRole } from "./admin.types";

export interface PagePermission {
  path: string;
  label: string;
  roles: AdminRole[];
  icon?: string;
}

export const PAGE_PERMISSIONS: Record<string, AdminRole[]> = {
  "/admins": ["SUPER_ADMIN"],
  "/agents": ["SUPER_ADMIN", "ADMIN", "OPS", "TREASURY"],
  "/agents/topup": ["SUPER_ADMIN", "ADMIN", "OPS", "TREASURY"],
  "/users": ["SUPER_ADMIN", "ADMIN", "OPS"],
  "/kyc": ["SUPER_ADMIN", "ADMIN", "COMPLIANCE"],
  "/partners": ["SUPER_ADMIN", "ADMIN", "OPS"],
  "/treasury": ["SUPER_ADMIN", "ADMIN", "TREASURY"],
  "/payouts": ["SUPER_ADMIN", "ADMIN", "OPS"],
  "/cases": ["SUPER_ADMIN", "ADMIN", "COMPLIANCE"],
  "/fraud": ["SUPER_ADMIN", "ADMIN", "COMPLIANCE"],
  "/": ["SUPER_ADMIN", "ADMIN", "COMPLIANCE", "OPS", "TREASURY", "AGENT_PARTNER", "AGENT_INTERNAL"],
  "/live": ["SUPER_ADMIN", "ADMIN", "COMPLIANCE", "OPS", "TREASURY"],
  "/system": ["SUPER_ADMIN", "ADMIN", "COMPLIANCE", "OPS", "TREASURY"],
  "/notifications": ["SUPER_ADMIN", "ADMIN", "COMPLIANCE", "OPS", "TREASURY"],
  "/agent/deposit": ["AGENT_PARTNER", "AGENT_INTERNAL"],
  "/agent/withdraw": ["AGENT_PARTNER", "AGENT_INTERNAL"],
  "/agent/payout": ["AGENT_PARTNER", "AGENT_INTERNAL"],
  "/agent/transfer": ["AGENT_PARTNER", "AGENT_INTERNAL"],
  "/agent/topup": ["AGENT_INTERNAL"],
  "/transfers": ["SUPER_ADMIN", "ADMIN", "OPS", "TREASURY"],
  "/audit": ["SUPER_ADMIN", "ADMIN", "COMPLIANCE", "OPS"],
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
