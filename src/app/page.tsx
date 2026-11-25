import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { SiteHeader } from "@/components/ui/SiteHeader";

const steps = [
  { n: "01", title: "Post your car", text: "Snap your car, set a budget and tell us the vibe: wraps, rims, body kits, lighting, interiors or the full build." },
  { n: "02", title: "Compare real renders", text: "Verified shops and creators send renders of your car with itemised quotes, timelines and RTO checks." },
  { n: "03", title: "Pick it. Pay safe. Drive it.", text: "Choose your favourite, pay into KSTM Pay escrow, and the shop gets paid only when you approve the finished car." },
];

const ecosystem = [
  ["Renders", "See your build before you spend a rupee."],
  ["Pro", "Verified shops with proven builds."],
  ["Creators", "Freelance 3D designers, paid per render."],
  ["Parts", "Genuine rims, kits, wraps and lights."],
  ["Pay", "Escrow that protects both sides."],
  ["Legal", "RTO-compliance check on every mod."],
  ["Meets", "Weekend meets from ECR to Munnar."],
];

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4">
      <SiteHeader />

      <main className="flex flex-col gap-24 py-16">
        <section className="flex max-w-2xl flex-col gap-6">
          <span className="w-fit rounded-full border border-line px-3 py-1 font-mono text-xs uppercase tracking-widest text-mut">
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-cy" />Kochi · Chennai · Bengaluru · Coimbatore
          </span>
          <h1 className="disp text-5xl leading-[0.95] sm:text-7xl">
            Post your car. Get <span className="grad-text">competing</span> mods.
          </h1>
          <p className="text-lg text-mut">
            Upload a photo, describe your dream build, and let the best detailing shops and 3D designers
            across South India send you real renders with real prices. Pick the one you love.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/jobs/new" className="rounded-lg bg-gradient-to-r from-a1 to-a2 px-5 py-3 font-semibold text-bg">Post my car, it&apos;s free →</Link>
            <Link href="/jobs" className="rounded-lg border border-line px-5 py-3 font-semibold hover:bg-panel">See open jobs</Link>
          </div>
        </section>

        <section className="flex flex-col gap-8">
          <p className="font-mono text-xs uppercase tracking-widest text-a2">How KSTM Bay works</p>
          <h2 className="disp text-4xl sm:text-5xl">Three steps from stock to <span className="grad-text">signature.</span></h2>
          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="relative overflow-hidden rounded-2xl border border-line bg-panel p-6">
                <span className="disp absolute -top-3 right-4 text-8xl text-transparent [-webkit-text-stroke:1.5px_#2e2e3a]">{s.n}</span>
                <h3 className="mt-16 text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm text-mut">{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-8">
          <p className="font-mono text-xs uppercase tracking-widest text-a2">The KSTM ecosystem</p>
          <h2 className="disp text-4xl sm:text-5xl">Everything custom, <span className="grad-text">one bay.</span></h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {ecosystem.map(([name, text]) => (
              <div key={name} className="rounded-xl border border-line bg-panel p-4">
                <p className="disp text-xs text-mut">KSTM</p>
                <p className="disp text-xl">{name}</p>
                <p className="mt-3 text-xs text-mut">{text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="flex flex-col items-center justify-between gap-3 border-t border-line py-8 text-sm text-mut sm:flex-row">
        <Logo size={28} />
        <span>Built for custom culture in South India</span>
        <span>© 2026 KSTM Bay</span>
      </footer>
    </div>
  );
}
