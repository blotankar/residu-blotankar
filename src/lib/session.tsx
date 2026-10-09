import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { RoleId } from "@/lib/roles";

const API_URL = "http://localhost:3000";
const SESSION_KEY = "residuguard.session";

export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  role: RoleId;
};

type AuthResponse = {
  message?: string;
  error?: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
};

type SessionContextValue = {
  user: AuthUser | null;
  register: (
    fullName: string,
    email: string,
    password: string,
    role: RoleId,
    profile: Record<string, string>,
  ) => Promise<void>;
  signIn: (
    email: string,
    password: string,
    role: RoleId,
  ) => Promise<AuthUser>;
  signOut: () => void;
};

const SessionContext = createContext<SessionContextValue | undefined>(
  undefined,
);

function readStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;

  try {
    const saved = localStorage.getItem(SESSION_KEY);
    return saved ? (JSON.parse(saved) as AuthUser) : null;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

async function postAuth(
  endpoint: string,
  payload: Record<string, unknown>,
): Promise<AuthResponse> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}/api/auth/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error(
      "Cannot connect to the server. Make sure the ResiduGuard backend is running.",
    );
  }

  const result = (await response.json()) as AuthResponse;

  if (!response.ok) {
    throw new Error(result.error || "Authentication request failed.");
  }

  return result;
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());

  async function register(
    fullName: string,
    email: string,
    password: string,
    role: RoleId,
    profile: Record<string, string>,
  ): Promise<void> {
    await postAuth("register", {
      fullName,
      email,
      password,
      role,
      ...profile,
    });
  }

  async function signIn(
    email: string,
    password: string,
    role: RoleId,
  ): Promise<AuthUser> {
    const result = await postAuth("login", { email, password, role });

    if (!result.user) {
      throw new Error("The server did not return user information.");
    }

    const authenticatedUser = result.user as AuthUser;

    localStorage.setItem(SESSION_KEY, JSON.stringify(authenticatedUser));
    setUser(authenticatedUser);

    return authenticatedUser;
  }

  function signOut() {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }

  return (
    <SessionContext.Provider
      value={{ user, register, signIn, signOut }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSession must be used within a SessionProvider.");
  }

  return context;
}