// Today's orders only, with status tabs. Older orders live under Archived.
import { useState } from "react";
import OrderCard from "./OrderCard.jsx";
import { STATUSES, isToday } from "./orderUtils.js";

const TABS = [["active", "Active"], ...STATUSES, ["cancelled", "Cancelled"], ["all", "All"]];
const matches = (o, f) => f === "active" ? o.status !== "done" && o.status !== "cancelled" : f === "all" || o.status === f;

export default function TodayView({ orders, showSlug, onStatus, emptyHint }) {
  const [filter, setFilter] = useState("active");
  const today = orders.filter(isToday);
  const shown = today.filter(o => matches(o, filter));

  return (
    <>
      <div className="tabs">
        {TABS.map(([k, l]) => (
          <button key={k} className={filter === k ? "on" : ""} onClick={() => setFilter(k)}>{l} ({today.filter(o => matches(o, k)).length})</button>
        ))}
      </div>
      <div id="list">
        {emptyHint ? <p className="empty">{emptyHint}</p>
          : !shown.length ? <p className="empty">{today.length ? "No orders in this tab." : "No orders yet today. Scan your QR code and place an order from a phone."}</p>
          : shown.map(o => <OrderCard key={o.id} order={o} showSlug={showSlug} onStatus={onStatus} />)}
      </div>
    </>
  );
}
