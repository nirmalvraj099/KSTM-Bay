"use client";

import Link from "next/link";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { EASE, Img } from "./motion";
import { PHOTOS } from "./photos";

/** Transparent header that turns into a frosted bar once the page scrolls. */
export function HomeHeader() {
  const { scrollY } = useScroll();
  const [solid, setSolid] = useState(false);
  useMotionValueEvent(scrollY, "change", (v) => setSolid(v > 24));
  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        solid ? "border-b border-white/10 bg-bg/75 backdrop-blur-xl" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" aria-label="KSTM Bay home"><Logo size={36} /></Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-white/70 md:flex">
          <a href="#how" className="transition hover:text-white">How it works</a>
          <a href="#builds" className="transition hover:text-white">Builds</a>
          <a href="#designers" className="transition hover:text-white">Designers</a>
          <a href="#shops" className="transition hover:text-white">For shops</a>
          <Link href="/jobs" className="transition hover:text-white">Open jobs</Link>
        </nav>
        <div className="flex items-center gap-2 text-sm">
          <Link href="/login" className="hidden rounded-lg px-4 py-2 font-medium text-white/80 transition hover:bg-white/10 hover:text-white sm:inline-block">Log in</Link>
          <Link href="/jobs/new" className="rounded-lg bg-gradient-to-r from-a1 to-a2 px-4 py-2 font-semibold text-bg shadow-[0_8px_30px_-8px_rgba(255,80,40,.7)] transition hover:brightness-110">
            Post a job
          </Link>
        </div>
      </div>
    </header>
  );
}

const HEADLINE = ["Post", "your", "ride.", "Get", "competing", "mods."];

const BIDS = [
  { shop: "Torque Theory Customs", city: "Edappally", price: 184000, days: 12, rating: 4.8 },
  { shop: "Westside Wraps", city: "Kakkanad", price: 171500, days: 9, rating: 4.7 },
  { shop: "Malabar Motorworks", city: "Aluva", price: 196000, days: 14, rating: 4.9 },
];

const inr = (n: number) => "₹" + n.toLocaleString("en-IN");

/** Glass card where bids drop in one after another, on a loop. */
function LiveJobCard() {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(reduce ? BIDS.length : 0);
  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setShown((n) => (n >= BIDS.length + 2 ? 0 : n + 1)), 1600);
    return () => clearInterval(t);
  }, [reduce]);
  const visible = BIDS.slice(0, Math.min(shown, BIDS.length));
  const best = visible.length ? Math.min(...visible.map((b) => b.price)) : null;

  return (
    <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#101016]/70 p-5 shadow-[0_40px_120px_-20px_rgba(0,0,0,.9)] backdrop-blur-2xl">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-white/50">Job #KB-2611 · Kochi</p>
          <h3 className="mt-1 text-lg font-bold">Thar LX · overland street build</h3>
          <p className="text-sm text-white/60">Satin wrap, 2&quot; lift, A/T tyres, light bar</p>
        </div>
        <span className="flex items-center gap-2 rounded-full border border-cy/30 bg-cy/10 px-2.5 py-1 text-xs font-semibold text-cy">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cy opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cy" />
          </span>
          Live
        </span>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl">
        <Img photo={PHOTOS.thar} sizes="420px" className="h-36 w-full object-cover" eager />
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-white/50">
        <span>Budget ₹1.5L – ₹2L</span>
        <span>{visible.length} of 3 bids</span>
      </div>

      <ul className="mt-2 flex min-h-[198px] flex-col gap-2">
        <AnimatePresence initial={false}>
          {visible.map((b) => (
            <motion.li
              key={b.shop}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.25 } }}
              transition={{ duration: 0.6, ease: EASE }}
              className={`flex items-center justify-between rounded-xl border px-3 py-2.5 ${
                b.price === best ? "border-a2/60 bg-a2/[0.07]" : "border-white/10 bg-white/[0.03]"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 text-xs font-bold">
                  {b.shop.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                </span>
                <div>
                  <p className="flex items-center gap-1.5 text-sm font-semibold">
                    {b.shop}
                    <span className="grid h-3.5 w-3.5 place-items-center rounded-full bg-cy text-[9px] font-black text-bg">✓</span>
                  </p>
                  <p className="text-xs text-white/50">{b.city} · ★ {b.rating} · {b.days} days</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold tabular-nums">{inr(b.price)}</p>
                {b.price === best && <p className="text-[10px] font-bold uppercase tracking-wider text-a2">Best quote</p>}
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
        {visible.length < BIDS.length && (
          <li className="flex items-center gap-2 px-1 pt-1 text-xs text-white/40">
            <span className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-white/40"
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </span>
            Shops are quoting…
          </li>
        )}
      </ul>
    </div>
  );
}

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "22%"]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.05, reduce ? 1.05 : 1.18]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "35%"]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} className="relative isolate flex min-h-[100svh] items-center overflow-hidden pt-24 pb-16">
      <motion.div className="absolute inset-0 -z-10" style={{ y: imgY, scale: imgScale }}>
        <motion.div
          className="h-full w-full"
          initial={reduce ? false : { scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2.4, ease: EASE }}
        >
          <Img photo={PHOTOS.hero} className="h-full w-full object-cover object-[60%_center]" eager />
        </motion.div>
      </motion.div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-bg via-bg/80 to-bg/10" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-bg via-transparent to-bg/40" />
      <div className="absolute -left-40 bottom-0 -z-10 h-[500px] w-[500px] rounded-full bg-cy/10 blur-[120px]" />

      <motion.div style={{ y: contentY, opacity: fade }} className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.15fr_.85fr]">
        <div>
          <motion.span
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-white/80 backdrop-blur"
          >
            <span className="h-2 w-2 rounded-full bg-cy shadow-[0_0_12px_var(--cy)]" />
            Kochi · Bengaluru · Chennai · Coimbatore
          </motion.span>

          <h1 className="disp mt-6 text-[13vw] leading-[0.9] sm:text-7xl lg:text-[88px]">
            {HEADLINE.map((w, i) => (
              <span key={i} className="inline-block overflow-hidden pb-2 align-bottom">
                <motion.span
                  className={`inline-block pr-[0.22em] ${w === "competing" ? "grad-text" : ""}`}
                  initial={reduce ? false : { y: "110%", rotate: 4 }}
                  animate={{ y: "0%", rotate: 0 }}
                  transition={{ duration: 1, ease: EASE, delay: 0.35 + i * 0.08 }}
                >
                  {w}
                </motion.span>
                {i === 2 && <br />}
              </span>
            ))}
          </h1>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.9 }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-white/75"
          >
            South India&apos;s marketplace for custom cars and bikes. 3D designers render your build, verified shops bid
            with real quotes, and your finished ride gets showcased with every mod labelled.
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 1.05 }}
            className="mt-9 flex flex-wrap gap-3"
          >
            <Link
              href="/jobs/new"
              className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-a1 to-a2 px-6 py-3.5 font-semibold text-bg shadow-[0_12px_40px_-10px_rgba(255,80,40,.8)]"
            >
              <span className="relative z-10">Post my ride, it&apos;s free →</span>
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </Link>
            <a href="#builds" className="rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 font-semibold backdrop-blur transition hover:border-white/40 hover:bg-white/10">
              See builds
            </a>
          </motion.div>
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 40, rotateX: 12 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 1.2, ease: EASE, delay: 0.7 }}
          className="relative hidden justify-end [perspective:1200px] lg:flex"
        >
          <motion.div animate={reduce ? undefined : { y: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
            <LiveJobCard />
          </motion.div>
          <motion.div
            initial={reduce ? false : { opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 1.6 }}
            className="absolute -left-4 bottom-10 flex items-center gap-3 rounded-2xl border border-white/10 bg-[#17171f]/90 px-4 py-3 shadow-2xl backdrop-blur-xl"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-a1/15 text-lg text-a1">♥</span>
            <div className="text-sm">
              <p className="font-semibold">Render liked by owner</p>
              <p className="text-xs text-white/50">Ananya R. earned +40 credits</p>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.a
        href="#stats"
        aria-label="Scroll down"
        style={{ opacity: fade }}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-white/50 sm:flex"
      >
        Scroll
        <span className="relative h-10 w-[1px] overflow-hidden bg-white/15">
          <motion.span
            className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-transparent to-a2"
            animate={reduce ? undefined : { y: [-16, 40] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
      </motion.a>
    </section>
  );
}
