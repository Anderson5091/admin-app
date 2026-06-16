import { api } from "./client";
import { getToken } from "../utils/token";

export const setupInterceptors = () => {
  api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
};
