import { useEffect, useLayoutEffect, useRef, useState } from "react";

// Renders a generated logo. The SVG text is built by our own generators (all user text is XML-escaped),
// and the same string is what gets downloaded, so preview and download always match.
export function Svg({ markup, className, style, id }) {
  return <div id={id} className={className} style={style} dangerouslySetInnerHTML={{ __html: markup || "" }} />;
}

export function useMediaQuery(q) {
  const [on, setOn] = useState(() => window.matchMedia(q).matches);
  useEffect(() => {
    const mq = window.matchMedia(q);
    const h = () => setOn(mq.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, [q]);
  return on;
}

// Width the menu board is designed (and exported) at. It is shown scaled to fit the screen.
export const BOARD_WIDTH = 896;

// Percentage that makes a `width`-px board fit inside `ref` (never above 100%). Follows resizes and rotation.
export function useFitZoom(ref, width = BOARD_WIDTH, min = 20) {
  const [fit, setFit] = useState(100);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const cs = getComputedStyle(el);
      const inner = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      if (inner > 0) setFit(Math.max(min, Math.min(100, Math.floor((inner / width) * 100))));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref, width]);
  return fit;
}

export function useWindowWidth() {
  const [w, setW] = useState(window.innerWidth);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return w;
}

// Drag helper that never breaks normal clicks: it only takes over after a real sideways move,
// and swallows the click that a drag would otherwise fire.
export function useDragSwipe(ref, onMove, onEnd) {
  const cb = useRef({ onMove, onEnd });
  cb.current = { onMove, onEnd };
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let x0 = null, y0 = 0, dragging = false, pid = null, dragAt = 0;
    const down = e => { if (e.button) return; x0 = e.clientX; y0 = e.clientY; dragging = false; pid = e.pointerId; };
    const move = e => {
      if (x0 === null) return;
      const dx = e.clientX - x0, dy = e.clientY - y0;
      if (!dragging) {
        if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) { dragging = true; try { el.setPointerCapture(pid); } catch (_) { /* ignore */ } }
        else if (Math.abs(dy) > 12) { x0 = null; return; }
        else return;
      }
      cb.current.onMove(dx);
    };
    const end = e => {
      if (x0 === null) return;
      const dx = e.clientX - x0; x0 = null;
      if (dragging) { dragAt = Date.now(); cb.current.onEnd(e.type === "pointercancel" ? 0 : dx); }
    };
    const click = e => { if (Date.now() - dragAt < 350) { e.stopPropagation(); e.preventDefault(); } };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);
    el.addEventListener("click", click, true);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", end);
      el.removeEventListener("pointercancel", end);
      el.removeEventListener("click", click, true);
    };
  }, [ref]);
}

const arrowKeys = (step) => (e) => {
  if (e.key === "ArrowLeft") { step(-1); e.preventDefault(); }
  if (e.key === "ArrowRight") { step(1); e.preventDefault(); }
};

// Arrow buttons + dots under a carousel
export function CarouselControls({ n, cur, step, go, hidden }) {
  return (
    <div className={"cc-ctrl" + (hidden ? " hidden" : "")}>
      <button type="button" className="cc-arrow" aria-label="Previous" onClick={() => step(-1)}>&#8249;</button>
      <div className="cc-dots">
        {Array.from({ length: n }, (_, i) => (
          <button key={i} type="button" aria-label={`Show ${i + 1} of ${n}`} aria-current={i === cur ? "true" : "false"} onClick={() => go(i)} />
        ))}
      </div>
      <button type="button" className="cc-arrow" aria-label="Next" onClick={() => step(1)}>&#8250;</button>
    </div>
  );
}

// ---------- 1. COVERFLOW (logo variations): big centre card, side cards tilt back ----------
// renderCard(i, { style, front, onClickCapture }) must return the card element.
export function Coverflow({ count, start = 0, className, renderCard }) {
  const track = useRef(null);
  const [cur, setCur] = useState(() => Math.max(0, Math.min(count - 1, start)));
  const [drag, setDrag] = useState(0);
  const [height, setHeight] = useState(undefined);
  const width = useWindowWidth();
  const gap = width < 640 ? 118 : 190;
  const go = i => { setDrag(0); setCur(Math.max(0, Math.min(count - 1, i))); };
  const step = d => go(cur + d);

  useLayoutEffect(() => {
    const first = track.current && track.current.firstElementChild;
    if (!first) return;
    const measure = () => setHeight(first.offsetHeight + 24);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(first);
    return () => ro.disconnect();
  }, [count]);

  useDragSwipe(track, dx => setDrag(dx), dx => {
    if (Math.abs(dx) <= 50) { setDrag(0); return; }
    let k = Math.round(-dx / gap);
    if (!k) k = dx < 0 ? 1 : -1;
    setDrag(0);
    setCur(c => Math.max(0, Math.min(count - 1, c + k)));
  });

  return (
    <>
      <div ref={track} className={className + " cf3d"} style={{ height }} tabIndex={0} onKeyDown={arrowKeys(step)}>
        {Array.from({ length: count }, (_, k) => {
          const d = k - cur + drag / gap, a = Math.abs(d);
          const front = Math.round(d) === 0;
          return renderCard(k, {
            front,
            style: {
              transition: drag ? "none" : undefined,
              transform: `translateX(calc(-50% + ${d * gap}px)) translateZ(${-a * 150}px) rotateY(${-Math.sign(d) * Math.min(a, 1) * 35}deg)`,
              zIndex: 50 - Math.round(a * 10),
              opacity: a > 2.6 ? 0 : 1,                        // solid cards: no see-through overlaps
              filter: a < 0.5 ? "none" : `brightness(${1 - Math.min(a, 2) * 0.07}) saturate(${1 - Math.min(a, 2) * 0.2})`
            },
            // Clicking a side card brings it to the front instead of choosing it
            onClickCapture: e => { if (k !== cur) { e.stopPropagation(); e.preventDefault(); go(k); } }
          });
        })}
      </div>
      <CarouselControls n={count} cur={cur} step={step} go={go} />
    </>
  );
}

// ---------- 2. STACKED CARDS (logo styles, phones only): a pile you swipe away ----------
export function StackCards({ count, id, className, renderCard }) {
  const track = useRef(null);
  const on = useMediaQuery("(max-width: 760px)");
  const [cur, setCur] = useState(0);
  const [drag, setDrag] = useState(0);
  const [flying, setFlying] = useState(false);
  const [height, setHeight] = useState(undefined);
  const curN = ((cur % count) + count) % count;
  const go = i => { setDrag(0); setFlying(false); setCur(i); };
  const step = d => {
    if (d > 0 && on) {
      setFlying(true);
      setTimeout(() => go(curN + 1), 260);
    } else go(curN + d);
  };

  useLayoutEffect(() => {
    if (!on) { setHeight(undefined); return; }
    const first = track.current && track.current.firstElementChild;
    if (first) setHeight(first.offsetHeight + 44);
  }, [on, count]);

  useDragSwipe(track, dx => { if (on) setDrag(dx); }, dx => {
    if (!on) return;
    if (dx < -60) step(1); else if (dx > 60) step(-1); else setDrag(0);
  });

  return (
    <>
      <div ref={track} id={id} className={className + (on ? " stk" : "")} style={{ height }} onKeyDown={arrowKeys(step)}>
        {Array.from({ length: count }, (_, k) => {
          if (!on) return renderCard(k, { style: undefined, top: true, tabIndex: 0 });
          const p = (k - curN + count) % count;        // 0 = top of the pile
          let style;
          if (p === 0 && flying) style = { transition: "transform .32s ease-in, opacity .32s ease-in", transform: "translateX(-130%) rotate(-16deg)", opacity: 0, zIndex: 40 };
          else style = {
            transition: p === 0 && drag ? "none" : undefined,
            transform: p === 0 && drag ? `translateX(${drag}px) rotate(${drag / 18}deg)` : `translateY(${p * 13}px) scale(${1 - p * 0.055}) rotate(${p ? (p % 2 ? 2.5 : -2.5) : 0}deg)`,
            zIndex: 40 - p,
            opacity: p > 3 ? 0 : 1
          };
          return renderCard(k, { style, top: p === 0, tabIndex: p ? -1 : 0, ariaHidden: p ? "true" : "false" });
        })}
      </div>
      <CarouselControls n={count} cur={curN} step={step} go={go} hidden={!on} />
    </>
  );
}

// ---------- 3. CENTRE-FOCUS SLIDER (mockups): big centre card, neighbours peek, auto-plays ----------
export function CentreFocus({ id, className, autoMs, children }) {
  const view = useRef(null);
  const track = useRef(null);
  const cards = Array.isArray(children) ? children : [children];
  const n = cards.length;
  const [cur, setCur] = useState(0);
  const [drag, setDrag] = useState(0);
  const [, force] = useState(0);
  const hold = useRef(0);
  const go = i => { setDrag(0); setCur((i + n) % n); };
  const step = d => { hold.current = Date.now(); go(cur + d); };

  useLayoutEffect(() => {
    const t = track.current, v = view.current;
    if (!t || !v) return;
    const c = t.children[cur];
    t.style.transition = drag ? "none" : "";
    t.style.transform = `translateX(${v.clientWidth / 2 - (c.offsetLeft + c.offsetWidth / 2) + drag}px)`;
  });
  useEffect(() => {
    const h = () => force(x => x + 1);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!autoMs || reduce) return;
    const t = setInterval(() => {
      if (!view.current || !view.current.offsetParent || document.hidden || Date.now() - hold.current < 6000) return;
      setCur(c => (c + 1) % n);
    }, autoMs);
    return () => clearInterval(t);
  }, [autoMs, n]);

  useDragSwipe(view, dx => { hold.current = Date.now(); setDrag(dx); }, dx => {
    if (dx < -50) step(1); else if (dx > 50) step(-1); else setDrag(0);
  });

  return (
    <>
      <div ref={view} className="cfx-view" tabIndex={0} onKeyDown={arrowKeys(step)}
        onPointerEnter={() => { hold.current = Date.now() + 1e9; }} onFocus={() => { hold.current = Date.now() + 1e9; }}
        onPointerLeave={() => { hold.current = Date.now(); }} onBlur={() => { hold.current = Date.now(); }}>
        <div ref={track} id={id} className={className + " cfx-track"}>
          {cards.map((card, i) => (
            <div key={i} className={card.props.className + (i === cur ? " cfx-on" : "")} aria-hidden={i === cur ? "false" : "true"}
              onClickCapture={e => { if (i !== cur) { e.stopPropagation(); step(i - cur); } }}>
              {card.props.children}
            </div>
          ))}
        </div>
      </div>
      <CarouselControls n={n} cur={cur} step={step} go={i => { hold.current = Date.now(); go(i); }} />
    </>
  );
}
