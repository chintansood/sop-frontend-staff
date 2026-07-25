"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ClipboardList, CheckCircle2, AlertTriangle } from "lucide-react"
import { StaffSidebar } from "@/components/staff-sidebar"
import { StatCard } from "@/components/stat-card"
import { SopCard, type Sop } from "@/components/sop-card"
import { apiFetch, getToken } from "@/lib/api"

interface Assignment {
  id: string
  status: string
  dueDate: string
  sopVersionId: string
  sop: { title: string; category: string }
  sopVersion: { versionNumber: number }
}

function mapToSop(a: Assignment): Sop {
  const statusMap: Record<string, Sop["status"]> = {
    NOT_STARTED: "not-started",
    IN_PROGRESS: "in-progress",
    OVERDUE:     "overdue",
    PASSED:      "completed",
    FAILED:      "overdue",
    STALE:       "not-started",
  }

  const ctaMap: Record<string, string> = {
    NOT_STARTED: "Read SOP",
    IN_PROGRESS: "Continue",
    OVERDUE:     "Start Now",
    PASSED:      "Review",
    FAILED:      "Retake",
    STALE:       "Read SOP",
  }

  return {
    id:        a.id,
    title:     a.sop.title,
    category:  a.sop.category,
    dateLabel: a.status === "PASSED"
      ? `Completed`
      : a.dueDate
        ? `Due ${new Date(a.dueDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}`
        : "No due date",
    status:   statusMap[a.status] ?? "not-started",
    progress: a.status === "PASSED" ? 100 : a.status === "IN_PROGRESS" ? 50 : 0,
    cta:      ctaMap[a.status] ?? "Read SOP",
  }
}

export default function DashboardPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading]         = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!getToken()) {
      router.push("/login")
      return
    }
    apiFetch("/api/v1/assignments/me")
      .then(data => setAssignments(data.assignments ?? []))
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false))
  }, [])

  const pending   = assignments.filter(a => ["NOT_STARTED", "IN_PROGRESS", "STALE", "FAILED"].includes(a.status)).map(mapToSop)
  const overdue   = assignments.filter(a => a.status === "OVERDUE").map(mapToSop)
  const completed = assignments.filter(a => a.status === "PASSED").map(mapToSop)

  return (
    <div className="flex min-h-screen bg-background text-foreground pt-14 md:pt-0">
      <StaffSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-6 py-8 md:px-10">
          <header className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight">My SOPs</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {pending.length} pending · {overdue.length} overdue
            </p>
          </header>

          {loading ? (
            <div className="text-sm text-muted-foreground">Loading your SOPs...</div>
          ) : (
            <>
              <div className="mb-8 grid gap-4 sm:grid-cols-3">
                <StatCard label="Assigned"  value={assignments.length} icon={ClipboardList} />
                <StatCard label="Completed" value={completed.length}   icon={CheckCircle2}  tone="success" />
                <StatCard label="Overdue"   value={overdue.length}     icon={AlertTriangle} tone="danger" />
              </div>

              {pending.length > 0 && (
                <section className="mb-8">
                  <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Pending</h2>
                  <div className="grid gap-4">
                    {pending.map(sop => <SopCard key={sop.id} sop={sop} />)}
                  </div>
                </section>
              )}

              {overdue.length > 0 && (
                <section className="mb-8">
                  <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Overdue</h2>
                  <div className="grid gap-4">
                    {overdue.map(sop => <SopCard key={sop.id} sop={sop} />)}
                  </div>
                </section>
              )}

              {completed.length > 0 && (
                <section>
                  <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Completed</h2>
                  <div className="grid gap-4">
                    {completed.map(sop => <SopCard key={sop.id} sop={sop} />)}
                  </div>
                </section>
              )}

              {assignments.length === 0 && (
                <div className="text-sm text-muted-foreground">No SOPs assigned yet.</div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
