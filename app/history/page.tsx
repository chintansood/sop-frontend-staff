"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { StaffSidebar } from "@/components/staff-sidebar"
import { apiFetch, getToken } from "@/lib/api"

interface Attempt {
  id: string
  attemptNumber: number
  score: string
  passed: boolean
  startedAt: string
  submittedAt: string
}

interface Assignment {
  id: string
  status: string
  dueDate: string
  sop: { title: string; category: string }
  attempts: Attempt[]
}

export default function HistoryPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading]         = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!getToken()) { router.push("/login"); return }
    apiFetch("/api/v1/assignments/me")
      .then(data => setAssignments(data.assignments ?? []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const totalPassed = assignments.filter(a => a.status === "PASSED").length
  const totalFailed = assignments.filter(a => a.status === "FAILED").length
  const totalAttempts = assignments.reduce((sum, a) => sum + (a.attempts?.length ?? 0), 0)

  return (
    <div className="flex min-h-screen bg-background pt-14 md:pt-0">
      <StaffSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center border-b border-border bg-background px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold text-foreground">My History</h1>
            <p className="text-sm text-muted-foreground">All your past assessment attempts</p>
          </div>
        </header>

        <main className="flex-1 space-y-6 p-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">Passed</p>
              <p className="mt-1 text-3xl font-bold text-success">{totalPassed}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">Failed</p>
              <p className="mt-1 text-3xl font-bold text-destructive">{totalFailed}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">Total attempts</p>
              <p className="mt-1 text-3xl font-bold text-foreground">{totalAttempts}</p>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-xl border border-border bg-card">
            <div className="border-b border-border px-5 py-4">
              <p className="font-medium text-foreground">Attempt History</p>
            </div>
            {loading ? (
              <div className="px-5 py-8 text-sm text-muted-foreground">Loading history...</div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground">
                    <th className="px-5 py-3 font-medium">SOP</th>
                    <th className="px-5 py-3 font-medium">Attempt</th>
                    <th className="px-5 py-3 font-medium">Score</th>
                    <th className="px-5 py-3 font-medium">Result</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.flatMap(a =>
                    (a.attempts ?? []).map(attempt => (
                      <tr key={attempt.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                        <td className="px-5 py-3.5 font-medium text-foreground">{a.sop.title}</td>
                        <td className="px-5 py-3.5 text-muted-foreground">#{attempt.attemptNumber}</td>
                        <td className={`px-5 py-3.5 font-medium ${attempt.passed ? "text-success" : "text-destructive"}`}>
                          {attempt.score !== null ? `${Math.round(Number(attempt.score))}%` : "—"}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${
                            attempt.passed
                              ? "border-success/30 bg-success/10 text-success"
                              : "border-destructive/30 bg-destructive/10 text-destructive"
                          }`}>
                            <span className={`size-1.5 rounded-full ${attempt.passed ? "bg-success" : "bg-destructive"}`} />
                            {attempt.passed ? "Passed" : "Failed"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-muted-foreground">
                          {attempt.submittedAt
                            ? new Date(attempt.submittedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                            : "—"}
                        </td>
                      </tr>
                    ))
                  )}
                  {assignments.every(a => !a.attempts?.length) && (
                    <tr><td colSpan={5} className="px-5 py-8 text-sm text-muted-foreground">No attempts yet.</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
