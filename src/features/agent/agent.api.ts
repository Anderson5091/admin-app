import { api } from "../../api/client";

export const AgentApi = {
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

  async processPayment(
    agentId: string,
    payload: { userId: string; amount: number; paymentMethod: string; commissionPercent?: number }
  ): Promise<{ id: string; status: string; type: string; amount: number; commission: number; netAmount: number; reference: string }> {
    const { data } = await api.post(`/agent/${agentId}/process-payment`, payload);
    return data;
  },
};
