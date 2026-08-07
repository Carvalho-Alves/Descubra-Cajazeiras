import { API_BASE_URL } from '../config/api';

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

type RequestOptions = {
  method?: string;
  token?: string | null;
  body?: BodyInit | null;
  headers?: Record<string, string>;
  formData?: boolean;
};

let authToken: string | null = null;

export function setApiToken(token: string | null) {
  authToken = token;
}

export function getApiToken() {
  return authToken;
}

function extractErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== 'object') return fallback;
  const data = payload as Record<string, unknown>;
  if (typeof data.message === 'string') return data.message;
  if (typeof data.erro === 'string') return data.erro;
  if (typeof data.error === 'string') return data.error;
  if (Array.isArray(data.errors) && data.errors[0]) {
    const first = data.errors[0] as { msg?: string; message?: string };
    return first.msg || first.message || fallback;
  }
  return fallback;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers ?? {}),
  };

  const token = options.token ?? authToken;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (options.body && !options.formData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body,
  });

  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    throw new ApiError(
      extractErrorMessage(payload, `Erro ${response.status}`),
      response.status,
      payload,
    );
  }

  return payload as T;
}

export function jsonBody(data: unknown): string {
  return JSON.stringify(data);
}
