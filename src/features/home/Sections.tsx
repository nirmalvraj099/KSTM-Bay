"use client";

import Link from "next/link";
import { AnimatePresence, motion, useInView, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { CITIES, MOD_TYPES } from "@/features/marketplace/options";
import { CountUp, EASE, Img, Reveal } from "./motion";
import { PHOTOS, type Photo } from "./photos";

const inr = (n: number) => "₹" + n.toLocaleString("en-IN");

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-xs uppercase tracking-[0.25em] text-a2">{children}</p>;
}

/* ───────────────────────── Marquee ───────────────────────── */

const MODS = ["Satin wraps", "Forged rims", "2\" lift kits", "PPF", "Projector headlamps", "Ceramic coating", "Coilovers", "Ambient lighting", "Roof racks", "Body kits", "Exhaust", "Bucket seats"];
const BRANDS = ["Avero Films", "Kaveri Forge", "Ridgeline", "TrailCore", "Lumora", "IronPeak", "Dyno Sound", "Basecamp", "AirRaid"];

function Row({ items, reverse = false }: { items: string[]; reverse?: boolean }) {
  return (
    <div className="flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
      <div className={`flex shrink-0 items-center gap-8 pr-8 ${reverse ? "animate-marquee-rev" : "animate-marquee"}`}>
        {[...items, ...items].map((t, i) => (
          <span key={i} className="flex items-center gap-8 whitespace-nowrap">
            {t}
            <span className="h-1.5 w-1.5 rotate-45 bg-a1" />
          </span>
        ))}
      </div>
      <div aria-hidden className={`flex shrink-0 items-center gap-8 pr-8 ${reverse ? "animate-marquee-rev" : "animate-marquee"}`}>
        {[...items, ...items].map((t, i) => (
          <span key={i} className="flex items-center gap-8 whitespace-nowrap">
            {t}
            <span className="h-1.5 w-1.5 rotate-45 bg-a1" />
          </span>
        ))}
      </div>
    </div>
  );
}

export function Marquee() {
  return (
    <div className="relative -rotate-1 border-y border-white/10 bg-panel/80 py-5">
      <div className="disp flex flex-col gap-3 text-2xl text-white/90 sm:text-3xl">
        <Row items={MODS} />
        <div className="font-mono text-sm not-italic tracking-widest text-white/40 uppercase">
          <Row items={BRANDS} reverse />
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Stats ───────────────────────── */

export function Stats() {
  const stats = [
    { value: CITIES.length, label: "South Indian cities you can post from" },
    { value: MOD_TYPES.length, label: "mod categories, from wraps to full builds" },
    { value: 0, prefix: "₹", label: "to post a job and collect quotes" },
    { value: 100, suffix: "%", label: "of payments held in KSTM Pay escrow" },
  ];
  return (
    <section id="stats" className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 lg:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.08} className="bg-bg p-6 sm:p-8">
            <p className="disp text-5xl sm:text-6xl">
              <span className="grad-text">
                <CountUp to={s.value} prefix={s.prefix} suffix={s.suffix} />
              </span>
            </p>
            <p className="mt-3 max-w-[16rem] text-sm text-white/60">{s.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────────── How it works (sticky image) ───────────────────────── */

const STEPS: { n: string; title: string; text: string; photo: Photo; tag: string }[] = [
  { n: "01", title: "Post your car or bike", text: "Add photos, pick the mods you want and set a budget. It takes two minutes and costs nothing.", photo: PHOTOS.thar, tag: "Job posted · Kochi" },
  { n: "02", title: "Designers render it", text: "Freelance 3D designers send renders of your exact vehicle. Every render you like earns them reward credits.", photo: PHOTOS.concept, tag: "Render #3 · ♥ liked" },
  { n: "03", title: "Shops bid with real quotes", text: "Verified shops quote against the render you chose, with itemised parts, labour, timeline and an RTO check.", photo: PHOTOS.wash, tag: "3 bids · best ₹1.71L" },
  { n: "04", title: "Build it, then show it off", text: "Pay into escrow, approve the finished build, and it goes live in the showcase with every mod and brand labelled.", photo: PHOTOS.interior, tag: "Build verified" },
];

function Step({ step, index, onActive }: { step: (typeof STEPS)[number]; index: number; onActive: (i: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-45% 0px -45% 0px" });
  useEffect(() => {
    if (inView) onActive(index);
  }, [inView, index, onActive]);
  return (
    <div ref={ref} className="flex min-h-[55vh] flex-col justify-center py-8 lg:min-h-[70vh]">
      <Reveal>
        <span className="disp text-7xl text-transparent [-webkit-text-stroke:1.5px_#3a3a48]">{step.n}</span>
        <h3 className="mt-3 text-3xl font-extrabold sm:text-4xl">{step.title}</h3>
        <p className="mt-4 max-w-md text-lg leading-relaxed text-white/65">{step.text}</p>
        <div className="mt-6 overflow-hidden rounded-2xl lg:hidden">
          <Img photo={step.photo} sizes="100vw" className="aspect-[4/3] w-full object-cover" />
        </div>
      </Reveal>
    </div>
  );
}

export function HowItWorks() {
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start center", "end center"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <section id="how" ref={ref} className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <Reveal className="max-w-2xl">
        <Eyebrow>How KSTM Bay works</Eyebrow>
        <h2 className="disp mt-4 text-5xl leading-[0.95] sm:text-6xl">
          From stock to <span className="grad-text">signature</span> in four moves.
        </h2>
      </Reveal>

      <div className="relative mt-8 grid gap-12 lg:grid-cols-2">
        <div className="relative pl-8">
          <div className="absolute left-0 top-0 h-full w-[2px] bg-white/10">
            <motion.div style={{ scaleY: progress }} className="h-full w-full origin-top bg-gradient-to-b from-a1 to-a2" />
          </div>
          {STEPS.map((s, i) => (
            <Step key={s.n} step={s} index={i} onActive={setActive} />
          ))}
        </div>

        <div className="hidden lg:block">
          <div className="sticky top-24 aspect-[4/5] overflow-hidden rounded-3xl border border-white/10">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={active}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 1.08 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9, ease: EASE }}
              >
                <Img photo={STEPS[active].photo} sizes="50vw" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-bg/90 via-transparent to-transparent" />
              </motion.div>
            </AnimatePresence>
            <div className="absolute inset-x-6 bottom-6 flex items-center justify-between">
              <AnimatePresence mode="wait">
                <motion.span
                  key={active}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                  className="rounded-full border border-white/15 bg-black/50 px-3 py-1.5 font-mono text-xs uppercase tracking-widest backdrop-blur"
                >
                  {STEPS[active].tag}
                </motion.span>
              </AnimatePresence>
              <span className="font-mono text-xs text-white/60">{STEPS[active].n} / 04</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Featured build with hotspots ───────────────────────── */

const HOTSPOTS = [
  { x: 47, y: 16, label: "Roof light bar", brand: "Lumora", price: 34000 },
  { x: 77, y: 48, label: "Halo LED projectors", brand: "Lumora", price: 22500 },
  { x: 60, y: 78, label: "A/T tyres 285/70 R17", brand: "Ridgeline", price: 114000 },
  { x: 24, y: 72, label: "2\" lift + nitro shocks", brand: "TrailCore", price: 78500 },
  { x: 36, y: 44, label: "Satin wrap + ember stripe", brand: "Avero Films", price: 68000 },
];

export function FeaturedBuild() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20%" });
  const reduce = useReducedMotion();
  const [hover, setHover] = useState<number | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-6%", "6%"]);
  const total = HOTSPOTS.reduce((a, h) => a + h.price, 0);

  return (
    <section id="builds" className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="max-w-2xl">
          <Eyebrow>Featured build · Kochi</Eyebrow>
          <h2 className="disp mt-4 text-5xl leading-[0.95] sm:text-6xl">
            Every mod, <span className="grad-text">labelled.</span>
          </h2>
          <p className="mt-4 text-lg text-white/65">
            Finished builds show exactly what went in: part, brand, price and whether it is road-legal. Like it? Copy the
            spec and get quotes for your own.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-panel px-5 py-4">
          <p className="font-mono text-[11px] uppercase tracking-widest text-white/50">Parts shown</p>
          <p className="disp text-4xl">{inView ? <CountUp to={total} prefix="₹" /> : "₹0"}</p>
        </div>
      </Reveal>

      <div ref={ref} className="relative mt-10 aspect-[4/3] overflow-hidden rounded-3xl border border-white/10 sm:aspect-[16/9]">
        <motion.div style={{ y }} className="absolute -inset-y-[8%] inset-x-0">
          <Img photo={PHOTOS.offroad} sizes="(min-width:1280px) 1280px, 100vw" className="h-full w-full object-cover" />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-bg/70 via-transparent to-bg/20" />
        <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/50 px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest backdrop-blur">
          Sample build · Project Sandstorm
        </span>

        {HOTSPOTS.map((h, i) => (
          <motion.button
            key={h.label}
            type="button"
            aria-label={`${h.label}, ${h.brand}, ${inr(h.price)}`}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(null)}
            onClick={() => setHover(hover === i ? null : i)}
            initial={{ scale: 0, opacity: 0 }}
            animate={inView ? { scale: 1, opacity: 1 } : {}}
            transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.3 + i * 0.18 }}
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${h.x}%`, top: `${h.y}%` }}
          >
            <span className="absolute inset-0 animate-ping rounded-full bg-a2/60" />
            <span className="relative grid h-8 w-8 place-items-center rounded-full border-2 border-a2 bg-bg/80 text-xs font-bold text-a2 backdrop-blur">
              {i + 1}
            </span>
            <AnimatePresence>
              {(hover === i || (hover === null && inView && i === 0)) && (
                <motion.span
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.25 }}
                  className={`absolute top-10 w-52 rounded-xl border border-white/10 bg-[#121218]/95 p-3 text-left shadow-2xl backdrop-blur ${h.x > 60 ? "right-0" : "left-0"}`}
                >
                  <span className="block font-mono text-[10px] uppercase tracking-widest text-a2">{h.brand}</span>
                  <span className="mt-1 block text-sm font-semibold">{h.label}</span>
                  <span className="mt-1 block text-sm tabular-nums text-white/60">{inr(h.price)}</span>
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────────── Build of the Month ───────────────────────── */

const BOTM = [
  { city: "Kochi", name: "Project Sandstorm", car: "Overland 4x4 · satin khaki", shop: "Torque Theory Customs", likes: 2140, photo: PHOTOS.offroad },
  { city: "Bengaluru", name: "Silver Line", car: "Rear-engine coupe · OEM+ stance", shop: "Indiranagar Autohaus", likes: 1876, photo: PHOTOS.porsche },
  { city: "Chennai", name: "Lime Spark", car: "Hot hatch · gloss lime + ECR lights", shop: "OMR Wrap Lab", likes: 1652, photo: PHOTOS.mini },
  { city: "Coimbatore", name: "Ghat Runner", car: "Adventure bike · touring kit", shop: "Kovai Moto Garage", likes: 1489, photo: PHOTOS.bike },
];

export function BuildOfTheMonth() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (paused || reduce) return;
    const t = setTimeout(() => setI((n) => (n + 1) % BOTM.length), 6000);
    return () => clearTimeout(t);
  }, [i, paused, reduce]);
  const b = BOTM[i];

  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <Eyebrow>Build of the Month · November</Eyebrow>
          <h2 className="disp mt-4 text-5xl leading-[0.95] sm:text-6xl">
            Four territories. <span className="grad-text">One crown each.</span>
          </h2>
        </div>
        <div className="flex flex-wrap gap-2" role="tablist">
          {BOTM.map((t, n) => (
            <button
              key={t.city}
              role="tab"
              aria-selected={n === i}
              onClick={() => setI(n)}
              className={`relative overflow-hidden rounded-full border px-4 py-2 text-sm font-semibold transition ${
                n === i ? "border-a2/60 text-white" : "border-white/15 text-white/60 hover:text-white"
              }`}
            >
              {n === i && <motion.span layoutId="botm-pill" className="absolute inset-0 -z-10 bg-a2/15" transition={{ duration: 0.5, ease: EASE }} />}
              {t.city}
              {n === i && !paused && !reduce && (
                <motion.span
                  key={`bar-${i}`}
                  className="absolute bottom-0 left-0 h-[2px] bg-a2"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 6, ease: "linear" }}
                />
              )}
            </button>
          ))}
        </div>
      </Reveal>

      <div className="group relative mt-10 aspect-[4/5] overflow-hidden rounded-3xl border border-white/10 sm:aspect-[16/8]">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={b.city}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: EASE }}
          >
            <Img photo={b.photo} sizes="(min-width:1280px) 1280px, 100vw" className="h-full w-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105" />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/50 px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest backdrop-blur">
          Sample builds
        </span>

        <AnimatePresence mode="wait">
          <motion.div
            key={b.city}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.15 }}
            className="absolute inset-x-5 bottom-5 flex flex-col gap-4 sm:inset-x-8 sm:bottom-8 sm:flex-row sm:items-end sm:justify-between"
          >
            <div>
              <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-a2">
                <span className="text-base">♛</span> {b.city} · Build of the Month
              </p>
              <h3 className="disp mt-2 text-4xl sm:text-6xl">{b.name}</h3>
              <p className="mt-1 text-white/70">{b.car} · by {b.shop}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 text-sm backdrop-blur">
                ♥ <span className="tabular-nums">{b.likes.toLocaleString("en-IN")}</span> votes
              </span>
              <Link href="/jobs/new" className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-bg transition hover:bg-a2">
                Build like this →
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ───────────────────────── Designers & rewards ───────────────────────── */

export function Designers() {
  const reduce = useReducedMotion();
  const [liked, setLiked] = useState(false);
  const [credits, setCredits] = useState(1240);
  const like = () => {
    if (!liked) setCredits((c) => c + 40);
    else setCredits((c) => c - 40);
    setLiked(!liked);
  };

  return (
    <section id="designers" className="relative overflow-hidden py-24">
      <div className="absolute right-0 top-1/2 -z-10 h-[600px] w-[600px] -translate-y-1/2 rounded-full bg-a1/10 blur-[140px]" />
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
        <Reveal>
          <Eyebrow>For 3D designers</Eyebrow>
          <h2 className="disp mt-4 text-5xl leading-[0.95] sm:text-6xl">
            Render it. Get liked. <span className="grad-text">Get paid.</span>
          </h2>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-white/65">
            Pick open jobs, render the owner&apos;s actual vehicle with the mods they asked for, and earn reward credits
            every time a customer likes your work. Top designers in each territory get featured.
          </p>
          <ul className="mt-8 grid gap-3 text-white/80 sm:grid-cols-2">
            {["+40 credits per customer like", "Bonus when a shop builds your render", "Portfolio that ranks by city", "Monthly leaderboard per territory"].map((t, i) => (
              <Reveal key={t} delay={0.1 + i * 0.06} y={12}>
                <li className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-cy/15 text-[10px] text-cy">✓</span>
                  {t}
                </li>
              </Reveal>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="relative mx-auto max-w-md">
            <motion.div
              whileHover={reduce ? undefined : { rotateY: -6, rotateX: 4 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="overflow-hidden rounded-3xl border border-white/10 bg-panel shadow-[0_40px_100px_-20px_rgba(0,0,0,.8)] [transform-style:preserve-3d]"
            >
              <div className="relative">
                <Img photo={PHOTOS.ferrari} sizes="450px" className="aspect-[4/3] w-full object-cover" />
                <span className="absolute left-3 top-3 rounded-md bg-black/60 px-2 py-1 font-mono text-[10px] uppercase tracking-widest backdrop-blur">Render v3 · gloss red + carbon</span>
              </div>
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-a1 to-a2 text-sm font-bold text-bg">AR</span>
                  <div>
                    <p className="font-semibold">Ananya R.</p>
                    <p className="text-xs text-white/50">Wrap &amp; livery designer · Bengaluru</p>
                  </div>
                </div>
                <motion.button
                  type="button"
                  onClick={like}
                  whileTap={{ scale: 0.85 }}
                  aria-pressed={liked}
                  className={`grid h-11 w-11 place-items-center rounded-full border text-xl transition ${liked ? "border-a1 bg-a1 text-white" : "border-white/20 text-white/70 hover:border-a1 hover:text-a1"}`}
                >
                  <motion.span key={String(liked)} initial={{ scale: 0.4 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 12 }}>
                    ♥
                  </motion.span>
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              layout
              className="absolute -bottom-6 -left-4 rounded-2xl border border-white/10 bg-[#17171f]/95 px-5 py-3 shadow-2xl backdrop-blur sm:-left-10"
            >
              <p className="font-mono text-[10px] uppercase tracking-widest text-white/50">Reward credits</p>
              <AnimatePresence mode="popLayout">
                <motion.p
                  key={credits}
                  initial={{ y: 12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -12, opacity: 0 }}
                  className="disp text-3xl tabular-nums text-cy"
                >
                  {credits.toLocaleString("en-IN")}
                </motion.p>
              </AnimatePresence>
            </motion.div>
            <p className="mt-10 text-center text-xs text-white/40">Tap the heart to try it</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ───────────────────────── Shops ───────────────────────── */

const PERKS = [
  { t: "Qualified leads", d: "Every job comes with photos, budget and the exact render the owner picked." },
  { t: "Escrow, not chasing", d: "Owners pay into KSTM Pay upfront. You get paid when they approve the build." },
  { t: "Your work, showcased", d: "Finished builds credit your shop on every labelled mod." },
  { t: "Win Build of the Month", d: "Top build in each territory gets featured to the whole city." },
];

export function Shops() {
  return (
    <section id="shops" className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <div className="relative overflow-hidden rounded-[2rem] border border-[#3a2216] bg-gradient-to-br from-[#1a0d08] via-[#2b1108] to-[#0c1a18] p-6 sm:p-12 lg:p-16">
        <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(115deg,transparent_0_60px,rgba(255,255,255,.025)_60px_62px)]" />
        <div className="relative grid items-center gap-10 lg:grid-cols-[1.1fr_.9fr]">
          <Reveal>
            <Eyebrow>For detailing &amp; mod shops</Eyebrow>
            <h2 className="disp mt-4 text-5xl leading-[0.95] sm:text-6xl">Stop chasing DMs. Start winning bids.</h2>
            <p className="mt-5 max-w-lg text-lg text-white/70">
              List your shop free, bid on jobs in your city, and turn every finished car into a portfolio piece that sells
              the next one.
            </p>
            <Link href="/login" className="mt-8 inline-block rounded-xl bg-gradient-to-r from-a1 to-a2 px-6 py-3.5 font-semibold text-bg transition hover:brightness-110">
              List your shop →
            </Link>
          </Reveal>
          <div className="grid gap-3 sm:grid-cols-2">
            {PERKS.map((p, i) => (
              <Reveal key={p.t} delay={i * 0.08}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="h-full rounded-2xl border border-white/10 bg-black/35 p-5 transition-colors hover:border-a2/40"
                >
                  <p className="font-bold">{p.t}</p>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">{p.d}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Final CTA ───────────────────────── */

export function FinalCta() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-12%", "12%"]);
  return (
    <section ref={ref} className="relative isolate overflow-hidden py-32 sm:py-44">
      <motion.div style={{ y }} className="absolute -inset-y-[15%] inset-x-0 -z-10">
        <Img photo={PHOTOS.forest} sizes="100vw" className="h-full w-full object-cover" />
      </motion.div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-bg via-bg/60 to-bg" />
      <Reveal className="mx-auto max-w-3xl px-4 text-center">
        <h2 className="disp text-5xl leading-[0.95] sm:text-7xl">
          Your build <span className="grad-text">starts here.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg text-white/70">Post your car or bike for free. Designers render it, shops quote it, and you pick the one you love.</p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link href="/jobs/new" className="rounded-xl bg-gradient-to-r from-a1 to-a2 px-7 py-4 font-semibold text-bg shadow-[0_12px_40px_-10px_rgba(255,80,40,.8)] transition hover:brightness-110">
            Post my ride →
          </Link>
          <Link href="/jobs" className="rounded-xl border border-white/20 bg-white/5 px-7 py-4 font-semibold backdrop-blur transition hover:bg-white/10">
            Browse open jobs
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
