import { api } from "../../api/client";
import type { AdminDashboardData, AdminUser, PendingKycItem, ComplianceCaseItem, FailedPayoutItem, ExecutedPayoutItem, PayoutDetailItem, FraudAnalysis, AdminNotification, AdminPartner, PartnerSlaMetric, FeeConfig, SystemRevenueData, AgentRevenueData, SystemHealth, SystemMetrics, SystemStatus, TreasuryOverview, Agent, AgentDetail, AgentKpiItem, AdminUserItem, TransferItem, AuditLogItem } from "./admin.types";

export const AdminApi = {
  async getDashboard(): Promise<AdminDashboardData> {
    const { data } = await api.get("/admin/dashboard");
    return data;
  },

  async getUsers(): Promise<AdminUser[]> {
    const { data } = await api.get("/admin/users");
    return data;
  },

  async toggleUserStatus(userId: string): Promise<void> {
    await api.post(`/admin/users/${userId}/toggle-status`);
  },

  async getPendingKyc(): Promise<PendingKycItem[]> {
    const { data } = await api.get("/admin/kyc/pending");
    return data;
  },

  async approveKyc(kycId: string): Promise<void> {
    await api.post(`/admin/kyc/${kycId}/approve`);
  },

  async rejectKyc(kycId: string): Promise<void> {
    await api.post(`/admin/kyc/${kycId}/reject`);
  },

  async getKycDetail(kycId: string): Promise<any> {
    const { data } = await api.get(`/admin/kyc/${kycId}`);
    return data;
  },

  async getComplianceCases(): Promise<ComplianceCaseItem[]> {
    const { data } = await api.get("/admin/compliance-cases");
    return data;
  },

  async escalateCase(caseId: string): Promise<void> {
    await api.post(`/admin/compliance-cases/${caseId}/escalate`);
  },

  async getFailedPayouts(): Promise<FailedPayoutItem[]> {
    const { data } = await api.get("/admin/payouts/failed");
    return data;
  },

  async getExecutedPayouts(): Promise<ExecutedPayoutItem[]> {
    const { data } = await api.get("/admin/payouts/completed");
    return data;
  },

  async getPayoutDetail(payoutId: string): Promise<PayoutDetailItem> {
    const { data } = await api.get(`/admin/payouts/${payoutId}`);
    return data;
  },

  async retryPayout(payoutId: string): Promise<void> {
    await api.post(`/admin/payouts/${payoutId}/retry`);
  },

  async getNotifications(): Promise<AdminNotification[]> {
    const { data } = await api.get("/admin/notifications");
    return data;
  },

  async markNotificationRead(notificationId: string): Promise<void> {
    await api.post(`/admin/notifications/${notificationId}/read`);
  },

  async markAllNotificationsRead(): Promise<void> {
    await api.post("/admin/notifications/mark-all-read");
  },

  async getPartners(): Promise<AdminPartner[]> {
    const { data } = await api.get("/partners");
    return data;
  },

  async getPartnerMetrics(partnerId: string): Promise<PartnerSlaMetric | null> {
    const { data } = await api.get(`/partners/${partnerId}/metrics`);
    return data;
  },

  async createPartner(data: { name: string; type: string; country?: string; baseUrl?: string; apiKey?: string; priority?: number }): Promise<AdminPartner> {
    const { data: res } = await api.post("/partners", data);
    return res;
  },

  async updatePartner(id: string, data: Partial<AdminPartner>): Promise<void> {
    await api.put(`/partners/${id}`, data);
  },

  async deactivatePartner(id: string): Promise<void> {
    await api.delete(`/partners/${id}`);
  },

  async reconcilePartners(): Promise<{ total: number; matched: number; unmatched: number; errors: number }> {
    const { data } = await api.post("/partners/reconcile");
    return data;
  },

  async getSystemHealth(): Promise<SystemHealth> {
    const { data } = await api.get("/production/health");
    return data;
  },

  async getSystemMetrics(): Promise<SystemMetrics> {
    const { data } = await api.get("/production/metrics");
    return data;
  },

  async getSystemStatus(): Promise<SystemStatus> {
    const { data } = await api.get("/production/system-status");
    return data;
  },

  async triggerBackup(): Promise<{ status: string }> {
    const { data } = await api.post("/production/backup");
    return data;
  },

  async getTreasuryOverview(): Promise<TreasuryOverview> {
    const { data } = await api.get("/treasury/overview");
    return data;
  },

  async triggerRebalance(network: string): Promise<{ status: string; message: string }> {
    const { data } = await api.post("/treasury/rebalance", { network });
    return data;
  },

  async getAgents(): Promise<Agent[]> {
    const { data } = await api.get("/agent/list");
    return data;
  },

  async createAgent(data: { email: string; password: string; fullName?: string; phone?: string; type: string }): Promise<Agent> {
    const { data: res } = await api.post("/agent/create", data);
    return res;
  },

  async getAgentDetail(agentId: string): Promise<AgentDetail> {
    const { data } = await api.get(`/agent/${agentId}`);
    return data;
  },

  async toggleAgentStatus(agentId: string): Promise<void> {
    await api.post(`/agent/${agentId}/toggle-status`);
  },

  async getAgentKpi(agentId: string, period?: string): Promise<AgentKpiItem[]> {
    const params = period ? `?period=${period}` : "";
    const { data } = await api.get(`/agent/kpi/${agentId}/${params}`);
    return data;
  },

  async addBalance(payload: { partnerAgentId: string; usdtAmount: number }): Promise<{ success: boolean; amount: number; partnerAgentId: string }> {
    const { data } = await api.post(`/agent/topup-partner`, payload);
    return data;
  },

  async getTransfers(): Promise<TransferItem[]> {
    const { data } = await api.get("/admin/transfers");
    return data;
  },

  async getAuditLogs(): Promise<AuditLogItem[]> {
    const { data } = await api.get("/admin/audit-logs");
    return data;
  },

  async analyzeFraud(userId: string): Promise<FraudAnalysis> {
    const { data } = await api.get(`/admin/fraud/analyze/${userId}`);
    return data;
  },

  async getAdmins(): Promise<AdminUserItem[]> {
    const { data } = await api.get("/admin/admins");
    return data;
  },

  async createAdmin(data: { email: string; name?: string; password: string; role: string }): Promise<AdminUserItem> {
    const { data: res } = await api.post("/admin/admins", data);
    return res;
  },

  async toggleAdminStatus(adminId: string): Promise<void> {
    await api.post(`/admin/admins/${adminId}/toggle-status`);
  },

  async deleteAdmin(adminId: string): Promise<void> {
    await api.delete(`/admin/admins/${adminId}`);
  },

  async getFeeConfigs(): Promise<FeeConfig[]> {
    const { data } = await api.get("/admin/fees");
    return data;
  },

  async updateFeeConfig(id: string, payload: Partial<FeeConfig>): Promise<FeeConfig> {
    const { data } = await api.put(`/admin/fees/${id}`, payload);
    return data;
  },

  async getSystemRevenue(period: string = "day"): Promise<SystemRevenueData> {
    const { data } = await api.get("/admin/revenue/system", { params: { period } });
    return data;
  },

  async getAgentRevenue(period: string = "day", agentId?: string): Promise<AgentRevenueData> {
    const params: Record<string, string> = { period };
    if (agentId) params.agentId = agentId;
    const { data } = await api.get("/admin/revenue/agents", { params });
    return data;
  },
};
