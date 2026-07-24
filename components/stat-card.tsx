import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type Tone = "default" | "success" | "danger"

const toneStyles: Record<Tone, { value: string; icon: string }> = {
  default: { value: "text-foreground", icon: "bg-primary/15 text-primary" },
  success: { value: "text-success", icon: "bg-success/15 text-success" },
  danger: { value: "text-destructive", icon: "bg-destructive/15 text-destructive" },
}

interface StatCardProps {
  label: string
  value: number
  icon: LucideIcon
  tone?: Tone
}

export function StatCard({ label, value, icon: Icon, tone = "default" }: StatCardProps) {
  const styles = toneStyles[tone]
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5">
      <div className={cn("flex size-11 items-center justify-center rounded-lg", styles.icon)}>
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <div>
        <p className={cn("text-2xl font-semibold leading-none", styles.value)}>{value}</p>
        <p className="mt-1.5 text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}
