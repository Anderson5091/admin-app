import { create } from "zustand";
import { AgentApi } from "./agent.api";
import { CURRENCY_TOKEN } from "../../config/constants";

interface AgentActionState {
  loading: boolean;
  result: { success: boolean; message: string; reference?: string } | null;

  swapFunds: (agentId: string, amount: number, direction: "TO_LEDGER" | "TO_WALLET") => Promise<void>;
  deposit: (agentId: string, payload: { userId: string; fiatAmount: string; usdtAmount: number }) => Promise<void>;
  withdraw: (agentId: string, payload: { userId: string; amount: number; destinationType?: "OFFCHAIN" | "MAIN" }) => Promise<void>;
  topupPartner: (payload: { partnerAgentId: string; usdtAmount: number }) => Promise<void>;
  payout: (agentId: string, payload: { userId: string; amount: number; payoutMethod: string; beneficiaryId?: string }) => Promise<void>;
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
    debitUserWallet?: boolean;
  }) => Promise<void>;
  requestCash: (agentId: string, payload: { amount: number; notes?: string }) => Promise<void>;
  submitSettlement: (agentId: string, payload: { amount: number; bankName: string; referenceNumber: string; cashRequestId?: string; notes?: string }) => Promise<void>;
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
        result: { success: true, message: `Deposit completed — ${res.netAmount} ${CURRENCY_TOKEN} credited to user`, reference: res.reference },
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
        result: { success: true, message: `Withdrawal completed — ${res.netAmount} ${CURRENCY_TOKEN} debited from user`, reference: res.reference },
      });
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || "Withdrawal failed";
      set({ loading: false, result: { success: false, message: msg } });
    }
  },

  topupPartner: async (payload) => {
    set({ loading: true, result: null });
    try {
      const res = await AgentApi.topupPartner(payload);
      set({
        loading: false,
        result: { success: true, message: `Top-up completed — ${payload.usdtAmount} ${CURRENCY_TOKEN} sent to partner`, reference: res.id },
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
        result: { success: true, message: `Payout processed — ${res.netAmount} ${CURRENCY_TOKEN} via ${payload.payoutMethod}`, reference: res.reference },
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
        result: { success: true, message: `Transfer processed — ${res.netAmount} ${CURRENCY_TOKEN} via ${payload.payoutMethod}`, reference: res.reference },
      });
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || "Transfer failed";
      set({ loading: false, result: { success: false, message: msg } });
    }
  },

  swapFunds: async (agentId, amount, direction) => {
    set({ loading: true, result: null });
    try {
      const res = await AgentApi.swapFunds(agentId, amount, direction);
      const label = direction === "TO_LEDGER" ? "wallet to ledger" : "ledger to wallet";
      set({
        loading: false,
        result: { success: true, message: `Swapped ${res.swappedAmount} ${CURRENCY_TOKEN} from ${label}` },
      });
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || "Swap failed";
      set({ loading: false, result: { success: false, message: msg } });
    }
  },

  requestCash: async (agentId, payload) => {
    set({ loading: true, result: null });
    try {
      const res = await AgentApi.requestCash(agentId, payload);
      set({
        loading: false,
        result: { success: true, message: `Cash request submitted for $${payload.amount}`, reference: res.id },
      });
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || "Cash request failed";
      set({ loading: false, result: { success: false, message: msg } });
    }
  },

  submitSettlement: async (agentId, payload) => {
    set({ loading: true, result: null });
    try {
      const res = await AgentApi.submitSettlement(agentId, payload);
      set({
        loading: false,
        result: { success: true, message: `Settlement submitted — $${payload.amount} to ${payload.bankName}`, reference: res.id },
      });
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || "Settlement submission failed";
      set({ loading: false, result: { success: false, message: msg } });
    }
  },

  clearResult: () => set({ result: null }),
}));
