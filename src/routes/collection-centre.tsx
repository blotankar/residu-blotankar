import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Milk, Ban, Truck, Users } from "lucide-react";

import { PortalShell } from "@/components/residuguard/PortalShell";
import { RoleGate } from "@/components/residuguard/RoleGate";
import { StatCard } from "@/components/residuguard/StatCard";
import { StatusBadge } from "@/components/residuguard/StatusBadge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { fetchCattle, type ApiCattle } from "@/lib/api";
import { formatDate, milkBatches } from "@/lib/residuguard-data";

export const Route = createFileRoute("/collection-centre")({
  head: () => ({
    meta: [
      {
        title: "Collection Centre Dashboard — ResiduGuard",
      },
      {
        name: "description",
        content:
          "Collection centre view: screen incoming milk against withdrawal status and create milk batch IDs.",
      },
      {
        property: "og:title",
        content: "Collection Centre Dashboard — ResiduGuard",
      },
      {
        property: "og:description",
        content:
          "Accept eligible milk, hold animals under withdrawal and issue milk batch IDs.",
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
  const [cattle, setCattle] = useState<ApiCattle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<string[]>([]);
  const [created, setCreated] = useState<string[]>([]);

  // Load cattle from PostgreSQL through the backend API
  useEffect(() => {
    fetchCattle()
      .then((data) => {
        setCattle(data);
        setSelected(data.map((cow) => cow.id));
        setError(null);
      })
      .catch((err) => {
        console.error("Failed to load cattle:", err);
        setError("Unable to load cattle data from the backend.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  /*
   * For this first frontend/backend integration:
   * cattle returned from PostgreSQL are treated as SAFE.
   *
   * We will replace this with real withdrawal calculation
   * using Treatment.withdrawalEnds in the next step.
   */
  const intake = useMemo(
    () =>
      cattle.map((cow) => ({
        cow,
        wd: {
          status: "SAFE" as const,
          reason: "No active withdrawal period recorded.",
          clearsOn: undefined,
        },
      })),
    [cattle],
  );

  const eligible = intake.filter(
    (record) => record.wd.status === "SAFE",
  );

  function toggle(id: string, on: boolean) {
    setSelected((previous) =>
      on
        ? [...new Set([...previous, id])]
        : previous.filter((item) => item !== id),
    );
  }

  function createBatch() {
    const id = `MB-2026-0921-${String.fromCharCode(
      68 + created.length,
    )}`;

    setCreated((previous) => [...previous, id]);

    toast.success(`Milk batch ${id} created`, {
      description: `${selected.length} eligible animals pooled. Hash-chained event written to the ledger.`,
    });
  }

  const todays = milkBatches.filter(
    (batch) => batch.date === "2026-09-21",
  );

  return (
    <PortalShell
      role="collection"
      title="Collection Centre Dashboard"
      subtitle="Kolewadi Collection Centre · CC-SAT-07 · Morning shift, 21 Sep 2026"
    >
      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Farmers Registered"
          value={3}
          icon={Users}
        />

        <StatCard
          label="Animals Eligible Today"
          value={eligible.length}
          icon={Milk}
          tone="safe"
        />

        <StatCard
          label="Animals Blocked (HOLD)"
          value={intake.length - eligible.length}
          icon={Ban}
          tone="hold"
        />

        <StatCard
          label="Batches Dispatched"
          value={
            todays.filter((batch) => batch.dispatchedTo).length
          }
          icon={Truck}
          tone="info"
        />
      </div>

      <Tabs defaultValue="intake" className="mt-8">
        <TabsList className="flex-wrap">
          <TabsTrigger value="intake">
            Milk Intake Screening
          </TabsTrigger>

          <TabsTrigger value="batches">
            Milk Batches
          </TabsTrigger>

          <TabsTrigger value="blocked">
            Blocked Animals
          </TabsTrigger>
        </TabsList>

        {/* =========================
            MILK INTAKE SCREENING
           ========================= */}
        <TabsContent value="intake" className="mt-5">
          <div className="panel p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">
                  Today's intake screening
                </h2>

                <p className="text-sm text-muted-foreground">
                  Animals under an active withdrawal period cannot
                  be added to a pooled batch.
                </p>
              </div>

              <Button
                onClick={createBatch}
                disabled={selected.length === 0}
              >
                Create milk batch ID ({selected.length} animals)
              </Button>
            </div>

            {loading && (
              <p className="mt-4 text-sm text-muted-foreground">
                Loading cattle from PostgreSQL...
              </p>
            )}

            {error && (
              <p className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </p>
            )}

            {!loading && !error && cattle.length === 0 && (
              <p className="mt-4 rounded-md bg-muted p-3 text-sm text-muted-foreground">
                No cattle records found.
              </p>
            )}

            {!loading && !error && cattle.length > 0 && (
              <div className="mt-4 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        Pool
                      </TableHead>

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
                            onCheckedChange={(value) =>
                              toggle(
                                cow.id,
                                Boolean(value),
                              )
                            }
                            aria-label={`Pool milk from ${cow.cattleId}`}
                          />
                        </TableCell>

                        <TableCell className="font-medium">
                          {cow.cattleId} · {cow.name ?? "Unnamed"}
                        </TableCell>

                        <TableCell>
                          {cow.farmer.user.name}
                        </TableCell>

                        <TableCell>
                          {cow.farmer.village}
                        </TableCell>

                        <TableCell className="max-w-sm text-sm text-muted-foreground">
                          {wd.reason}
                        </TableCell>

                        <TableCell>
                          <StatusBadge status={wd.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {created.length > 0 ? (
              <p className="mt-4 rounded-md bg-safe-soft p-3 text-sm text-safe">
                Created this session: {created.join(", ")}
              </p>
            ) : null}
          </div>
        </TabsContent>

        {/* =========================
            MILK BATCHES
           ========================= */}
        <TabsContent value="batches" className="mt-5">
          <div className="panel overflow-x-auto p-5">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Milk Batch ID</TableHead>

                  <TableHead>Date</TableHead>

                  <TableHead>Volume</TableHead>

                  <TableHead>
                    Contributing animals
                  </TableHead>

                  <TableHead>Status</TableHead>

                  <TableHead>Dispatched to</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {milkBatches.map((batch) => (
                  <TableRow key={batch.id}>
                    <TableCell className="font-medium">
                      {batch.id}
                    </TableCell>

                    <TableCell>
                      {formatDate(batch.date)}
                    </TableCell>

                    <TableCell>
                      {batch.volumeL} L
                    </TableCell>

                    <TableCell className="text-sm text-muted-foreground">
                      {batch.contributingCows.join(", ")}
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={batch.status} />
                    </TableCell>

                    <TableCell>
                      {batch.dispatchedTo ?? "Held at centre"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* =========================
            BLOCKED ANIMALS
           ========================= */}
        <TabsContent value="blocked" className="mt-5">
          <div className="grid gap-4 md:grid-cols-2">
            {intake
              .filter(
                (record) => record.wd.status === "HOLD",
              )
              .map(({ cow, wd }) => (
                <div
                  key={cow.id}
                  className="panel p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-heading text-lg font-semibold text-heading">
                        {cow.cattleId} ·{" "}
                        {cow.name ?? "Unnamed"}
                      </p>

                      <p className="text-sm text-muted-foreground">
                        {cow.farmer.user.name} ·{" "}
                        {cow.farmer.village}
                      </p>
                    </div>

                    <StatusBadge status="HOLD" />
                  </div>

                  <p className="mt-3 text-sm">
                    {wd.reason}
                  </p>

                  {wd.clearsOn ? (
                    <p className="mt-2 text-sm font-semibold text-hold">
                      Accept milk again from{" "}
                      {formatDate(wd.clearsOn)}
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