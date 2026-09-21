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
      { title: "Sign in — ResiduGuard Dairy Portal" },
      {
        name: "description",
        content:
          "Sign in to ResiduGuard as a farmer, veterinarian, collection centre, factory or regulatory authority.",
      },
      { property: "og:title", content: "Sign in — ResiduGuard Dairy Portal" },
      {
        property: "og:description",
        content: "Role-based access for farmers, vets, collection centres, factories and regulators.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [selected, setSelected] = useState<RoleId>("farmer");
  const { signIn } = useSession();
  const navigate = useNavigate();
  const active = roles.find((r) => r.id === selected)!;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (selected === "consumer") {
      navigate({ to: "/verify" });
      return;
    }
    signIn(selected);
    navigate({ to: active.path });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Brand />
          <Button asChild variant="ghost" size="sm">
            <Link to="/">Back to home</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-semibold">Select your role to continue</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          ResiduGuard uses role-based access. Each role sees only the records it is permitted to
          view. This prototype signs you in with a demo account for the selected role.
        </p>

        <form onSubmit={submit} className="mt-8 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            {roles.map((role) => {
              const isActive = selected === role.id;
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelected(role.id)}
                  aria-pressed={isActive}
                  className={cn(
                    "panel p-5 text-left transition-colors",
                    isActive ? "border-primary ring-2 ring-primary/25" : "hover:border-primary/50",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-10 place-items-center rounded-lg",
                      isActive ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground",
                    )}
                  >
                    <role.icon className="size-5" aria-hidden />
                  </span>
                  <span className="mt-3 block font-heading text-base font-semibold text-heading">
                    {role.label}
                  </span>
                  <span className="mt-1 block text-sm text-muted-foreground">{role.description}</span>
                </button>
              );
            })}
          </div>

          <div className="panel h-fit p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Signing in as
            </p>
            <p className="mt-1 font-heading text-xl font-semibold text-heading">{active.label}</p>
            <p className="text-sm text-muted-foreground">
              {active.person} · {active.org}
            </p>

            <div className="mt-5 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="userid">User ID</Label>
                <Input id="userid" defaultValue={`${active.id}@residuguard.demo`} readOnly />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pass">Password</Label>
                <Input id="pass" type="password" defaultValue="demo1234" readOnly />
              </div>
            </div>

            <Button type="submit" className="mt-6 w-full">
              {selected === "consumer" ? "Continue to batch verification" : "Enter dashboard"}
              <ArrowRight className="size-4" aria-hidden />
            </Button>

            <p className="mt-4 flex gap-2 rounded-md bg-info-soft p-3 text-xs text-info">
              <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
              Demo credentials are pre-filled. Consumers do not need an account — batch
              verification is open to the public.
            </p>
          </div>
        </form>
      </main>
    </div>
  );
}
