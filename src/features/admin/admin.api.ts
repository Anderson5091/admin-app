import { api } from "../../api/client";
import type { AdminDashboardData, AdminUser, PendingKycItem, ComplianceCaseItem, FailedPayoutItem, FraudAnalysis, AdminNotification, AdminPartner, PartnerSlaMetric, SystemHealth, SystemMetrics, SystemStatus, TreasuryOverview, Agent, AgentDetail, AgentKpiItem } from "./admin.types";

const USE_ADMIN_MOCK = false;

const mockDashboard: AdminDashboardData = {
  totalUsers: 12847,
  activeUsers: 10421,
  totalTransfers: 89231,
  totalVolume: 12450000,
  pendingKyc: 143,
  failedPayouts: 27,
  openCases: 89,
  fraudAlerts: 12,
  alerts: [
    { id: "a1", severity: "CRITICAL", message: "Unusual withdrawal pattern detected - 15 transactions over $10k in 1 hour", timestamp: "2026-06-12T08:23:00Z" },
    { id: "a2", severity: "HIGH", message: "Tier-2 KYC backlog exceeds 48 hours", timestamp: "2026-06-12T07:45:00Z" },
    { id: "a3", severity: "HIGH", message: "Treasury rebalance required - USDT on Base below threshold", timestamp: "2026-06-12T06:30:00Z" },
    { id: "a4", severity: "MEDIUM", message: "Payout partner 'SwiftPay' latency above SLA", timestamp: "2026-06-12T05:15:00Z" },
    { id: "a5", severity: "LOW", message: "New sanctions list update available", timestamp: "2026-06-11T22:00:00Z" },
  ],
  recentActivity: [
    { id: "r1", action: "User account frozen - suspicious activity", user: "j*****@example.com", timestamp: "2026-06-12T08:30:00Z" },
    { id: "r2", action: "KYC Tier 3 approved", user: "m*****@example.com", timestamp: "2026-06-12T08:15:00Z" },
    { id: "r3", action: "Compliance case escalated to LE", user: "a*****@example.com", timestamp: "2026-06-12T07:50:00Z" },
    { id: "r4", action: "Payout retry successful ($12,500)", user: "System", timestamp: "2026-06-12T07:30:00Z" },
    { id: "r5", action: "New admin user created", user: "admin@quicksend.com", timestamp: "2026-06-12T07:00:00Z" },
  ],
};

const mockUsers: AdminUser[] = Array.from({ length: 25 }, (_, i) => ({
  id: `usr_${i + 1}`,
  email: `user${i + 1}@example.com`,
  name: `User ${i + 1}`,
  status: i < 3 ? "FROZEN" : i < 5 ? "SUSPENDED" : "ACTIVE",
  kycTier: i % 3 === 0 ? 3 : i % 3 === 1 ? 2 : 1,
  totalTransfers: Math.floor(Math.random() * 100),
  totalVolume: Math.floor(Math.random() * 50000),
  createdAt: new Date(2025, i % 12, (i % 28) + 1).toISOString(),
}));

const mockPendingKyc: PendingKycItem[] = Array.from({ length: 10 }, (_, i) => ({
  id: `kyc_${i + 1}`,
  userId: `usr_${i + 50}`,
  email: `applicant${i + 1}@example.com`,
  name: `Applicant ${i + 1}`,
  tier: i < 4 ? 3 : 2,
  documents: [
    { id: `doc_${i}_1`, type: "PASSPORT", status: "PENDING", url: "#" },
    { id: `doc_${i}_2`, type: "PROOF_OF_ADDRESS", status: "PENDING", url: "#" },
  ],
  submittedAt: new Date(2026, 5, 12 - i).toISOString(),
}));

const mockComplianceCases: ComplianceCaseItem[] = Array.from({ length: 12 }, (_, i) => ({
  id: `case_${i + 1}`,
  userId: `usr_${i + 100}`,
  email: `flagged${i + 1}@example.com`,
  type: ["Suspicious Activity", "Structured Transfers", "Sanctions Hit", "Identity Theft"][i % 4],
  status: i < 3 ? "OPEN" : i < 6 ? "INVESTIGATING" : i < 9 ? "ESCALATED" : "CLOSED",
  severity: i < 3 ? "CRITICAL" : i < 6 ? "HIGH" : i < 9 ? "MEDIUM" : "LOW",
  createdAt: new Date(2026, 5, 10 - i).toISOString(),
}));

const mockFailedPayouts: FailedPayoutItem[] = Array.from({ length: 8 }, (_, i) => ({
  id: `po_${i + 1}`,
  transferId: `trx_${i + 200}`,
  amount: Math.floor(Math.random() * 15000) + 500,
  currency: "USDT",
  reason: ["Insufficient partner balance", "Invalid beneficiary details", "Partner timeout", "Compliance block"][i % 4],
  attempts: i < 3 ? 3 : i < 6 ? 2 : 1,
  lastAttempt: new Date(2026, 5, 11, 10 - i, 30).toISOString(),
  status: i < 4 ? "FAILED" : "PENDING_RETRY",
}));

const mockAdminNotifications: AdminNotification[] = [
  { id: "an1", type: "PAYOUT_FAILED", title: "Payout Failed", message: "Payout to user j*****@example.com failed - partner timeout", severity: "HIGH", status: "UNREAD", createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString() },
  { id: "an2", type: "KYC_PENDING", title: "KYC Backlog", message: "43 KYC applications pending review for over 24 hours", severity: "MEDIUM", status: "UNREAD", createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
  { id: "an3", type: "TREASURY_ALERT", title: "Treasury Low", message: "USDT on Base hot wallet balance is below minimum threshold", severity: "CRITICAL", status: "UNREAD", createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
  { id: "an4", type: "COMPLIANCE_FLAG", title: "Suspicious Activity", message: "Multiple high-value transfers detected from new account", severity: "HIGH", status: "READ", createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
  { id: "an5", type: "SYSTEM_INFO", title: "Sanctions List Updated", message: "OFAC sanctions list has been updated. 14 new entries added.", severity: "LOW", status: "READ", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
  { id: "an6", type: "USER_ALERT", title: "Account Frozen", message: "User a*****@example.com has been frozen due to suspicious activity", severity: "CRITICAL", status: "UNREAD", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() },
  { id: "an7", type: "SYSTEM_INFO", title: "System Update", message: "Platform maintenance scheduled for 02:00 UTC", severity: "LOW", status: "READ", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString() },
];

const mockPartners: AdminPartner[] = [
  { id: "p1", name: "SwiftPay Bank", type: "BANK", country: "US", status: "ACTIVE", baseUrl: "https://api.swiftpay.com", priority: 1, createdAt: new Date(Date.now() - 86400000 * 30).toISOString() },
  { id: "p2", name: "MobileWave", type: "MOBILE_MONEY", country: "GH", status: "ACTIVE", baseUrl: "https://api.mobilewave.com", priority: 2, createdAt: new Date(Date.now() - 86400000 * 25).toISOString() },
  { id: "p3", name: "CashNet Express", type: "CASH_PICKUP", country: "NG", status: "ACTIVE", baseUrl: "https://api.cashnet.com", priority: 3, createdAt: new Date(Date.now() - 86400000 * 20).toISOString() },
  { id: "p4", name: "GlobalPay", type: "BANK", country: "UK", status: "ACTIVE", baseUrl: "https://api.globalpay.com", priority: 2, createdAt: new Date(Date.now() - 86400000 * 15).toISOString() },
  { id: "p5", name: "DigiCash", type: "MOBILE_MONEY", country: "KE", status: "INACTIVE", baseUrl: "https://api.digicash.com", priority: 3, createdAt: new Date(Date.now() - 86400000 * 10).toISOString() },
];

const mockPartnerMetrics: Record<string, PartnerSlaMetric> = {
  p1: { id: "m1", partnerId: "p1", successRate: 98.5, avgResponseTimeMs: 450, failureCount: 3, updatedAt: new Date().toISOString() },
  p2: { id: "m2", partnerId: "p2", successRate: 94.2, avgResponseTimeMs: 820, failureCount: 8, updatedAt: new Date().toISOString() },
  p3: { id: "m3", partnerId: "p3", successRate: 91.7, avgResponseTimeMs: 1250, failureCount: 12, updatedAt: new Date().toISOString() },
  p4: { id: "m4", partnerId: "p4", successRate: 96.1, avgResponseTimeMs: 680, failureCount: 5, updatedAt: new Date().toISOString() },
  p5: { id: "m5", partnerId: "p5", successRate: 88.3, avgResponseTimeMs: 2100, failureCount: 18, updatedAt: new Date().toISOString() },
};

export const AdminApi = {
  async getDashboard(): Promise<AdminDashboardData> {
    if (USE_ADMIN_MOCK) return mockDashboard;
    const { data } = await api.get("/admin/dashboard");
    return data;
  },

  async getUsers(): Promise<AdminUser[]> {
    if (USE_ADMIN_MOCK) return mockUsers;
    const { data } = await api.get("/admin/users");
    return data;
  },

  async toggleUserStatus(userId: string): Promise<void> {
    if (USE_ADMIN_MOCK) return;
    await api.post(`/admin/users/${userId}/toggle-status`);
  },

  async getPendingKyc(): Promise<PendingKycItem[]> {
    if (USE_ADMIN_MOCK) return mockPendingKyc;
    const { data } = await api.get("/admin/kyc/pending");
    return data;
  },

  async approveKyc(kycId: string): Promise<void> {
    if (USE_ADMIN_MOCK) return;
    await api.post(`/admin/kyc/${kycId}/approve`);
  },

  async rejectKyc(kycId: string): Promise<void> {
    if (USE_ADMIN_MOCK) return;
    await api.post(`/admin/kyc/${kycId}/reject`);
  },

  async getComplianceCases(): Promise<ComplianceCaseItem[]> {
    if (USE_ADMIN_MOCK) return mockComplianceCases;
    const { data } = await api.get("/admin/compliance-cases");
    return data;
  },

  async escalateCase(caseId: string): Promise<void> {
    if (USE_ADMIN_MOCK) return;
    await api.post(`/admin/compliance-cases/${caseId}/escalate`);
  },

  async getFailedPayouts(): Promise<FailedPayoutItem[]> {
    if (USE_ADMIN_MOCK) return mockFailedPayouts;
    const { data } = await api.get("/admin/payouts/failed");
    return data;
  },

  async retryPayout(payoutId: string): Promise<void> {
    if (USE_ADMIN_MOCK) return;
    await api.post(`/admin/payouts/${payoutId}/retry`);
  },

  async getNotifications(): Promise<AdminNotification[]> {
    if (USE_ADMIN_MOCK) return mockAdminNotifications;
    const { data } = await api.get("/admin/notifications");
    return data;
  },

  async markNotificationRead(notificationId: string): Promise<void> {
    if (USE_ADMIN_MOCK) return;
    await api.post(`/admin/notifications/${notificationId}/read`);
  },

  async markAllNotificationsRead(): Promise<void> {
    if (USE_ADMIN_MOCK) return;
    await api.post("/admin/notifications/mark-all-read");
  },

  async getPartners(): Promise<AdminPartner[]> {
    if (USE_ADMIN_MOCK) return mockPartners;
    const { data } = await api.get("/partners");
    return data;
  },

  async getPartnerMetrics(partnerId: string): Promise<PartnerSlaMetric | null> {
    if (USE_ADMIN_MOCK) return mockPartnerMetrics[partnerId] || null;
    const { data } = await api.get(`/partners/${partnerId}/metrics`);
    return data;
  },

  async createPartner(data: { name: string; type: string; country?: string; baseUrl?: string; apiKey?: string; priority?: number }): Promise<AdminPartner> {
    if (USE_ADMIN_MOCK) {
      const partner: AdminPartner = {
        id: `p_${Date.now()}`,
        name: data.name,
        type: data.type as AdminPartner["type"],
        country: data.country || null,
        status: "ACTIVE",
        baseUrl: data.baseUrl || null,
        priority: data.priority || 1,
        createdAt: new Date().toISOString(),
      };
      return partner;
    }
    const { data: res } = await api.post("/partners", data);
    return res;
  },

  async updatePartner(id: string, data: Partial<AdminPartner>): Promise<void> {
    if (USE_ADMIN_MOCK) return;
    await api.put(`/partners/${id}`, data);
  },

  async deactivatePartner(id: string): Promise<void> {
    if (USE_ADMIN_MOCK) return;
    await api.delete(`/partners/${id}`);
  },

  async reconcilePartners(): Promise<{ total: number; matched: number; unmatched: number; errors: number }> {
    if (USE_ADMIN_MOCK) {
      return { total: 1250, matched: 1198, unmatched: 38, errors: 14 };
    }
    const { data } = await api.post("/partners/reconcile");
    return data;
  },

  async getSystemHealth(): Promise<SystemHealth> {
    if (USE_ADMIN_MOCK) {
      return {
        status: "OK",
        version: "1.0.0",
        uptime: 184320,
        timestamp: new Date().toISOString(),
        services: { api: "UP", database: "UP", redis: "UP" },
        metrics: { totalRequests: 128473, activeTraces: 3 },
      };
    }
    const { data } = await api.get("/production/health");
    return data;
  },

  async getSystemMetrics(): Promise<SystemMetrics> {
    if (USE_ADMIN_MOCK) {
      return {
        uptime: 184320,
        counters: [
          { name: "api_requests_total", count: 128473, lastUpdated: new Date().toISOString() },
          { name: "api_status_200", count: 125234, lastUpdated: new Date().toISOString() },
          { name: "api_status_401", count: 1823, lastUpdated: new Date().toISOString() },
          { name: "api_status_500", count: 1416, lastUpdated: new Date().toISOString() },
          { name: "waf_sql_injection_blocked", count: 47, lastUpdated: new Date().toISOString() },
          { name: "waf_xss_blocked", count: 23, lastUpdated: new Date().toISOString() },
        ],
        latencies: [
          { name: "api_GET_/api/v1/wallet", avg: 45, min: 12, max: 340, count: 8421 },
          { name: "api_POST_/api/v1/transfers", avg: 230, min: 85, max: 1200, count: 3156 },
          { name: "api_POST_/api/v1/payout/execute", avg: 890, min: 210, max: 4500, count: 1872 },
        ],
        timestamp: new Date().toISOString(),
      };
    }
    const { data } = await api.get("/production/metrics");
    return data;
  },

  async getSystemStatus(): Promise<SystemStatus> {
    if (USE_ADMIN_MOCK) {
      return {
        healthy: true,
        lastBackup: "quicksend-backup-2026-06-11-23-00-00.sql",
        availableBackups: 14,
        disk: "/dev/sda1 100G 45G 55G 45% /",
        timestamp: new Date().toISOString(),
      };
    }
    const { data } = await api.get("/production/system-status");
    return data;
  },

  async triggerBackup(): Promise<{ status: string }> {
    if (USE_ADMIN_MOCK) {
      return { status: "SUCCESS" };
    }
    const { data } = await api.post("/production/backup");
    return data;
  },

  async getTreasuryOverview(): Promise<TreasuryOverview> {
    if (USE_ADMIN_MOCK) {
      return {
        totalLiquidity: 4450000,
        hotTotal: 1250000,
        warmTotal: 2200000,
        coldTotal: 1000000,
        networks: ["BASE", "ETHEREUM", "POLYGON", "SOLANA"],
        wallets: [
          { id: "tw1", walletType: "HOT", network: "BASE", address: "0xBaseHot......", balance: 45000, thresholdMin: 20000, lastSync: new Date().toISOString() },
          { id: "tw2", walletType: "HOT", network: "ETHEREUM", address: "0xEthHot......", balance: 35000, thresholdMin: 20000, lastSync: new Date().toISOString() },
          { id: "tw3", walletType: "HOT", network: "POLYGON", address: "0xPolyHot......", balance: 25000, thresholdMin: 20000, lastSync: new Date().toISOString() },
          { id: "tw4", walletType: "HOT", network: "SOLANA", address: "SolHot......", balance: 20000, thresholdMin: 20000, lastSync: new Date().toISOString() },
          { id: "tw5", walletType: "WARM", network: "BASE", address: "0xBaseWarm......", balance: 800000, thresholdMin: 250000, lastSync: new Date().toISOString() },
          { id: "tw6", walletType: "WARM", network: "ETHEREUM", address: "0xEthWarm......", balance: 600000, thresholdMin: 250000, lastSync: new Date().toISOString() },
          { id: "tw7", walletType: "WARM", network: "POLYGON", address: "0xPolyWarm......", balance: 500000, thresholdMin: 250000, lastSync: new Date().toISOString() },
          { id: "tw8", walletType: "WARM", network: "SOLANA", address: "SolWarm......", balance: 300000, thresholdMin: 250000, lastSync: new Date().toISOString() },
          { id: "tw9", walletType: "COLD", network: "BASE", address: "0xBaseCold......", balance: 1000000, thresholdMin: null, lastSync: new Date().toISOString() },
          { id: "tw10", walletType: "REVENUE", network: "BASE", address: "0xRevenue......", balance: 250000, thresholdMin: null, lastSync: new Date().toISOString() },
        ],
        recentMovements: [
          { id: "tm1", fromWallet: "WARM", toWallet: "HOT", amount: 100000, network: "BASE", reason: "Hot wallet refill", status: "COMPLETED", createdAt: new Date(Date.now() - 3600000).toISOString() },
          { id: "tm2", fromWallet: "COLD", toWallet: "WARM", amount: 500000, network: "ETHEREUM", reason: "Scheduled warming", status: "COMPLETED", createdAt: new Date(Date.now() - 7200000).toISOString() },
        ],
        snapshots: Array.from({ length: 7 }, (_, i) => ({
          id: `snap_${i}`,
          network: "BASE",
          hotBalance: 45000 - i * 2000,
          warmBalance: 800000 + i * 50000,
          coldBalance: 1000000,
          totalBalance: 1845000 + i * 48000,
          createdAt: new Date(Date.now() - i * 86400000).toISOString(),
        })),
      };
    }
    const { data } = await api.get("/treasury/overview");
    return data;
  },

  async triggerRebalance(network: string): Promise<{ status: string; message: string }> {
    if (USE_ADMIN_MOCK) {
      return { status: "SUCCESS", message: `Rebalance triggered for ${network}` };
    }
    const { data } = await api.post("/treasury/rebalance", { network });
    return data;
  },

  async getAgents(): Promise<Agent[]> {
    if (USE_ADMIN_MOCK) {
      return [
        { id: "agt_1", email: "partner1@quicksend.com", fullName: "John Partner", type: "PARTNER", status: "ACTIVE", kpiRating: 85, totalRewards: 12500, totalTransactions: 342, baseTreasuryBalance: 50000, commissionBalance: 3200, createdAt: new Date(Date.now() - 86400000 * 30).toISOString() },
        { id: "agt_2", email: "internal1@quicksend.com", fullName: "Jane Internal", type: "INTERNAL", status: "ACTIVE", kpiRating: 92, totalRewards: 8500, totalTransactions: 218, baseTreasuryBalance: 0, commissionBalance: 1800, createdAt: new Date(Date.now() - 86400000 * 25).toISOString() },
        { id: "agt_3", email: "partner2@quicksend.com", fullName: "Bob Partner", type: "PARTNER", status: "SUSPENDED", kpiRating: 45, totalRewards: 2300, totalTransactions: 89, baseTreasuryBalance: 12000, commissionBalance: 450, createdAt: new Date(Date.now() - 86400000 * 15).toISOString() },
      ];
    }
    const { data } = await api.get("/agent/list");
    return data;
  },

  async createAgent(data: { email: string; password: string; fullName?: string; phone?: string; type: string }): Promise<Agent> {
    if (USE_ADMIN_MOCK) {
      return { id: `agt_${Date.now()}`, email: data.email, fullName: data.fullName || null, type: data.type as Agent["type"], status: "ACTIVE", kpiRating: null, totalRewards: 0, totalTransactions: 0, baseTreasuryBalance: 0, commissionBalance: 0, createdAt: new Date().toISOString() };
    }
    const { data: res } = await api.post("/agent/create", data);
    return res;
  },

  async getAgentDetail(agentId: string): Promise<AgentDetail> {
    if (USE_ADMIN_MOCK) {
      return {
        id: agentId,
        email: "agent@quicksend.com",
        fullName: "Agent Name",
        type: "PARTNER",
        status: "ACTIVE",
        kpiRating: 78,
        totalRewards: 5600,
        baseTreasuryBalance: 25000,
        commissionBalance: 1200,
        todayVolume: 3400,
        todayCommission: 170,
        todayTxCount: 12,
        transactions: [],
        wallets: [
          { id: "w1", walletType: "BASE_TREASURY", network: "BASE", address: "0xBaseAgent...", balance: 25000 },
          { id: "w2", walletType: "COMMISSION", network: "BASE", address: "0xCommAgent...", balance: 1200 },
        ],
      };
    }
    const { data } = await api.get(`/agent/${agentId}`);
    return data;
  },

  async toggleAgentStatus(agentId: string): Promise<void> {
    if (USE_ADMIN_MOCK) return;
    await api.post(`/agent/${agentId}/toggle-status`);
  },

  async getAgentKpi(agentId: string, period?: string): Promise<AgentKpiItem[]> {
    if (USE_ADMIN_MOCK) {
      return Array.from({ length: 7 }, (_, i) => ({
        id: `kpi_${i}`,
        period: period || "DAILY",
        periodStart: new Date(Date.now() - i * 86400000).toISOString(),
        periodEnd: new Date(Date.now() - i * 86400000 + 86400000).toISOString(),
        totalVolume: 1500 + i * 200,
        totalCommission: 75 + i * 10,
        totalTxCount: 8 + i,
        rewardPoints: 150 + i * 20,
        rating: 70 + i * 3,
      }));
    }
    const params = period ? `?period=${period}` : "";
    const { data } = await api.get(`/agent/${agentId}/kpi${params}`);
    return data;
  },

  async analyzeFraud(userId: string): Promise<FraudAnalysis> {
    if (USE_ADMIN_MOCK) {
      return {
        userId,
        email: `user_${userId}@example.com`,
        riskScore: Math.floor(Math.random() * 100),
        flags: ["HIGH_VALUE_TRANSFER", "MULTIPLE_ACCOUNTS", "GEO_ANOMALY"].slice(0, Math.floor(Math.random() * 3) + 1),
        recentActivity: Array.from({ length: 8 }, (_, i) => ({
          action: ["Login from new device", "Transfer $5,000", "KYC tier change", "Password reset"][i % 4],
          timestamp: new Date(2026, 5, 12, 8 - i, 0).toISOString(),
        })),
      };
    }
    const { data } = await api.get(`/admin/fraud/analyze/${userId}`);
    return data;
  },
};
