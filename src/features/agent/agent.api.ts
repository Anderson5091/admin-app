import { api } from "../../api/client";
import type { AgentDetail } from "../admin/admin.types";

export const AgentApi = {
  async lookupUser(identifier: string): Promise<{ id: string; email: string; fullName: string | null; phone: string | null } | null> {
    const { data } = await api.post("/agent/lookup-user", { identifier });
    return data;
  },

  async addBalance(
    agentId: string,
    payload: { userId: string; fiatAmount: string; usdtAmount: number }
  ): Promise<{ id: string; status: string; type: string; amount: number; commission: number; netAmount: number; reference: string }> {
    const { data } = await api.post(`/agent/${agentId}/add-balance`, payload);
    return data;
  },

  async withdraw(
    agentId: string,
    payload: { userId: string; amount: number; destinationType?: "OFFCHAIN" | "MAIN" }
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
    payload: { userId: string; amount: number; payoutMethod: string; beneficiaryId?: string }
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
      debitUserWallet?: boolean;
    }
  ): Promise<{ id: string; type: string; amount: number; commission: number; netAmount: number; reference: string }> {
    const { data } = await api.post(`/agent/${agentId}/transfer`, payload);
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

  async swapFunds(agentId: string, amount: number, direction: "TO_LEDGER" | "TO_WALLET"): Promise<{ swappedAmount: number; walletBalance: number; ledgerBalance: number }> {
    const { data } = await api.post(`/agent/${agentId}/swap`, { amount, direction });
    return data;
  },

  async walletWithdraw(agentId: string, amount: number): Promise<{ success: boolean; message: string }> {
    const { data } = await api.post(`/agent/${agentId}/withdraw-wallet`, { amount });
    return data;
  },

  async requestCash(agentId: string, payload: { amount: number; destination?: string; bankName?: string; accountNumber?: string; country?: string; notes?: string }): Promise<any> {
    const { data } = await api.post(`/agent/${agentId}/request-cash`, payload);
    return data;
  },

  async getCashRequests(agentId: string): Promise<any[]> {
    const { data } = await api.get(`/agent/${agentId}/cash-requests`);
    return data;
  },

  async submitSettlement(agentId: string, payload: { amount: number; bankName: string; referenceNumber: string; cashRequestId?: string; proofImage?: string; depositBankName?: string; depositAccountNumber?: string; depositAccountName?: string; depositCountry?: string; notes?: string }): Promise<any> {
    const { data } = await api.post(`/agent/${agentId}/submit-settlement`, payload);
    return data;
  },

  async getSettlements(agentId: string): Promise<any[]> {
    const { data } = await api.get(`/agent/${agentId}/settlements`);
    return data;
  },
};
