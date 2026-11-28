// Date helpers and money totals shared by the Today, Archived and Reports views.
// Orders carry created_at as a UTC ISO string; everything here works in the browser's local time.

export const STATUSES = [["new", "New"], ["preparing", "Preparing"], ["ready", "Ready"], ["done", "Served"]];
export const STATUS_LABEL = { ...Object.fromEntries(STATUSES), cancelled: "Cancelled" };

export function money(n, cur) {
  const num = Number(n) || 0;
  const v = Number.isInteger(num) ? String(num) : num.toFixed(2);
  return cur === "/-" ? `${v}/-` : `${cur || ""}${v}`;
}

const pad = n => String(n).padStart(2, "0");

// Date -> "2026-11-28" in local time
export const dateKey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// Orders saved before created_at existed have no date
export const orderDate = o => (o.created_at ? new Date(o.created_at) : null);
export const orderDay = o => { const d = orderDate(o); return d ? dateKey(d) : ""; };

export const todayKey = () => dateKey(new Date());
export const daysAgoKey = n => { const d = new Date(); d.setDate(d.getDate() - n); return dateKey(d); };

export const isToday = o => orderDay(o) === todayKey();

// from / to are "YYYY-MM-DD" (inclusive); empty means open-ended
export const inRange = (o, from, to) => {
  const k = orderDay(o);
  if (!k) return !from && !to;
  return (!from || k >= from) && (!to || k <= to);
};

export function prettyDay(key) {
  if (!key) return "Unknown date";
  if (key === todayKey()) return "Today";
  if (key === daysAgoKey(1)) return "Yesterday";
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

// The currency most of these orders use
export function mainCurrency(orders) {
  const count = {};
  orders.forEach(o => { count[o.currency || ""] = (count[o.currency || ""] || 0) + 1; });
  return Object.entries(count).sort((a, b) => b[1] - a[1])[0]?.[0] || "";
}

const round2 = n => Math.round(n * 100) / 100;

// Money summary. Cancelled orders never count as revenue.
export function summarize(orders) {
  const kept = orders.filter(o => o.status !== "cancelled");
  const cancelled = orders.filter(o => o.status === "cancelled");
  const revenue = round2(kept.reduce((s, o) => s + (Number(o.total) || 0), 0));

  const byDay = {};
  const byHour = Array.from({ length: 24 }, () => ({ orders: 0, revenue: 0 }));
  const items = {};
  kept.forEach(o => {
    const day = orderDay(o);
    byDay[day] = byDay[day] || { day, orders: 0, revenue: 0 };
    byDay[day].orders += 1;
    byDay[day].revenue = round2(byDay[day].revenue + (Number(o.total) || 0));
    const d = orderDate(o);
    const hour = d ? d.getHours() : Number(String(o.time || "").split(":")[0]);
    if (hour >= 0 && hour < 24) { byHour[hour].orders += 1; byHour[hour].revenue = round2(byHour[hour].revenue + (Number(o.total) || 0)); }
    (o.items || []).forEach(i => {
      items[i.name] = items[i.name] || { name: i.name, qty: 0, revenue: 0 };
      items[i.name].qty += Number(i.qty) || 0;
      items[i.name].revenue = round2(items[i.name].revenue + (Number(i.subtotal) || 0));
    });
  });
  cancelled.forEach(o => {   // a day with only cancelled orders still shows up
    const day = orderDay(o);
    byDay[day] = byDay[day] || { day, orders: 0, revenue: 0 };
  });
  Object.values(byDay).forEach(r => {
    const dayCancelled = cancelled.filter(o => orderDay(o) === r.day);
    r.cancelled = dayCancelled.length;
    r.cancelledValue = round2(dayCancelled.reduce((s, o) => s + (Number(o.total) || 0), 0));
  });

  return {
    revenue,
    orders: kept.length,
    served: kept.filter(o => o.status === "done").length,
    average: kept.length ? round2(revenue / kept.length) : 0,
    cancelled: cancelled.length,
    cancelledValue: round2(cancelled.reduce((s, o) => s + (Number(o.total) || 0), 0)),
    cancelRate: orders.length ? cancelled.length / orders.length : 0,
    byDay: Object.values(byDay).sort((a, b) => (a.day < b.day ? 1 : -1)),
    byHour,
    items: Object.values(items),
  };
}
