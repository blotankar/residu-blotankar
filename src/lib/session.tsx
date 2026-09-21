import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { RoleId } from "./residuguard-data";

const KEY = "residuguard.session";

interface SessionValue {
  role: RoleId | null;
  hydrated: boolean;
  signIn: (role: RoleId) => void;
  signOut: () => void;
}

const SessionContext = createContext<SessionValue>({
  role: null,
  hydrated: false,
  signIn: () => {},
  signOut: () => {},
});

export function SessionProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<RoleId | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(KEY) as RoleId | null;
      if (stored) setRole(stored);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  const signIn = useCallback((next: RoleId) => {
    setRole(next);
    try {
      window.localStorage.setItem(KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const signOut = useCallback(() => {
    setRole(null);
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <SessionContext.Provider value={{ role, hydrated, signIn, signOut }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
