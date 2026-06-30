import { api } from "../../api/client";
import type { AgentDetail } from "../admin/admin.types";

export const AgentApi = {
  async lookupUser(identifier: string): Promise<{ id: string; email: string; fullName: string | null; phone: string | null } | null> {
    const { data } = await api.post("/agent/lookup-user", { identifier });
    return data;
  },

  async addBalance(
    agentId: string,
    payload: { userId: string; fiatAmount: string; usdtAmount: number; commissionPercent?: number }
  ): Promise<{ id: string; status: string; type: string; amount: number; commission: number; netAmount: number; reference: string }> {
    const { data } = await api.post(`/agent/${agentId}/add-balance`, payload);
    return data;
  },

  async withdraw(
    agentId: string,
    payload: { userId: string; amount: number; destinationAddress: string; commissionPercent?: number }
  ): Promise<{ id: string; status: string; type: string; amount: number; commission: number; netAmount: number; reference: string }> {
    const { data } = await api.post(`/agent/${agentId}/withdraw`, payload);
    return data;
  },

  async topupPartner(payload: { partnerAgentId: string; usdtAmount: number }): Promise<{ id: string; status: string; message?: string }> {
    const { data } = await api.post("/agent/topup-partner", payload);
    return data;
  },

  async processPayout(
    agentId: string,
    payload: { userId: string; amount: number; payoutMethod: string; beneficiaryId?: string; commissionPercent?: number }
  ): Promise<{ id: string; type: string; amount: number; commission: number; netAmount: number; reference: string }> {
    const { data } = await api.post(`/agent/${agentId}/process-payout`, payload);
    return data;
  },

  async processTransfer(
    agentId: string,
    payload: {
      userId?: string;
      amount: number;
      payoutMethod: string;
      beneficiaryId?: string;
      beneficiary?: {
        fullName: string;
        country: string;
        bankName?: string;
        accountNumber?: string;
        mobileWalletNumber?: string;
        mobileProvider?: string;
        cashPickupLocation?: string;
      };
      commissionPercent?: number;
    }
  ): Promise<{ id: string; type: string; amount: number; commission: number; netAmount: number; reference: string }> {
    const { data } = await api.post(`/agent/${agentId}/transfer`, payload);
    return data;
  },

  async withdrawCommission(agentId: string): Promise<{ id: string; type: string; amount: number; status: string; reference: string }> {
    const { data } = await api.post(`/agent/${agentId}/withdraw-commission`);
    return data;
  },

  async getMyDashboard(): Promise<AgentDetail> {
    const { data } = await api.get("/agent/me/dashboard");
    return data;
  },

  async getPendingTransfers(): Promise<any[]> {
    const { data } = await api.get("/agent/pending-transfers");
    return data;
  },

  async getMyProcessingTransfers(agentId: string): Promise<any[]> {
    const { data } = await api.get(`/agent/${agentId}/transactions`);
    return data.filter((t: any) => t.type === "PAYOUT" && t.status === "PROCESSING");
  },

  async cancelPayout(agentId: string, transferId: string): Promise<{ success: boolean; message: string; transferId: string }> {
    const { data } = await api.post(`/agent/${agentId}/cancel-payout`, { transferId });
    return data;
  },

  async confirmPayout(agentId: string, transferId: string, proofImage: string, proofMimeType: string): Promise<{ success: boolean; message: string; transferId: string }> {
    const { data } = await api.post(`/agent/${agentId}/confirm-payout`, { transferId, proofImage, proofMimeType });
    return data;
  },

  async executePayout(agentId: string, transferId: string): Promise<{ success: boolean; message: string; transferId: string }> {
    const { data } = await api.post(`/agent/${agentId}/execute-payout`, { transferId });
    return data;
  },

  async getPendingTransferDetail(referenceId: string): Promise<any> {
    const { data } = await api.get(`/agent/pending-transfer/${referenceId}`);
    return data;
  },

  async getRecentWithdrawals(agentId: string): Promise<any[]> {
    const { data } = await api.get(`/agent/${agentId}/recent-withdrawals`);
    return data;
  },

  async getRecentDeposits(agentId: string): Promise<any[]> {
    const { data } = await api.get(`/agent/${agentId}/recent-deposits`);
    return data;
  },

  async getMyTransactions(agentId: string): Promise<any[]> {
    const { data } = await api.get(`/agent/${agentId}/transactions`);
    return data;
  },

  async swapOffchain(agentId: string, direction: "TO_MAIN" | "TO_OFFCHAIN", amount?: number): Promise<{ id: string; type: string; amount: number; status: string; reference: string }> {
    const { data } = await api.post(`/agent/${agentId}/swap-offchain`, { direction, amount });
    return data;
  },
};
