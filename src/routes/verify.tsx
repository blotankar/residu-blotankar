import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ScanLine,
  Search,
  MapPin,
  Factory,
  Milk,
  ShieldCheck,
  Link2,
  Info,
} from "lucide-react";
import { Brand } from "@/components/residuguard/PortalShell";
import { StatusBadge } from "@/components/residuguard/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate, sampleBatchIds, traceByBatchId, type TraceResult } from "@/lib/residuguard-data";

export const Route = createFileRoute("/verify")({
  head: () => ({
    meta: [
      { title: "Verify a Milk Batch — ResiduGuard" },
      {
        name: "description",
        content:
          "Enter the batch ID printed on your milk packet to see its collection centre, processing plant and compliance status.",
      },
      { property: "og:title", content: "Verify a Milk Batch — ResiduGuard" },
      {
        property: "og:description",
        content: "Public traceability lookup for dairy packets processed through ResiduGuard.",
      },
    ],
  }),
  component: VerifyPage,
});

function VerifyPage() {
  const [value, setValue] = useState("");
  const [result, setResult] = useState<TraceResult | null>(null);
  const [notFound, setNotFound] = useState(false);

  function lookup(id: string) {
    const found = traceByBatchId(id);
    setResult(found);
    setNotFound(!found);
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Brand />
          <Button asChild variant="ghost" size="sm">
            <Link to="/login">Staff login</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <span className="inline-flex items-center gap-2 rounded-md bg-info-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-info">
          <ScanLine className="size-3.5" aria-hidden /> Consumer access
        </span>
        <h1 className="mt-4 text-3xl font-semibold">Verify your milk packet</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Enter the batch ID printed near the date on your packet. You will see the collection
          centre, processing plant and the recorded antibiotic-withdrawal compliance status for
          that batch. Individual farmer and animal identities are not disclosed publicly.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            lookup(value);
          }}
          className="panel mt-6 flex flex-wrap gap-3 p-5"
        >
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g. PB-2026-0921-M1"
            className="min-w-56 flex-1"
            aria-label="Batch ID"
          />
          <Button type="submit">
            <Search className="size-4" aria-hidden /> Verify batch
          </Button>
        </form>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          Try a sample:
          {sampleBatchIds.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setValue(id);
                lookup(id);
              }}
              className="rounded-md border border-border bg-card px-2.5 py-1 font-mono text-xs text-info hover:border-primary"
            >
              {id}
            </button>
          ))}
        </div>

        {notFound ? (
          <div className="panel mt-8 p-6">
            <h2 className="text-lg font-semibold">No record found</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              We could not find that batch ID. Check the printed code and try again.
            </p>
          </div>
        ) : null}

        {result ? (
          <section className="mt-8 space-y-5">
            <div className="panel p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Processing batch
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold">{result.processing.id}</h2>
                  <p className="text-sm text-muted-foreground">
                    {result.processing.product} · packed {formatDate(result.processing.date)}
                  </p>
                </div>
                <StatusBadge status={result.processing.status} className="text-sm" />
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <Info3 icon={Factory} label="Processed at" value={result.processing.factory} />
                <Info3 icon={MapPin} label="Collection centres" value={result.centres.join(", ")} />
                <Info3
                  icon={Milk}
                  label="Milk batches pooled"
                  value={result.milkBatches.map((m) => m.id).join(", ")}
                />
              </div>
            </div>

            <div className="panel p-6">
              <h3 className="text-lg font-semibold">Antibiotic withdrawal compliance</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Based on recorded veterinary treatment data for every animal contributing to this
                batch. No laboratory testing or residue measurement is involved.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <Info3 icon={ShieldCheck} label="Animals checked" value={String(result.compliance.checked)} />
                <Info3
                  icon={ShieldCheck}
                  label="Animals under withdrawal at pooling"
                  value={String(result.compliance.underWithdrawal)}
                />
                <Info3
                  icon={ShieldCheck}
                  label="Milk from treated animals"
                  value={result.compliance.underWithdrawal === 0 ? "Excluded" : "Review required"}
                />
              </div>
            </div>

            <div className="panel p-6">
              <h3 className="flex items-center gap-2 text-lg font-semibold">
                <Link2 className="size-5 text-info" aria-hidden /> Traceability chain
              </h3>
              <ol className="mt-4 space-y-4 border-l border-border pl-5">
                {result.events.map((e) => (
                  <li key={e.id} className="relative">
                    <span className="absolute -left-[1.4rem] top-1.5 size-2.5 rounded-full bg-primary" />
                    <p className="text-sm font-semibold text-heading">
                      {e.type.replace(/_/g, " ").toLowerCase()} · {e.refId}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(e.timestamp).toLocaleString("en-IN")} · {e.actor}
                    </p>
                    <p className="mt-1 truncate font-mono text-xs text-info">{e.hash}</p>
                  </li>
                ))}
              </ol>
            </div>

            <p className="flex items-start gap-2 text-xs text-muted-foreground">
              <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
              Farmer names, animal IDs and treatment details are withheld from public view. Only
              chain-level compliance information is disclosed to consumers.
            </p>
          </section>
        ) : null}
      </main>
    </div>
  );
}

function Info3({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-surface p-4">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="size-3.5" aria-hidden /> {label}
      </p>
      <p className="mt-1.5 text-sm font-semibold text-heading">{value}</p>
    </div>
  );
}
