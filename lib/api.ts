const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

export async function apiFetch(path: string, options?: RequestInit) {
  const token = typeof window !== "undefined"
    ? localStorage.getItem("staff_token")
    : null

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: "omit",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("staff_token")
      window.location.href = "/login"
    }
    throw new Error("Session expired. Please login again.")
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Request failed" }))
    throw new Error(error.error || "Request failed")
  }

  return res.json()
}

export function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("staff_token") : null
}

export function setToken(token: string) {
  localStorage.setItem("staff_token", token)
}

export function removeToken() {
  localStorage.removeItem("staff_token")
}
