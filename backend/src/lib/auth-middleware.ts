
import jwt, { type JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

const JWT_ISSUER = "residuguard-api";
const JWT_AUDIENCE = "residuguard-frontend";

export type AppRole =
  | "farmer"
  | "veterinarian"
  | "collection_centre"
  | "factory"
  | "authority";

export type AuthenticatedUser = {
  userId: string;
  role: AppRole;
};

const allowedRoles: AppRole[] = [
  "farmer",
  "veterinarian",
  "collection_centre",
  "factory",
  "authority",
];

function unauthorized(message: string, status = 401): Response {
  return Response.json(
    { error: message },
    {
      status,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      },
    },
  );
}

export function authenticateRequest(
  req: Request,
): AuthenticatedUser | Response {
  const authorization = req.headers.get("Authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return unauthorized("Authentication required. Please log in.");
  }

  const token = authorization.slice(7).trim();

  if (!token) {
    return unauthorized("Authentication token is missing.");
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET!, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });

    if (typeof decoded === "string") {
      return unauthorized("Invalid authentication token.");
    }

    const payload = decoded as JwtPayload & {
      role?: string;
    };

    if (
      typeof payload.sub !== "string" ||
      typeof payload.role !== "string" ||
      !allowedRoles.includes(payload.role as AppRole)
    ) {
      return unauthorized("Invalid authentication token.");
    }

    return {
      userId: payload.sub,
      role: payload.role as AppRole,
    };
  } catch {
    return unauthorized("Invalid or expired authentication token.");
  }
}

export function requireRoles(
  user: AuthenticatedUser,
  roles: AppRole[],
): Response | null {
  if (!roles.includes(user.role)) {
    return unauthorized(
      "You do not have permission to access this resource.",
      403,
    );
  }

  return null;
}
