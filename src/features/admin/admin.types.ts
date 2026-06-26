export type AdminRole = "SUPER_ADMIN" | "ADMIN" | "COMPLIANCE" | "OPS" | "TREASURY" | "AGENT_PARTNER" | "AGENT_INTERNAL";

export type AgentType = "PARTNER" | "INTERNAL";

export interface Agent {
  id: string;
  email: string;
  fullName: string | null;
  type: AgentType;
  status: "ACTIVE" | "SUSPENDED";
  kpiRating: number | null;
  totalRewards: number;
  totalTransactions: number;
  walletBalance: number;
  commissionLedgerBalance: number;
  createdAt: string;
}

export interface PendingTransferItem {
  id: string;
  beneficiaryId: string | null;
  amount: number;
  payoutMethod: string | null;
  currency: string;
  status: string;
  createdAt: string;
}

export interface AgentDetail {
  id: string;
  email: string;
  fullName: string | null;
  type: AgentType;
  status: string;
  kpiRating: number | null;
  totalRewards: number;
  commissionLedgerBalance: number;
  walletBalance: number | null;
  todayVolume: number;
  todayCommission: number;
  todayTxCount: number;
  transactions: AgentTransactionItem[];
  wallets: AgentWalletInfo[];
  pendingTransfers: PendingTransferItem[];
}

export interface AgentTransactionItem {
  id: string;
  type: string;
  amount: number;
  commission: number;
  netAmount: number;
  userRef: string | null;
  status: string;
  createdAt: string;
}

export interface AgentWalletInfo {
  id: string;
  walletType: string;
  network: string;
  balance: number;
}

export interface AgentKpiItem {
  id: string;
  period: string;
  periodStart: string;
  periodEnd: string;
  totalVolume: number;
  totalCommission: number;
  totalTxCount: number;
  rewardPoints: number;
  rating: number | null;
}

export interface AddBalancePayload {
  userId: string;
  fiatAmount: string;
  usdtAmount: number;
}

export interface AdminProfile {
  id: string;
  email: string;
  role: AdminRole;
  status: string;
  createdAt: string;
}

export interface AdminUserItem {
  id: string;
  email: string;
  role: AdminRole;
  status: string;
  createdAt: string;
}

export type AlertSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export interface AdminDashboardData {
  totalUsers: number;
  activeUsers: number;
  totalTransfers: number;
  totalVolume: number;
  pendingKyc: number;
  failedPayouts: number;
  openCases: number;
  fraudAlerts: number;
  totalAgents: number;
  partnerAgents: number;
  internalAgents: number;
  alerts: Alert[];
  recentActivity: ActivityItem[];
}

export interface Alert {
  id: string;
  severity: AlertSeverity;
  message: string;
  timestamp: string;
  link?: string;
}

export interface ActivityItem {
  id: string;
  action: string;
  user: string;
  timestamp: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  status: "ACTIVE" | "FROZEN" | "SUSPENDED";
  kycTier: number;
  totalTransfers: number;
  totalVolume: number;
  createdAt: string;
}

export interface PendingKycItem {
  id: string;
  userId: string;
  email: string;
  name: string;
  tier: number;
  documents: KycDocument[];
  submittedAt: string;
}

export interface KycDocument {
  id: string;
  type: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  url: string;
}

export interface ComplianceCaseItem {
  id: string;
  userId: string;
  email: string;
  type: string;
  status: "OPEN" | "INVESTIGATING" | "ESCALATED" | "CLOSED";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  createdAt: string;
}

export interface FailedPayoutItem {
  id: string;
  transferId: string;
  amount: number;
  currency: string;
  reason: string;
  attempts: number;
  lastAttempt: string;
  status: "FAILED" | "PENDING_RETRY";
}

export interface FraudAnalysis {
  userId: string;
  email: string;
  riskScore: number;
  flags: string[];
  recentActivity: FraudActivity[];
}

export interface FraudActivity {
  action: string;
  timestamp: string;
}

export interface AdminNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  status: "UNREAD" | "READ";
  createdAt: string;
}

export interface AdminPartner {
  id: string;
  name: string;
  type: "BANK" | "MOBILE_MONEY" | "CASH_PICKUP";
  country: string | null;
  status: string;
  baseUrl: string | null;
  priority: number;
  createdAt: string;
}

export interface PartnerSlaMetric {
  id: string;
  partnerId: string;
  successRate: number | null;
  avgResponseTimeMs: number | null;
  failureCount: number;
  updatedAt: string;
}

export interface TreasuryWallet {
  id: string;
  walletType: "HOT" | "WARM" | "COLD" | "REVENUE";
  network: string;
  address: string;
  balance: number;
  thresholdMin: number | null;
  lastSync: string;
}

export interface TreasuryMovement {
  id: string;
  fromWallet: string;
  toWallet: string;
  amount: number;
  network: string;
  reason: string | null;
  status: string;
  createdAt: string;
}

export interface LiquiditySnapshot {
  id: string;
  network: string;
  hotBalance: number;
  warmBalance: number;
  coldBalance: number;
  totalBalance: number;
  createdAt: string;
}

export interface TreasuryOverview {
  totalLiquidity: number;
  hotTotal: number;
  warmTotal: number;
  coldTotal: number;
  networks: string[];
  wallets: TreasuryWallet[];
  recentMovements: TreasuryMovement[];
  snapshots: LiquiditySnapshot[];
}

export interface SystemHealth {
  status: string;
  version: string;
  uptime: number;
  timestamp: string;
  services: Record<string, string>;
  metrics: {
    totalRequests: number;
    activeTraces: number;
  };
}

export interface SystemMetrics {
  uptime: number;
  counters: { name: string; count: number; lastUpdated: string }[];
  latencies: { name: string; avg: number; min: number; max: number; count: number }[];
  timestamp: string;
}

export interface BackupEntry {
  backups: string[];
}

export interface TransferItem {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  amount: number;
  fee: number;
  destinationAmount: number;
  payoutMethod: string | null;
  status: string;
  referenceId: string | null;
  partner: string | null;
  partnerStatus: string | null;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  adminId: string | null;
  action: string;
  entity: string | null;
  entityId: string | null;
  metadata: any;
  createdAt: string;
}

export interface SystemStatus {
  healthy: boolean;
  lastBackup: string | null;
  availableBackups: number;
  disk: string;
  timestamp: string;
}
