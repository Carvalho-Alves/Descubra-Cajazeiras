import axios from 'axios';
import type { RootState } from '../store/store';

// Em dev, prefira usar o proxy do Vite (vite.config.ts) para evitar CORS.
// Em produção, defina VITE_API_BASE_URL se a API estiver em outro host.
const apiBaseURL = import.meta.env.VITE_API_BASE_URL || '/api';

export const api = axios.create({
  baseURL: apiBaseURL,
  timeout: 15000
});

export function attachAuthInterceptors(getState: () => RootState) {
  api.interceptors.request.use((config) => {
    const token = getState().auth.token;
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
}
