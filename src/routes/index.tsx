import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Syringe,
  CalendarClock,
  Milk,
  Factory,
  Boxes,
  ScanLine,
  ShoppingBasket,
  AlertTriangle,
  Search,
  FileWarning,
  Link2,
  ShieldCheck,
} from "lucide-react";
import heroImage from "@/assets/hero-dairy.jpg";
import { Brand } from "@/components/residuguard/PortalShell";
import { Button } from "@/components/ui/button";
import { roles } from "@/lib/roles";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ResiduGuard — Antibiotic Treatment & Milk Traceability Platform" },
      {
        name: "description",
        content:
          "Track cattle treatment, monitor withdrawal periods, manage milk batches, and provide transparent farm-to-consumer traceability.",
      },
      { property: "og:title", content: "ResiduGuard — Antibiotic Treatment & Milk Traceability" },
      {
        property: "og:description",
        content:
          "A dairy-chain portal for treatment records, withdrawal compliance, milk batch management and consumer traceability.",
      },
    ],
  }),
  component: Landing,
});

const flow = [
  { label: "Cattle Health", icon: ShieldCheck },
  { label: "Antibiotic Treatment", icon: Syringe },
  { label: "Withdrawal Compliance", icon: CalendarClock },
  { label: "Milk Batch", icon: Milk },
  { label: "Processing", icon: Factory },
  { label: "Traceability", icon: Boxes },
  { label: "Consumer", icon: ShoppingBasket },
];

const problems = [
  {
    icon: Syringe,
    title: "Antibiotic misuse",
    body: "Treatments given without proper veterinary records make safe-milk decisions guesswork.",
  },
  {
    icon: CalendarClock,
    title: "Withdrawal non-compliance",
    body: "Milk is often pooled before the label withdrawal period for the drug has elapsed.",
  },
  {
    icon: Search,
    title: "Pooled milk is hard to trace",
    body: "Once cans are mixed at a centre, linking a packet back to contributing animals is difficult.",
  },
  {
    icon: FileWarning,
    title: "No treatment-to-batch record",
    body: "Paper registers break the chain between a vet's prescription and the batch that reaches a consumer.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Brand />
          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/verify">Verify Batch</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/login">Login</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="border-b border-border">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-20">
            <div>
              <span className="inline-flex items-center gap-2 rounded-md bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent-foreground">
                <ShieldCheck className="size-3.5" aria-hidden /> Dairy compliance prototype
              </span>
              <h1 className="mt-5 text-4xl font-semibold sm:text-5xl">ResiduGuard</h1>
              <p className="mt-3 font-heading text-xl text-heading/80">
                Antibiotic Treatment &amp; Milk Traceability Platform
              </p>
              <p className="mt-4 max-w-xl text-base text-muted-foreground">
                Track cattle treatment, monitor withdrawal periods, manage milk batches, and
                provide transparent farm-to-consumer traceability.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link to="/login">
                    Login <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/verify">
                    <ScanLine className="size-4" aria-hidden /> Verify Batch
                  </Link>
                </Button>
              </div>
            </div>

            <div className="panel overflow-hidden p-0">
              <img
                src={heroImage}
                alt="Indian dairy farmer and veterinarian with Gir cattle beside milk cans at a cooperative farm"
                width={1600}
                height={1008}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* Flow */}
        <section className="border-b border-border bg-surface">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
            <h2 className="text-xl font-semibold">How a record travels through the chain</h2>
            <ol className="mt-6 flex flex-wrap items-stretch gap-3">
              {flow.map((step, i) => (
                <li key={step.label} className="flex flex-1 items-center gap-3">
                  <div className="panel flex min-w-40 flex-1 items-center gap-3 p-4">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                      <step.icon className="size-5" aria-hidden />
                    </span>
                    <span className="text-sm font-semibold text-heading">{step.label}</span>
                  </div>
                  {i < flow.length - 1 ? (
                    <ArrowRight className="hidden size-4 shrink-0 text-muted-foreground xl:block" aria-hidden />
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Problem */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
            <h2 className="text-2xl font-semibold">The problem we are addressing</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              ResiduGuard does not test milk. It makes recorded treatment and withdrawal
              information visible and auditable across every actor in the chain.
            </p>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {problems.map((p) => (
                <div key={p.title} className="panel p-5">
                  <span className="grid size-10 place-items-center rounded-lg bg-hold-soft text-hold">
                    <p.icon className="size-5" aria-hidden />
                  </span>
                  <h3 className="mt-3 text-base font-semibold">{p.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Roles */}
        <section className="border-b border-border bg-surface">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
            <h2 className="text-2xl font-semibold">One portal, six connected roles</h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {roles.map((role) => (
                <Link key={role.id} to={role.path} className="panel p-5 transition-colors hover:border-primary/60">
                  <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                    <role.icon className="size-5" aria-hidden />
                  </span>
                  <h3 className="mt-3 text-base font-semibold">{role.label}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{role.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Ledger note */}
        <section>
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
            <div className="panel flex flex-col items-start gap-6 p-8 lg:flex-row lg:items-center">
              <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-info-soft text-info">
                <Link2 className="size-6" aria-hidden />
              </span>
              <div className="flex-1">
                <h2 className="text-xl font-semibold">Tamper-evident event ledger</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Every treatment entry, withdrawal clearance, batch creation and dispatch is
                  written as a hash-chained event. Any edit to a past record breaks the chain and
                  is visible to the regulatory authority.
                </p>
              </div>
              <Button asChild variant="outline">
                <Link to="/authority">View audit ledger</Link>
              </Button>
            </div>

            <p className="mt-8 flex items-start gap-2 text-xs text-muted-foreground">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
              Academic prototype. ResiduGuard records antibiotic usage and withdrawal compliance.
              It does not perform laboratory testing and does not measure or claim residue
              concentrations. MRL values shown are regulatory reference information only.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-card py-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 text-sm text-muted-foreground sm:px-6">
          <Brand compact />
          <p>ResiduGuard · Final-year dairy supply-chain transparency project</p>
        </div>
      </footer>
    </div>
  );
}
