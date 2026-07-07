import { create } from "zustand";
import { AdminApi } from "./admin.api";
import type { AdminDashboardData, AdminUser, PendingKycItem, ComplianceCaseItem, FailedPayoutItem, ExecutedPayoutItem, PayoutDetailItem, FraudAnalysis, AdminNotification, AdminPartner, PartnerSlaMetric, SystemHealth, SystemMetrics, SystemStatus, TreasuryOverview, Agent, AgentDetail, AgentKpiItem, AdminUserItem, AddBalancePayload, TransferItem, AuditLogItem } from "./admin.types";

interface AdminState {
  dashboard: AdminDashboardData | null;
  users: AdminUser[];
  pendingKyc: PendingKycItem[];
  kycDetail: any | null;
  complianceCases: ComplianceCaseItem[];
  failedPayouts: FailedPayoutItem[];
  executedPayouts: ExecutedPayoutItem[];
  fraudAnalysis: FraudAnalysis | null;
  notifications: AdminNotification[];
  unreadNotifications: number;
  partners: AdminPartner[];
  partnerMetrics: Record<string, PartnerSlaMetric>;
  reconcileResult: { total: number; matched: number; unmatched: number; errors: number } | null;
  systemHealth: SystemHealth | null;
  systemMetrics: SystemMetrics | null;
  systemStatus: SystemStatus | null;
  treasuryOverview: TreasuryOverview | null;
  treasuryLoading: boolean;
  rebalanceMessage: string;
  loading: boolean;
  usersLoading: boolean;
  error: string;

  fetchDashboard: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  toggleUserStatus: (userId: string) => Promise<void>;
  fetchPendingKyc: () => Promise<void>;
  approveKyc: (kycId: string) => Promise<void>;
  rejectKyc: (kycId: string) => Promise<void>;
  fetchKycDetail: (kycId: string) => Promise<void>;
  fetchComplianceCases: () => Promise<void>;
  escalateCase: (caseId: string) => Promise<void>;
  fetchFailedPayouts: () => Promise<void>;
  fetchExecutedPayouts: () => Promise<void>;
  fetchPayoutDetail: (payoutId: string) => Promise<PayoutDetailItem>;
  retryPayout: (payoutId: string) => Promise<void>;
  analyzeFraud: (userId: string) => Promise<void>;
  fetchNotifications: () => Promise<void>;
  markNotificationRead: (notificationId: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  fetchPartners: () => Promise<void>;
  fetchPartnerMetrics: (partnerId: string) => Promise<void>;
  createPartner: (data: { name: string; type: string; country?: string; baseUrl?: string; apiKey?: string; priority?: number }) => Promise<void>;
  deactivatePartner: (partnerId: string) => Promise<void>;
  runReconciliation: () => Promise<void>;
  fetchSystemHealth: () => Promise<void>;
  fetchSystemMetrics: () => Promise<void>;
  fetchSystemStatus: () => Promise<void>;
  triggerBackup: () => Promise<void>;
  fetchTreasuryOverview: () => Promise<void>;
  triggerRebalance: (network: string) => Promise<void>;
  agents: Agent[];
  agentDetail: AgentDetail | null;
  agentKpi: AgentKpiItem[];
  agentActionLoading: boolean;
  agentActionResult: string | null;
  fetchAgents: () => Promise<void>;
  createAgent: (data: { email: string; password: string; fullName?: string; phone?: string; type: string }) => Promise<void>;
  fetchAgentDetail: (agentId: string) => Promise<void>;
  toggleAgentStatus: (agentId: string) => Promise<void>;
  fetchAgentKpi: (agentId: string, period?: string) => Promise<void>;
  agentAddBalance: (payload: AddBalancePayload) => Promise<void>;
  clearAgentActionResult: () => void;

  adminUsers: AdminUserItem[];
  fetchAdminUsers: () => Promise<void>;
  createAdmin: (data: { email: string; name?: string; password: string; role: string }) => Promise<void>;
  toggleAdminStatus: (adminId: string) => Promise<void>;
  deleteAdmin: (adminId: string) => Promise<void>;

  transfers: TransferItem[];
  transfersLoading: boolean;
  fetchTransfers: () => Promise<void>;

  auditLogs: AuditLogItem[];
  auditLogsLoading: boolean;
  fetchAuditLogs: () => Promise<void>;
}

export const useAdminStore = create<AdminState>((set) => ({
  dashboard: null,
  users: [],
  pendingKyc: [],
  kycDetail: null,
  complianceCases: [],
  failedPayouts: [],
  executedPayouts: [],
  fraudAnalysis: null,
  notifications: [],
  unreadNotifications: 0,
  partners: [],
  partnerMetrics: {},
  reconcileResult: null,
  systemHealth: null,
  systemMetrics: null,
  systemStatus: null,
  treasuryOverview: null,
  treasuryLoading: false,
  rebalanceMessage: "",
  agents: [],
  agentDetail: null,
  agentKpi: [],
  agentActionLoading: false,
  agentActionResult: null,
  adminUsers: [],
  transfers: [],
  transfersLoading: false,
  auditLogs: [],
  auditLogsLoading: false,
  loading: false,
  usersLoading: false,
  error: "",

  fetchDashboard: async () => {
    set({ loading: true, error: "" });
    try {
      const dashboard = await AdminApi.getDashboard();
      set({ dashboard, loading: false });
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.message || "Failed to load dashboard";
      set({ loading: false, error: message });
    }
  },

  fetchUsers: async () => {
    set({ usersLoading: true });
    try {
      const users = await AdminApi.getUsers();
      set({ users, usersLoading: false });
    } catch (err) {
      console.error("Failed to fetch users:", err);
      set({ usersLoading: false });
    }
  },

  toggleUserStatus: async (userId: string) => {
    try {
      await AdminApi.toggleUserStatus(userId);
      set((state) => ({
        users: state.users.map((u) =>
          u.id === userId ? { ...u, status: u.status === "ACTIVE" ? "FROZEN" as const : "ACTIVE" as const } : u
        ),
      }));
    } catch (err) {
      console.error("Failed to toggle user status:", err);
    }
  },

  fetchPendingKyc: async () => {
    try {
      const pendingKyc = await AdminApi.getPendingKyc();
      set({ pendingKyc });
    } catch (err) {
      console.error("Failed to fetch pending KYC:", err);
    }
  },

  approveKyc: async (kycId: string) => {
    await AdminApi.approveKyc(kycId);
    set((state) => ({ pendingKyc: state.pendingKyc.filter((k) => k.id !== kycId) }));
  },

  rejectKyc: async (kycId: string) => {
    await AdminApi.rejectKyc(kycId);
    set((state) => ({ pendingKyc: state.pendingKyc.filter((k) => k.id !== kycId) }));
  },

  fetchKycDetail: async (kycId: string) => {
    try {
      const kycDetail = await AdminApi.getKycDetail(kycId);
      set({ kycDetail });
    } catch (err) {
      console.error("Failed to fetch KYC detail:", err);
    }
  },

  fetchComplianceCases: async () => {
    try {
      const complianceCases = await AdminApi.getComplianceCases();
      set({ complianceCases });
    } catch (err) {
      console.error("Failed to fetch compliance cases:", err);
    }
  },

  escalateCase: async (caseId: string) => {
    await AdminApi.escalateCase(caseId);
    set((state) => ({
      complianceCases: state.complianceCases.map((c) =>
        c.id === caseId ? { ...c, status: "ESCALATED" as const } : c
      ),
    }));
  },

  fetchFailedPayouts: async () => {
    try {
      const failedPayouts = await AdminApi.getFailedPayouts();
      set({ failedPayouts });
    } catch (err) {
      console.error("Failed to fetch failed payouts:", err);
    }
  },

  fetchExecutedPayouts: async () => {
    try {
      const executedPayouts = await AdminApi.getExecutedPayouts();
      set({ executedPayouts });
    } catch (err) {
      console.error("Failed to fetch executed payouts:", err);
    }
  },

  fetchPayoutDetail: async (payoutId: string) => {
    const detail = await AdminApi.getPayoutDetail(payoutId);
    return detail;
  },

  retryPayout: async (payoutId: string) => {
    await AdminApi.retryPayout(payoutId);
    set((state) => ({
      failedPayouts: state.failedPayouts.filter((p) => p.id !== payoutId),
    }));
  },

  fetchNotifications: async () => {
    try {
      const notifications = await AdminApi.getNotifications();
      set({ notifications, unreadNotifications: notifications.filter((n) => n.status === "UNREAD").length });
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  },

  markNotificationRead: async (notificationId: string) => {
    await AdminApi.markNotificationRead(notificationId);
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === notificationId ? { ...n, status: "READ" as const } : n
      ),
      unreadNotifications: Math.max(0, state.unreadNotifications - 1),
    }));
  },

  markAllNotificationsRead: async () => {
    await AdminApi.markAllNotificationsRead();
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, status: "READ" as const })),
      unreadNotifications: 0,
    }));
  },

  fetchPartners: async () => {
    try {
      const partners = await AdminApi.getPartners();
      set({ partners });
    } catch (err) {
      console.error("Failed to fetch partners:", err);
    }
  },

  fetchPartnerMetrics: async (partnerId: string) => {
    try {
      const metrics = await AdminApi.getPartnerMetrics(partnerId);
      if (metrics) {
        set((state) => ({ partnerMetrics: { ...state.partnerMetrics, [partnerId]: metrics } }));
      }
    } catch (err) {
      console.error("Failed to fetch partner metrics:", err);
    }
  },

  createPartner: async (data) => {
    const partner = await AdminApi.createPartner(data);
    set((state) => ({ partners: [...state.partners, partner] }));
  },

  deactivatePartner: async (partnerId: string) => {
    await AdminApi.deactivatePartner(partnerId);
    set((state) => ({
      partners: state.partners.map((p) =>
        p.id === partnerId ? { ...p, status: "INACTIVE" } : p
      ),
    }));
  },

  runReconciliation: async () => {
    const result = await AdminApi.reconcilePartners();
    set({ reconcileResult: result });
  },

  fetchSystemHealth: async () => {
    try {
      const systemHealth = await AdminApi.getSystemHealth();
      set({ systemHealth });
    } catch (err) {
      console.error("Failed to fetch system health:", err);
    }
  },

  fetchSystemMetrics: async () => {
    try {
      const systemMetrics = await AdminApi.getSystemMetrics();
      set({ systemMetrics });
    } catch (err) {
      console.error("Failed to fetch system metrics:", err);
    }
  },

  fetchSystemStatus: async () => {
    try {
      const systemStatus = await AdminApi.getSystemStatus();
      set({ systemStatus });
    } catch (err) {
      console.error("Failed to fetch system status:", err);
    }
  },

  triggerBackup: async () => {
    try {
      await AdminApi.triggerBackup();
    } catch (err) {
      console.error("Failed to trigger backup:", err);
    }
  },

  analyzeFraud: async (userId: string) => {
    const fraudAnalysis = await AdminApi.analyzeFraud(userId);
    set({ fraudAnalysis });
  },

  fetchTreasuryOverview: async () => {
    set({ treasuryLoading: true });
    try {
      const treasuryOverview = await AdminApi.getTreasuryOverview();
      set({ treasuryOverview, treasuryLoading: false });
    } catch (err) {
      console.error("Failed to fetch treasury overview:", err);
      set({ treasuryLoading: false });
    }
  },

  triggerRebalance: async (network: string) => {
    set({ rebalanceMessage: "" });
    const result = await AdminApi.triggerRebalance(network);
    set({ rebalanceMessage: result.message });
  },

  fetchAgents: async () => {
    try {
      const agents = await AdminApi.getAgents();
      set({ agents });
    } catch (err) {
      console.error("Failed to fetch agents:", err);
    }
  },

  createAgent: async (data) => {
    const agent = await AdminApi.createAgent(data);
    set((state) => ({ agents: [...state.agents, agent] }));
  },

  fetchAgentDetail: async (agentId: string) => {
    try {
      const agentDetail = await AdminApi.getAgentDetail(agentId);
      set({ agentDetail });
    } catch (err) {
      console.error("Failed to fetch agent detail:", err);
    }
  },

  toggleAgentStatus: async (agentId: string) => {
    await AdminApi.toggleAgentStatus(agentId);
    set((state) => ({
      agents: state.agents.map((a) =>
        a.id === agentId ? { ...a, status: a.status === "ACTIVE" ? "SUSPENDED" as const : "ACTIVE" as const } : a
      ),
    }));
  },

  fetchAgentKpi: async (agentId: string, period?: string) => {
    try {
      const agentKpi = await AdminApi.getAgentKpi(agentId, period);
      set({ agentKpi });
    } catch (err) {
      console.error("Failed to fetch agent KPI:", err);
    }
  },

  agentAddBalance: async (payload: AddBalancePayload) => {
    set({ agentActionLoading: true, agentActionResult: null });
    try {
      await AdminApi.addBalance(payload);
      set({ agentActionLoading: false, agentActionResult: `Top-up completed — ${payload.usdtAmount} USDT sent to partner` });
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.message || "Top up failed";
      set({ agentActionLoading: false, agentActionResult: message });
    }
  },

  clearAgentActionResult: () => set({ agentActionResult: null }),

  fetchAdminUsers: async () => {
    try {
      const adminUsers = await AdminApi.getAdmins();
      set({ adminUsers });
    } catch (err) {
      console.error("Failed to fetch admin users:", err);
    }
  },

  createAdmin: async (data) => {
    const admin = await AdminApi.createAdmin(data);
    set((state) => ({ adminUsers: [...state.adminUsers, admin] }));
  },

  toggleAdminStatus: async (adminId: string) => {
    await AdminApi.toggleAdminStatus(adminId);
    set((state) => ({
      adminUsers: state.adminUsers.map((a) =>
        a.id === adminId ? { ...a, status: a.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE" } : a
      ),
    }));
  },

  deleteAdmin: async (adminId: string) => {
    await AdminApi.deleteAdmin(adminId);
    set((state) => ({ adminUsers: state.adminUsers.filter((a) => a.id !== adminId) }));
  },

  fetchTransfers: async () => {
    set({ transfersLoading: true });
    try {
      const transfers = await AdminApi.getTransfers();
      set({ transfers, transfersLoading: false, error: "" });
    } catch (err) {
      const message = (err as any)?.response?.data?.error || (err as any)?.message || "Failed to fetch transfers";
      console.error("Failed to fetch transfers:", message);
      set({ transfersLoading: false, error: message });
      throw err;
    }
  },

  fetchAuditLogs: async () => {
    set({ auditLogsLoading: true });
    try {
      const auditLogs = await AdminApi.getAuditLogs();
      set({ auditLogs, auditLogsLoading: false });
    } catch (err) {
      console.error("Failed to fetch audit logs:", err);
      set({ auditLogsLoading: false });
    }
  },
}));
