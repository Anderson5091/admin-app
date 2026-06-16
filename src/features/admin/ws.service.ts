import { getToken } from "../../utils/token";
import { useAdminStreamStore } from "./stream.store";

const WS_URL = import.meta.env.VITE_WS_URL || "wss://backend-app-production-0a8a.up.railway.app/ws";

let ws: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

export function connectAdminStream() {
  if (ws?.readyState === WebSocket.OPEN || ws?.readyState === WebSocket.CONNECTING) return;

  const token = getToken();
  if (!token) return;

  ws = new WebSocket(`${WS_URL}?token=${token}`);

  ws.onopen = () => {
    useAdminStreamStore.getState().setConnected(true);
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }

    heartbeatTimer = setInterval(() => {
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "PING" }));
      }
    }, 30000);
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      const store = useAdminStreamStore.getState();

      switch (data.type) {
        case "CONNECTED":
          store.setConnected(true);
          break;
        case "LIVE_TRANSACTION":
          store.addTransaction(data.payload);
          break;
        case "PAYOUT_UPDATE":
          store.addPayoutUpdate(data.payload);
          break;
        case "KPI_UPDATE":
          store.updateKpis(data.payload);
          break;
        case "ALERT":
          store.addAlert(data.payload);
          break;
        case "ADMIN_EVENT":
          store.addAdminEvent(data);
          break;
        case "SYSTEM_STATUS":
          store.setSystemStatus(data.payload);
          break;
        case "EVENT":
          store.addAdminEvent(data);
          break;
      }
    } catch {
      // ignore malformed messages
    }
  };

  ws.onclose = () => {
    useAdminStreamStore.getState().setConnected(false);
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
    scheduleReconnect();
  };

  ws.onerror = () => {
    ws?.close();
  };
}

export function disconnectAdminStream() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
  ws?.close();
  ws = null;
  useAdminStreamStore.getState().setConnected(false);
}

function scheduleReconnect() {
  if (reconnectTimer) return;
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connectAdminStream();
  }, 5000);
}
