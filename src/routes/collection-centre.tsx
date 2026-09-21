import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Milk, Ban, Truck, Users } from "lucide-react";
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
import { cattle, formatDate, milkBatches, withdrawalFor } from "@/lib/residuguard-data";

export const Route = createFileRoute("/collection-centre")({
  head: () => ({
    meta: [
      { title: "Collection Centre Dashboard — ResiduGuard" },
      {
        name: "description",
        content:
          "Collection centre view: screen incoming milk against withdrawal status and create milk batch IDs.",
      },
      { property: "og:title", content: "Collection Centre Dashboard — ResiduGuard" },
      {
        property: "og:description",
        content: "Accept eligible milk, hold animals under withdrawal and issue milk batch IDs.",
      },
    ],
  }),
  component: () => (
    <RoleGate role="collection">
      <CentreDashboard />
    </RoleGate>
  ),
});

function CentreDashboard() {
  const intake = useMemo(
    () => cattle.map((c) => ({ cow: c, wd: withdrawalFor(c.id) })),
    [],
  );
  const eligible = intake.filter((r) => r.wd.status === "SAFE");
  const [selected, setSelected] = useState<string[]>(eligible.map((r) => r.cow.id));
  const [created, setCreated] = useState<string[]>([]);

  function toggle(id: string, on: boolean) {
    setSelected((p) => (on ? [...new Set([...p, id])] : p.filter((x) => x !== id)));
  }

  function createBatch() {
    const id = `MB-2026-0921-${String.fromCharCode(68 + created.length)}`;
    setCreated((p) => [...p, id]);
    toast.success(`Milk batch ${id} created`, {
      description: `${selected.length} eligible animals pooled. Hash-chained event written to the ledger.`,
    });
  }

  const todays = milkBatches.filter((b) => b.date === "2026-09-21");

  return (
    <PortalShell
      role="collection"
      title="Collection Centre Dashboard"
      subtitle="Kolewadi Collection Centre · CC-SAT-07 · Morning shift, 21 Sep 2026"
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Farmers Registered" value={3} icon={Users} />
        <StatCard label="Animals Eligible Today" value={eligible.length} icon={Milk} tone="safe" />
        <StatCard label="Animals Blocked (HOLD)" value={intake.length - eligible.length} icon={Ban} tone="hold" />
        <StatCard
          label="Batches Dispatched"
          value={todays.filter((b) => b.dispatchedTo).length}
          icon={Truck}
          tone="info"
        />
      </div>

      <Tabs defaultValue="intake" className="mt-8">
        <TabsList className="flex-wrap">
          <TabsTrigger value="intake">Milk Intake Screening</TabsTrigger>
          <TabsTrigger value="batches">Milk Batches</TabsTrigger>
          <TabsTrigger value="blocked">Blocked Animals</TabsTrigger>
        </TabsList>

        <TabsContent value="intake" className="mt-5">
          <div className="panel p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Today's intake screening</h2>
                <p className="text-sm text-muted-foreground">
                  Animals under an active withdrawal period cannot be added to a pooled batch.
                </p>
              </div>
              <Button onClick={createBatch} disabled={selected.length === 0}>
                Create milk batch ID ({selected.length} animals)
              </Button>
            </div>

            <div className="mt-4 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Pool</TableHead>
                    <TableHead>Cow</TableHead>
                    <TableHead>Farmer</TableHead>
                    <TableHead>Village</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Eligibility</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {intake.map(({ cow, wd }) => (
                    <TableRow key={cow.id}>
                      <TableCell>
                        <Checkbox
                          checked={selected.includes(cow.id)}
                          disabled={wd.status === "HOLD"}
                          onCheckedChange={(v) => toggle(cow.id, Boolean(v))}
                          aria-label={`Pool milk from ${cow.id}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {cow.id} · {cow.name}
                      </TableCell>
                      <TableCell>{cow.farmerName}</TableCell>
                      <TableCell>{cow.village}</TableCell>
                      <TableCell className="max-w-sm text-sm text-muted-foreground">{wd.reason}</TableCell>
                      <TableCell>
                        <StatusBadge status={wd.status} />
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

        <TabsContent value="batches" className="mt-5">
          <div className="panel overflow-x-auto p-5">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Milk Batch ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Volume</TableHead>
                  <TableHead>Contributing animals</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Dispatched to</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {milkBatches.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">{b.id}</TableCell>
                    <TableCell>{formatDate(b.date)}</TableCell>
                    <TableCell>{b.volumeL} L</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {b.contributingCows.join(", ")}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={b.status} />
                    </TableCell>
                    <TableCell>{b.dispatchedTo ?? "Held at centre"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="blocked" className="mt-5">
          <div className="grid gap-4 md:grid-cols-2">
            {intake
              .filter((r) => r.wd.status === "HOLD")
              .map(({ cow, wd }) => (
                <div key={cow.id} className="panel p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-heading text-lg font-semibold text-heading">
                        {cow.id} · {cow.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {cow.farmerName} · {cow.village}
                      </p>
                    </div>
                    <StatusBadge status="HOLD" />
                  </div>
                  <p className="mt-3 text-sm">{wd.reason}</p>
                  {wd.clearsOn ? (
                    <p className="mt-2 text-sm font-semibold text-hold">
                      Accept milk again from {formatDate(wd.clearsOn)}
                    </p>
                  ) : null}
                </div>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </PortalShell>
  );
}
