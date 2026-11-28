// Kitchen Orders screen: the logged-in owner's orders from the phone menu; staff move them along.
// Not logged in -> a login / sign-up card instead of the orders.
import { useCallback, useEffect, useRef, useState } from "react";
import { getMe, login, signup, logout } from "../shared/auth.js";

const STATUSES = [["new", "New"], ["preparing", "Preparing"], ["ready", "Ready"], ["done", "Served"]];
const TABS = [["active", "Active"], ...STATUSES, ["all", "All"]];

function money(n, cur) {
  const v = Number.isInteger(n) ? String(n) : n.toFixed(2);
  return cur === "/-" ? `${v}/-` : `${cur || ""}${v}`;
}

function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator(); o.frequency.value = 880; o.connect(ctx.destination);
    o.start(); o.stop(ctx.currentTime + 0.25);
  } catch (e) { /* no audio */ }
}

const matches = (o, f) => f === "active" ? o.status !== "done" : f === "all" || o.status === f;

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
  const [filter, setFilter] = useState("active");
  const seen = useRef(null);

  useEffect(() => { getMe().then(setMe); }, []);

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

  const setStatus = (id, status) => {
    fetch(`/api/orders/${id}/status`, { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) })
      .then(load);
  };

  const doLogout = async () => {
    try { await logout(); } catch { /* already out */ }
    seen.current = null; setOrders(null); setMe(null);
  };

  const all = orders || [];
  const shown = all.filter(o => matches(o, filter));
  const names = (me?.restaurants || []).map(r => r.name).join(", ");

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
          <div className="tabs" id="tabs">
            {TABS.map(([k, l]) => (
              <button key={k} className={filter === k ? "on" : ""} onClick={() => setFilter(k)}>{l} ({all.filter(o => matches(o, k)).length})</button>
            ))}
          </div>
          <div id="list">
            {orders === null ? <p className="empty">Loading…</p>
              : !me.restaurants?.length ? <p className="empty">You haven't published a phone menu yet. Open the studio, design your menu and publish it with "Use our phone menu link".</p>
              : !shown.length ? <p className="empty">No orders here yet. Scan your QR code and place an order from a phone.</p>
              : shown.map(o => (
                <div key={o.id} className={"card" + (o.status === "new" ? " new" : "")}>
                  <div className="top"><span className="id">#{o.id}</span><span className="table">Table {o.table}</span></div>
                  <div className="meta">{o.time}{o.name ? " · " + o.name : ""}{me.restaurants.length > 1 ? " · " + o.slug : ""}</div>
                  <ul>{o.items.map((i, k) => <li key={k}><span><b>{i.qty}×</b>{i.name}</span><span>{money(i.subtotal, o.currency)}</span></li>)}</ul>
                  {o.note && <div className="note">📝 {o.note}</div>}
                  <div className="total"><span>Total</span><span>{money(o.total, o.currency)}</span></div>
                  <div className="btns">
                    {STATUSES.map(([k, l]) => <button key={k} className={o.status === k ? "cur" : ""} onClick={() => setStatus(o.id, k)}>{l}</button>)}
                  </div>
                </div>
              ))}
          </div>
        </>}
    </>
  );
}
