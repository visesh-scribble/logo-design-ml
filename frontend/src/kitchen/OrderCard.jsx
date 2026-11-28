// One order. Live cards (today) can move between statuses or be cancelled; archived cards are read-only.
import { useState } from "react";
import { STATUSES, STATUS_LABEL, money } from "./orderUtils.js";

function CancelDialog({ order, onConfirm, onClose }) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async e => {
    e.preventDefault();
    setBusy(true); setErr("");
    try { await onConfirm(reason); onClose(); }
    catch (ex) { setErr(ex.message); setBusy(false); }
  };

  return (
    <div className="modal-back" onClick={onClose}>
      <form className="modal" onClick={e => e.stopPropagation()} onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="cancelTitle">
        <h3 id="cancelTitle">Cancel order #{order.id}?</h3>
        <p className="modal-sub">Table {order.table} · {money(order.total, order.currency)}. The customer's phone will show that the order was cancelled.</p>
        <label htmlFor="cancelReason">Reason (optional)</label>
        <input id="cancelReason" autoFocus maxLength={200} value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Item out of stock, customer left" />
        <p className="auth-err" role="alert">{err}</p>
        <div className="modal-btns">
          <button type="button" className="ghost" onClick={onClose}>Keep order</button>
          <button type="submit" className="danger" disabled={busy}>{busy ? "Cancelling…" : "Cancel order"}</button>
        </div>
      </form>
    </div>
  );
}

export default function OrderCard({ order: o, showSlug, onStatus, readOnly }) {
  const [asking, setAsking] = useState(false);
  const cancelled = o.status === "cancelled";
  const canChange = !readOnly && !cancelled;

  return (
    <div className={"card" + (o.status === "new" && !readOnly ? " new" : "") + (cancelled ? " cancelled" : "")}>
      <div className="top">
        <span className="id">#{o.id}</span>
        <span className="table">Table {o.table}</span>
      </div>
      <div className="meta">
        {o.time}{o.name ? " · " + o.name : ""}{showSlug ? " · " + o.slug : ""}
        {(readOnly || cancelled) && <span className={"badge " + o.status}>{STATUS_LABEL[o.status] || o.status}</span>}
      </div>
      <ul>{o.items.map((i, k) => <li key={k}><span><b>{i.qty}×</b>{i.name}</span><span>{money(i.subtotal, o.currency)}</span></li>)}</ul>
      {o.note && <div className="note">📝 {o.note}</div>}
      {cancelled && o.cancel_reason && <div className="cancel-reason">Reason: {o.cancel_reason}</div>}
      <div className="total"><span>Total</span><span>{money(o.total, o.currency)}</span></div>
      {canChange && (
        <>
          <div className="btns">
            {STATUSES.map(([k, l]) => <button key={k} className={o.status === k ? "cur" : ""} onClick={() => onStatus(o.id, k).catch(e => alert(e.message))}>{l}</button>)}
          </div>
          {o.status !== "done" && <button className="cancel-btn" onClick={() => setAsking(true)}>Cancel order</button>}
        </>
      )}
      {asking && <CancelDialog order={o} onConfirm={reason => onStatus(o.id, "cancelled", reason)} onClose={() => setAsking(false)} />}
    </div>
  );
}
