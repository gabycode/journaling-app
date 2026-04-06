const API_BASE = "http://localhost:3000/api";

function getToken(): string | null {
  return localStorage.getItem("diario_token");
}

function setToken(token: string) {
  localStorage.setItem("diario_token", token);
}

function clearToken() {
  localStorage.removeItem("diario_token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.error || `Error ${res.status}`);
  }
  return data as T;
}

// Auth
export async function apiLogin(email: string, contrasena: string) {
  const data = await request<{ token: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, contrasena }),
  });
  setToken(data.token);
  return data;
}

export async function apiRegister(
  nombre: string,
  email: string,
  contrasena: string,
) {
  const data = await request<{ mensaje: string; id: number }>(
    "/auth/register",
    {
      method: "POST",
      body: JSON.stringify({ nombre, email, contrasena }),
    },
  );
  return data;
}

export async function apiForgotPassword(email: string) {
  return request<{ mensaje: string }>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function apiResetPassword(token: string, nuevaContrasena: string) {
  return request<{ mensaje: string }>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, nuevaContrasena }),
  });
}

export function apiLogout() {
  clearToken();
}

export function hasToken() {
  return !!getToken();
}

// Entradas
export interface EntradaAPI {
  notas_id: number;
  usuario_id: number;
  titulo: string;
  nota: string;
  es_publica: number;
  fecha: string;
}

export async function apiGetEntradas() {
  return request<EntradaAPI[]>("/entradas");
}

export async function apiGetEntrada(id: string) {
  return request<EntradaAPI>(`/entradas/${id}`);
}

export async function apiCreateEntrada(
  titulo: string,
  nota: string,
  es_publica: boolean,
) {
  return request<{ mensaje: string; id: number }>("/entradas", {
    method: "POST",
    body: JSON.stringify({ titulo, nota, es_publica }),
  });
}

export async function apiUpdateEntrada(
  id: string,
  titulo: string,
  nota: string,
  es_publica: boolean,
) {
  return request<{ mensaje: string }>(`/entradas/${id}`, {
    method: "PUT",
    body: JSON.stringify({ titulo, nota, es_publica }),
  });
}

export async function apiDeleteEntrada(id: string) {
  return request<{ mensaje: string }>(`/entradas/${id}`, { method: "DELETE" });
}

// Pública
export interface EntradaPublicaAPI {
  titulo: string;
  nota: string;
  fecha: string;
}

export interface EntradaPublicaListaAPI {
  notas_id: number;
  titulo: string;
  nota: string;
  fecha: string;
  usuario_id?: number;
  nombre_usuario?: string;
  autor?: string;
}

export async function apiGetEntradasPublicas() {
  return request<EntradaPublicaListaAPI[]>("/entradas/publicas");
}

export async function apiGetEntradaPublica(id: string) {
  return request<EntradaPublicaAPI>(`/entradas/publica/${id}`);
}
