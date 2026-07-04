import { api } from "./client";
import { getToken, setToken, clearToken, getRefreshToken, setRefreshToken, clearRefreshToken } from "../utils/token";
import { useAuthStore } from "../features/admin/auth.store";

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: any) => void; reject: (reason: any) => void }> = [];

function processQueue(error: any, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
}

export const setupInterceptors = () => {
  api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status !== 401 || originalRequest._retry) {
        return Promise.reject(error);
      }

      const url: string = originalRequest.url || "";
      if (url.includes("/auth/refresh")) {
        return Promise.reject(error);
      }

      const storedRefreshToken = getRefreshToken();
      if (!storedRefreshToken) {
        clearToken();
        useAuthStore.getState().setSessionExpired(true);
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      isRefreshing = true;

      try {
        const { data } = await api.post("/admin/auth/refresh", { refreshToken: storedRefreshToken });
        setToken(data.token);
        setRefreshToken(data.refreshToken);
        processQueue(null, data.token);
        originalRequest.headers.Authorization = `Bearer ${data.token}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearToken();
        clearRefreshToken();
        useAuthStore.getState().setSessionExpired(true);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
  );
};
