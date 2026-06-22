import { create } from "zustand";
import { AdminApi } from "./admin.api";
import type { AdminDashboardData, AdminUser, PendingKycItem, ComplianceCaseItem, FailedPayoutItem, FraudAnalysis, AdminNotification, AdminPartner, PartnerSlaMetric, SystemHealth, SystemMetrics, SystemStatus, TreasuryOverview, Agent, AgentDetail, AgentKpiItem, AdminUserItem } from "./admin.types";

interface AdminState {
  dashboard: AdminDashboardData | null;
  users: AdminUser[];
  pendingKyc: PendingKycItem[];
  complianceCases: ComplianceCaseItem[];
  failedPayouts: FailedPayoutItem[];
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

  fetchDashboard: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  toggleUserStatus: (userId: string) => Promise<void>;
  fetchPendingKyc: () => Promise<void>;
  approveKyc: (kycId: string) => Promise<void>;
  rejectKyc: (kycId: string) => Promise<void>;
  fetchComplianceCases: () => Promise<void>;
  escalateCase: (caseId: string) => Promise<void>;
  fetchFailedPayouts: () => Promise<void>;
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
  fetchAgents: () => Promise<void>;
  createAgent: (data: { email: string; password: string; fullName?: string; phone?: string; type: string }) => Promise<void>;
  fetchAgentDetail: (agentId: string) => Promise<void>;
  toggleAgentStatus: (agentId: string) => Promise<void>;
  fetchAgentKpi: (agentId: string, period?: string) => Promise<void>;

  adminUsers: AdminUserItem[];
  fetchAdminUsers: () => Promise<void>;
  createAdmin: (data: { email: string; password: string; role: string }) => Promise<void>;
  toggleAdminStatus: (adminId: string) => Promise<void>;
  deleteAdmin: (adminId: string) => Promise<void>;
}

export const useAdminStore = create<AdminState>((set) => ({
  dashboard: null,
  users: [],
  pendingKyc: [],
  complianceCases: [],
  failedPayouts: [],
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
  adminUsers: [],
  loading: false,

  fetchDashboard: async () => {
    set({ loading: true });
    const dashboard = await AdminApi.getDashboard();
    set({ dashboard, loading: false });
  },

  fetchUsers: async () => {
    try {
      const users = await AdminApi.getUsers();
      set({ users });
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  },

  toggleUserStatus: async (userId: string) => {
    await AdminApi.toggleUserStatus(userId);
    set((state) => ({
      users: state.users.map((u) =>
        u.id === userId ? { ...u, status: u.status === "ACTIVE" ? "FROZEN" as const : "ACTIVE" as const } : u
      ),
    }));
  },

  fetchPendingKyc: async () => {
    const pendingKyc = await AdminApi.getPendingKyc();
    set({ pendingKyc });
  },

  approveKyc: async (kycId: string) => {
    await AdminApi.approveKyc(kycId);
    set((state) => ({ pendingKyc: state.pendingKyc.filter((k) => k.id !== kycId) }));
  },

  rejectKyc: async (kycId: string) => {
    await AdminApi.rejectKyc(kycId);
    set((state) => ({ pendingKyc: state.pendingKyc.filter((k) => k.id !== kycId) }));
  },

  fetchComplianceCases: async () => {
    const complianceCases = await AdminApi.getComplianceCases();
    set({ complianceCases });
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
    const failedPayouts = await AdminApi.getFailedPayouts();
    set({ failedPayouts });
  },

  retryPayout: async (payoutId: string) => {
    await AdminApi.retryPayout(payoutId);
    set((state) => ({
      failedPayouts: state.failedPayouts.filter((p) => p.id !== payoutId),
    }));
  },

  fetchNotifications: async () => {
    const notifications = await AdminApi.getNotifications();
    set({ notifications, unreadNotifications: notifications.filter((n) => n.status === "UNREAD").length });
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
    const partners = await AdminApi.getPartners();
    set({ partners });
  },

  fetchPartnerMetrics: async (partnerId: string) => {
    const metrics = await AdminApi.getPartnerMetrics(partnerId);
    if (metrics) {
      set((state) => ({ partnerMetrics: { ...state.partnerMetrics, [partnerId]: metrics } }));
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
    const systemHealth = await AdminApi.getSystemHealth();
    set({ systemHealth });
  },

  fetchSystemMetrics: async () => {
    const systemMetrics = await AdminApi.getSystemMetrics();
    set({ systemMetrics });
  },

  fetchSystemStatus: async () => {
    const systemStatus = await AdminApi.getSystemStatus();
    set({ systemStatus });
  },

  triggerBackup: async () => {
    await AdminApi.triggerBackup();
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
}));
