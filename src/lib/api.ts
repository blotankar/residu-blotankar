
const API_URL = "http://localhost:3000";
const SESSION_KEY = "residuguard.session";

export type ApiCattle = {
  id: string;
  cattleId: string;
  name: string | null;
  breed: string | null;
  sex: string | null;
  dateOfBirth?: string | null;
  farmer: {
    village: string;
    user: {
      name: string;
    };
  };
  treatments: {
    id: string;
    medicineName: string;
    dosage: string | null;
    administeredAt: string;
    withdrawalEnds: string | null;
    reason: string | null;
  }[];
};

function getAuthToken(): string {
  if (typeof window === "undefined") {
    throw new Error("Authentication is only available in the browser.");
  }

  const saved = localStorage.getItem(SESSION_KEY);

  if (!saved) {
    throw new Error("Please log in to access cattle records.");
  }

  try {
    const session = JSON.parse(saved) as {
      token?: unknown;
    };

    if (typeof session.token !== "string" || !session.token) {
      throw new Error("Your session has no authentication token. Please log in again.");
    }

    return session.token;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error("Your saved session is invalid. Please log in again.");
    }

    throw error;
  }
}

async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getAuthToken();

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (response.status === 401) {
    throw new Error("Your session is invalid or expired. Please log in again.");
  }

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "The API request failed.");
  }

  return result as T;
}

export async function fetchCattle(): Promise<ApiCattle[]> {
  return apiRequest<ApiCattle[]>("/api/cattle");
}

export type CreateCattleInput = {
  cattleId: string;
  name?: string | null;
  breed?: string | null;
  sex?: string | null;
  dateOfBirth?: string | null;
};

export async function createCattle(
  input: CreateCattleInput,
): Promise<ApiCattle> {
  const result = await apiRequest<{ cattle: ApiCattle }>("/api/cattle", {
    method: "POST",
    body: JSON.stringify(input),
  });

  return result.cattle;
}
