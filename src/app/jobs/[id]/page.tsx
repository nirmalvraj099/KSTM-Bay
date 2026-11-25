"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { DemoBanner } from "@/features/marketplace/DemoBanner";
import { CarPhoto, daysLeft } from "@/features/marketplace/JobCard";
import { JobBids, type Role } from "@/features/marketplace/JobBids";
import { deleteJob, getJob } from "@/features/marketplace/jobs-repo";
import { formatINR, modLabel } from "@/features/marketplace/options";
import type { Job } from "@/features/marketplace/types";

const ROLE_KEY = "kstm.role.v1";

export default function JobPage() {
  return (
    <Suspense>
      <JobView />
    </Suspense>
  );
}

function JobView() {
  const { id } = useParams<{ id: string }>();
  const params = useSearchParams();
  const posted = params.get("posted") === "1";
  const router = useRouter();
  const [job, setJob] = useState<Job | null | undefined>(undefined);
  const [active, setActive] = useState(0);
  const [role, setRoleState] = useState<Role>("owner");

  const load = useCallback(() => getJob(id).then(setJob), [id]);
  useEffect(() => {
    load();
  }, [load]);

  // Demo mode has no sign-in, so you switch between the owner's and a shop's view of the job.
  useEffect(() => {
    const asParam = params.get("as");
    let saved: string | null = null;
    try { saved = window.localStorage.getItem(ROLE_KEY); } catch {}
    const r = asParam ?? saved;
    if (r === "owner" || r === "shop") {
      setRoleState(r);
      try { window.localStorage.setItem(ROLE_KEY, r); } catch {}
    }
  }, [params]);
  const setRole = (r: Role) => {
    setRoleState(r);
    try { window.localStorage.setItem(ROLE_KEY, r); } catch {}
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16">
      <SiteHeader />
      <DemoBanner />
      {job === undefined && <p className="mt-10 text-mut">Loading…</p>}
      {job === null && (
        <div className="mt-16 flex flex-col items-start gap-4">
          <h1 className="disp text-4xl">Job not found</h1>
          <p className="text-mut">It may have been removed, or it was posted in another browser.</p>
          <Link href="/jobs" className="rounded-lg border border-line px-4 py-2 font-medium hover:bg-panel">See open jobs</Link>
        </div>
      )}
      {job && (
        <main className="mt-8 flex flex-col gap-8">
          {posted && (
            <div className="rounded-2xl border border-cy/40 bg-cy/10 p-5">
              <p className="font-semibold text-cy">✓ Your job is live.</p>
              <p className="mt-1 text-sm text-mut">
                Verified shops and creators in {job.city} can now send renders and quotes. We&apos;ll let you know when the first bid lands.
              </p>
            </div>
          )}

          <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
            <div className="flex flex-col gap-3">
              <CarPhoto job={{ ...job, photos: job.photos.slice(active) }} className="aspect-[4/3] w-full rounded-2xl border border-line" />
              {job.photos.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {job.photos.map((src, i) => (
                    <button key={i} onClick={() => setActive(i)} className={`flex-none overflow-hidden rounded-lg border-2 ${i === active ? "border-a2" : "border-transparent"}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt={`Photo ${i + 1}`} className="h-16 w-20 object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-5">
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-a2">
                  {job.city} · {job.status === "open" ? daysLeft(job.closesAt) : job.status === "awarded" ? <span className="text-cy">Winner picked</span> : job.status}
                </p>
                <h1 className="disp mt-2 text-3xl sm:text-4xl">{job.title}</h1>
              </div>
              <div className="rounded-2xl border border-line bg-panel p-5">
                <p className="font-mono text-xs uppercase tracking-widest text-mut">Budget</p>
                <p className="disp mt-1 text-3xl">{formatINR(job.budgetMin)} – {formatINR(job.budgetMax)}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {job.modTypes.map((m) => (
                  <span key={m} className="rounded-full border border-line px-3 py-1 text-sm">{modLabel(m)}</span>
                ))}
              </div>
              <p className="whitespace-pre-line text-mut">{job.description}</p>
              <p className="text-sm text-mut">{job.make} {job.model}, {job.year} · Posted {new Date(job.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-line pt-6 text-sm">
            <span className="text-mut">Viewing as</span>
            <div className="flex rounded-lg border border-line p-1" role="group" aria-label="Viewing as">
              {(["owner", "shop"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  aria-pressed={role === r}
                  onClick={() => setRole(r)}
                  className={`rounded-md px-3 py-1.5 font-medium ${role === r ? "bg-gradient-to-r from-a1 to-a2 text-bg" : "text-mut hover:text-txt"}`}
                >
                  {r === "owner" ? "Car owner" : "Shop"}
                </button>
              ))}
            </div>
            <span className="text-xs text-mut">Demo only: once sign-in is live you see the view that fits your account.</span>
          </div>

          <JobBids job={job} role={role} onChange={load} />

          <div className="flex flex-wrap gap-3">
            <Link href="/jobs" className="rounded-lg border border-line px-4 py-2 font-medium hover:bg-panel">← All open jobs</Link>
            {!job.sample && (
              <button
                onClick={async () => { await deleteJob(job.id); router.push("/jobs"); }}
                className="rounded-lg border border-line px-4 py-2 font-medium text-mut hover:border-a1 hover:text-a1"
              >
                Delete this job
              </button>
            )}
          </div>
        </main>
      )}
    </div>
  );
}
