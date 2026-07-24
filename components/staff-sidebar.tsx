"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { FileText, History, Bell, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "My SOPs", icon: FileText, badge: null },
  { href: "/history", label: "My History", icon: History, badge: null },
  { href: "/notifications", label: "Notifications", icon: Bell, badge: 2 },
]

export function StaffSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  function logout() {
    localStorage.removeItem("staff_token")
    router.push("/login")
  }

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex size-8 items-center justify-center rounded-md bg-primary/15 text-primary">
          <ShieldCheck className="size-5" aria-hidden="true" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-sidebar-foreground">SOP Portal</p>
          <p className="text-xs text-muted-foreground">Northgate Academy</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-2" aria-label="Main">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
              )}
            >
              <Icon className="size-[18px]" aria-hidden="true" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge ? (
                <span className="flex size-5 items-center justify-center rounded-full bg-destructive text-[11px] font-semibold text-destructive-foreground">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <button
          onClick={logout}
          className="mb-2 flex w-full items-center justify-center rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground transition-colors hover:text-destructive hover:border-destructive/30"
        >
          Logout
        </button>
        <div className="flex items-center gap-3 rounded-md px-2 py-2">
          <div className="flex size-9 items-center justify-center rounded-full bg-success/20 text-sm font-semibold text-success">
            KR
          </div>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-medium text-sidebar-foreground">Kavita Rao</p>
            <p className="truncate text-xs text-muted-foreground">Teaching Staff</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
