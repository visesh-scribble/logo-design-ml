// Orders from before today, grouped by day. Read-only.
import { useState } from "react";
import OrderCard from "./OrderCard.jsx";
import { STATUSES, isToday, inRange, orderDay, prettyDay, summarize, money, mainCurrency } from "./orderUtils.js";

export default function ArchivedView({ orders, showSlug, emptyHint }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");

  const needle = q.trim().toLowerCase();
  // Newest first; orders saved before dates existed go last
  const past = orders.filter(o => !isToday(o))
    .sort((a, b) => (b.created_at || "").localeCompare(a.created_at || "") || b.id - a.id);
  const shown = past.filter(o =>
    inRange(o, from, to) &&
    (status === "all" || o.status === status) &&
    (!needle || String(o.id) === needle.replace(/^#/, "") || (o.name || "").toLowerCase().includes(needle) || String(o.table).toLowerCase() === needle));

  const groups = [];
  shown.forEach(o => {
    const day = orderDay(o);
    if (!groups.length || groups[groups.length - 1].day !== day) groups.push({ day, orders: [] });
    groups[groups.length - 1].orders.push(o);
  });

  return (
    <>
      <div className="filters">
        <label>From <input type="date" value={from} onChange={e => setFrom(e.target.value)} /></label>
        <label>To <input type="date" value={to} onChange={e => setTo(e.target.value)} /></label>
        <label>Status
          <select value={status} onChange={e => setStatus(e.target.value)}>
            <option value="all">All</option>
            {STATUSES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            <option value="cancelled">Cancelled</option>
          </select>
        </label>
        <label className="grow">Search <input type="search" value={q} onChange={e => setQ(e.target.value)} placeholder="Order #, table or customer name" /></label>
        {(from || to || status !== "all" || q) && <button className="ghost" onClick={() => { setFrom(""); setTo(""); setStatus("all"); setQ(""); }}>Clear</button>}
      </div>
      {emptyHint ? <p className="empty">{emptyHint}</p>
        : !groups.length ? <p className="empty">{past.length ? "No archived orders match these filters." : "No archived orders yet. Orders move here the day after they are placed."}</p>
        : groups.map(g => {
          const s = summarize(g.orders);
          return (
            <section key={g.day} className="day">
              <h2 className="day-head">
                <span>{prettyDay(g.day)}</span>
                <span className="day-sum">{g.orders.length} order{g.orders.length === 1 ? "" : "s"} · {money(s.revenue, mainCurrency(g.orders))}{s.cancelled ? ` · ${s.cancelled} cancelled` : ""}</span>
              </h2>
              <div className="grid">
                {g.orders.map(o => <OrderCard key={o.id} order={o} showSlug={showSlug} readOnly />)}
              </div>
            </section>
          );
        })}
    </>
  );
}
