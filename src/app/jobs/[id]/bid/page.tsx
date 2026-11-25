"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { BidDraft, MAX_RENDERS, quoteTotal } from "@/features/marketplace/bids";
import { getMyBid, getMyShop, placeBid } from "@/features/marketplace/bids-repo";
import { DemoBanner } from "@/features/marketplace/DemoBanner";
import { CarPhoto } from "@/features/marketplace/JobCard";
import { getJob } from "@/features/marketplace/jobs-repo";
import { CITIES, formatINR, modLabel } from "@/features/marketplace/options";
import { shrinkPhoto } from "@/features/marketplace/photos";
import { RenderImage } from "@/features/marketplace/RenderImage";
import { renderPresetsFor } from "@/features/marketplace/renders";
import type { Job } from "@/features/marketplace/types";

type Line = { label: string; amount: string };
type Form = { shopName: string; shopCity: string; renders: string[]; lines: Line[]; daysEstimate: string; notes: string };

const input = "w-full rounded-lg border border-line bg-panel px-3 py-2.5 outline-none focus:border-a2";

function toDraft(f: Form) {
  return {
    ...f,
    lines: f.lines.map((l) => ({ label: l.label, amount: Number(l.amount) || 0 })),
    daysEstimate: Number(f.daysEstimate) || 0,
  };
}

export default function PlaceBidPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [job, setJob] = useState<Job | null | undefined>(undefined);
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState<Form>({ shopName: "", shopCity: "", renders: [], lines: [{ label: "", amount: "" }], daysEstimate: "", notes: "" });

  useEffect(() => {
    getJob(id).then((j) => {
      setJob(j);
      if (!j) return;
      const mine = getMyBid(j.id);
      const shop = getMyShop();
      if (mine) {
        setEditing(true);
        setF({
          shopName: mine.shop.name,
          shopCity: mine.shop.city,
          renders: mine.renders,
          lines: mine.lines.map((l) => ({ label: l.label, amount: String(l.amount) })),
          daysEstimate: String(mine.daysEstimate),
          notes: mine.notes,
        });
      } else {
        // Start with one quote line per mod the owner asked for.
        setF((p) => ({
          ...p,
          shopName: shop?.name ?? "",
          shopCity: shop?.city ?? j.city,
          lines: j.modTypes.map((m) => ({ label: modLabel(m), amount: "" })),
        }));
      }
    });
  }, [id]);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setF((p) => ({ ...p, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };
  const setLine = (i: number, patch: Partial<Line>) => set("lines", f.lines.map((l, j) => (j === i ? { ...l, ...patch } : l)));

  async function addRenders(files: FileList | null) {
    if (!files) return;
    const room = MAX_RENDERS - f.renders.length;
    const picked = Array.from(files).filter((x) => x.type.startsWith("image/")).slice(0, room);
    try {
      const urls = await Promise.all(picked.map((x) => shrinkPhoto(x, 1280)));
      set("renders", [...f.renders, ...urls]);
    } catch {
      setErrors((e) => ({ ...e, renders: "One of those images couldn't be read. Try a JPG or PNG." }));
    }
  }

  async function submit() {
    const res = BidDraft.safeParse(toDraft(f));
    if (!res.success) {
      const errs: Record<string, string> = {};
      for (const issue of res.error.issues) {
        const k = String(issue.path[0]);
        if (!errs[k]) errs[k] = issue.message;
      }
      setErrors(errs);
      document.querySelector("[role=alert]")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (!job) return;
    setBusy(true);
    try {
      await placeBid(job, res.data);
      router.push(`/jobs/${job.id}?as=shop`);
    } catch (e) {
      setBusy(false);
      setErrors({ form: e instanceof Error ? e.message : "Could not send your bid. Try again." });
    }
  }

  const total = quoteTotal(toDraft(f).lines);
  const presets = job ? renderPresetsFor(job).slice(0, 6) : [];

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16">
      <SiteHeader />
      <DemoBanner />
      {job === undefined && <p className="mt-10 text-mut">Loading…</p>}
      {job === null && (
        <div className="mt-16 flex flex-col items-start gap-4">
          <h1 className="disp text-4xl">Job not found</h1>
          <Link href="/jobs" className="rounded-lg border border-line px-4 py-2 font-medium hover:bg-panel">See open jobs</Link>
        </div>
      )}
      {job && (
        <main className="mx-auto mt-10 grid max-w-5xl gap-8 lg:grid-cols-[1fr_300px]">
          <div className="flex flex-col gap-6">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-a2">{editing ? "Edit your bid" : "Place a bid"}</p>
              <h1 className="disp mt-2 text-3xl sm:text-4xl">Show them the <span className="grad-text">build</span>.</h1>
            </div>

            {job.status === "awarded" ? (
              <p className="rounded-2xl border border-line bg-panel p-5">The owner has already picked a winner for this job, so it no longer takes bids.</p>
            ) : (
              <section className="flex flex-col gap-7 rounded-2xl border border-line bg-panel/50 p-5 sm:p-7">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Shop or studio name" error={errors.shopName}>
                    <input className={input} value={f.shopName} onChange={(e) => set("shopName", e.target.value)} placeholder="WrapCult Kochi" />
                  </Field>
                  <Field label="Your city" error={errors.shopCity}>
                    <select className={input} value={f.shopCity} onChange={(e) => set("shopCity", e.target.value)}>
                      <option value="">Choose a city</option>
                      {CITIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </Field>
                </div>

                <Field
                  label={`Renders (${f.renders.length}/${MAX_RENDERS})`}
                  hint="Upload your mock-ups of their car. In demo mode you can also pick a sample render below."
                  error={errors.renders}
                >
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {f.renders.map((src, i) => (
                      <div key={i} className="relative overflow-hidden rounded-lg border border-line">
                        <RenderImage src={src} alt={`Render ${i + 1}`} className="aspect-[16/9] w-full" />
                        <button type="button" onClick={() => set("renders", f.renders.filter((_, j) => j !== i))} className="absolute right-1 top-1 rounded-md bg-bg/80 px-1.5 text-xs" aria-label={`Remove render ${i + 1}`}>
                          ✕
                        </button>
                      </div>
                    ))}
                    {f.renders.length < MAX_RENDERS && (
                      <label className="flex aspect-[16/9] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-line text-mut hover:border-a2 hover:text-a2">
                        <span className="text-xl">+</span>
                        <span className="text-xs">Upload render</span>
                        <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => { addRenders(e.target.files); e.target.value = ""; }} />
                      </label>
                    )}
                  </div>
                  {f.renders.length < MAX_RENDERS && (
                    <div className="mt-2">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-mut">Sample renders</p>
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                        {presets.map((p) => {
                          const on = f.renders.includes(p.src);
                          return (
                            <button
                              key={p.id}
                              type="button"
                              disabled={on}
                              onClick={() => set("renders", [...f.renders, p.src])}
                              className={`overflow-hidden rounded-lg border text-left ${on ? "border-a2 opacity-50" : "border-line hover:border-mut"}`}
                              title={p.label}
                            >
                              <RenderImage src={p.src} alt={p.label} className="aspect-[16/9] w-full" />
                              <span className="block truncate px-1.5 py-1 text-[11px] text-mut">{p.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </Field>

                <Field label="Itemised quote" hint="One line per part or job. Owners trust quotes they can read." error={errors.lines}>
                  <div className="flex flex-col gap-2">
                    {f.lines.map((l, i) => (
                      <div key={i} className="flex gap-2">
                        <input className={`${input} flex-1`} value={l.label} onChange={(e) => setLine(i, { label: e.target.value })} placeholder="Satin black wrap, full body" aria-label={`Line ${i + 1} description`} />
                        <label className="flex w-36 flex-none items-center gap-1 rounded-lg border border-line bg-panel px-3 focus-within:border-a2">
                          <span className="text-mut">₹</span>
                          <input className="w-full bg-transparent py-2.5 outline-none" inputMode="numeric" value={l.amount} onChange={(e) => setLine(i, { amount: e.target.value.replace(/\D/g, "").slice(0, 7) })} placeholder="0" aria-label={`Line ${i + 1} price`} />
                        </label>
                        <button type="button" onClick={() => set("lines", f.lines.filter((_, j) => j !== i))} disabled={f.lines.length === 1} className="rounded-lg border border-line px-3 text-mut hover:text-a1 disabled:opacity-30" aria-label={`Remove line ${i + 1}`}>
                          ✕
                        </button>
                      </div>
                    ))}
                    <div className="flex items-center justify-between">
                      {f.lines.length < 12 ? (
                        <button type="button" onClick={() => set("lines", [...f.lines, { label: "", amount: "" }])} className="text-sm font-semibold text-a2">
                          + Add line
                        </button>
                      ) : <span />}
                      <p className="font-semibold">Total <span className="disp ml-2 text-2xl">{formatINR(total)}</span></p>
                    </div>
                    {total > job.budgetMax && (
                      <p className="text-right text-sm text-a2">That&apos;s {formatINR(total - job.budgetMax)} over the owner&apos;s max budget. You can still send it; say why in the notes.</p>
                    )}
                  </div>
                </Field>

                <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
                  <Field label="Days to finish" error={errors.daysEstimate}>
                    <input className={input} inputMode="numeric" value={f.daysEstimate} onChange={(e) => set("daysEstimate", e.target.value.replace(/\D/g, "").slice(0, 3))} placeholder="5" />
                  </Field>
                  <Field label="Notes for the owner (optional)" error={errors.notes}>
                    <textarea className={`${input} min-h-[46px]`} rows={2} value={f.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Warranty, brands you use, pickup and drop…" />
                  </Field>
                </div>

                {errors.form && <p role="alert" className="text-sm text-a1">{errors.form}</p>}

                <div className="flex items-center justify-between border-t border-line pt-5">
                  <Link href={`/jobs/${job.id}`} className="rounded-lg border border-line px-4 py-2 font-medium hover:bg-panel">Cancel</Link>
                  <button type="button" disabled={busy} onClick={submit} className="rounded-lg bg-gradient-to-r from-a1 to-a2 px-5 py-2.5 font-semibold text-bg disabled:opacity-60">
                    {busy ? "Sending…" : editing ? "Update bid" : `Send bid · ${formatINR(total)}`}
                  </button>
                </div>
              </section>
            )}
          </div>

          <aside className="flex h-fit flex-col gap-3 rounded-2xl border border-line bg-panel p-4 lg:sticky lg:top-6">
            <p className="font-mono text-xs uppercase tracking-widest text-mut">The job</p>
            <CarPhoto job={job} className="aspect-[4/3] w-full rounded-xl" />
            <h2 className="font-bold leading-snug">{job.title}</h2>
            <p className="text-sm"><span className="text-mut">Budget</span> <b>{formatINR(job.budgetMin)} – {formatINR(job.budgetMax)}</b></p>
            <p className="text-sm text-mut">{job.city} · {job.year}</p>
            <p className="line-clamp-5 text-sm text-mut">{job.description}</p>
          </aside>
        </main>
      )}
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
