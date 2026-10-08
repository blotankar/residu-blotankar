import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Eye, EyeOff } from "lucide-react";

import { Brand } from "@/components/residuguard/PortalShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { roles } from "@/lib/roles";
import { useSession } from "@/lib/session";
import type { RoleId } from "@/lib/residuguard-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      {
        title: "Create Account — ResiduGuard Dairy Portal",
      },
      {
        name: "description",
        content:
          "Create a ResiduGuard account for farmers, veterinarians, collection centres, factories and regulatory authorities.",
      },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useSession();

  const [selected, setSelected] = useState<RoleId>("farmer");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter a password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const result = await register(
        fullName.trim(),
        email.trim(),
        password,
        selected,
      );

      if (!result.success) {
        setError(result.error ?? "Registration failed.");
        return;
      }

      setSuccess(
        "Account created successfully. Redirecting to login...",
      );

      setTimeout(() => {
        navigate({ to: "/login" });
      }, 1200);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Brand />

          <Button asChild variant="ghost" size="sm">
            <Link to="/login">
              <ArrowLeft className="size-4" aria-hidden />
              Back to login
            </Link>
          </Button>
        </div>
      </header>

      {/* MAIN */}
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-semibold">
              Create your ResiduGuard account
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Register your account to access the ResiduGuard dairy
              portal.
            </p>
          </div>

          <form onSubmit={submit} className="panel p-6 sm:p-8">
            {/* ACCOUNT INFORMATION */}
            <div>
              <h2 className="font-heading text-lg font-semibold text-heading">
                Account information
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Enter your details to create your account.
              </p>
            </div>

            <div className="mt-6 grid gap-5">
              {/* FULL NAME */}
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Full Name</Label>

                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  disabled={loading}
                />
              </div>

              {/* EMAIL */}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address</Label>

                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  autoComplete="email"
                  disabled={loading}
                />
              </div>

              {/* PASSWORD */}
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>

                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    autoComplete="new-password"
                    className="pr-10"
                    disabled={loading}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>

                <p className="text-xs text-muted-foreground">
                  Password must contain at least 6 characters.
                </p>
              </div>

              {/* CONFIRM PASSWORD */}
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">
                  Confirm Password
                </Label>

                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={
                      showConfirmPassword ? "text" : "password"
                    }
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    className="pr-10"
                    disabled={loading}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword,
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    disabled={loading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* ROLE */}
            <div className="mt-8 border-t border-border pt-6">
              <h2 className="font-heading text-lg font-semibold text-heading">
                Select your role
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Your role determines which ResiduGuard features and
                records you can access.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {roles
                  .filter((role) => role.id !== "consumer")
                  .map((role) => {
                    const isActive = selected === role.id;

                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => setSelected(role.id)}
                        aria-pressed={isActive}
                        disabled={loading}
                        className={cn(
                          "rounded-lg border p-4 text-left transition-colors",
                          isActive
                            ? "border-primary ring-2 ring-primary/25"
                            : "border-border hover:border-primary/50",
                          loading &&
                            "cursor-not-allowed opacity-60",
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={cn(
                              "grid size-9 shrink-0 place-items-center rounded-lg",
                              isActive
                                ? "bg-primary text-primary-foreground"
                                : "bg-accent text-accent-foreground",
                            )}
                          >
                            <role.icon
                              className="size-4"
                              aria-hidden
                            />
                          </span>

                          <span>
                            <span className="block font-heading font-semibold text-heading">
                              {role.label}
                            </span>

                            <span className="mt-1 block text-xs text-muted-foreground">
                              {role.description}
                            </span>
                          </span>
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* ERROR */}
            {error && (
              <div className="mt-6 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* SUCCESS */}
            {success && (
              <div className="mt-6 rounded-md border border-primary/30 bg-primary/10 p-3 text-sm text-primary">
                {success}
              </div>
            )}

            {/* REGISTER */}
            <Button
              type="submit"
              className="mt-6 w-full"
              disabled={loading || Boolean(success)}
            >
              {loading ? "Creating account..." : "Create Account"}

              {!loading && (
                <ArrowRight className="size-4" aria-hidden />
              )}
            </Button>

            {/* LOGIN */}
            <div className="mt-5 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?
              </p>

              <Button
                asChild
                variant="link"
                className="mt-1"
                disabled={loading}
              >
                <Link to="/login">Sign in instead</Link>
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

