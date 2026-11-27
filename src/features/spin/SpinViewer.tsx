"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { angleLabel, type SpinSet } from "./types";

/**
 * 360° spin viewer for a set of frames taken around a vehicle.
 *
 * Works for both kinds of set the platform will have:
 * - Sparse sets (AI multi-angle renders, usually 8 views). Neighbouring frames are
 *   cross-faded while dragging so the spin feels continuous, and the viewer settles
 *   on a real view when released.
 * - Dense sets (shop turntable photos or video frames, 24 to 36+). Frames swap
 *   directly like a flipbook.
 *
 * Frames must be ordered so that frame 0 is the front and the car turns the same way
 * through the set (front, front-right ¾, right side, ... for the default order).
 * Dragging right moves forward through the set.
 *
 * Performance notes: every frame is an <img> stacked in the same box, and only
 * opacity changes while spinning. Position lives in a ref and is painted in a
 * requestAnimationFrame loop, so dragging never re-renders React.
 */

const DENSE_THRESHOLD = 16; // sets with fewer frames than this are cross-faded
const FRICTION = 0.92; // velocity kept per 16ms after release
const MIN_VELOCITY = 0.002; // frames per ms below which inertia stops

type Props = {
  set: SpinSet;
  /** Extra classes for the outer card. */
  className?: string;
  /** Spin a short way on load to show it can be turned. Default true. */
  hint?: boolean;
  /** Show the clickable view chips (front, side, rear...). Default: on for sparse sets. */
  showViews?: boolean;
  /** Load frames only once the viewer scrolls near the screen. Default true. */
  lazy?: boolean;
};

const mod = (a: number, n: number) => ((a % n) + n) % n;

export function SpinViewer({ set, className = "", hint = true, showViews, lazy = true }: Props) {
  const n = set.frames.length;
  const dense = n >= DENSE_THRESHOLD;
  const views = showViews ?? !dense;

  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const pos = useRef(set.start ?? 0); // continuous position in frames
  const vel = useRef(0); // frames per ms
  const anim = useRef<{ from: number; to: number; t0: number; dur: number } | null>(null);
  const drag = useRef<{ id: number; x: number; p: number; t: number; lastX: number; lastT: number } | null>(null);
  const raf = useRef(0);
  const loadedMask = useRef<boolean[]>(Array(n).fill(false));

  const [near, setNear] = useState(!lazy);
  const [loaded, setLoaded] = useState(0);
  const [failed, setFailed] = useState(0);
  const [frame, setFrame] = useState(mod(Math.round(pos.current), n));
  const [touched, setTouched] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [full, setFull] = useState(false);
  const ready = loaded + failed >= n;

  /* ── Paint: set opacities for the current position ── */
  const paint = useCallback(() => {
    const p = mod(pos.current, n);
    const imgs = imgRefs.current;
    let a: number, b: number, mix: number;
    if (dense) {
      a = mod(Math.round(p), n);
      b = a;
      mix = 0;
    } else {
      a = Math.floor(p) % n;
      b = (a + 1) % n;
      // Hold each view for most of the drag and blend only through the middle,
      // which reads as motion rather than a double exposure.
      const f = p - Math.floor(p);
      const t = Math.min(1, Math.max(0, (f - 0.25) / 0.5));
      mix = t * t * (3 - 2 * t);
    }
    // Never show a frame that has not loaded: fall back to the nearest loaded one.
    const ok = loadedMask.current;
    const nearestLoaded = (i: number) => {
      for (let d = 0; d < n; d++) {
        if (ok[mod(i + d, n)]) return mod(i + d, n);
        if (ok[mod(i - d, n)]) return mod(i - d, n);
      }
      return i;
    };
    if (!ok[a]) a = nearestLoaded(a);
    if (!ok[b]) b = a;
    for (let i = 0; i < n; i++) {
      const el = imgs[i];
      if (!el) continue;
      // The base frame is fully opaque underneath; the next frame fades in on top.
      const o = i === a ? 1 : i === b ? mix : 0;
      el.style.opacity = String(o);
      el.style.zIndex = i === b && b !== a ? "2" : i === a ? "1" : "0";
    }
    const shown = mod(Math.round(p), n);
    setFrame((f) => (f === shown ? f : shown));
  }, [n, dense]);

  /* ── Animation loop: inertia and eased jumps ── */
  const loop = useCallback(() => {
    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(now - last, 48);
      last = now;
      let running = false;
      if (anim.current) {
        const { from, to, t0, dur } = anim.current;
        const k = Math.min(1, (now - t0) / dur);
        const e = 1 - Math.pow(1 - k, 3); // ease-out cubic
        pos.current = from + (to - from) * e;
        if (k < 1) running = true;
        else anim.current = null;
      } else if (!drag.current && Math.abs(vel.current) > MIN_VELOCITY) {
        pos.current += vel.current * dt;
        vel.current *= Math.pow(FRICTION, dt / 16);
        running = true;
      } else if (!drag.current && !dense && Math.abs(pos.current - Math.round(pos.current)) > 0.001) {
        // Sparse sets settle on a real view so you never rest on a blend.
        vel.current = 0;
        anim.current = { from: pos.current, to: Math.round(pos.current), t0: now, dur: 260 };
        running = true;
      }
      paint();
      raf.current = running ? requestAnimationFrame(step) : 0;
    };
    if (!raf.current) raf.current = requestAnimationFrame(step);
  }, [paint, dense]);

  const goTo = useCallback(
    (target: number, dur = 450) => {
      // Take the short way round.
      let d = mod(target - pos.current, n);
      if (d > n / 2) d -= n;
      vel.current = 0;
      anim.current = { from: pos.current, to: pos.current + d, t0: performance.now(), dur };
      loop();
    },
    [n, loop],
  );

  /* ── Lazy start: begin loading when the viewer nears the viewport ── */
  useEffect(() => {
    if (near) return;
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return setNear(true);
    const io = new IntersectionObserver((es) => es.some((e) => e.isIntersecting) && setNear(true), { rootMargin: "400px" });
    io.observe(el);
    return () => io.disconnect();
  }, [near]);

  /* ── Preload: the start frame first, then outward from it in both directions ── */
  useEffect(() => {
    if (!near) return;
    let cancelled = false;
    const start = mod(Math.round(pos.current), n);
    const order: number[] = [start];
    for (let d = 1; order.length < n; d++) {
      order.push(mod(start + d, n));
      if (order.length < n) order.push(mod(start - d, n));
    }
    // For dense sets, fetch every 4th frame first so a rough spin works almost at once.
    const queue = dense ? [...order.filter((_, i) => i % 4 === 0), ...order.filter((_, i) => i % 4 !== 0)] : order;
    const CONCURRENCY = 6;
    let next = 0;
    const pump = () => {
      if (cancelled || next >= queue.length) return;
      const i = queue[next++];
      const img = new Image();
      img.decoding = "async";
      img.src = set.frames[i];
      const done = (ok: boolean) => {
        if (cancelled) return;
        if (ok) {
          loadedMask.current[i] = true;
          setLoaded((c) => c + 1);
        } else setFailed((c) => c + 1);
        paint();
        pump();
      };
      (img.decode ? img.decode() : new Promise((r, j) => ((img.onload = r), (img.onerror = j)))).then(
        () => done(true),
        () => done(false),
      );
    };
    for (let k = 0; k < CONCURRENCY; k++) pump();
    return () => {
      cancelled = true;
    };
  }, [near, n, dense, set.frames, paint]);

  /* ── Load hint: a short half-turn swing once everything is in ── */
  useEffect(() => {
    if (!ready || !hint || touched) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const base = pos.current;
    const t = setTimeout(() => {
      anim.current = { from: base, to: base + n * 0.25, t0: performance.now(), dur: 900 };
      loop();
      setTimeout(() => {
        if (!drag.current) goTo(base, 900);
      }, 950);
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  /* ── Pointer drag (mouse, pen, touch). Vertical page scroll still works on touch. ── */
  const pxPerFrame = () => {
    const w = stageRef.current?.clientWidth ?? 600;
    // About one full turn per 1.25 stage widths on dense sets; sparse sets turn a little slower.
    return (w * (dense ? 1.25 : 1.6)) / n;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    anim.current = null;
    vel.current = 0;
    const now = performance.now();
    drag.current = { id: e.pointerId, x: e.clientX, p: pos.current, t: now, lastX: e.clientX, lastT: now };
    setDragging(true);
    setTouched(true);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const now = performance.now();
    const ppf = pxPerFrame();
    pos.current = d.p + (e.clientX - d.x) / ppf;
    const dt = now - d.lastT;
    if (dt > 0) {
      const v = (e.clientX - d.lastX) / ppf / dt;
      vel.current = vel.current * 0.6 + v * 0.4; // smoothed
    }
    d.lastX = e.clientX;
    d.lastT = now;
    paint();
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    // A pause before letting go cancels the throw.
    if (performance.now() - d.lastT > 80) vel.current = 0;
    vel.current = Math.max(-0.05, Math.min(0.05, vel.current));
    drag.current = null;
    setDragging(false);
    loop();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const k = e.key;
    if (k === "ArrowRight" || k === "ArrowLeft") {
      e.preventDefault();
      setTouched(true);
      goTo(Math.round(pos.current) + (k === "ArrowRight" ? 1 : -1), dense ? 120 : 380);
    } else if (k === "Home") {
      e.preventDefault();
      goTo(0);
    }
  };

  const toggleFull = async () => {
    const el = rootRef.current;
    if (!el) return;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await el.requestFullscreen();
    } catch {
      /* fullscreen not allowed (e.g. iOS Safari on iPhone): ignore */
    }
  };
  useEffect(() => {
    const on = () => setFull(document.fullscreenElement === rootRef.current);
    document.addEventListener("fullscreenchange", on);
    return () => document.removeEventListener("fullscreenchange", on);
  }, []);
  // Repaint after resize or fullscreen so the stacked frames stay in sync.
  useEffect(() => paint(), [full, paint]);

  const pct = Math.round(((loaded + failed) / n) * 100);
  const isAI = set.source === "ai";
  const viewChips = views ? VIEW_STOPS.map((v) => ({ ...v, i: Math.round((v.deg / 360) * n) % n })) : [];
  const heading = (frame / n) * 360;

  return (
    <div
      ref={rootRef}
      className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-panel ${full ? "flex flex-col justify-center !rounded-none" : ""} ${className}`}
    >
      {/* Stage */}
      <div
        ref={stageRef}
        role="slider"
        tabIndex={0}
        aria-label={`${set.title}: drag or use arrow keys to turn the car`}
        aria-valuemin={1}
        aria-valuemax={n}
        aria-valuenow={frame + 1}
        aria-valuetext={`${angleLabel(heading)}, view ${frame + 1} of ${n}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
        className={`relative w-full select-none outline-none focus-visible:ring-2 focus-visible:ring-a2/70 ${
          dragging ? "cursor-grabbing" : "cursor-grab"
        } ${full ? "max-h-[85vh]" : ""}`}
        style={{ aspectRatio: set.aspect ?? "16 / 10", touchAction: "pan-y" }}
      >
        {near &&
          set.frames.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src}
              ref={(el) => {
                imgRefs.current[i] = el;
              }}
              src={src}
              alt={i === frame ? `${set.alt}, ${angleLabel((i / n) * 360)} view` : ""}
              aria-hidden={i !== frame}
              draggable={false}
              decoding="async"
              fetchPriority={i === (set.start ?? 0) ? "high" : "low"}
              className="pointer-events-none absolute inset-0 h-full w-full object-cover"
              style={{ opacity: 0 }}
            />
          ))}

        {/* Loading veil until the first frame is in */}
        {loaded === 0 && (
          <div className="absolute inset-0 grid place-items-center bg-panel">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-a2" />
          </div>
        )}

        {/* Top-left: source badge */}
        <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-wrap items-center gap-2 sm:left-4 sm:top-4">
          <span
            className={`rounded-full border px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest backdrop-blur ${
              isAI ? "border-a2/40 bg-a2/15 text-a2" : "border-cy/40 bg-cy/15 text-cy"
            }`}
          >
            {isAI ? "AI render" : "Shop photos"} · {n} {dense ? "frames" : "views"}
          </span>
          {set.verified && (
            <span className="rounded-full border border-cy/30 bg-black/40 px-2.5 py-1 text-[10px] font-semibold text-cy backdrop-blur">
              ✓ Real build
            </span>
          )}
        </div>

        {/* Top-right: fullscreen */}
        <button
          type="button"
          onClick={toggleFull}
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-black/40 text-white/80 backdrop-blur transition hover:bg-black/60 hover:text-white sm:right-4 sm:top-4"
          aria-label={full ? "Exit full screen" : "Full screen"}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {full ? <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" /> : <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />}
          </svg>
        </button>

        {/* Centre: drag hint until first interaction */}
        <div
          className={`pointer-events-none absolute inset-x-0 bottom-16 z-10 flex justify-center transition-opacity duration-500 sm:bottom-20 ${
            touched || loaded === 0 ? "opacity-0" : "opacity-100"
          }`}
        >
          <span className="flex items-center gap-2 rounded-full border border-white/15 bg-black/55 px-3.5 py-2 text-xs font-semibold text-white/90 backdrop-blur">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 8 3 12l4 4M17 8l4 4-4 4M3 12h18" />
            </svg>
            Drag to spin 360°
          </span>
        </div>

        {/* Bottom bar: compass, angle, counter, load progress */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-center justify-between gap-3 bg-gradient-to-t from-black/70 to-transparent px-3 pb-3 pt-10 sm:px-4 sm:pb-4">
          <div className="flex items-center gap-2.5">
            <Compass deg={heading} />
            <span className="text-sm font-semibold text-white/90">{angleLabel(heading)}</span>
          </div>
          <div className="flex items-center gap-3">
            {!ready && (
              <span className="flex items-center gap-2 font-mono text-[11px] text-white/60">
                <span className="relative h-1 w-14 overflow-hidden rounded-full bg-white/15">
                  <span className="absolute inset-y-0 left-0 bg-gradient-to-r from-a1 to-a2 transition-[width]" style={{ width: `${pct}%` }} />
                </span>
                {pct}%
              </span>
            )}
            <span className="font-mono text-xs text-white/60">
              {String(frame + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>

      {/* View chips */}
      {viewChips.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto border-t border-white/10 p-2.5 [scrollbar-width:none] sm:p-3">
          {viewChips.map((v) => (
            <button
              key={v.label}
              type="button"
              onClick={() => {
                setTouched(true);
                goTo(v.i);
              }}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                frame === v.i ? "bg-white/10 text-white" : "text-white/55 hover:bg-white/5 hover:text-white/85"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      )}
      {failed > 0 && ready && (
        <p className="border-t border-white/10 px-4 py-2 text-xs text-a1">
          {failed} of {n} frames could not load. The spin skips them.
        </p>
      )}
    </div>
  );
}

const VIEW_STOPS = [
  { label: "Front", deg: 0 },
  { label: "Front ¾", deg: 45 },
  { label: "Side", deg: 90 },
  { label: "Rear ¾", deg: 135 },
  { label: "Rear", deg: 180 },
  { label: "Other side", deg: 270 },
];

/** Tiny top-down car icon that rotates with the view. */
function Compass({ deg }: { deg: number }) {
  return (
    <span className="relative grid h-8 w-8 place-items-center rounded-full border border-white/20 bg-black/40 backdrop-blur">
      <svg width="32" height="32" viewBox="0 0 32 32" className="absolute inset-0">
        <circle cx="16" cy="16" r="13" fill="none" stroke="rgba(255,255,255,.12)" strokeDasharray="1.5 3" />
        {/* camera position: always at the bottom */}
        <circle cx="16" cy="29" r="1.6" fill="var(--a2)" />
      </svg>
      <svg
        width="14"
        height="20"
        viewBox="0 0 14 20"
        style={{ transform: `rotate(${-deg}deg)`, transition: "transform 80ms linear" }}
        aria-hidden
      >
        {/* nose points down (towards the camera) at 0° */}
        <rect x="1" y="1" width="12" height="18" rx="4" fill="rgba(255,255,255,.85)" />
        <rect x="3" y="12" width="8" height="4" rx="1.5" fill="var(--a1)" />
      </svg>
    </span>
  );
}
