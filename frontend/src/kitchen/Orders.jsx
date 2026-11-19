// Kitchen Orders screen: lists orders placed from the phone menu and lets staff move them along.
import { useCallback, useEffect, useRef, useState } from "react";

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

export default function Orders() {
  const [orders, setOrders] = useState(null);
  const [filter, setFilter] = useState("active");
  const seen = useRef(null);

  const load = useCallback(() => {
    fetch("/api/orders").then(r => r.json()).then(res => {
      const list = res.orders || [];
      if (seen.current && list.some(o => !seen.current.has(o.id))) beep();
      seen.current = new Set(list.map(o => o.id));
      setOrders(list);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, [load]);

  const setStatus = (id, status) => {
    fetch(`/api/orders/${id}/status`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) })
      .then(load);
  };

  const all = orders || [];
  const shown = all.filter(o => matches(o, filter));

  return (
    <>
      <header>
        <h1>🍽️ Kitchen Orders</h1>
        <span className="live"><i /> Live · updates every 3 seconds</span>
      </header>
      <div className="tabs" id="tabs">
        {TABS.map(([k, l]) => (
          <button key={k} className={filter === k ? "on" : ""} onClick={() => setFilter(k)}>{l} ({all.filter(o => matches(o, k)).length})</button>
        ))}
      </div>
      <div id="list">
        {orders === null ? <p className="empty">Loading…</p>
          : !shown.length ? <p className="empty">No orders here yet. Scan the QR code and place an order from a phone.</p>
          : shown.map(o => (
            <div key={o.id} className={"card" + (o.status === "new" ? " new" : "")}>
              <div className="top"><span className="id">#{o.id}</span><span className="table">Table {o.table}</span></div>
              <div className="meta">{o.time}{o.name ? " · " + o.name : ""}</div>
              <ul>{o.items.map((i, k) => <li key={k}><span><b>{i.qty}×</b>{i.name}</span><span>{money(i.subtotal, o.currency)}</span></li>)}</ul>
              {o.note && <div className="note">📝 {o.note}</div>}
              <div className="total"><span>Total</span><span>{money(o.total, o.currency)}</span></div>
              <div className="btns">
                {STATUSES.map(([k, l]) => <button key={k} className={o.status === k ? "cur" : ""} onClick={() => setStatus(o.id, k)}>{l}</button>)}
              </div>
            </div>
          ))}
      </div>
    </>
  );
}
