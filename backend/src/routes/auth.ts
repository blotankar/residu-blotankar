import { prisma } from "../lib/prisma";
import { UserRole } from "../../generated/prisma/client";

const roleMap: Record<string, UserRole> = {
  farmer: UserRole.FARMER,
  veterinarian: UserRole.VETERINARIAN,
  collection_centre: UserRole.COLLECTION_CENTRE,
  factory: UserRole.FACTORY,
  authority: UserRole.AUTHORITY,
  consumer: UserRole.CONSUMER,
};

const reverseRoleMap: Record<UserRole, string> = {
  [UserRole.FARMER]: "farmer",
  [UserRole.VETERINARIAN]: "veterinarian",
  [UserRole.COLLECTION_CENTRE]: "collection_centre",
  [UserRole.FACTORY]: "factory",
  [UserRole.AUTHORITY]: "authority",
  [UserRole.CONSUMER]: "consumer",
};

function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function register(req: Request) {
  try {
    const body = await req.json();

    const {
      fullName,
      email,
      password,
      role,
    } = body;

    if (!fullName || !email || !password || !role) {
      return json(
        {
          error:
            "Full name, email, password and role are required.",
        },
        400,
      );
    }

    const normalizedEmail = String(email)
      .trim()
      .toLowerCase();

    const normalizedRole = String(role)
      .trim()
      .toLowerCase();

    if (!roleMap[normalizedRole]) {
      return json(
        {
          error: "Invalid user role.",
        },
        400,
      );
    }

    if (String(password).length < 6) {
      return json(
        {
          error:
            "Password must contain at least 6 characters.",
        },
        400,
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingUser) {
      return json(
        {
          error:
            "An account with this email already exists.",
        },
        409,
      );
    }

    /*
     * Bun provides password hashing through Bun.password.
     * The password itself is NEVER stored in PostgreSQL.
     */
    const passwordHash = await Bun.password.hash(
      password,
      {
        algorithm: "bcrypt",
        cost: 12,
      },
    );

    const user = await prisma.user.create({
      data: {
        name: String(fullName).trim(),
        email: normalizedEmail,
        passwordHash,
        role: roleMap[normalizedRole],
      },
    });

    return json(
      {
        message: "Account created successfully.",
        user: {
          id: user.id,
          fullName: user.name,
          email: user.email,
          role: reverseRoleMap[user.role],
        },
      },
      201,
    );
  } catch (error) {
    console.error("Registration error:", error);

    return json(
      {
        error: "Failed to create account.",
      },
      500,
    );
  }
}

export async function login(req: Request) {
  try {
    const body = await req.json();

    const {
      email,
      password,
    } = body;

    if (!email || !password) {
      return json(
        {
          error: "Email and password are required.",
        },
        400,
      );
    }

    const normalizedEmail = String(email)
      .trim()
      .toLowerCase();

    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (!user) {
      return json(
        {
          error: "Invalid email or password.",
        },
        401,
      );
    }

    const passwordValid =
      await Bun.password.verify(
        password,
        user.passwordHash,
      );

    if (!passwordValid) {
      return json(
        {
          error: "Invalid email or password.",
        },
        401,
      );
    }

    return json({
      message: "Login successful.",
      user: {
        id: user.id,
        fullName: user.name,
        email: user.email,
        role: reverseRoleMap[user.role],
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return json(
      {
        error: "Failed to login.",
      },
      500,
    );
  }
}