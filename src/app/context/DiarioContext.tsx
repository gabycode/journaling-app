import { createContext, useContext, useState, type ReactNode } from 'react';

export interface Entry {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  authorName: string;
  userId: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

interface DiarioContextType {
  user: User | null;
  entries: Entry[];
  login: (email: string, password: string) => boolean;
  register: (name: string, email: string, password: string) => boolean;
  logout: () => void;
  updateProfile: (name: string) => void;
  createEntry: (title: string, content: string, isPublic: boolean) => string;
  updateEntry: (id: string, updates: Partial<Pick<Entry, 'title' | 'content' | 'isPublic'>>) => void;
  deleteEntry: (id: string) => void;
  getEntry: (id: string) => Entry | undefined;
}

const DiarioContext = createContext<DiarioContextType | null>(null);

function loadAllEntries(): Entry[] {
  try {
    const stored = localStorage.getItem('diario_all_entries');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveAllEntries(entries: Entry[]) {
  localStorage.setItem('diario_all_entries', JSON.stringify(entries));
}

function loadUser(): User | null {
  try {
    const stored = localStorage.getItem('diario_current_user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function seedEntries(userId: string, name: string, existing: Entry[]): Entry[] {
  const sample: Entry[] = [
    {
      id: crypto.randomUUID(),
      title: 'Primera entrada del año',
      content: `Hoy comienza un nuevo capítulo. Me senté frente a la ventana y observé cómo la ciudad despertaba lentamente. Hay algo profundamente reconfortante en estos momentos de quietud antes de que el mundo empiece a exigirte.\n\nDecidí empezar este diario como un acto de resistencia suave contra el olvido. Quiero recordar los días pequeños, los que nadie fotografía, los que se escurren entre los dedos si no los nombramos.\n\nHoy fue uno de esos días.`,
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      isPublic: false,
      authorName: name,
      userId,
    },
    {
      id: crypto.randomUUID(),
      title: 'Sobre la lentitud',
      content: `He decidido caminar más despacio. No metafóricamente, sino de verdad. El mundo recompensa la velocidad, pero creo que la lentitud tiene sus propios tesoros escondidos.\n\nHoy encontré una flor entre las grietas del pavimento y me detuve a mirarla. Era pequeña, casi invisible, pero completamente decidida a existir. Pienso que hay una lección ahí que todavía no sé nombrar del todo.\n\nQuizás la escritura es otra forma de lentitud. Una manera de hacer que los momentos duren un poco más de lo que la vida les permite.`,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      isPublic: true,
      authorName: name,
      userId,
    },
    {
      id: crypto.randomUUID(),
      title: 'Notas de un martes cualquiera',
      content: `Los martes tienen una textura peculiar. No son el entusiasmo del lunes ni el cansancio del miércoles. Son simplemente días que suceden, y quizás eso es exactamente lo que necesitamos más seguido.\n\nTomé café solo esta mañana. Lo dejé enfriarse demasiado. Lo bebí frío de todas formas y pensé que a veces las cosas saben mejor cuando ya no las esperamos.\n\nEscribir esto me tomó menos de diez minutos. Me alegra haber empezado.`,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      isPublic: false,
      authorName: name,
      userId,
    },
  ];
  return [...existing, ...sample];
}

export function DiarioProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadUser);
  const [allEntries, setAllEntries] = useState<Entry[]>(loadAllEntries);

  const entries = user ? allEntries.filter(e => e.userId === user.id) : [];

  const persist = (next: Entry[]) => {
    setAllEntries(next);
    saveAllEntries(next);
  };

  const login = (email: string, password: string): boolean => {
    try {
      const raw = localStorage.getItem(`diario_account_${email}`);
      if (!raw) return false;
      const account = JSON.parse(raw);
      if (account.password !== password) return false;
      const u: User = { id: account.id, name: account.name, email: account.email };
      setUser(u);
      localStorage.setItem('diario_current_user', JSON.stringify(u));
      return true;
    } catch {
      return false;
    }
  };

  const register = (name: string, email: string, password: string): boolean => {
    const id = crypto.randomUUID();
    const account = { id, name, email, password };
    localStorage.setItem(`diario_account_${email}`, JSON.stringify(account));
    const u: User = { id, name, email };
    setUser(u);
    localStorage.setItem('diario_current_user', JSON.stringify(u));
    const seeded = seedEntries(id, name, allEntries);
    persist(seeded);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('diario_current_user');
  };

  const updateProfile = (name: string) => {
    if (!user) return;
    const updated = { ...user, name };
    setUser(updated);
    localStorage.setItem('diario_current_user', JSON.stringify(updated));
    // Update author name in entries
    persist(allEntries.map(e => e.userId === user.id ? { ...e, authorName: name } : e));
    // Update account
    try {
      const raw = localStorage.getItem(`diario_account_${user.email}`);
      if (raw) {
        const acc = JSON.parse(raw);
        localStorage.setItem(`diario_account_${user.email}`, JSON.stringify({ ...acc, name }));
      }
    } catch {}
  };

  const createEntry = (title: string, content: string, isPublic: boolean): string => {
    if (!user) return '';
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const entry: Entry = { id, title, content, createdAt: now, updatedAt: now, isPublic, authorName: user.name, userId: user.id };
    persist([...allEntries, entry]);
    return id;
  };

  const updateEntry = (id: string, updates: Partial<Pick<Entry, 'title' | 'content' | 'isPublic'>>) => {
    persist(allEntries.map(e => e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e));
  };

  const deleteEntry = (id: string) => {
    persist(allEntries.filter(e => e.id !== id));
  };

  const getEntry = (id: string) => allEntries.find(e => e.id === id);

  return (
    <DiarioContext.Provider value={{ user, entries, login, register, logout, updateProfile, createEntry, updateEntry, deleteEntry, getEntry }}>
      {children}
    </DiarioContext.Provider>
  );
}

export function useDiario() {
  const ctx = useContext(DiarioContext);
  if (!ctx) throw new Error('useDiario must be inside DiarioProvider');
  return ctx;
}
