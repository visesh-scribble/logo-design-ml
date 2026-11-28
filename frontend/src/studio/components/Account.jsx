// Restaurant owner account: log in / sign up form, the login pop-up, and the account button in the top bar.
// Owners must be logged in to publish their phone menu and to see their kitchen orders.
import { useEffect, useRef, useState } from "react";
import { UserRound, LogIn, LogOut, ChefHat } from "lucide-react";
import { useStudio } from "../store.js";
import { getMe, login, signup, logout } from "../../shared/auth.js";

// ---- "make sure someone is logged in" (opens the pop-up when nobody is) ----
let pending = null;

export async function ensureLoggedIn() {
  const s = useStudio.getState();
  if (s.owner) return s.owner;
  const me = await getMe();
  if (me) { useStudio.setState({ owner: me }); return me; }
  if (pending) pending.reject(new Error("AUTH_CANCELLED"));
  return new Promise((resolve, reject) => {
    pending = { resolve, reject };
    s.openModal("auth");
  });
}

function finishLogin(me) {
  useStudio.setState({ owner: me });
  if (pending) { pending.resolve(me); pending = null; }
}

// ---- the form (used in the pop-up and inside the QR pop-up) ----
export function AuthForm({ onDone, intro }) {
  const [mode, setMode] = useState("signup");      // "signup" | "login"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const emailRef = useRef(null);
  useEffect(() => { emailRef.current?.focus(); }, []);

  const submit = async e => {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      const me = await (mode === "signup" ? signup : login)(email, password);
      onDone(me);
    } catch (ex) {
      setErr(ex.message);
      setBusy(false);
    }
  };

  const field = "w-full bg-[#fbfaf7] border border-[#d6d3cb] text-[#1c1917] rounded-xl px-3 py-2.5 text-[16px] sm:text-sm focus:outline-none focus:border-[#15803d]";
  return (
    <form onSubmit={submit} className="space-y-3" noValidate>
      <p className="text-xs text-[#78716c]">{intro || "Your account keeps your menu and orders private. Only you can change your menu and see its orders."}</p>
      <div className="grid grid-cols-2 gap-1 p-1 bg-[#f5f4ef] rounded-xl" role="tablist">
        {[["signup", "Create account"], ["login", "Log in"]].map(([k, l]) => (
          <button key={k} type="button" role="tab" aria-selected={mode === k} onClick={() => { setMode(k); setErr(""); }}
            className={"py-2 rounded-lg text-xs font-bold " + (mode === k ? "bg-white text-[#1c1917] shadow-sm" : "text-[#78716c]")}>{l}</button>
        ))}
      </div>
      <div>
        <label htmlFor="authEmail" className="block text-xs font-bold text-[#44403c] mb-1">Email</label>
        <input id="authEmail" ref={emailRef} type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} className={field} placeholder="you@restaurant.com" />
      </div>
      <div>
        <label htmlFor="authPassword" className="block text-xs font-bold text-[#44403c] mb-1">Password</label>
        <input id="authPassword" type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} required minLength={8}
          value={password} onChange={e => setPassword(e.target.value)} className={field} placeholder={mode === "signup" ? "At least 8 characters" : ""} />
      </div>
      <p className="text-xs text-[#b91c1c] min-h-[1em]" role="alert">{err}</p>
      <button type="submit" disabled={busy} className="w-full py-3 bg-[#15803d] hover:bg-[#166534] disabled:opacity-60 text-white font-bold rounded-xl text-sm">
        {busy ? "Please wait…" : mode === "signup" ? "Create account" : "Log in"}
      </button>
    </form>
  );
}

// ---- the pop-up ----
export function AuthModal() {
  const close = useStudio(s => s.closeModal);
  // Closing without logging in cancels whatever was waiting for the login
  useEffect(() => () => { if (pending) { pending.reject(new Error("AUTH_CANCELLED")); pending = null; } }, []);
  useEffect(() => {
    const onKey = e => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [close]);
  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="authTitle"
      onClick={e => { if (e.target === e.currentTarget) close(); }}>
      <div className="bg-white border border-[#e7e5e0] max-w-sm w-full rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#f0eee6] pb-3">
          <div className="flex items-center space-x-2"><UserRound className="w-5 h-5 text-[#b45309]" /><h3 id="authTitle" className="font-serif text-lg font-bold text-[#1c1917]">Your restaurant account</h3></div>
          <button onClick={close} className="text-[#78716c] hover:text-[#1c1917] p-1 rounded-lg text-xl leading-none" aria-label="Close">×</button>
        </div>
        <AuthForm onDone={me => { finishLogin(me); close(); }} />
      </div>
    </div>
  );
}

// ---- top bar button ----
export function AccountButton() {
  const owner = useStudio(s => s.owner);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => { getMe().then(me => { if (me) useStudio.setState({ owner: me }); }); }, []);
  useEffect(() => {
    if (!open) return;
    const onDoc = e => { if (!ref.current?.contains(e.target)) setOpen(false); };
    const onKey = e => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
  }, [open]);

  if (!owner) {
    return (
      <button type="button" className="login-btn" onClick={() => ensureLoggedIn().catch(() => {})}>
        <LogIn aria-hidden="true" /><span>Log in</span>
      </button>
    );
  }
  const doLogout = async () => {
    setOpen(false);
    try { await logout(); } catch { /* already logged out */ }
    useStudio.setState({ owner: null });
  };
  return (
    <div className="acct" ref={ref}>
      <button type="button" className="theme-toggle acct-btn is-in" onClick={() => setOpen(o => !o)} aria-haspopup="menu" aria-expanded={open}
        aria-label={"Account: " + owner.email} title={owner.email}>
        <UserRound aria-hidden="true" />
      </button>
      {open && (
        <div className="acct-menu" role="menu">
          <div className="acct-email">{owner.email}</div>
          {owner.restaurants?.length > 0 && <div className="acct-sub">{owner.restaurants.map(r => r.name).join(", ")}</div>}
          <a role="menuitem" href="/orders.html" target="_blank" rel="noopener"><ChefHat aria-hidden="true" />Kitchen orders</a>
          <button role="menuitem" type="button" onClick={doLogout}><LogOut aria-hidden="true" />Log out</button>
        </div>
      )}
    </div>
  );
}
