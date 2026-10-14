"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { StaffSidebar } from "@/components/staff-sidebar"
import Link from "next/link"
import { useEffect, useState, Suspense } from "react"
import { apiFetch, getToken } from "@/lib/api"
import { CheckCircle2, XCircle, Lightbulb, ArrowLeft } from "lucide-react"

interface Option {
  id: string
  text: string
}

interface EnrichedAnswer {
  questionText: string
  selectedOptionId: string
  isCorrect: boolean
  correctOptionId?: string
  explanation: string | null
  options: Option[]
}

interface AttemptDetails {
  attemptId: string
  attemptNumber: number
  sopTitle: string
  score: number | string
  passed: boolean
  submittedAt: string
  answers: EnrichedAnswer[]
}

function ResultContent() {
  const params    = useSearchParams()
  const router    = useRouter()
  const attemptId = params.get("attemptId")
  const score     = Number(params.get("score")   ?? 0)
  const passed    = params.get("passed") === "true"
  const correct   = Number(params.get("correct") ?? 0)
  const total     = Number(params.get("total")   ?? 5)
  const pct       = Math.round(score)

  const [userName, setUserName]             = useState("Staff")
  const [details, setDetails]               = useState<AttemptDetails | null>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)

  useEffect(() => {
    if (!getToken()) {
      router.push("/login")
      return
    }

    // Get staff name
    apiFetch("/api/v1/auth/me")
      .then(d => {
        if (d?.fullName) {
          const first = d.fullName.split(" ")[0]
          setUserName(first)
        }
      })
      .catch(() => {})

    // If attemptId is in URL, fetch full question snapshot with explanations
    if (attemptId) {
      setLoadingDetails(true)
      apiFetch(`/api/v1/assessments/attempts/${attemptId}`)
        .then(data => setDetails(data))
        .catch(console.error)
        .finally(() => setLoadingDetails(false))
    }
  }, [attemptId, router])

  return (
    <div className="flex min-h-screen bg-background pt-14 md:pt-0">
      <StaffSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-background px-6 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex size-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Assessment Result</h1>
              {details?.sopTitle && (
                <p className="text-xs text-muted-foreground">{details.sopTitle}</p>
              )}
            </div>
          </div>
          <Link
            href="/history"
            className="rounded-lg bg-secondary px-3.5 py-1.5 text-xs font-medium text-secondary-foreground hover:bg-secondary/80"
          >
            My History →
          </Link>
        </header>

        <main className="flex-1 space-y-6 p-6">
          {/* Top Score Banner */}
          <div className="flex flex-col gap-6 md:flex-row">
            {/* Left — score circle */}
            <div className="flex w-full md:w-64 shrink-0 flex-col items-center rounded-xl border border-border bg-card p-6">
              <div className={`flex size-40 items-center justify-center rounded-full border-4 ${
                passed ? "border-success bg-success/10" : "border-destructive bg-destructive/10"
              }`}>
                <div className="text-center">
                  <p className={`text-4xl font-bold tracking-tight ${passed ? "text-success" : "text-destructive"}`}>
                    {pct}%
                  </p>
                  <p className={`mt-0.5 text-xs font-semibold uppercase tracking-wider ${passed ? "text-success" : "text-destructive"}`}>
                    {passed ? "Passed" : "Failed"}
                  </p>
                </div>
              </div>

              <h2 className="mt-4 text-center text-base font-semibold text-foreground">
                {passed ? `Well done, ${userName}!` : `Keep trying, ${userName}`}
              </h2>
              <p className="mt-1 text-center text-xs text-muted-foreground">
                {passed
                  ? `You passed with ${pct}%. Your compliance status is updated.`
                  : `You scored ${pct}%. Pass mark is 80%. Retakes are available.`}
              </p>

              <div className="mt-5 flex w-full flex-col gap-2">
                <Link
                  href="/"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-center text-xs font-medium text-foreground hover:bg-muted transition-colors"
                >
                  ← Back to My SOPs
                </Link>
                <Link
                  href="/history"
                  className="w-full rounded-lg bg-primary px-4 py-2 text-center text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  View All Attempts
                </Link>
              </div>
            </div>

            {/* Right — breakdown cards */}
            <div className="flex-1 space-y-4">
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="mb-3 text-sm font-semibold text-foreground">Result Summary</h3>
                <div className="divide-y divide-border">
                  {[
                    { label: "Your Score", val: `${pct}%`, color: passed ? "text-success font-semibold" : "text-destructive font-semibold" },
                    { label: "Correct Answers", val: `${correct} of ${total}`, color: "text-foreground font-medium" },
                    { label: "Passing Mark", val: "80%", color: "text-muted-foreground" },
                    { label: "Attempt Number", val: `#${params.get("attempt") ?? 1}`, color: "text-muted-foreground" },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between py-2 text-xs">
                      <span className="text-muted-foreground">{row.label}</span>
                      <span className={row.color}>{row.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`rounded-xl border p-4 ${passed ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5"}`}>
                <div className="flex items-start gap-2.5">
                  {passed ? (
                    <CheckCircle2 className="size-4 shrink-0 text-success mt-0.5" />
                  ) : (
                    <XCircle className="size-4 shrink-0 text-destructive mt-0.5" />
                  )}
                  <p className={`text-xs leading-relaxed ${passed ? "text-success" : "text-destructive"}`}>
                    {passed
                      ? "Assignment marked as PASSED. Your digital signature and score have been permanently verified in the compliance audit log."
                      : "Assessment did not reach the 80% passing threshold. Please review the wrong answers and explanations below, re-read the SOP if needed, and try again."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Question Review & Explanations */}
          {details?.answers && details.answers.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-foreground">Detailed Question Review</h2>
                  <p className="text-xs text-muted-foreground">
                    Review your answers along with the explanations from the SOP document
                  </p>
                </div>
                <span className="rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground font-medium">
                  {details.answers.length} Questions
                </span>
              </div>

              <div className="space-y-4">
                {details.answers.map((ans, idx) => {
                  return (
                    <div
                      key={idx}
                      className={`rounded-xl border p-5 bg-card transition-all ${
                        ans.isCorrect
                          ? "border-success/30"
                          : "border-destructive/30"
                      }`}
                    >
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-foreground">
                            {idx + 1}
                          </span>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                            ans.isCorrect
                              ? "bg-success/15 text-success"
                              : "bg-destructive/15 text-destructive"
                          }`}>
                            {ans.isCorrect ? <CheckCircle2 className="size-3" /> : <XCircle className="size-3" />}
                            {ans.isCorrect ? "Correct" : "Incorrect"}
                          </span>
                        </div>
                      </div>

                      <p className="mb-4 text-sm font-medium leading-relaxed text-foreground">
                        {ans.questionText}
                      </p>

                      {/* Options */}
                      <div className="space-y-2 mb-4">
                        {ans.options?.map((opt, optIdx) => {
                          const isSelected = opt.id === ans.selectedOptionId
                          const isTheCorrectOption = ans.correctOptionId ? opt.id === ans.correctOptionId : (ans.isCorrect && isSelected)

                          let optStyle = "border-border bg-background text-muted-foreground"
                          if (isSelected && ans.isCorrect) {
                            optStyle = "border-success bg-success/10 text-success font-medium"
                          } else if (isSelected && !ans.isCorrect) {
                            optStyle = "border-destructive bg-destructive/10 text-destructive font-medium"
                          } else if (isTheCorrectOption && !ans.isCorrect) {
                            optStyle = "border-success/60 bg-success/5 text-success font-medium"
                          }

                          return (
                            <div
                              key={opt.id}
                              className={`flex items-center justify-between rounded-lg border px-3.5 py-2.5 text-xs transition-colors ${optStyle}`}
                            >
                              <div className="flex items-center gap-2.5">
                                <span className={`flex size-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${
                                  isSelected || isTheCorrectOption ? "border-current" : "border-muted-foreground"
                                }`}>
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                                <span>{opt.text}</span>
                              </div>
                              <span className="text-[11px] font-semibold">
                                {isSelected && ans.isCorrect && "✓ Your Answer (Correct)"}
                                {isSelected && !ans.isCorrect && "✗ Your Answer"}
                                {!isSelected && isTheCorrectOption && "✓ Correct Answer"}
                              </span>
                            </div>
                          )
                        })}
                      </div>

                      {/* Explanation box */}
                      {ans.explanation && (
                        <div className="flex items-start gap-2.5 rounded-lg border border-primary/20 bg-primary/5 p-3.5 text-xs leading-relaxed text-foreground">
                          <Lightbulb className="size-4 shrink-0 text-primary mt-0.5" />
                          <div>
                            <span className="font-semibold text-primary block mb-0.5">SOP Explanation:</span>
                            <span className="text-muted-foreground">{ans.explanation}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Loading result...</p>
      </div>
    }>
      <ResultContent />
    </Suspense>
  )
}
