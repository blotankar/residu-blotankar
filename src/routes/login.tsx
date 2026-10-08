
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Info } from "lucide-react";

import { Brand } from "@/components/residuguard/PortalShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { roles } from "@/lib/roles";
import { useSession } from "@/lib/session";
import type { RoleId } from "@/lib/residuguard-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      {
        title: "Sign in — ResiduGuard Dairy Portal",
      },
      {
        name: "description",
        content:
          "Sign in to ResiduGuard as a farmer, veterinarian, collection centre, factory or regulatory authority.",
      },
      {
        property: "og:title",
        content: "Sign in — ResiduGuard Dairy Portal",
      },
      {
        property: "og:description",
        content:
          "Role-based access for farmers, vets, collection centres, factories and regulators.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [selected, setSelected] =
    useState<RoleId>("farmer");

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);

  const { signIn } = useSession();
  const navigate = useNavigate();

  const active = roles.find(
    (r) => r.id === selected,
  )!;

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    setLoginError("");

    /*
     * Consumers do not need an account.
     */
    if (selected === "consumer") {
      navigate({ to: "/verify" });
      return;
    }

    /*
     * Validate email.
     */
    if (!userId.trim()) {
      setLoginError("Please enter your email address.");
      return;
    }

    /*
     * Validate password.
     */
    if (!password.trim()) {
      setLoginError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      /*
       * Authenticate through the backend.
       *
       * The backend checks PostgreSQL and returns
       * the authenticated user's role.
       */
      const result = await signIn(
        userId.trim(),
        password,
      );

      if (!result.success) {
        setLoginError(
          result.error ??
            "Invalid email or password.",
        );
        return;
      }

      /*
       * The user's role comes from the database.
       */
      const loggedInRole = result.user?.role;

      if (!loggedInRole) {
        setLoginError(
          "User role was not returned by the server.",
        );
        return;
      }

      /*
       * Find the dashboard belonging to the role.
       */
      const destination = roles.find(
        (role) => role.id === loggedInRole,
      );

      if (!destination) {
        setLoginError(
          "Invalid user role.",
        );
        return;
      }

      /*
       * Redirect to the appropriate dashboard.
       */
      navigate({
        to: destination.path,
      });
    } finally {
      setLoading(false);
    }
  }

  function goToRegister() {
    navigate({ to: "/register" });
  }

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Brand />

          <Button
            asChild
            variant="ghost"
            size="sm"
          >
            <Link to="/">
              Back to home
            </Link>
          </Button>
        </div>
      </header>

      {/* MAIN */}
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-semibold">
          Sign in to ResiduGuard
        </h1>

        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Select your role and enter your registered
          credentials to continue.
        </p>

        <form
          onSubmit={submit}
          className="mt-8 grid gap-8 lg:grid-cols-[1.5fr_1fr]"
        >
          {/* ROLE SELECTION */}
          <div className="grid gap-4 sm:grid-cols-2">
            {roles.map((role) => {
              const isActive =
                selected === role.id;

              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() =>
                    setSelected(role.id)
                  }
                  aria-pressed={isActive}
                  disabled={loading}
                  className={cn(
                    "panel p-5 text-left transition-colors",
                    isActive
                      ? "border-primary ring-2 ring-primary/25"
                      : "hover:border-primary/50",
                    loading &&
                      "cursor-not-allowed opacity-60",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-10 place-items-center rounded-lg",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-accent text-accent-foreground",
                    )}
                  >
                    <role.icon
                      className="size-5"
                      aria-hidden
                    />
                  </span>

                  <span className="mt-3 block font-heading text-base font-semibold text-heading">
                    {role.label}
                  </span>

                  <span className="mt-1 block text-sm text-muted-foreground">
                    {role.description}
                  </span>
                </button>
              );
            })}
          </div>

          {/* LOGIN CARD */}
          <div className="panel h-fit p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Signing in as
            </p>

            <p className="mt-1 font-heading text-xl font-semibold text-heading">
              {active.label}
            </p>

            <p className="text-sm text-muted-foreground">
              {active.person} · {active.org}
            </p>

            {/* CONSUMER */}
            {selected === "consumer" ? (
              <>
                <div className="mt-5">
                  <p className="flex gap-2 rounded-md bg-info-soft p-3 text-xs text-info">
                    <Info
                      className="mt-0.5 size-4 shrink-0"
                      aria-hidden
                    />

                    Consumers do not need an account.
                    You can directly verify a milk batch
                    using its Batch ID.
                  </p>
                </div>

                <Button
                  type="submit"
                  className="mt-6 w-full"
                >
                  Continue to batch verification

                  <ArrowRight
                    className="size-4"
                    aria-hidden
                  />
                </Button>
              </>
            ) : (
              <>
                {/* EMAIL */}
                <div className="mt-5 space-y-1.5">
                  <Label htmlFor="userid">
                    Email Address
                  </Label>

                  <Input
                    id="userid"
                    type="email"
                    value={userId}
                    onChange={(e) =>
                      setUserId(e.target.value)
                    }
                    placeholder="Enter your email"
                    autoComplete="username"
                    disabled={loading}
                  />
                </div>

                {/* PASSWORD */}
                <div className="mt-4 space-y-1.5">
                  <Label htmlFor="pass">
                    Password
                  </Label>

                  <Input
                    id="pass"
                    type="password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={loading}
                  />
                </div>

                {/* ERROR */}
                {loginError && (
                  <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    {loginError}
                  </div>
                )}

                {/* LOGIN */}
                <Button
                  type="submit"
                  className="mt-6 w-full"
                  disabled={loading}
                >
                  {loading
                    ? "Signing in..."
                    : "Sign in"}

                  {!loading && (
                    <ArrowRight
                      className="size-4"
                      aria-hidden
                    />
                  )}
                </Button>

                {/* REGISTER */}
                <div className="mt-5 text-center">
                  <p className="text-sm text-muted-foreground">
                    Don't have an account?
                  </p>

                  <Button
                    type="button"
                    variant="outline"
                    className="mt-2 w-full"
                    onClick={goToRegister}
                    disabled={loading}
                  >
                    Create an account
                  </Button>
                </div>
              </>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}

