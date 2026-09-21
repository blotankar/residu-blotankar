import { CheckCircle2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Status } from "@/lib/residuguard-data";

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const safe = status === "SAFE";
  const Icon = safe ? CheckCircle2 : AlertTriangle;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold tracking-wide",
        safe ? "bg-safe-soft text-safe" : "bg-hold-soft text-hold",
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      {status}
    </span>
  );
}
