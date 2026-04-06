import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  apiLogin,
  apiRegister,
  apiLogout,
  hasToken,
  apiGetEntradas,
  apiCreateEntrada,
  apiUpdateEntrada,
  apiDeleteEntrada,
  type EntradaAPI,
} from "../api";

export interface Entry {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  userId: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResult {
  ok: boolean;
  error?: string;
}

interface DiarioContextType {
  user: User | null;
  entries: Entry[];
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (
    name: string,
    email: string,
    password: string,
  ) => Promise<AuthResult>;
  logout: () => void;
  refreshEntries: () => Promise<void>;
  createEntry: (
    title: string,
    content: string,
    isPublic: boolean,
  ) => Promise<string>;
  updateEntry: (
    id: string,
    updates: Partial<Pick<Entry, "title" | "content" | "isPublic">>,
  ) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  getEntry: (id: string) => Entry | undefined;
}

const DiarioContext = createContext<DiarioContextType | null>(null);

const USERNAME_STORAGE_KEY = "diario_username";

function setStoredUsername(name: string) {
  localStorage.setItem(USERNAME_STORAGE_KEY, name);
}

function getStoredUsername(): string | null {
  return localStorage.getItem(USERNAME_STORAGE_KEY);
}

function clearStoredUsername() {
  localStorage.removeItem(USERNAME_STORAGE_KEY);
}

function mapEntrada(e: EntradaAPI): Entry {
  return {
    id: String(e.notas_id),
    title: e.titulo,
    content: e.nota,
    createdAt: e.fecha,
    updatedAt: e.fecha,
    isPublic: e.es_publica === 1,
    userId: String(e.usuario_id),
  };
}

function parseJwt(token: string): {
  id: number;
  email: string;
  nombreUsuario?: string;
  nombre_usuario?: string;
  username?: string;
  name?: string;
} | null {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

function loadUserFromToken(): User | null {
  const token = localStorage.getItem("diario_token");
  if (!token) return null;
  const payload = parseJwt(token);
  if (!payload) return null;
  const username =
    payload.nombreUsuario ||
    payload.nombre_usuario ||
    payload.username ||
    payload.name ||
    getStoredUsername() ||
    payload.email.split("@")[0];

  if (
    payload.nombreUsuario ||
    payload.nombre_usuario ||
    payload.username ||
    payload.name
  ) {
    setStoredUsername(username);
  }

  return {
    id: String(payload.id),
    name: username,
    email: payload.email,
  };
}

export function DiarioProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadUserFromToken);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshEntries = useCallback(async () => {
    if (!hasToken()) return;
    setLoading(true);
    try {
      const data = await apiGetEntradas();
      setEntries(data.map(mapEntrada));
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) refreshEntries();
  }, [user, refreshEntries]);

  const login = async (
    email: string,
    password: string,
  ): Promise<AuthResult> => {
    try {
      await apiLogin(email, password);
      setUser(loadUserFromToken());
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        error:
          err instanceof Error ? err.message : "No se pudo iniciar sesión.",
      };
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
  ): Promise<AuthResult> => {
    try {
      await apiRegister(name, email, password);
      await apiLogin(email, password);
      setStoredUsername(name.trim());
      setUser(loadUserFromToken());
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        error:
          err instanceof Error ? err.message : "No se pudo crear la cuenta.",
      };
    }
  };

  const logout = () => {
    apiLogout();
    clearStoredUsername();
    setUser(null);
    setEntries([]);
  };

  const createEntry = async (
    title: string,
    content: string,
    isPublic: boolean,
  ): Promise<string> => {
    const res = await apiCreateEntrada(title, content, isPublic);
    const newId = String(res.id);
    await refreshEntries();
    return newId;
  };

  const updateEntry = async (
    id: string,
    updates: Partial<Pick<Entry, "title" | "content" | "isPublic">>,
  ) => {
    const existing = entries.find((e) => e.id === id);
    if (!existing) return;
    await apiUpdateEntrada(
      id,
      updates.title ?? existing.title,
      updates.content ?? existing.content,
      updates.isPublic ?? existing.isPublic,
    );
    await refreshEntries();
  };

  const deleteEntry = async (id: string) => {
    await apiDeleteEntrada(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const getEntry = (id: string) => entries.find((e) => e.id === id);

  return (
    <DiarioContext.Provider
      value={{
        user,
        entries,
        loading,
        login,
        register,
        logout,
        refreshEntries,
        createEntry,
        updateEntry,
        deleteEntry,
        getEntry,
      }}
    >
      {children}
    </DiarioContext.Provider>
  );
}

export function useDiario() {
  const ctx = useContext(DiarioContext);
  if (!ctx) throw new Error("useDiario must be inside DiarioProvider");
  return ctx;
}
