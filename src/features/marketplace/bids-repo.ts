"use client";

/**
 * Where bids are stored.
 *
 * Demo mode (now): bids placed from this browser, and which bid the owner picked, live in
 * localStorage next to the sample bids in `sample-bids.ts`. No Supabase or API keys needed.
 *
 * Later: swap these functions for the `bids` table (render uploads go to Storage). Picking a
 * winner should go through a server route with the service role, so it can mark the job
 * awarded and start escrow (issue #16) in one step. The pages only call the functions below.
 */
import { type Bid, type BidDraft, type Shop, quoteTotal } from "./bids";
import { modLabel } from "./options";
import { SAMPLE_BIDS, SAMPLE_SHOPS } from "./sample-bids";
import { renderPresetsFor } from "./renders";
import type { Job } from "./types";

const KEY = "kstm.bids.v1";
const SHOP_KEY = "kstm.myshop.v1";
const MY_SHOP_ID = "my-shop";

type Store = {
  /** Bids placed in this browser (from "your shop", or demo bids generated for your own jobs). */
  bids: Bid[];
  /** jobId -> the bid the owner picked */
  awards: Record<string, string>;
};

function read(): Store {
  try {
    const raw = window.localStorage.getItem(KEY);
    const s = raw ? (JSON.parse(raw) as Partial<Store>) : {};
    return { bids: s.bids ?? [], awards: s.awards ?? {} };
  } catch {
    return { bids: [], awards: {} };
  }
}

function write(s: Store) {
  window.localStorage.setItem(KEY, JSON.stringify(s));
}

/** Bids on a job, with status worked out from the owner's pick. Newest first. */
export function bidsForJobSync(jobId: string, store: Store = read()): Bid[] {
  const winner = store.awards[jobId];
  return [...store.bids, ...SAMPLE_BIDS]
    .filter((b) => b.jobId === jobId)
    .map((b): Bid => ({ ...b, status: winner ? (b.id === winner ? "accepted" : "rejected") : b.status }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listBids(jobId: string): Promise<Bid[]> {
  return bidsForJobSync(jobId);
}

/** Bid count and award state for a job, used by the job list and job page. */
export function bidStats(jobId: string) {
  const store = read();
  return { count: bidsForJobSync(jobId, store).length, awardedBidId: store.awards[jobId] as string | undefined };
}

// ---- Shop side ----

/** The shop you bid as in demo mode. Once sign-in and shop onboarding (#6) land, this comes from the `shops` table. */
export function getMyShop(): Pick<Shop, "name" | "city"> | null {
  try {
    const raw = window.localStorage.getItem(SHOP_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getMyBid(jobId: string): Bid | null {
  return bidsForJobSync(jobId).find((b) => b.mine) ?? null;
}

/** Place a bid, or update yours (one bid per shop per job, like the `unique (job_id, shop_id)` rule). */
export async function placeBid(job: Pick<Job, "id">, draft: BidDraft): Promise<Bid> {
  const store = read();
  if (store.awards[job.id]) throw new Error("The owner has already picked a winner for this job.");
  window.localStorage.setItem(SHOP_KEY, JSON.stringify({ name: draft.shopName, city: draft.shopCity }));
  const existing = store.bids.find((b) => b.jobId === job.id && b.mine);
  const bid: Bid = {
    id: existing?.id ?? crypto.randomUUID(),
    jobId: job.id,
    shop: { id: MY_SHOP_ID, name: draft.shopName, kind: "shop", city: draft.shopCity, verified: false, rating: 0, jobsDone: 0 },
    renders: draft.renders,
    lines: draft.lines,
    priceInr: quoteTotal(draft.lines),
    daysEstimate: draft.daysEstimate,
    notes: draft.notes,
    status: "pending",
    createdAt: new Date().toISOString(),
    mine: true,
  };
  const others = store.bids.filter((b) => b.id !== bid.id);
  try {
    write({ ...store, bids: [bid, ...others] });
  } catch {
    // Browser storage full (renders are images). Keep the first render rather than lose the bid.
    write({ ...store, bids: [{ ...bid, renders: bid.renders.slice(0, 1) }, ...others] });
  }
  return bid;
}

export async function withdrawBid(jobId: string) {
  const store = read();
  write({ ...store, bids: store.bids.filter((b) => !(b.jobId === jobId && b.mine)) });
}

// ---- Owner side ----

export async function acceptBid(jobId: string, bidId: string) {
  const store = read();
  if (!bidsForJobSync(jobId, store).some((b) => b.id === bidId)) throw new Error("That bid no longer exists.");
  write({ ...store, awards: { ...store.awards, [jobId]: bidId } });
}

/** Demo only: undo the pick so you can try again. */
export async function reopenBidding(jobId: string) {
  const store = read();
  const awards = { ...store.awards };
  delete awards[jobId];
  write({ ...store, awards });
}

/**
 * Demo only: fill your own job with a few believable bids from the sample shops, so you can try
 * comparing and picking a winner without switching to the shop side.
 */
export async function addDemoBids(job: Job) {
  const store = read();
  const presets = renderPresetsFor(job);
  const mid = Math.round((job.budgetMin + job.budgetMax) / 2);
  const plans = [
    { shop: 0, factor: 0.92, days: 4, note: "Price includes fitting. Warranty card on handover." },
    { shop: 2, factor: 0.78, days: 7, note: "Render first, then install through a partner shop near you." },
    { shop: 1, factor: 1.12, days: 3, note: "Premium materials. We can start this weekend." },
  ];
  const now = Date.now();
  const mods = job.modTypes.length ? job.modTypes : ["full"];
  const made: Bid[] = plans.map((p, i) => {
    const total = Math.max(1000, Math.round((mid * p.factor) / 500) * 500);
    const share = Math.round(total / mods.length / 100) * 100;
    const lines = mods.map((m, j) => ({
      label: `${modLabel(m)}${j === 0 ? " (parts + labour)" : ""}`,
      amount: j === mods.length - 1 ? total - share * (mods.length - 1) : share,
    }));
    return {
      id: `demo-${job.id}-${i}`,
      jobId: job.id,
      shop: { ...SAMPLE_SHOPS[p.shop], city: job.city },
      renders: [presets[i % presets.length].src],
      lines,
      priceInr: quoteTotal(lines),
      daysEstimate: p.days,
      notes: p.note,
      status: "pending",
      createdAt: new Date(now - (i + 1) * 3_600_000).toISOString(),
      mine: false,
    };
  });
  write({ ...store, bids: [...made, ...store.bids.filter((b) => !b.id.startsWith(`demo-${job.id}-`))] });
}

/** Clean up bids and picks when a job is deleted. */
export async function deleteBidsForJob(jobId: string) {
  const store = read();
  const awards = { ...store.awards };
  delete awards[jobId];
  write({ bids: store.bids.filter((b) => b.jobId !== jobId), awards });
}
