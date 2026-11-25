"use client";

/**
 * Where jobs are stored.
 *
 * Demo mode (now): jobs live in this browser's localStorage, next to a few sample jobs, so the
 * whole flow works with no Supabase project or API keys.
 *
 * Later: once Supabase is set up (issues #3 and #4), swap these functions for inserts into the
 * `jobs` table and photo uploads to Storage. The pages only call the functions below, so they
 * will not need to change.
 */
import type { Job, JobDraft } from "./types";
import { modLabel } from "./options";
import { SAMPLE_JOBS } from "./sample-jobs";
import { bidStats, deleteBidsForJob } from "./bids-repo";

const KEY = "kstm.jobs.v1";

export const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function readLocal(): Job[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Job[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(jobs: Job[]) {
  window.localStorage.setItem(KEY, JSON.stringify(jobs));
}

/** e.g. "Hyundai Creta 2022 · Wrap / PPF + Lighting" */
export function makeTitle(d: Pick<JobDraft, "make" | "model" | "year" | "modTypes">) {
  const mods = d.modTypes.slice(0, 2).map(modLabel).join(" + ");
  const more = d.modTypes.length > 2 ? ` +${d.modTypes.length - 2}` : "";
  return `${d.make} ${d.model} ${d.year} · ${mods}${more}`;
}

/** Bid count and status come from the bids, so they stay right as shops bid and owners pick. */
function withBids(job: Job): Job {
  const { count, awardedBidId } = bidStats(job.id);
  return { ...job, bidCount: count, status: awardedBidId ? "awarded" : job.status, awardedBidId };
}

export async function listJobs(): Promise<Job[]> {
  const mine = readLocal();
  return [...mine, ...SAMPLE_JOBS].map(withBids).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getJob(id: string): Promise<Job | null> {
  return (await listJobs()).find((j) => j.id === id) ?? null;
}

export async function createJob(draft: JobDraft): Promise<Job> {
  const now = new Date();
  const { biddingDays, ...rest } = draft;
  const job: Job = {
    ...rest,
    id: crypto.randomUUID(),
    title: makeTitle(draft),
    status: "open",
    createdAt: now.toISOString(),
    closesAt: new Date(now.getTime() + biddingDays * 86_400_000).toISOString(),
    bidCount: 0,
    sample: false,
  };
  try {
    writeLocal([job, ...readLocal()]);
  } catch {
    // Browser storage full (photos are large). Save without photos rather than lose the job.
    writeLocal([{ ...job, photos: job.photos.slice(0, 1) }, ...readLocal()]);
  }
  return job;
}

export async function deleteJob(id: string) {
  writeLocal(readLocal().filter((j) => j.id !== id));
  await deleteBidsForJob(id);
}
