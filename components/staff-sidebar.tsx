"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { BookOpen, History, Bell, ShieldCheck, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/",              label: "My SOPs",       icon: BookOpen, badge: null },
  { href: "/history",       label: "My History",    icon: History,  badge: null },
  { href: "/notifications", label: "Notifications", icon: Bell,     badge: 2 },
]

export function StaffSidebar() {
  const pathname = usePathname()
  const router   = useRouter()
  const [open, setOpen] = useState(false)

  function logout() {
    localStorage.removeItem("staff_token")
    router.push("/login")
  }

  const SidebarContent = () => (
    <>
      <div className="flex items-center justify-between px-5 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-md bg-primary/15 text-primary">
            <ShieldCheck className="size-5" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-sidebar-foreground">SOP Portal</p>
            <p className="text-xs text-muted-foreground">Northgate Academy</p>
          </div>
        </div>
        <button onClick={() => setOpen(false)} className="md:hidden text-muted-foreground hover:text-foreground">
          <X className="size-5" />
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive ? "bg-sidebar-accent text-sidebar-foreground" : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
              )}
            >
              <Icon className="size-[18px]" />
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
        <button onClick={logout}
          className="mb-2 flex w-full items-center justify-center rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground hover:text-destructive hover:border-destructive/30">
          Logout
        </button>
        <div className="flex items-center gap-3 rounded-md px-2 py-2">
          <div className="flex size-9 items-center justify-center rounded-full bg-success/20 text-sm font-semibold text-success">KR</div>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-medium text-sidebar-foreground">Kavita Rao</p>
            <p className="truncate text-xs text-muted-foreground">Teaching Staff</p>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-40 flex md:hidden size-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground"
      >
        <Menu className="size-4" />
      </button>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-sidebar-border bg-sidebar transition-transform md:hidden",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
        <SidebarContent />
      </aside>
    </>
  )
}
