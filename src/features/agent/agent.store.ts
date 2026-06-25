import { create } from "zustand";
import { AgentApi } from "./agent.api";

interface AgentActionState {
  loading: boolean;
  result: { success: boolean; message: string; reference?: string } | null;

  deposit: (agentId: string, payload: { userId: string; fiatAmount: string; usdtAmount: number; commissionPercent?: number }) => Promise<void>;
  withdraw: (agentId: string, payload: { userId: string; amount: number; destinationAddress: string; commissionPercent?: number }) => Promise<void>;
  processPayment: (agentId: string, payload: { userId: string; amount: number; paymentMethod: string; commissionPercent?: number }) => Promise<void>;
  topupPartner: (payload: { partnerAgentId: string; usdtAmount: number }) => Promise<void>;
  payout: (agentId: string, payload: { userId: string; amount: number; payoutMethod: string; beneficiaryId?: string; commissionPercent?: number }) => Promise<void>;
  transfer: (agentId: string, payload: {
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
  }) => Promise<void>;
  clearResult: () => void;
}

export const useAgentStore = create<AgentActionState>((set) => ({
  loading: false,
  result: null,

  deposit: async (agentId, payload) => {
    set({ loading: true, result: null });
    try {
      const res = await AgentApi.addBalance(agentId, payload);
      set({
        loading: false,
        result: { success: true, message: `Deposit completed — ${res.netAmount} USDT credited to user`, reference: res.reference },
      });
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || "Deposit failed";
      set({ loading: false, result: { success: false, message: msg } });
    }
  },

  withdraw: async (agentId, payload) => {
    set({ loading: true, result: null });
    try {
      const res = await AgentApi.withdraw(agentId, payload);
      set({
        loading: false,
        result: { success: true, message: `Withdrawal completed — ${res.netAmount} USDT debited from user`, reference: res.reference },
      });
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || "Withdrawal failed";
      set({ loading: false, result: { success: false, message: msg } });
    }
  },

  processPayment: async (agentId, payload) => {
    set({ loading: true, result: null });
    try {
      const res = await AgentApi.processPayment(agentId, payload);
      set({
        loading: false,
        result: { success: true, message: `Payment processed — ${res.netAmount} USDT via ${payload.paymentMethod}`, reference: res.reference },
      });
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || "Payment failed";
      set({ loading: false, result: { success: false, message: msg } });
    }
  },

  topupPartner: async (payload) => {
    set({ loading: true, result: null });
    try {
      const res = await AgentApi.topupPartner(payload);
      set({
        loading: false,
        result: { success: true, message: `Top-up completed — ${payload.usdtAmount} USDT sent to partner`, reference: res.id },
      });
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || "Top-up failed";
      set({ loading: false, result: { success: false, message: msg } });
    }
  },

  payout: async (agentId, payload) => {
    set({ loading: true, result: null });
    try {
      const res = await AgentApi.processPayout(agentId, payload);
      set({
        loading: false,
        result: { success: true, message: `Payout processed — ${res.netAmount} USDT via ${payload.payoutMethod}`, reference: res.reference },
      });
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || "Payout failed";
      set({ loading: false, result: { success: false, message: msg } });
    }
  },

  transfer: async (agentId, payload) => {
    set({ loading: true, result: null });
    try {
      const res = await AgentApi.processTransfer(agentId, payload);
      set({
        loading: false,
        result: { success: true, message: `Transfer processed — ${res.netAmount} USDT via ${payload.payoutMethod}`, reference: res.reference },
      });
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || "Transfer failed";
      set({ loading: false, result: { success: false, message: msg } });
    }
  },

  clearResult: () => set({ result: null }),
}));
