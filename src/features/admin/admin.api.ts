import { api } from "../../api/client";
import type { AdminDashboardData, AdminUser, PendingKycItem, ComplianceCaseItem, FailedPayoutItem, ExecutedPayoutItem, PayoutDetailItem, FraudAnalysis, AdminNotification, AdminPartner, PartnerSlaMetric, FeeConfig, SystemRevenueData, AgentRevenueData, SystemHealth, SystemMetrics, SystemStatus, TreasuryOverview, Agent, AgentDetail, AgentKpiItem, AdminUserItem, TransferItem, AuditLogItem, TreasuryOnrampInfo, TreasuryBankAccount, TreasuryOfframpOrder, TreasuryOnrampTransfer, TreasuryOfframpResult } from "./admin.types";

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

  async updateUserEmail(userId: string, email: string): Promise<{ id: string; email: string }> {
    const { data } = await api.put(`/admin/users/${userId}`, { email });
    return data;
  },

  async deleteUser(userId: string): Promise<void> {
    await api.delete(`/admin/users/${userId}`);
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

  async deletePartner(partnerId: string): Promise<{ success: boolean; message: string }> {
    const { data } = await api.post(`/partners/${partnerId}/delete`);
    return data;
  },

  async activatePartner(partnerId: string): Promise<{ success: boolean; status: string }> {
    const { data } = await api.post(`/partners/${partnerId}/activate`);
    return data;
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

  // Treasury Onramp / Offramp
  async getTreasuryOnrampInfo(): Promise<TreasuryOnrampInfo> {
    const { data } = await api.get("/treasury/ramp/onramp/info");
    return data;
  },

  async getTreasuryOnrampTransfers(): Promise<TreasuryOnrampTransfer[]> {
    const { data } = await api.get("/treasury/ramp/onramp/transfers");
    return data;
  },

  async createTreasuryCardDeposit(payload: { chain: string; amount: number; receiptEmail?: string; destinationWalletType?: string }): Promise<{ id: string; orderId: string; clientSecret: string; status: string; walletAddress: string; walletType: string; chain: string; amount: number }> {
    const { data } = await api.post("/treasury/ramp/onramp/card", payload);
    return data;
  },

  async getTreasuryOrderStatus(orderId: string): Promise<any> {
    const { data } = await api.get(`/treasury/ramp/onramp/orders/${orderId}`);
    return data;
  },

  async createTreasuryOnrampTransfer(payload: { chain: string; fiatAmount: number; memoCode?: string; notes?: string; destinationWalletType?: string }): Promise<{ id: string; status: string; destinationWalletType?: string }> {
    const { data } = await api.post("/treasury/ramp/onramp/transfers", payload);
    return data;
  },

  async getTreasuryOfframpOrders(): Promise<TreasuryOfframpOrder[]> {
    const { data } = await api.get("/treasury/ramp/offramp/orders");
    return data;
  },

  async createTreasuryOfframpOrder(payload: { chain: string; amount: number; paymentMethodId?: string; sourceWalletType?: string }): Promise<TreasuryOfframpResult> {
    const { data } = await api.post("/treasury/ramp/offramp/orders", payload);
    return data;
  },

  async executeTreasuryOfframpOrder(orderId: string): Promise<{ status: string; serializedTransaction?: string; txHash?: string }> {
    const { data } = await api.post(`/treasury/ramp/offramp/orders/${orderId}/execute`);
    return data;
  },

  async confirmTreasuryOfframpOrder(orderId: string, txHash: string): Promise<void> {
    await api.post(`/treasury/ramp/offramp/orders/${orderId}/confirm`, { txHash });
  },

  async getTreasuryBankAccounts(): Promise<TreasuryBankAccount[]> {
    const { data } = await api.get("/treasury/ramp/bank-accounts");
    return data;
  },

  async createTreasuryBankAccount(payload: { bankName: string; accountSuffix?: string; routingNumber?: string; paymentMethodId: string; currency?: string; isDefault?: boolean }): Promise<TreasuryBankAccount> {
    const { data } = await api.post("/treasury/ramp/bank-accounts", payload);
    return data;
  },

  async removeTreasuryBankAccount(id: string): Promise<void> {
    await api.delete(`/treasury/ramp/bank-accounts/${id}`);
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

  async deleteAgent(agentId: string): Promise<{ success: boolean; message: string }> {
    const { data } = await api.post(`/agent/${agentId}/delete`);
    return data;
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

  async updateAdmin(adminId: string, data: { name?: string; role?: string; email?: string; password?: string }): Promise<AdminUserItem> {
    const { data: res } = await api.put(`/admin/admins/${adminId}`, data);
    return res;
  },

  async sendResetEmail(adminId: string): Promise<{ success: boolean; message: string }> {
    const { data } = await api.post(`/admin/admins/${adminId}/send-reset`);
    return data;
  },

  async resetPassword(token: string, password: string): Promise<{ success: boolean; message: string }> {
    const { data } = await api.post("/admin/reset-password", { token, password });
    return data;
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

  // --- Cash Request & Settlement Admin ---

  async getAllCashRequests(): Promise<any[]> {
    const { data } = await api.get("/admin/cash-requests");
    return data;
  },

  async processCashRequest(id: string, status: string): Promise<any> {
    const { data } = await api.post(`/admin/cash-requests/${id}/process`, { status });
    return data;
  },

  async getAllSettlements(): Promise<any[]> {
    const { data } = await api.get("/admin/settlements");
    return data;
  },

  async processSettlement(id: string, status: string): Promise<any> {
    const { data } = await api.post(`/admin/settlements/${id}/process`, { status });
    return data;
  },
};
