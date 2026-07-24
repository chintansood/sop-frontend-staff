import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type SopStatus = "not-started" | "in-progress" | "overdue" | "completed"

export interface Sop {
  id: string
  title: string
  category: string
  dateLabel: string
  status: SopStatus
  progress: number
  score?: number
  cta?: string
}

const statusBadge: Record<SopStatus, { label: string; className: string }> = {
  "not-started": { label: "Not Started", className: "bg-secondary text-muted-foreground" },
  "in-progress": { label: "In Progress", className: "bg-primary/15 text-primary" },
  overdue: { label: "Overdue", className: "bg-destructive/15 text-destructive" },
  completed: { label: "Passed", className: "bg-success/15 text-success" },
}

function ProgressBar({ value, status }: { value: number; status: SopStatus }) {
  const barColor = status === "completed" ? "bg-success" : status === "overdue" ? "bg-destructive" : "bg-primary"
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div className={cn("h-full rounded-full transition-all", barColor)} style={{ width: `${value}%` }} />
    </div>
  )
}

export function SopCard({ sop }: { sop: Sop }) {
  const badge = statusBadge[sop.status]
  const isOverdue = sop.status === "overdue"

  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-5",
        isOverdue ? "border-destructive/50" : "border-border",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate text-base font-medium text-card-foreground">{sop.title}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            <span>{sop.category}</span>
            <span aria-hidden="true">·</span>
            <span>{sop.dateLabel}</span>
            {typeof sop.score === "number" ? (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-success">Score {sop.score}%</span>
              </>
            ) : null}
          </div>
        </div>
        <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-xs font-medium", badge.className)}>
          {badge.label}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <div className="flex-1">
          <ProgressBar value={sop.progress} status={sop.status} />
        </div>
        {sop.cta ? (
  <Link href={sop.status === "completed" ? "/" : `/read?assignmentId=${sop.id}`}>
    <Button
      size="sm"
      variant={sop.status === "completed" ? "secondary" : "default"}
      className={cn(
        isOverdue && "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      )}
    >
      {sop.cta}
    </Button>
  </Link>
) : null}
      </div>
    </div>
  )
}
