"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { StaffSidebar } from "@/components/staff-sidebar"
import { apiFetch, getToken } from "@/lib/api"

interface Option { id: string; text: string }
interface Question { id: string; text: string; difficulty: string; options: Option[] }

export default function QuizPage() {
  const params       = useSearchParams()
  const router       = useRouter()
  const assignmentId = params.get("assignmentId")

  const [attemptId, setAttemptId]   = useState<string | null>(null)
  const [questions, setQuestions]   = useState<Question[]>([])
  const [current, setCurrent]       = useState(0)
  const [selected, setSelected]     = useState<string | null>(null)
  const [answers, setAnswers]       = useState<{questionId: string; selectedOptionId: string}[]>([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [timeLeft, setTimeLeft]     = useState(15 * 60) // 15 minutes in seconds

  useEffect(() => {
    if (loading || submitting) return
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          // Auto submit when time runs out
          handleNext()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [loading, submitting])

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0")
    const s = (seconds % 60).toString().padStart(2, "0")
    return `${m}:${s}`
  }

  useEffect(() => {
    if (!getToken()) { router.push("/login"); return }
    if (!assignmentId) { router.push("/"); return }

    apiFetch(`/api/v1/assessments/${assignmentId}/attempts`, { method: "POST" })
      .then(data => {
        setAttemptId(data.attemptId)
        setQuestions(data.questions ?? [])
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [assignmentId])

  async function handleNext() {
    if (!selected || !questions[current]) return

    const newAnswers = [...answers, {
      questionId:       questions[current].id,
      selectedOptionId: selected,
    }]
    setAnswers(newAnswers)
    setSelected(null)

    if (current + 1 >= questions.length) {
      // Submit
      setSubmitting(true)
      try {
        const result = await apiFetch(`/api/v1/assessments/attempts/${attemptId}/submit`, {
          method: "POST",
          body: JSON.stringify({ answers: newAnswers }),
        })
        router.push(`/result?score=${result.score}&passed=${result.passed}&correct=${result.correctCount}&total=${result.totalQuestions}&attempt=${result.attemptNumber}`)
      } catch (err: any) {
        setError(err.message)
        setSubmitting(false)
      }
    } else {
      setCurrent(current + 1)
    }
  }

  const q        = questions[current]
  const progress = questions.length > 0 ? ((current + 1) / questions.length) * 100 : 0

  if (loading) return (
    <div className="flex min-h-screen bg-background">
      <StaffSidebar />
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading assessment...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="flex min-h-screen bg-background">
      <StaffSidebar />
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-destructive mb-4">{error}</p>
          <button onClick={() => router.push("/")} className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
            Back to My SOPs
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-background">
      <StaffSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-background px-6 py-4">
          <h1 className="text-lg font-semibold text-foreground">Assessment</h1>
          <div className={`rounded-lg border px-3 py-1.5 ${
            timeLeft < 60
              ? "border-destructive/50 bg-destructive/10"
              : "border-yellow-900/50 bg-yellow-500/10"
          }`}>
            <span className={`text-sm font-semibold ${timeLeft < 60 ? "text-destructive" : "text-yellow-400"}`}>
              ⏱ {formatTime(timeLeft)}
            </span>
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="mb-6">
            <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
              <span>Question {current + 1} of {questions.length}</span>
              <span className="font-semibold text-yellow-400">{q?.difficulty}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <p className="mb-5 text-base font-semibold leading-relaxed text-foreground">{q?.text}</p>

            <div className="space-y-2.5">
              {q?.options.map((opt, i) => (
                <button
                  key={opt.id}
                  onClick={() => setSelected(opt.id)}
                  className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                    selected === opt.id
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-background text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                  }`}
                >
                  <span className={`flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                    selected === opt.id ? "border-primary text-primary" : "border-muted-foreground text-muted-foreground"
                  }`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt.text}
                </button>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Select an answer to continue</p>
              <button
                onClick={handleNext}
                disabled={!selected || submitting}
                className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {submitting ? "Submitting..." : current + 1 === questions.length ? "Submit →" : "Next question →"}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
