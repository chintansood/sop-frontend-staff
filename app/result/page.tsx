"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { StaffSidebar } from "@/components/staff-sidebar"
import Link from "next/link"

function ResultContent() {
  const params  = useSearchParams()
  const score   = Number(params.get("score")   ?? 0)
  const passed  = params.get("passed") === "true"
  const correct = Number(params.get("correct") ?? 0)
  const total   = Number(params.get("total")   ?? 5)
  const pct     = Math.round(score)

  return (
    <div className="flex min-h-screen bg-background">
      <StaffSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center border-b border-border bg-background px-6 py-4">
          <h1 className="text-lg font-semibold text-foreground">Assessment Result</h1>
        </header>

        <main className="flex-1 p-6">
          <div className="flex gap-6">

            {/* Left — score */}
            <div className="flex w-64 shrink-0 flex-col items-center">
              <div className={`flex size-44 items-center justify-center rounded-full border-4 ${
                passed ? "border-success bg-success/10" : "border-destructive bg-destructive/10"
              }`}>
                <div className="text-center">
                  <p className={`text-4xl font-bold ${passed ? "text-success" : "text-destructive"}`}>
                    {pct}%
                  </p>
                  <p className={`mt-1 text-sm font-medium ${passed ? "text-success" : "text-destructive"}`}>
                    {passed ? "Passed" : "Failed"}
                  </p>
                </div>
              </div>

              <h2 className="mt-5 text-lg font-semibold text-foreground">
                {passed ? "Well done, Kavita!" : "Keep trying, Kavita"}
              </h2>
              <p className="mt-1.5 text-center text-sm text-muted-foreground">
                {passed
                  ? `You passed with ${pct}%. This SOP is now marked complete.`
                  : `You scored ${pct}%. You need 80% to pass. You have retakes remaining.`}
              </p>

              <div className="mt-6 flex w-full flex-col gap-2">
                <Link href="/" className="w-full rounded-lg border border-border bg-card px-4 py-2 text-center text-sm text-muted-foreground hover:text-foreground">
                  ← Back to My SOPs
                </Link>
                <Link href="/history" className="w-full rounded-lg bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground hover:bg-primary/90">
                  View History
                </Link>
              </div>
            </div>

            {/* Right — summary */}
            <div className="flex-1 space-y-4">
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="mb-3 font-medium text-foreground">Result Summary</h3>
                <div className="divide-y divide-border">
                  {[
                    { label: "Score",           val: `${pct}%`,            color: passed ? "text-success" : "text-destructive" },
                    { label: "Correct answers", val: `${correct} / ${total}`, color: passed ? "text-success" : "text-destructive" },
                    { label: "Pass mark",       val: "80%",                color: "text-muted-foreground" },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between py-2.5">
                      <span className="text-sm text-muted-foreground">{row.label}</span>
                      <span className={`text-sm font-medium ${row.color}`}>{row.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`rounded-xl border p-5 ${passed ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5"}`}>
                <p className={`text-sm font-medium ${passed ? "text-success" : "text-destructive"}`}>
                  {passed
                    ? "✓ Assignment marked as PASSED. Your compliance record has been updated."
                    : "✗ Assignment marked as FAILED. Please retake the assessment."}
                </p>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}

import { Suspense } from "react"

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    }>
      <ResultContent />
    </Suspense>
  )
}
