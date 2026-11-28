// Financial report for a date range: revenue, orders, cancellations, best sellers, busy hours. Exports CSV / Excel.
import { useMemo, useState } from "react";
import { saveBlobAs } from "../shared/files.js";
import { STATUS_LABEL, money, todayKey, daysAgoKey, dateKey, inRange, summarize, prettyDay, mainCurrency, orderDay } from "./orderUtils.js";

const PRESETS = [
  ["today", "Today"], ["yesterday", "Yesterday"], ["7d", "Last 7 days"],
  ["30d", "Last 30 days"], ["month", "This month"], ["all", "All time"], ["custom", "Custom"],
];

function rangeFor(preset) {
  const now = new Date();
  switch (preset) {
    case "today": return [todayKey(), todayKey()];
    case "yesterday": return [daysAgoKey(1), daysAgoKey(1)];
    case "7d": return [daysAgoKey(6), todayKey()];
    case "30d": return [daysAgoKey(29), todayKey()];
    case "month": return [dateKey(new Date(now.getFullYear(), now.getMonth(), 1)), todayKey()];
    default: return ["", ""];
  }
}

const pct = n => `${Math.round(n * 1000) / 10}%`;
const hourLabel = h => `${String(h).padStart(2, "0")}:00`;

function Bar({ value, max }) {
  return <span className="bar"><i style={{ width: max ? `${(value / max) * 100}%` : 0 }} /></span>;
}

function orderRows(orders) {
  return orders.map(o => ({
    "Order #": o.id,
    Date: orderDay(o) || "",
    Time: o.time || "",
    Restaurant: o.slug || "",
    Table: o.table,
    Customer: o.name || "",
    Status: STATUS_LABEL[o.status] || o.status,
    Items: (o.items || []).map(i => `${i.qty}x ${i.name}`).join("; "),
    Total: Number(o.total) || 0,
    Currency: (o.currency || "").trim(),
    "Cancel reason": o.cancel_reason || "",
  }));
}

function toCSV(rows) {
  if (!rows.length) return "";
  const cols = Object.keys(rows[0]);
  const cell = v => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [cols.map(cell).join(","), ...rows.map(r => cols.map(c => cell(r[c])).join(","))].join("\n");
}

export default function ReportsView({ orders, restaurants }) {
  const [preset, setPreset] = useState("7d");
  const [custom, setCustom] = useState([daysAgoKey(6), todayKey()]);
  const [slug, setSlug] = useState("all");

  const [from, to] = preset === "custom" ? custom : rangeFor(preset);
  const picked = useMemo(
    () => orders.filter(o => (slug === "all" || o.slug === slug) && (preset === "all" || inRange(o, from, to))),
    [orders, slug, preset, from, to]);
  const s = useMemo(() => summarize(picked), [picked]);
  const cur = mainCurrency(picked.length ? picked : orders);
  const m = n => money(n, cur);

  const topQty = [...s.items].sort((a, b) => b.qty - a.qty).slice(0, 10);
  const topRev = [...s.items].sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  const hours = s.byHour.map((h, i) => ({ ...h, hour: i })).filter(h => h.orders);
  const maxDay = Math.max(0, ...s.byDay.map(d => d.revenue));
  const maxHour = Math.max(0, ...hours.map(h => h.revenue));
  const rangeText = preset === "all" ? "All time" : from === to ? prettyDay(from) : `${prettyDay(from)} – ${prettyDay(to)}`;
  const fileName = `orders-report_${preset === "all" ? "all-time" : `${from}_to_${to}`}`;

  const exportCSV = () => saveBlobAs(new Blob(["﻿" + toCSV(orderRows(picked))], { type: "text/csv;charset=utf-8" }), fileName + ".csv");

  const exportXLSX = async () => {
    const XLSX = await import("xlsx");
    const wb = XLSX.utils.book_new();
    const summary = [
      ["Period", preset === "all" ? "All time" : `${from} to ${to}`],
      ["Restaurant", slug === "all" ? "All restaurants" : slug],
      ["Currency", cur.trim()],
      [],
      ["Revenue (excl. cancelled)", s.revenue],
      ["Orders (excl. cancelled)", s.orders],
      ["Served", s.served],
      ["Average order value", s.average],
      ["Cancelled orders", s.cancelled],
      ["Cancelled value", s.cancelledValue],
      ["Cancellation rate", pct(s.cancelRate)],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summary), "Summary");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(s.byDay.map(d => ({
      Date: d.day, Orders: d.orders, Revenue: d.revenue, Cancelled: d.cancelled, "Cancelled value": d.cancelledValue,
    }))), "By day");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([...s.items].sort((a, b) => b.revenue - a.revenue).map(i => ({ Item: i.name, Qty: i.qty, Revenue: i.revenue }))), "Items");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(orderRows(picked)), "Orders");
    const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveBlobAs(new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), fileName + ".xlsx");
  };

  return (
    <div className="report">
      <div className="filters">
        <div className="presets">
          {PRESETS.map(([k, l]) => <button key={k} className={preset === k ? "on" : ""} onClick={() => setPreset(k)}>{l}</button>)}
        </div>
        {preset === "custom" && (
          <>
            <label>From <input type="date" value={custom[0]} max={custom[1]} onChange={e => setCustom([e.target.value, custom[1]])} /></label>
            <label>To <input type="date" value={custom[1]} min={custom[0]} onChange={e => setCustom([custom[0], e.target.value])} /></label>
          </>
        )}
        {restaurants.length > 1 && (
          <label>Restaurant
            <select value={slug} onChange={e => setSlug(e.target.value)}>
              <option value="all">All restaurants</option>
              {restaurants.map(r => <option key={r.slug} value={r.slug}>{r.name || r.slug}</option>)}
            </select>
          </label>
        )}
        <span className="grow" />
        <button className="ghost" onClick={exportCSV} disabled={!picked.length}>Download CSV</button>
        <button className="ghost" onClick={exportXLSX} disabled={!picked.length}>Download Excel</button>
      </div>

      <p className="range-text">{rangeText}</p>

      <div className="kpis">
        <div className="kpi main"><span>Revenue</span><b>{m(s.revenue)}</b><small>Excludes cancelled orders</small></div>
        <div className="kpi"><span>Orders</span><b>{s.orders}</b><small>{s.served} served</small></div>
        <div className="kpi"><span>Average order</span><b>{m(s.average)}</b><small>Revenue ÷ orders</small></div>
        <div className="kpi warn"><span>Cancelled</span><b>{s.cancelled}</b><small>{m(s.cancelledValue)} lost · {pct(s.cancelRate)} of orders</small></div>
      </div>

      {!picked.length ? <p className="empty">No orders in this period.</p> : (
        <div className="panels">
          <section className="panel wide">
            <h3>Revenue by day</h3>
            <table>
              <thead><tr><th>Date</th><th className="num">Orders</th><th className="num">Revenue</th><th className="bar-col" /><th className="num">Cancelled</th></tr></thead>
              <tbody>
                {s.byDay.map(d => (
                  <tr key={d.day}>
                    <td>{prettyDay(d.day)}</td><td className="num">{d.orders}</td><td className="num">{m(d.revenue)}</td>
                    <td className="bar-col"><Bar value={d.revenue} max={maxDay} /></td>
                    <td className="num">{d.cancelled ? `${d.cancelled} (${m(d.cancelledValue)})` : "–"}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot><tr><td>Total</td><td className="num">{s.orders}</td><td className="num">{m(s.revenue)}</td><td /><td className="num">{s.cancelled ? `${s.cancelled} (${m(s.cancelledValue)})` : "–"}</td></tr></tfoot>
            </table>
          </section>

          <section className="panel">
            <h3>Best sellers by revenue</h3>
            <table>
              <thead><tr><th>Item</th><th className="num">Qty</th><th className="num">Revenue</th></tr></thead>
              <tbody>{topRev.map(i => <tr key={i.name}><td>{i.name}</td><td className="num">{i.qty}</td><td className="num">{m(i.revenue)}</td></tr>)}</tbody>
            </table>
          </section>

          <section className="panel">
            <h3>Most ordered items</h3>
            <table>
              <thead><tr><th>Item</th><th className="num">Qty</th><th className="bar-col" /></tr></thead>
              <tbody>{topQty.map(i => <tr key={i.name}><td>{i.name}</td><td className="num">{i.qty}</td><td className="bar-col"><Bar value={i.qty} max={topQty[0]?.qty} /></td></tr>)}</tbody>
            </table>
          </section>

          <section className="panel wide">
            <h3>Busy hours</h3>
            <table>
              <thead><tr><th>Hour</th><th className="num">Orders</th><th className="num">Revenue</th><th className="bar-col" /></tr></thead>
              <tbody>{hours.map(h => <tr key={h.hour}><td>{hourLabel(h.hour)} – {hourLabel((h.hour + 1) % 24)}</td><td className="num">{h.orders}</td><td className="num">{m(h.revenue)}</td><td className="bar-col"><Bar value={h.revenue} max={maxHour} /></td></tr>)}</tbody>
            </table>
          </section>
        </div>
      )}
    </div>
  );
}
