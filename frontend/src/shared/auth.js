// Restaurant owner login: small wrappers around /api/auth/*. The session lives in an HttpOnly cookie.

async function post(path, body) {
  const r = await fetch(path, { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body || {}) });
  const res = await r.json().catch(() => ({}));
  if (!r.ok || !res.success) throw new Error(res.error || "Something went wrong. Please try again.");
  return res;
}

// { email, restaurants: [{ slug, name, url }] } when logged in, else null
export async function getMe() {
  try {
    const r = await fetch("/api/auth/me", { credentials: "same-origin" });
    if (!r.ok) return null;
    const res = await r.json();
    return res.success ? res : null;
  } catch {
    return null;
  }
}

export const login = (email, password) => post("/api/auth/login", { email, password });
export const signup = (email, password) => post("/api/auth/signup", { email, password });
export const logout = () => post("/api/auth/logout");
