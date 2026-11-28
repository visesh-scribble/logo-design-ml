// Kitchen Orders screen: the logged-in owner's orders from the phone menu.
// Three views share one login and one 3-second poll: Today (live), Archived (older days), Reports (money).
// Not logged in -> a login / sign-up card instead of the orders.
import { useCallback, useEffect, useRef, useState } from "react";
import { getMe, login, signup, logout } from "../shared/auth.js";
import TodayView from "./TodayView.jsx";
import ArchivedView from "./ArchivedView.jsx";
import ReportsView from "./ReportsView.jsx";

const VIEWS = [["today", "Today's orders"], ["archived", "Archived"], ["reports", "Financial report"]];
const viewFromHash = () => { const h = location.hash.slice(1); return VIEWS.some(([k]) => k === h) ? h : "today"; };

function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator(); o.frequency.value = 880; o.connect(ctx.destination);
    o.start(); o.stop(ctx.currentTime + 0.25);
  } catch (e) { /* no audio */ }
}

function LoginCard({ onDone }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async e => {
    e.preventDefault();
    setBusy(true); setErr("");
    try { onDone(await (mode === "login" ? login : signup)(email, password)); }
    catch (ex) { setErr(ex.message); setBusy(false); }
  };

  return (
    <form className="auth" onSubmit={submit} noValidate>
      <h2>{mode === "login" ? "Log in to see your orders" : "Create your account"}</h2>
      <p className="auth-sub">Only you can see your restaurant's orders.</p>
      <label htmlFor="kEmail">Email</label>
      <input id="kEmail" type="email" autoComplete="email" autoFocus value={email} onChange={e => setEmail(e.target.value)} placeholder="you@restaurant.com" />
      <label htmlFor="kPass">Password</label>
      <input id="kPass" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={e => setPassword(e.target.value)}
        placeholder={mode === "signup" ? "At least 8 characters" : ""} />
      <p className="auth-err" role="alert">{err}</p>
      <button type="submit" className="auth-go" disabled={busy}>{busy ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}</button>
      <button type="button" className="auth-switch" onClick={() => { setMode(m => m === "login" ? "signup" : "login"); setErr(""); }}>
        {mode === "login" ? "New here? Create an account" : "Already have an account? Log in"}
      </button>
    </form>
  );
}

export default function Orders() {
  const [me, setMe] = useState(undefined);       // undefined = checking, null = logged out
  const [orders, setOrders] = useState(null);
  const [view, setView] = useState(viewFromHash);
  const seen = useRef(null);

  useEffect(() => { getMe().then(setMe); }, []);

  useEffect(() => {
    const onHash = () => setView(viewFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const load = useCallback(() => {
    fetch("/api/orders", { credentials: "same-origin" }).then(r => {
      if (r.status === 401) { setMe(null); return null; }
      return r.json();
    }).then(res => {
      if (!res) return;
      const list = res.orders || [];
      if (seen.current && list.some(o => !seen.current.has(o.id))) beep();
      seen.current = new Set(list.map(o => o.id));
      setOrders(list);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!me) return;
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, [me, load]);

  // Rejects with the server's message so the cancel dialog can show it
  const setStatus = async (id, status, reason) => {
    const r = await fetch(`/api/orders/${id}/status`, {
      method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reason === undefined ? { status } : { status, reason }),
    });
    const res = await r.json().catch(() => ({}));
    load();
    if (!r.ok || !res.success) throw new Error(res.error || "Could not update the order.");
  };

  const doLogout = async () => {
    try { await logout(); } catch { /* already out */ }
    seen.current = null; setOrders(null); setMe(null);
  };

  const go = k => { location.hash = k; setView(k); };

  const all = orders || [];
  const restaurants = me?.restaurants || [];
  const names = restaurants.map(r => r.name).join(", ");
  const showSlug = restaurants.length > 1;
  const emptyHint = orders === null ? "Loading…"
    : !restaurants.length ? "You haven't published a phone menu yet. Open the studio, design your menu and publish it with \"Use our phone menu link\"."
    : "";

  return (
    <>
      <header>
        <div>
          <h1>🍽️ Kitchen Orders</h1>
          {me && <div className="who">{names || "No menu published yet"}</div>}
        </div>
        {me && (
          <div className="head-right">
            <span className="live"><i /> Live · updates every 3 seconds</span>
            <button type="button" className="logout" onClick={doLogout} title={me.email}>Log out</button>
          </div>
        )}
      </header>

      {me === undefined ? <p className="empty">Loading…</p>
        : me === null ? <LoginCard onDone={setMe} />
        : <>
          <nav className="views" aria-label="Orders sections">
            {VIEWS.map(([k, l]) => (
              <button key={k} className={view === k ? "on" : ""} aria-current={view === k ? "page" : undefined} onClick={() => go(k)}>{l}</button>
            ))}
          </nav>
          {view === "today" && <TodayView orders={all} showSlug={showSlug} onStatus={setStatus} emptyHint={emptyHint} />}
          {view === "archived" && <ArchivedView orders={all} showSlug={showSlug} emptyHint={emptyHint} />}
          {view === "reports" && (emptyHint ? <p className="empty">{emptyHint}</p> : <ReportsView orders={all} restaurants={restaurants} />)}
        </>}
    </>
  );
}
