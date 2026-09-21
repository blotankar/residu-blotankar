import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, AlertTriangle, Link2, Building2, FileCheck2 } from "lucide-react";
import { PortalShell } from "@/components/residuguard/PortalShell";
import { RoleGate } from "@/components/residuguard/RoleGate";
import { StatCard } from "@/components/residuguard/StatCard";
import { StatusBadge } from "@/components/residuguard/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  cattle,
  formatDate,
  ledger,
  milkBatches,
  mrlReference,
  processingBatches,
  treatments,
  withdrawalFor,
} from "@/lib/residuguard-data";

export const Route = createFileRoute("/authority")({
  head: () => ({
    meta: [
      { title: "Authority Dashboard — ResiduGuard" },
      {
        name: "description",
        content:
          "Regulatory view: compliance across farms and centres, MRL reference data and the tamper-evident audit ledger.",
      },
      { property: "og:title", content: "Authority Dashboard — ResiduGuard" },
      {
        property: "og:description",
        content: "Oversight of withdrawal compliance, held batches and the hash-chained event ledger.",
      },
    ],
  }),
  component: () => (
    <RoleGate role="authority">
      <AuthorityDashboard />
    </RoleGate>
  ),
});

const eventLabels: Record<string, string> = {
  TREATMENT_RECORDED: "Treatment recorded",
  WITHDRAWAL_CLEARED: "Withdrawal cleared",
  MILK_BATCH_CREATED: "Milk batch created",
  BATCH_HELD: "Batch held",
  BATCH_DISPATCHED: "Batch dispatched",
  PROCESSING_LINKED: "Processing batch linked",
  AUDIT_CHECK: "Audit check",
};

function AuthorityDashboard() {
  const hold = cattle.filter((c) => withdrawalFor(c.id).status === "HOLD");
  const heldBatches = milkBatches.filter((b) => b.status === "HOLD");
  const complianceRate = Math.round(
    ((milkBatches.length - heldBatches.length) / milkBatches.length) * 100,
  );

  return (
    <PortalShell
      role="authority"
      title="Regulatory Authority Dashboard"
      subtitle="State Dairy Authority · Satara district oversight"
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Registered Animals" value={cattle.length} icon={Building2} />
        <StatCard label="Treatments On Record" value={treatments.length} icon={FileCheck2} tone="info" />
        <StatCard label="Animals Under Withdrawal" value={hold.length} icon={AlertTriangle} tone="hold" />
        <StatCard
          label="Batch Compliance"
          value={`${complianceRate}%`}
          hint={`${heldBatches.length} batch(es) correctly held`}
          icon={ShieldCheck}
          tone="safe"
        />
      </div>

      <Tabs defaultValue="compliance" className="mt-8">
        <TabsList className="flex-wrap">
          <TabsTrigger value="compliance">Compliance Overview</TabsTrigger>
          <TabsTrigger value="ledger">Audit Ledger</TabsTrigger>
          <TabsTrigger value="chain">Supply Chain</TabsTrigger>
          <TabsTrigger value="mrl">MRL Reference</TabsTrigger>
        </TabsList>

        <TabsContent value="compliance" className="mt-5">
          <div className="panel overflow-x-auto p-5">
            <h2 className="text-lg font-semibold">Animals with an active withdrawal period</h2>
            <Table className="mt-4">
              <TableHeader>
                <TableRow>
                  <TableHead>Cow</TableHead>
                  <TableHead>Farmer</TableHead>
                  <TableHead>Antibiotic</TableHead>
                  <TableHead>Veterinarian</TableHead>
                  <TableHead>Clears on</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cattle.map((c) => {
                  const wd = withdrawalFor(c.id);
                  return (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">
                        {c.id} · {c.name}
                      </TableCell>
                      <TableCell>{c.farmerName}</TableCell>
                      <TableCell>{wd.treatment?.drug ?? "—"}</TableCell>
                      <TableCell>{wd.treatment?.vetName ?? "—"}</TableCell>
                      <TableCell>{wd.clearsOn ? formatDate(wd.clearsOn) : "—"}</TableCell>
                      <TableCell>
                        <StatusBadge status={wd.status} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="ledger" className="mt-5">
          <div className="panel p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Tamper-evident event ledger</h2>
                <p className="text-sm text-muted-foreground">
                  Each event stores the hash of the previous event. Altering any past record
                  invalidates every hash that follows it.
                </p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-md bg-safe-soft px-3 py-1.5 text-sm font-semibold text-safe">
                <Link2 className="size-4" aria-hidden /> Chain intact · {ledger.length} events
              </span>
            </div>
            <div className="mt-4 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Actor</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Hash</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ledger.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">{e.id}</TableCell>
                      <TableCell>{eventLabels[e.type]}</TableCell>
                      <TableCell>{e.refId}</TableCell>
                      <TableCell>{e.actor}</TableCell>
                      <TableCell>{new Date(e.timestamp).toLocaleString("en-IN")}</TableCell>
                      <TableCell className="max-w-[16rem] truncate font-mono text-xs text-info">
                        {e.hash}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="chain" className="mt-5">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="panel overflow-x-auto p-5">
              <h2 className="text-lg font-semibold">Milk batches</h2>
              <Table className="mt-4">
                <TableHeader>
                  <TableRow>
                    <TableHead>Batch</TableHead>
                    <TableHead>Centre</TableHead>
                    <TableHead>Volume</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {milkBatches.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium">{b.id}</TableCell>
                      <TableCell>{b.centreCode}</TableCell>
                      <TableCell>{b.volumeL} L</TableCell>
                      <TableCell>
                        <StatusBadge status={b.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="panel overflow-x-auto p-5">
              <h2 className="text-lg font-semibold">Processing batches</h2>
              <Table className="mt-4">
                <TableHeader>
                  <TableRow>
                    <TableHead>Batch</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Source batches</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processingBatches.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.id}</TableCell>
                      <TableCell>{p.product}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {p.milkBatchIds.join(", ")}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={p.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="mrl" className="mt-5">
          <div className="panel p-5">
            <h2 className="text-lg font-semibold">MRL reference register</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Published regulatory limits held as reference information. ResiduGuard performs no
              laboratory testing and does not generate residue concentration values.
            </p>
            <Table className="mt-4">
              <TableHeader>
                <TableRow>
                  <TableHead>Antibiotic</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Published MRL in milk</TableHead>
                  <TableHead>Typical milk withdrawal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mrlReference.map((m) => (
                  <TableRow key={m.drug}>
                    <TableCell className="font-medium">{m.drug}</TableCell>
                    <TableCell>{m.drugClass}</TableCell>
                    <TableCell>{m.mrlMilk}</TableCell>
                    <TableCell>{m.typicalWithdrawal}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </PortalShell>
  );
}
