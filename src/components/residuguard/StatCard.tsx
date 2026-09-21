import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "neutral",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tone?: "neutral" | "safe" | "hold" | "info";
}) {
  const tones = {
    neutral: "bg-muted text-muted-foreground",
    safe: "bg-safe-soft text-safe",
    hold: "bg-hold-soft text-hold",
    info: "bg-info-soft text-info",
  } as const;

  return (
    <div className="panel p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 font-heading text-3xl font-semibold text-heading">{value}</p>
          {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
        </div>
        <span className={cn("grid size-10 shrink-0 place-items-center rounded-lg", tones[tone])}>
          <Icon className="size-5" aria-hidden />
        </span>
      </div>
    </div>
  );
}
