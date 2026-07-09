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
  "/payouts": ["SUPER_ADMIN", "ADMIN", "OPS", "TREASURY"],
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
  "/agent/commission": ["AGENT_PARTNER", "AGENT_INTERNAL"],
  "/agent/reconciliation": ["AGENT_INTERNAL"],
  "/agent/swap-wallet": ["AGENT_PARTNER"],
  "/transfers": ["SUPER_ADMIN", "ADMIN", "OPS", "TREASURY"],
  "/audit": ["SUPER_ADMIN", "ADMIN", "COMPLIANCE", "OPS"],
  "/pending-transfers": ["AGENT_PARTNER", "AGENT_INTERNAL"],
  "/agent/activity": ["AGENT_PARTNER", "AGENT_INTERNAL"],
  "/agent/cash-settlement": ["AGENT_PARTNER", "AGENT_INTERNAL"],
  "/finance/fees": ["SUPER_ADMIN", "ADMIN", "OPS"],
  "/cash-requests": ["SUPER_ADMIN", "ADMIN", "OPS", "TREASURY"],
};

export function canAccess(path: string, role: AdminRole | undefined): boolean {
  if (!role) return false;
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
