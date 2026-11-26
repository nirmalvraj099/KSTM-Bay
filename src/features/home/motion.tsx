"use client";

/* eslint-disable @next/next/no-img-element -- Wikimedia images are served from their own CDN at fixed widths. */
import { animate, motion, useInView, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { Photo } from "./photos";

export const EASE = [0.16, 1, 0.3, 1] as const;

/** Fades and lifts its children in the first time they scroll into view. */
export function Reveal({ delay = 0, y = 28, className, children, ...rest }: HTMLMotionProps<"div"> & { delay?: number; y?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, ease: EASE, delay }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/** Counts from 0 to `to` when scrolled into view. */
export function CountUp({ to, prefix = "", suffix = "", duration = 1.6, format = true }: { to: number; prefix?: string; suffix?: string; duration?: number; format?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (reduce) return setVal(to);
    const c = animate(0, to, { duration, ease: EASE, onUpdate: (v) => setVal(Math.round(v)) });
    return () => c.stop();
  }, [inView, to, duration, reduce]);
  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {format ? val.toLocaleString("en-IN") : val}
      {suffix}
    </span>
  );
}

/** Responsive photo with a soft fade-in once it has loaded. */
export function Img({ photo, className = "", sizes = "100vw", eager = false }: { photo: Photo; className?: string; sizes?: string; eager?: boolean }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <img
      src={photo.src}
      srcSet={`${photo.small} 960w, ${photo.src} 1920w`}
      sizes={sizes}
      alt={photo.alt}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : "auto"}
      decoding="async"
      onLoad={() => setLoaded(true)}
      ref={(el) => {
        if (el?.complete && el.naturalWidth) setLoaded(true);
      }}
      className={`${className} transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}
    />
  );
}
