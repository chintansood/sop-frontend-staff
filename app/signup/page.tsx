"use client"

import { useState } from "react"
import Link from "next/link"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

export default function SignupPage() {
  const [schoolName, setSchoolName] = useState("")
  const [fullName, setFullName]     = useState("")
  const [email, setEmail]           = useState("")
  const [password, setPassword]     = useState("")
  const [role, setRole]             = useState("TEACHING_STAFF")
  const [loading, setLoading]       = useState(false)
  const [success, setSuccess]       = useState(false)
  const [error, setError]           = useState("")

  async function handleSignup() {
    if (!schoolName || !fullName || !email || !password) {
      setError("All fields are required")
      return
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`${BASE_URL}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "omit",
        body: JSON.stringify({ fullName, email, password, role, schoolName }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Registration failed")
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || "Signup failed")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 text-center">
          <div className="mb-4 mx-auto flex size-16 items-center justify-center rounded-full bg-success/10">
            <span className="text-3xl">✓</span>
          </div>
          <h1 className="mb-2 text-xl font-semibold text-foreground">Request submitted!</h1>
          <p className="mb-2 text-sm text-muted-foreground">
            Your account request for <strong>{schoolName}</strong> has been submitted.
          </p>
          <p className="mb-6 text-sm text-muted-foreground">
            Your school admin will approve your account. You will be able to login once approved.
          </p>
          <Link href="/login" className="block w-full rounded-lg bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Back to login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-foreground">Create staff account</h1>
          <p className="mt-1 text-sm text-muted-foreground">Join your school's SOP system</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
        )}

        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">School / Organisation name</label>
            <input type="text" value={schoolName} onChange={e => setSchoolName(e.target.value)}
              placeholder="Greenfield Academy"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            <p className="mt-1 text-xs text-muted-foreground">Must match your school's registered name exactly</p>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Full name</label>
            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
              placeholder="Kavita Rao"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="kavita@school.com"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Role</label>
            <select value={role} onChange={e => setRole(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="TEACHING_STAFF">Teaching Staff</option>
              <option value="NON_TEACHING_STAFF">Non-Teaching Staff</option>
              <option value="DEPT_HEAD">Department Head</option>
            </select>
          </div>
          <button onClick={handleSignup} disabled={loading}
            className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
            {loading ? "Submitting..." : "Request access →"}
          </button>
        </div>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">Login</Link>
        </p>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Are you an admin?{" "}
          <a href="https://sop-frontend-three.vercel.app/signup" className="text-primary hover:underline">
            Set up your school →
          </a>
        </p>
      </div>
    </div>
  )
}
