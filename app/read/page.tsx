"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { StaffSidebar } from "@/components/staff-sidebar"
import { Lock, CheckCircle } from "lucide-react"
import Link from "next/link"
import { apiFetch, getToken } from "@/lib/api"

function ReadContent() {
  const params       = useSearchParams()
  const router       = useRouter()
  const assignmentId = params.get("assignmentId")

  const [sopText, setSopText]       = useState<string | null>(null)
  const [sopTitle, setSopTitle]     = useState("SOP Document")
  const [unlocked, setUnlocked]     = useState(false)
  const [loading, setLoading]       = useState(true)
  const [marking, setMarking]       = useState(false)

  useEffect(() => {
    if (!getToken()) { router.push("/login"); return }
    if (!assignmentId) { router.push("/"); return }

    // Start learning
    apiFetch(`/api/v1/learning/${assignmentId}/start`, { method: "POST" })
      .catch(console.error)

    // Get assignment details for title
    apiFetch("/api/v1/assignments/me")
      .then(data => {
        const assignment = data.assignments?.find((a: any) => a.id === assignmentId)
        if (assignment) setSopTitle(assignment.sop.title)
      })
      .catch(console.error)

    // Get learning status
    apiFetch(`/api/v1/learning/${assignmentId}/status`)
      .then(data => {
        setUnlocked(data.assessment?.unlocked ?? false)
        setSopText(data.extractedText ?? null)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [assignmentId])

  async function markAsRead() {
    if (!assignmentId) return
    setMarking(true)
    try {
      await apiFetch(`/api/v1/learning/${assignmentId}/complete`, { method: "POST" })
      setUnlocked(true)
    } catch (err) {
      console.error(err)
    } finally {
      setMarking(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <StaffSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-background px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold text-foreground">{sopTitle}</h1>
            <p className="text-sm text-muted-foreground">Read the full document before taking the assessment</p>
          </div>
        </header>

        <main className="flex-1 p-6">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading document...</div>
          ) : (
            <div className="flex gap-6">
              {/* Document */}
              <div className="flex-1">
                <div className="rounded-xl border border-border bg-card p-6 min-h-96">
                  <h2 className="mb-4 text-base font-semibold text-foreground">{sopTitle}</h2>
                  {sopText ? (
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{sopText}</p>
                  ) : (
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <p>This SOP document contains the standard operating procedures that all staff must follow.</p>
                      <p>Please read through all sections carefully before proceeding to the assessment.</p>
                      <p>The assessment will test your understanding of the key procedures outlined in this document.</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex gap-3">
                  <Link href="/" className="rounded-lg border border-border bg-card px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
                    ← Back
                  </Link>
                  {!unlocked ? (
                    <button
                      onClick={markAsRead}
                      disabled={marking}
                      className="flex-1 rounded-lg bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                    >
                      {marking ? "Unlocking..." : "I've read this SOP — unlock assessment"}
                    </button>
                  ) : (
                    <Link
                      href={`/quiz?assignmentId=${assignmentId}`}
                      className="flex-1 rounded-lg bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                      Start assessment →
                    </Link>
                  )}
                </div>
              </div>

              {/* Right panel */}
              <div className="w-48 shrink-0 space-y-3">
                <div className="rounded-xl border border-border bg-card p-4">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">Assessment</p>
                  {unlocked ? (
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="size-3 text-success" />
                      <p className="text-xs text-success">Unlocked</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <Lock className="size-3 text-yellow-500" />
                      <p className="text-xs text-yellow-500">Finish reading first</p>
                    </div>
                  )}
                </div>

                {unlocked && (
                  <Link
                    href={`/quiz?assignmentId=${assignmentId}`}
                    className="block w-full rounded-lg bg-primary px-3 py-2 text-center text-xs font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    Start assessment
                  </Link>
                )}
                <p className="text-center text-xs text-muted-foreground">5 questions · 15 min</p>
              </div>
            </div>
          )}
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
      <ReadContent />
    </Suspense>
  )
}
