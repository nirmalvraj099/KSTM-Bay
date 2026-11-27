import type { Metadata } from "next";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { SpinViewer } from "@/features/spin/SpinViewer";
import { DEMO_AI_SET, DEMO_PHOTO_SET } from "@/features/spin/demo-sets";

export const metadata: Metadata = {
  title: "360° spin viewer · KSTM Bay",
  description: "Prototype of the 360° spin viewer for AI renders and shop photo sets.",
};

const PHASES = [
  {
    n: "01",
    tag: "Now",
    title: "AI multi-angle renders",
    text: "6 to 8 consistent views of the owner's car with the mods applied, cross-faded into a swipeable spin. Every job gets one.",
    tone: "text-a2 border-a2/40 bg-a2/10",
  },
  {
    n: "02",
    tag: "Next",
    title: "Shop turntable photos",
    text: "Shops shoot 24 to 36 photos (or a turntable video we cut into frames) of the finished build. Shown with a Real build badge.",
    tone: "text-cy border-cy/40 bg-cy/10",
  },
  {
    n: "03",
    tag: "Later",
    title: "Real 3D for hero cars",
    text: "Full 3D models for 3 to 5 popular cars (Thar, Creta, Swift...) as a premium feature with free orbit and zoom.",
    tone: "text-white/70 border-white/20 bg-white/5",
  },
];

export default function SpinPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-20">
      <SiteHeader />

      <div className="mt-10 max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-a2">Prototype · 360° spin</p>
        <h1 className="disp mt-3 text-4xl leading-[0.95] sm:text-6xl">
          Walk round the build <span className="grad-text">before it&apos;s built.</span>
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-white/65">
          Drag or swipe to turn the car. Arrow keys work too. Both viewers below run the same component: one with an 8-view
          AI set, one with a 36-frame shop photo set.
        </p>
        <p className="mt-4 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/60">
          The cars here are simple placeholder renders, not real builds.
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section>
          <SpinViewer set={DEMO_AI_SET} />
          <h2 className="mt-4 text-lg font-bold">Phase 1 · AI render, 8 views</h2>
          <p className="mt-1 text-sm text-white/60">
            Few frames, so neighbouring views blend while you drag and it settles on a real view when you let go. Tap a view
            to jump to it.
          </p>
        </section>
        <section>
          <SpinViewer set={DEMO_PHOTO_SET} />
          <h2 className="mt-4 text-lg font-bold">Phase 2 · Shop photos, 36 frames</h2>
          <p className="mt-1 text-sm text-white/60">
            Dense set, so frames flip like a turntable video. Every 4th frame loads first, so you can spin before the whole set
            is in.
          </p>
        </section>
      </div>

      <div className="mt-16 grid gap-4 md:grid-cols-3">
        {PHASES.map((p) => (
          <div key={p.n} className="rounded-2xl border border-white/10 bg-panel p-5">
            <div className="flex items-center justify-between">
              <span className="disp text-4xl text-transparent [-webkit-text-stroke:1.2px_#3a3a48]">{p.n}</span>
              <span className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-widest ${p.tone}`}>
                {p.tag}
              </span>
            </div>
            <h3 className="mt-3 font-bold">{p.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-white/60">{p.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
