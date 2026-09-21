import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Beef, Syringe, CalendarClock, CheckCircle2, AlertTriangle, Bell, Milk } from "lucide-react";
import { PortalShell } from "@/components/residuguard/PortalShell";
import { RoleGate } from "@/components/residuguard/RoleGate";
import { StatCard } from "@/components/residuguard/StatCard";
import { StatusBadge } from "@/components/residuguard/StatusBadge";
import { Input } from "@/components/ui/input";
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
  cattleFor,
  formatDate,
  milkBatches,
  treatmentsFor,
  withdrawalFor,
} from "@/lib/residuguard-data";

export const Route = createFileRoute("/farmer")({
  head: () => ({
    meta: [
      { title: "Farmer Dashboard — ResiduGuard" },
      {
        name: "description",
        content:
          "Farmer view: cattle register, active antibiotic treatments, withdrawal status and milk records.",
      },
      { property: "og:title", content: "Farmer Dashboard — ResiduGuard" },
      {
        property: "og:description",
        content: "Cattle register, treatments, withdrawal status and milk records for the farm.",
      },
    ],
  }),
  component: () => (
    <RoleGate role="farmer">
      <FarmerDashboard />
    </RoleGate>
  ),
});

const FARMER = "Ramesh Patil";

function FarmerDashboard() {
  const [query, setQuery] = useState("");
  const herd = useMemo(() => cattleFor(FARMER), []);
  const rows = useMemo(
    () =>
      herd.map((cow) => ({
        cow,
        latest: treatmentsFor(cow.id).sort((a, b) => (a.startDate < b.startDate ? 1 : -1))[0],
        wd: withdrawalFor(cow.id),
      })),
    [herd],
  );

  const filtered = rows.filter(({ cow }) =>
    `${cow.id} ${cow.name} ${cow.breed} ${cow.health}`.toLowerCase().includes(query.toLowerCase()),
  );

  const hold = rows.filter((r) => r.wd.status === "HOLD");
  const active = rows.filter((r) => r.wd.status === "HOLD" && r.latest).length;
  const myBatches = milkBatches.filter((b) => b.farmers.includes(FARMER));

  return (
    <PortalShell
      role="farmer"
      title="Farmer Dashboard"
      subtitle={`${FARMER} · FARM-KOL-014, Kolewadi · Linked centre CC-SAT-07`}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total Cattle" value={herd.length} icon={Beef} />
        <StatCard label="Active Treatments" value={active} icon={Syringe} tone="info" />
        <StatCard label="Animals Under Withdrawal" value={hold.length} icon={CalendarClock} tone="hold" />
        <StatCard label="SAFE Animals" value={herd.length - hold.length} icon={CheckCircle2} tone="safe" />
        <StatCard label="HOLD Animals" value={hold.length} icon={AlertTriangle} tone="hold" />
      </div>

      <Tabs defaultValue="cattle" className="mt-8">
        <TabsList className="flex-wrap">
          <TabsTrigger value="cattle">My Cattle</TabsTrigger>
          <TabsTrigger value="treatments">Treatments</TabsTrigger>
          <TabsTrigger value="withdrawal">Withdrawal Status</TabsTrigger>
          <TabsTrigger value="milk">Milk Records</TabsTrigger>
          <TabsTrigger value="alerts">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="cattle" className="mt-5">
          <div className="panel p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">My Cattle</h2>
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search cow ID, name or breed"
                className="max-w-xs"
              />
            </div>
            <div className="mt-4 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cow ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Breed</TableHead>
                    <TableHead>Health Status</TableHead>
                    <TableHead>Latest Treatment</TableHead>
                    <TableHead>Antibiotic</TableHead>
                    <TableHead>Milk Eligibility</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(({ cow, latest, wd }) => (
                    <TableRow key={cow.id}>
                      <TableCell className="font-medium">{cow.id}</TableCell>
                      <TableCell>{cow.name}</TableCell>
                      <TableCell>{cow.breed}</TableCell>
                      <TableCell>{cow.health}</TableCell>
                      <TableCell>{latest ? formatDate(latest.startDate) : "—"}</TableCell>
                      <TableCell>{latest ? latest.drug : "—"}</TableCell>
                      <TableCell>
                        <StatusBadge status={wd.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No cattle match that search.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="treatments" className="mt-5">
          <div className="panel p-5">
            <h2 className="text-lg font-semibold">Veterinary treatment records</h2>
            <div className="mt-4 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Record</TableHead>
                    <TableHead>Cow</TableHead>
                    <TableHead>Antibiotic</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Veterinarian</TableHead>
                    <TableHead>Start</TableHead>
                    <TableHead>Withdrawal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {herd.flatMap((c) => treatmentsFor(c.id)).map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.id}</TableCell>
                      <TableCell>{t.cowId}</TableCell>
                      <TableCell>{t.drug}</TableCell>
                      <TableCell>{t.route}</TableCell>
                      <TableCell>{t.reason}</TableCell>
                      <TableCell>{t.vetName}</TableCell>
                      <TableCell>{formatDate(t.startDate)}</TableCell>
                      <TableCell>{t.withdrawalDays} days</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="withdrawal" className="mt-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {rows.map(({ cow, wd }) => (
              <div key={cow.id} className="panel p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-heading text-lg font-semibold text-heading">
                      {cow.name} <span className="text-sm text-muted-foreground">({cow.id})</span>
                    </p>
                    <p className="text-sm text-muted-foreground">{cow.breed}</p>
                  </div>
                  <StatusBadge status={wd.status} />
                </div>
                <p className="mt-3 text-sm">{wd.reason}</p>
                {wd.status === "HOLD" && wd.clearsOn ? (
                  <p className="mt-2 text-sm font-semibold text-hold">
                    Milk eligible again on {formatDate(wd.clearsOn)} · {wd.daysRemaining} day
                    {wd.daysRemaining === 1 ? "" : "s"} remaining
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="milk" className="mt-5">
          <div className="panel p-5">
            <h2 className="text-lg font-semibold">Milk contributed to batches</h2>
            <div className="mt-4 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Milk Batch ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Centre</TableHead>
                    <TableHead>Volume</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Processing Batch</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myBatches.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium">{b.id}</TableCell>
                      <TableCell>{formatDate(b.date)}</TableCell>
                      <TableCell>{b.centre}</TableCell>
                      <TableCell>{b.volumeL} L</TableCell>
                      <TableCell>
                        <StatusBadge status={b.status} />
                      </TableCell>
                      <TableCell>{b.dispatchedTo ?? "Held at centre"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="mt-5">
          <div className="panel divide-y divide-border p-0">
            {hold.map(({ cow, wd }) => (
              <div key={cow.id} className="flex gap-3 p-5">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-hold-soft text-hold">
                  <Bell className="size-4" aria-hidden />
                </span>
                <div>
                  <p className="font-semibold">
                    Do not pool milk from {cow.name} ({cow.id})
                  </p>
                  <p className="text-sm text-muted-foreground">{wd.reason}</p>
                  {wd.clearsOn ? (
                    <p className="text-sm text-hold">Clears on {formatDate(wd.clearsOn)}</p>
                  ) : null}
                </div>
              </div>
            ))}
            <div className="flex gap-3 p-5">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-safe-soft text-safe">
                <Milk className="size-4" aria-hidden />
              </span>
              <div>
                <p className="font-semibold">Batch MB-2026-0921-A accepted</p>
                <p className="text-sm text-muted-foreground">
                  412 L from your farm and Kolewadi neighbours cleared for dispatch.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </PortalShell>
  );
}
