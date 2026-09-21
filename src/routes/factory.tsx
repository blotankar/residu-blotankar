import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Factory as FactoryIcon, Boxes, PackageCheck, Link2 } from "lucide-react";
import { PortalShell } from "@/components/residuguard/PortalShell";
import { RoleGate } from "@/components/residuguard/RoleGate";
import { StatCard } from "@/components/residuguard/StatCard";
import { StatusBadge } from "@/components/residuguard/StatusBadge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, milkBatches, processingBatches } from "@/lib/residuguard-data";

export const Route = createFileRoute("/factory")({
  head: () => ({
    meta: [
      { title: "Factory Dashboard — ResiduGuard" },
      {
        name: "description",
        content:
          "Factory view: link eligible milk batches into processing batches and keep packaging traceable.",
      },
      { property: "og:title", content: "Factory Dashboard — ResiduGuard" },
      {
        property: "og:description",
        content: "Accept eligible milk batches, create processing batch IDs and track packs produced.",
      },
    ],
  }),
  component: () => (
    <RoleGate role="factory">
      <FactoryDashboard />
    </RoleGate>
  ),
});

function FactoryDashboard() {
  const incoming = milkBatches.filter((b) => !b.dispatchedTo || b.date === "2026-09-21");
  const [selected, setSelected] = useState<string[]>([]);
  const [created, setCreated] = useState<string[]>([]);

  const volume = milkBatches
    .filter((b) => selected.includes(b.id))
    .reduce((s, b) => s + b.volumeL, 0);

  function toggle(id: string, on: boolean) {
    setSelected((p) => (on ? [...new Set([...p, id])] : p.filter((x) => x !== id)));
  }

  function createProcessing() {
    const id = `PB-2026-0921-M${2 + created.length}`;
    setCreated((p) => [...p, id]);
    setSelected([]);
    toast.success(`Processing batch ${id} created`, {
      description: `${volume} L linked. Forward and backward traceability recorded in the ledger.`,
    });
  }

  return (
    <PortalShell
      role="factory"
      title="Factory Dashboard"
      subtitle="Satara Co-operative Dairy Plant · Processing and packaging traceability"
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Milk Batches Received" value={milkBatches.filter((b) => b.dispatchedTo).length} icon={Boxes} tone="info" />
        <StatCard label="Processing Batches" value={processingBatches.length + created.length} icon={FactoryIcon} />
        <StatCard
          label="Volume Processed"
          value={`${processingBatches.reduce((s, p) => s + p.volumeL, 0)} L`}
          icon={Link2}
        />
        <StatCard
          label="Packs Produced"
          value={processingBatches.reduce((s, p) => s + p.packs, 0)}
          icon={PackageCheck}
          tone="safe"
        />
      </div>

      <Tabs defaultValue="incoming" className="mt-8">
        <TabsList className="flex-wrap">
          <TabsTrigger value="incoming">Incoming Milk Batches</TabsTrigger>
          <TabsTrigger value="processing">Processing Batches</TabsTrigger>
        </TabsList>

        <TabsContent value="incoming" className="mt-5">
          <div className="panel p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Link eligible milk batches</h2>
                <p className="text-sm text-muted-foreground">
                  Only batches marked SAFE by the collection centre can enter processing.
                </p>
              </div>
              <Button onClick={createProcessing} disabled={selected.length === 0}>
                Create processing batch ({volume} L)
              </Button>
            </div>

            <div className="mt-4 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Link</TableHead>
                    <TableHead>Milk Batch ID</TableHead>
                    <TableHead>Centre</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Volume</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incoming.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell>
                        <Checkbox
                          checked={selected.includes(b.id)}
                          disabled={b.status === "HOLD"}
                          onCheckedChange={(v) => toggle(b.id, Boolean(v))}
                          aria-label={`Link ${b.id}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{b.id}</TableCell>
                      <TableCell>{b.centre}</TableCell>
                      <TableCell>{formatDate(b.date)}</TableCell>
                      <TableCell>{b.volumeL} L</TableCell>
                      <TableCell>
                        <StatusBadge status={b.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {created.length > 0 ? (
              <p className="mt-4 rounded-md bg-safe-soft p-3 text-sm text-safe">
                Created this session: {created.join(", ")}
              </p>
            ) : null}
          </div>
        </TabsContent>

        <TabsContent value="processing" className="mt-5">
          <div className="grid gap-4 lg:grid-cols-2">
            {processingBatches.map((p) => (
              <div key={p.id} className="panel p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-heading text-lg font-semibold text-heading">{p.id}</p>
                    <p className="text-sm text-muted-foreground">
                      {p.product} · {formatDate(p.date)}
                    </p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Volume</dt>
                    <dd className="font-semibold">{p.volumeL} L</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Packs</dt>
                    <dd className="font-semibold">{p.packs}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-muted-foreground">Source milk batches</dt>
                    <dd className="font-semibold">{p.milkBatchIds.join(", ")}</dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </PortalShell>
  );
}
