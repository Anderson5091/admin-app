import { create } from "zustand";
import { AdminApi } from "./admin.api";
import type { AdminDashboardData, AdminUser, PendingKycItem, ComplianceCaseItem, FailedPayoutItem, FraudAnalysis, AdminNotification, AdminPartner, PartnerSlaMetric, SystemHealth, SystemMetrics, SystemStatus, TreasuryOverview } from "./admin.types";

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
  loading: false,

  fetchDashboard: async () => {
    set({ loading: true });
    const dashboard = await AdminApi.getDashboard();
    set({ dashboard, loading: false });
  },

  fetchUsers: async () => {
    const users = await AdminApi.getUsers();
    set({ users });
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
    const treasuryOverview = await AdminApi.getTreasuryOverview();
    set({ treasuryOverview, treasuryLoading: false });
  },

  triggerRebalance: async (network: string) => {
    set({ rebalanceMessage: "" });
    const result = await AdminApi.triggerRebalance(network);
    set({ rebalanceMessage: result.message });
  },
}));
