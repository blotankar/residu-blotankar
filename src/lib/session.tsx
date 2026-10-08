import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { RoleId } from "./residuguard-data";

/*
 * Backend URL
 *
 * Your Bun backend is running on:
 * http://localhost:3000
 */
const API_URL = "http://localhost:3000";

const KEY = "residuguard.session";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: RoleId;
}

interface AuthResponse {
  message?: string;
  error?: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
}

interface SessionValue {
  user: AuthUser | null;
  role: RoleId | null;
  hydrated: boolean;

  signIn: (
    email: string,
    password: string,
  ) => Promise<{
    success: boolean;
    error?: string;
    user?: AuthUser;
  }>;

  register: (
    fullName: string,
    email: string,
    password: string,
    role: RoleId,
  ) => Promise<{
    success: boolean;
    error?: string;
  }>;

  signOut: () => void;
}

const SessionContext = createContext<SessionValue>({
  user: null,
  role: null,
  hydrated: false,

  signIn: async () => ({
    success: false,
    error: "Session provider is not available.",
  }),

  register: async () => ({
    success: false,
    error: "Session provider is not available.",
  }),

  signOut: () => {},
});

export function SessionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<AuthUser | null>(
    null,
  );

  const [hydrated, setHydrated] = useState(false);

  /*
   * Restore the logged-in user when the application starts.
   *
   * IMPORTANT:
   * This only stores the logged-in session information.
   * Passwords are NEVER stored here.
   */
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(KEY);

      if (stored) {
        const parsed = JSON.parse(stored) as AuthUser;

        if (
          parsed &&
          parsed.id &&
          parsed.email &&
          parsed.fullName &&
          parsed.role
        ) {
          setUser(parsed);
        }
      }
    } catch (error) {
      console.error(
        "Failed to restore session:",
        error,
      );

      window.localStorage.removeItem(KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  /*
   * REGISTER
   *
   * Sends the registration details to:
   * POST http://localhost:3000/api/auth/register
   *
   * The backend hashes the password and stores
   * the user in PostgreSQL.
   */
  const register = useCallback(
    async (
      fullName: string,
      email: string,
      password: string,
      role: RoleId,
    ): Promise<{
      success: boolean;
      error?: string;
    }> => {
      try {
        const response = await fetch(
          `${API_URL}/api/auth/register`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              fullName,
              email,
              password,
              role,
            }),
          },
        );

        let data: AuthResponse;

        try {
          data =
            (await response.json()) as AuthResponse;
        } catch {
          return {
            success: false,
            error:
              "The server returned an invalid response.",
          };
        }

        if (!response.ok) {
          return {
            success: false,
            error:
              data.error ??
              "Registration failed.",
          };
        }

        return {
          success: true,
        };
      } catch (error) {
        console.error(
          "Registration request failed:",
          error,
        );

        return {
          success: false,
          error:
            "Unable to connect to the backend. Make sure the ResiduGuard backend is running on port 3000.",
        };
      }
    },
    [],
  );

  /*
   * LOGIN
   *
   * Sends the email and password to:
   * POST http://localhost:3000/api/auth/login
   *
   * The backend:
   * 1. Finds the user in PostgreSQL
   * 2. Verifies the password
   * 3. Returns the user's role
   */
  const signIn = useCallback(
    async (
      email: string,
      password: string,
    ): Promise<{
      success: boolean;
      error?: string;
      user?: AuthUser;
    }> => {
      try {
        const response = await fetch(
          `${API_URL}/api/auth/login`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email,
              password,
            }),
          },
        );

        let data: AuthResponse;

        try {
          data =
            (await response.json()) as AuthResponse;
        } catch {
          return {
            success: false,
            error:
              "The server returned an invalid response.",
          };
        }

        if (!response.ok) {
          return {
            success: false,
            error:
              data.error ??
              "Invalid email or password.",
          };
        }

        if (!data.user) {
          return {
            success: false,
            error:
              "Login succeeded but no user information was returned.",
          };
        }

        const loggedInUser: AuthUser = {
          id: data.user.id,
          fullName: data.user.fullName,
          email: data.user.email,
          role: data.user.role as RoleId,
        };

        /*
         * Store only the logged-in user's basic information.
         *
         * NEVER store the password here.
         */
        setUser(loggedInUser);

        try {
          window.localStorage.setItem(
            KEY,
            JSON.stringify(loggedInUser),
          );
        } catch (error) {
          console.error(
            "Failed to save session:",
            error,
          );
        }

        return {
          success: true,
          user: loggedInUser,
        };
      } catch (error) {
        console.error(
          "Login request failed:",
          error,
        );

        return {
          success: false,
          error:
            "Unable to connect to the backend. Make sure the ResiduGuard backend is running on port 3000.",
        };
      }
    },
    [],
  );

  /*
   * LOGOUT
   */
  const signOut = useCallback(() => {
    setUser(null);

    try {
      window.localStorage.removeItem(KEY);
    } catch (error) {
      console.error(
        "Failed to clear session:",
        error,
      );
    }
  }, []);

  const role = user?.role ?? null;

  return (
    <SessionContext.Provider
      value={{
        user,
        role,
        hydrated,
        signIn,
        register,
        signOut,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}