import { create } from "zustand";

interface LiveTransaction {
  id: string;
  userId: string;
  amount: number;
  status: string;
  payoutMethod: string;
  referenceId: string;
  timestamp: string;
}

interface PayoutUpdate {
  id: string;
  transferId: string;
  status: string;
  partner: string;
  externalReference: string;
  timestamp: string;
}

interface StreamAlert {
  severity: string;
  message: string;
  timestamp: string;
}

interface AdminEvent {
  type: string;
  eventType: string;
  payload: Record<string, unknown>;
  timestamp: string;
}

interface SystemStatusData {
  eventCount: number;
  connectedAdmins: number;
  connectedUsers: number;
  uptime: number;
}

interface StreamState {
  connected: boolean;
  liveTransactions: LiveTransaction[];
  payoutUpdates: PayoutUpdate[];
  alerts: StreamAlert[];
  adminEvents: AdminEvent[];
  kpis: Record<string, number>;
  systemStatus: SystemStatusData | null;

  setConnected: (connected: boolean) => void;
  addTransaction: (tx: LiveTransaction) => void;
  addPayoutUpdate: (update: PayoutUpdate) => void;
  addAlert: (alert: StreamAlert) => void;
  addAdminEvent: (event: AdminEvent) => void;
  updateKpis: (kpis: Record<string, number>) => void;
  setSystemStatus: (status: SystemStatusData) => void;
  clearTransactions: () => void;
}

export const useAdminStreamStore = create<StreamState>((set) => ({
  connected: false,
  liveTransactions: [],
  payoutUpdates: [],
  alerts: [],
  adminEvents: [],
  kpis: {},
  systemStatus: null,

  setConnected: (connected) => set({ connected }),

  addTransaction: (tx) =>
    set((state) => ({
      liveTransactions: [{ ...tx, timestamp: new Date().toISOString() }, ...state.liveTransactions].slice(0, 100),
    })),

  addPayoutUpdate: (update) =>
    set((state) => ({
      payoutUpdates: [{ ...update, timestamp: new Date().toISOString() }, ...state.payoutUpdates].slice(0, 50),
    })),

  addAlert: (alert) =>
    set((state) => ({
      alerts: [{ ...alert, timestamp: new Date().toISOString() }, ...state.alerts].slice(0, 20),
    })),

  addAdminEvent: (event) =>
    set((state) => ({
      adminEvents: [event, ...state.adminEvents].slice(0, 50),
    })),

  updateKpis: (kpis) => set({ kpis }),

  setSystemStatus: (status) => set({ systemStatus: status }),

  clearTransactions: () => set({ liveTransactions: [], payoutUpdates: [] }),
}));
