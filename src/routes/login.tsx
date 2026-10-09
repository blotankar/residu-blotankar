
import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSession } from "@/lib/session";
import type { RoleId } from "@/lib/roles";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

const roleOptions: {
  id: RoleId;
  label: string;
  description: string;
}[] = [
  {
    id: "farmer" as RoleId,
    label: "Farmer",
    description: "Manage cattle and track milk batches",
  },
  {
    id: "veterinarian" as RoleId,
    label: "Veterinarian",
    description: "Manage treatments and animal health",
  },
  {
    id: "collection_centre" as RoleId,
    label: "Collection Centre",
    description: "Manage milk collection and testing",
  },
  {
    id: "factory" as RoleId,
    label: "Factory",
    description: "Manage milk processing and batches",
  },
  {
    id: "authority" as RoleId,
    label: "Authority",
    description: "Monitor compliance and residue records",
  },
  {
    id: "consumer" as RoleId,
    label: "Consumer",
    description: "Verify a product or milk batch",
  },
];

// Update these destinations if your project uses different dashboard paths.
const dashboardRoutes: Partial<Record<string, string>> = {
  farmer: "/farmer",
  veterinarian: "/veterinarian",
  collection_centre: "/collection-centre",
  factory: "/factory",
  authority: "/authority",
};

function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useSession();

  const [selectedRole, setSelectedRole] = useState<RoleId>(
    "farmer" as RoleId,
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    // Consumers use public batch verification and do not need an account.
    if (selectedRole === ("consumer" as RoleId)) {
      navigate({ to: "/verify" });
      return;
    }

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const user = await signIn(
        email.trim(),
        password,
        selectedRole,
      );

      const destination = dashboardRoutes[user.role];

      if (!destination) {
        setError(
          "Your dashboard route has not been configured. Please contact the administrator.",
        );
        return;
      }

      navigate({ to: destination as never });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  function openRegistration() {
    if (selectedRole === ("consumer" as RoleId)) {
      navigate({ to: "/verify" });
      return;
    }

    if (selectedRole === ("authority" as RoleId)) {
      setError(
        "Authority accounts are created by an administrator. Public registration is not available.",
      );
      return;
    }

    // Pass the selected role to the Register page.
    window.location.href = `/register?role=${encodeURIComponent(
      String(selectedRole),
    )}`;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <section className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-7 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700">
            ResiduGuard
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Select your role and sign in to your account.
          </p>
        </div>

        <div className="mb-6">
          <h2 className="mb-3 text-sm font-semibold text-slate-800">
            Choose your role
          </h2>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {roleOptions.map((role) => {
              const active = selectedRole === role.id;

              return (
                <button
                  key={String(role.id)}
                  type="button"
                  onClick={() => {
                    setSelectedRole(role.id);
                    setError("");
                  }}
                  className={`rounded-xl border p-4 text-left transition ${
                    active
                      ? "border-emerald-600 bg-emerald-50 ring-1 ring-emerald-600"
                      : "border-slate-200 bg-white hover:border-emerald-300"
                  }`}
                  aria-pressed={active}
                >
                  <span className="block font-semibold text-slate-900">
                    {role.label}
                  </span>
                  <span className="mt-1 block text-sm text-slate-600">
                    {role.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {selectedRole === ("consumer" as RoleId) ? (
          <div className="rounded-xl border border-sky-200 bg-sky-50 p-4">
            <h2 className="font-semibold text-slate-900">
              Verify a milk batch
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Consumers can verify a batch directly without registering or
              signing in.
            </p>
            <button
              type="button"
              onClick={() => navigate({ to: "/verify" })}
              className="mt-4 w-full rounded-lg bg-emerald-700 px-4 py-3 font-semibold text-white hover:bg-emerald-800"
            >
              Continue to Verification
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {selectedRole === ("authority" as RoleId) && (
              <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                Authority accounts are created by an administrator. If you
                already have an account, sign in below.
              </p>
            )}

            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-emerald-700 px-4 py-3 font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            {selectedRole !== ("authority" as RoleId) && (
              <p className="text-center text-sm text-slate-600">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={openRegistration}
                  className="font-semibold text-emerald-700 hover:underline"
                >
                  Register
                </button>
              </p>
            )}
          </form>
        )}

        {error && selectedRole === ("consumer" as RoleId) && (
          <p role="alert" className="mt-4 text-sm text-red-700">
            {error}
          </p>
        )}

        <p className="mt-7 text-center text-xs text-slate-500">
          ResiduGuard · Milk safety and residue traceability
        </p>
      </section>
    </main>
  );
}