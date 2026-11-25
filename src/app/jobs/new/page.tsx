"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { DemoBanner } from "@/features/marketplace/DemoBanner";
import { createJob, makeTitle } from "@/features/marketplace/jobs-repo";
import {
  BIDDING_DAYS,
  BUDGET_PRESETS,
  CITIES,
  MAX_PHOTOS,
  MOD_TYPES,
  formatINR,
  modLabel,
} from "@/features/marketplace/options";
import { shrinkPhoto } from "@/features/marketplace/photos";
import { JobDraft } from "@/features/marketplace/types";

type Form = {
  make: string;
  model: string;
  year: string;
  photos: string[];
  modTypes: string[];
  description: string;
  city: string;
  budgetMin: string;
  budgetMax: string;
  biddingDays: number;
};

const STEPS = [
  { title: "Your car", fields: ["make", "model", "year", "photos"] },
  { title: "The mods", fields: ["modTypes", "description"] },
  { title: "City & budget", fields: ["city", "budgetMin", "budgetMax"] },
  { title: "Review", fields: [] },
] as const;

const input = "w-full rounded-lg border border-line bg-panel px-3 py-2.5 outline-none focus:border-a2";

function toDraft(f: Form) {
  return {
    ...f,
    year: Number(f.year) || 0,
    budgetMin: Number(f.budgetMin) || 0,
    budgetMax: Number(f.budgetMax) || 0,
  };
}

export default function PostJobPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState<Form>({
    make: "",
    model: "",
    year: "",
    photos: [],
    modTypes: [],
    description: "",
    city: "",
    budgetMin: "",
    budgetMax: "",
    biddingDays: 7,
  });

  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setF((p) => ({ ...p, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  /** Errors for the given fields only (so step 1 doesn't complain about step 3). */
  function check(fields: readonly string[]) {
    const res = JobDraft.safeParse(toDraft(f));
    const errs: Record<string, string> = {};
    if (!res.success) {
      for (const issue of res.error.issues) {
        const k = String(issue.path[0]);
        if (fields.includes(k) && !errs[k]) errs[k] = issue.message;
      }
    }
    setErrors(errs);
    return errs;
  }

  async function addPhotos(files: FileList | null) {
    if (!files) return;
    const room = MAX_PHOTOS - f.photos.length;
    const picked = Array.from(files).filter((x) => x.type.startsWith("image/")).slice(0, room);
    try {
      const urls = await Promise.all(picked.map((x) => shrinkPhoto(x)));
      set("photos", [...f.photos, ...urls]);
    } catch {
      setErrors((e) => ({ ...e, photos: "One of those photos couldn't be read. Try a JPG or PNG." }));
    }
  }

  async function publish() {
    const errs = check(STEPS.flatMap((s) => s.fields));
    const bad = STEPS.findIndex((s) => s.fields.some((k) => errs[k]));
    if (bad !== -1) {
      setStep(bad);
      return;
    }
    setBusy(true);
    const job = await createJob(JobDraft.parse(toDraft(f)));
    router.push(`/jobs/${job.id}?posted=1`);
  }

  const next = () => {
    if (Object.keys(check(STEPS[step].fields)).length === 0) setStep(step + 1);
  };
  const draft = toDraft(f);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16">
      <SiteHeader />
      <DemoBanner />
      <main className="mx-auto mt-10 max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-widest text-a2">Post a job</p>
        <h1 className="disp mt-2 text-4xl sm:text-5xl">Get <span className="grad-text">competing</span> mods.</h1>

        <ol className="mt-8 grid grid-cols-4 gap-2" aria-label="Steps">
          {STEPS.map((s, i) => (
            <li key={s.title}>
              <button
                type="button"
                disabled={i > step}
                onClick={() => setStep(i)}
                className="flex w-full flex-col gap-2 text-left disabled:cursor-default"
                aria-current={i === step ? "step" : undefined}
              >
                <span className={`h-1 rounded-full ${i <= step ? "bg-gradient-to-r from-a1 to-a2" : "bg-line"}`} />
                <span className={`text-xs sm:text-sm ${i === step ? "font-semibold" : "text-mut"}`}>
                  <span className="font-mono">0{i + 1}</span> {s.title}
                </span>
              </button>
            </li>
          ))}
        </ol>

        <section className="mt-8 flex flex-col gap-6 rounded-2xl border border-line bg-panel/50 p-5 sm:p-7">
          {step === 0 && (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Make" error={errors.make}>
                  <input className={input} value={f.make} onChange={(e) => set("make", e.target.value)} placeholder="Hyundai" />
                </Field>
                <Field label="Model" error={errors.model}>
                  <input className={input} value={f.model} onChange={(e) => set("model", e.target.value)} placeholder="Creta" />
                </Field>
                <Field label="Year" error={errors.year}>
                  <input className={input} inputMode="numeric" value={f.year} onChange={(e) => set("year", e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="2022" />
                </Field>
              </div>
              <Field label={`Photos (${f.photos.length}/${MAX_PHOTOS})`} hint="Front, side and rear work best. Shops draw their renders on these." error={errors.photos}>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                  {f.photos.map((src, i) => (
                    <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border border-line">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt={`Car photo ${i + 1}`} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => set("photos", f.photos.filter((_, j) => j !== i))}
                        className="absolute right-1 top-1 rounded-md bg-bg/80 px-1.5 text-xs"
                        aria-label={`Remove photo ${i + 1}`}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  {f.photos.length < MAX_PHOTOS && (
                    <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-line text-mut hover:border-a2 hover:text-a2">
                      <span className="text-2xl">+</span>
                      <span className="text-xs">Add photos</span>
                      <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => { addPhotos(e.target.files); e.target.value = ""; }} />
                    </label>
                  )}
                </div>
              </Field>
            </>
          )}

          {step === 1 && (
            <>
              <Field label="What do you want done?" hint="Pick everything you're open to." error={errors.modTypes}>
                <div className="grid gap-2 sm:grid-cols-3">
                  {MOD_TYPES.map((m) => {
                    const on = f.modTypes.includes(m.id);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        aria-pressed={on}
                        onClick={() => set("modTypes", on ? f.modTypes.filter((x) => x !== m.id) : [...f.modTypes, m.id])}
                        className={`rounded-xl border p-3 text-left transition ${on ? "border-a1 bg-a1/10" : "border-line hover:border-mut"}`}
                      >
                        <span className="block font-semibold">{on ? "✓ " : ""}{m.label}</span>
                        <span className="block text-xs text-mut">{m.hint}</span>
                      </button>
                    );
                  })}
                </div>
              </Field>
              <Field label="Describe the vibe" hint="Colours, reference builds, what you'll use the car for." error={errors.description}>
                <textarea
                  className={`${input} min-h-32`}
                  value={f.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Nardo grey wrap, black 18 inch rims, smoked tail lamps. Daily driver in Chennai so it has to handle the rain."
                />
                <span className="text-right text-xs text-mut">{f.description.trim().length}/1500</span>
              </Field>
            </>
          )}

          {step === 2 && (
            <>
              <Field label="City" hint="Shops near you see your job first." error={errors.city}>
                <select className={input} value={f.city} onChange={(e) => set("city", e.target.value)}>
                  <option value="">Choose a city</option>
                  {CITIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Budget" hint="Pick a range or type your own." error={errors.budgetMin || errors.budgetMax}>
                <div className="flex flex-wrap gap-2">
                  {BUDGET_PRESETS.map((b) => {
                    const on = f.budgetMin === String(b.min) && f.budgetMax === String(b.max);
                    return (
                      <button
                        key={b.label}
                        type="button"
                        aria-pressed={on}
                        onClick={() => { set("budgetMin", String(b.min)); set("budgetMax", String(b.max)); }}
                        className={`rounded-full border px-3 py-1.5 text-sm ${on ? "border-a1 bg-a1/10" : "border-line hover:border-mut"}`}
                      >
                        {b.label}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 rounded-lg border border-line bg-panel px-3">
                    <span className="text-mut">Min ₹</span>
                    <input className="w-full bg-transparent py-2.5 outline-none" inputMode="numeric" value={f.budgetMin} onChange={(e) => set("budgetMin", e.target.value.replace(/\D/g, ""))} placeholder="25000" />
                  </label>
                  <label className="flex items-center gap-2 rounded-lg border border-line bg-panel px-3">
                    <span className="text-mut">Max ₹</span>
                    <input className="w-full bg-transparent py-2.5 outline-none" inputMode="numeric" value={f.budgetMax} onChange={(e) => set("budgetMax", e.target.value.replace(/\D/g, ""))} placeholder="75000" />
                  </label>
                </div>
              </Field>
              <Field label="Keep bidding open for">
                <div className="flex flex-wrap gap-2">
                  {BIDDING_DAYS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      aria-pressed={f.biddingDays === d}
                      onClick={() => set("biddingDays", d)}
                      className={`rounded-full border px-3 py-1.5 text-sm ${f.biddingDays === d ? "border-a1 bg-a1/10" : "border-line hover:border-mut"}`}
                    >
                      {d} days
                    </button>
                  ))}
                </div>
              </Field>
            </>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-5">
              {f.photos.length > 0 && (
                <div className="flex gap-2 overflow-x-auto">
                  {f.photos.map((src, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={src} alt="" className="h-24 w-32 flex-none rounded-lg object-cover" />
                  ))}
                </div>
              )}
              <h2 className="text-xl font-bold">{makeTitle({ ...draft, modTypes: f.modTypes })}</h2>
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <Row k="Car" v={`${f.make} ${f.model} (${f.year})`} />
                <Row k="City" v={f.city} />
                <Row k="Budget" v={`${formatINR(draft.budgetMin)} – ${formatINR(draft.budgetMax)}`} />
                <Row k="Bidding open" v={`${f.biddingDays} days`} />
                <Row k="Mods" v={f.modTypes.map(modLabel).join(", ")} />
              </dl>
              <p className="whitespace-pre-line rounded-lg border border-line p-3 text-sm text-mut">{f.description}</p>
              <p className="flex items-start gap-2 text-sm text-mut">
                <span className="mt-1.5 inline-block h-2 w-2 flex-none rounded-full bg-cy" />
                Verified shops in {f.city} reply with renders and itemised quotes. You pay nothing until you pick one.
              </p>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-line pt-5">
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className={`rounded-lg border border-line px-4 py-2 font-medium hover:bg-panel ${step === 0 ? "invisible" : ""}`}
            >
              ← Back
            </button>
            {step < STEPS.length - 1 ? (
              <button type="button" onClick={next} className="rounded-lg bg-gradient-to-r from-a1 to-a2 px-5 py-2.5 font-semibold text-bg">
                Continue →
              </button>
            ) : (
              <button type="button" disabled={busy} onClick={publish} className="rounded-lg bg-gradient-to-r from-a1 to-a2 px-5 py-2.5 font-semibold text-bg disabled:opacity-60">
                {busy ? "Publishing…" : "Publish job"}
              </button>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-semibold">{label}</span>
      {hint && <span className="-mt-1 text-sm text-mut">{hint}</span>}
      {children}
      {error && <span role="alert" className="text-sm text-a1">{error}</span>}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="font-mono text-xs uppercase tracking-widest text-mut">{k}</dt>
      <dd className="mt-0.5 font-medium">{v}</dd>
    </div>
  );
}
