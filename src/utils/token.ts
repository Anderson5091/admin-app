import { TOKEN_KEY, REFRESH_KEY } from "../config/constants";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY);
export const setRefreshToken = (token: string) => localStorage.setItem(REFRESH_KEY, token);
export const clearRefreshToken = () => localStorage.removeItem(REFRESH_KEY);
