"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { StaffSidebar } from "@/components/staff-sidebar"
import { apiFetch, getToken } from "@/lib/api"
import Link from "next/link"

interface Assignment {
  id: string
  status: string
  dueDate: string
  createdAt: string
  sop: { title: string; category: string }
}

export default function NotificationsPage() {
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

  // Generate notifications from assignments
  const notifications = assignments.map(a => {
    if (a.status === "OVERDUE" || (a.dueDate && new Date(a.dueDate) < new Date() && !["PASSED","STALE"].includes(a.status))) {
      return {
        id: a.id,
        unread: true,
        borderColor: "border-l-destructive",
        dot: "bg-destructive",
        title: `${a.sop.title} is overdue`,
        sub: `Was due ${new Date(a.dueDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })} · Please complete immediately`,
        time: "Overdue",
        btnLabel: "Start Now",
        btnStyle: "bg-destructive/10 text-destructive hover:bg-destructive/20",
        href: `/read?assignmentId=${a.id}`,
      }
    }
    if (a.status === "FAILED") {
      return {
        id: a.id,
        unread: true,
        borderColor: "border-l-yellow-500",
        dot: "bg-yellow-500",
        title: `Retake available: ${a.sop.title}`,
        sub: `You failed this assessment. You have retakes remaining.`,
        time: new Date(a.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
        btnLabel: "Retake",
        btnStyle: "bg-primary/10 text-primary hover:bg-primary/20",
        href: `/read?assignmentId=${a.id}`,
      }
    }
    if (a.status === "NOT_STARTED" || a.status === "STALE") {
      return {
        id: a.id,
        unread: false,
        borderColor: "border-l-transparent",
        dot: "bg-primary",
        title: `New SOP assigned: ${a.sop.title}`,
        sub: `${a.sop.category} · Due ${new Date(a.dueDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}`,
        time: new Date(a.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
        btnLabel: "View SOP",
        btnStyle: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        href: `/read?assignmentId=${a.id}`,
      }
    }
    if (a.status === "PASSED") {
      return {
        id: a.id,
        unread: false,
        borderColor: "border-l-transparent",
        dot: "bg-success",
        title: `You passed: ${a.sop.title}`,
        sub: `Assessment completed successfully`,
        time: new Date(a.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
        btnLabel: "View Result",
        btnStyle: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        href: `/history`,
      }
    }
    return null
  }).filter(Boolean) as any[]

  const unreadCount = notifications.filter(n => n.unread).length

  return (
    <div className="flex min-h-screen bg-background pt-14 md:pt-0">
      <StaffSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-background px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Notifications</h1>
            <p className="text-sm text-muted-foreground">Your alerts and updates</p>
          </div>
          {unreadCount > 0 && (
            <span className="rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
              {unreadCount} unread
            </span>
          )}
        </header>

        <main className="flex-1 p-6">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="text-sm text-muted-foreground">No notifications yet.</div>
          ) : (
            <div className="space-y-3">
              {notifications.map(n => (
                <div
                  key={n.id}
                  className={`flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 border-l-4 ${n.borderColor} ${!n.unread ? "opacity-70" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`mt-1.5 size-2 shrink-0 rounded-full ${n.dot}`} />
                    <div>
                      <p className={`text-sm font-medium ${n.unread ? "text-foreground" : "text-muted-foreground"}`}>
                        {n.title}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{n.sub}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{n.time}</p>
                    </div>
                  </div>
                  <Link
                    href={n.href}
                    className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${n.btnStyle}`}
                  >
                    {n.btnLabel}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
