"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Bid } from "./bids";
import { BidCard, tagBids } from "./BidCard";
import { acceptBid, addDemoBids, listBids, reopenBidding, withdrawBid } from "./bids-repo";
import { isDemoMode } from "./jobs-repo";
import { formatINR } from "./options";
import type { Job } from "./types";

export type Role = "owner" | "shop";

const SORTS = {
  price: { label: "Lowest price", fn: (a: Bid, b: Bid) => a.priceInr - b.priceInr },
  days: { label: "Fastest", fn: (a: Bid, b: Bid) => a.daysEstimate - b.daysEstimate },
  rating: { label: "Top rated", fn: (a: Bid, b: Bid) => b.shop.rating - a.shop.rating },
  newest: { label: "Newest", fn: (a: Bid, b: Bid) => b.createdAt.localeCompare(a.createdAt) },
} as const;
type SortKey = keyof typeof SORTS;

/** The bids section of a job page. `onChange` lets the page refresh the job's status after a pick. */
export function JobBids({ job, role, onChange }: { job: Job; role: Role; onChange: () => void }) {
  const [bids, setBids] = useState<Bid[] | null>(null);
  const [version, setVersion] = useState(0);
  const refresh = () => {
    setVersion((v) => v + 1);
    onChange();
  };
  useEffect(() => {
    listBids(job.id).then(setBids);
  }, [job.id, version]);

  if (!bids) return <p className="text-mut">Loading bids…</p>;
  return role === "owner"
    ? <OwnerBids job={job} bids={bids} refresh={refresh} />
    : <ShopBids job={job} bids={bids} refresh={refresh} />;
}

function OwnerBids({ job, bids, refresh }: { job: Job; bids: Bid[]; refresh: () => void }) {
  const [sort, setSort] = useState<SortKey>("price");
  const [confirming, setConfirming] = useState<string | null>(null);
  const [error, setError] = useState("");
  const tags = useMemo(() => tagBids(bids), [bids]);
  const sorted = useMemo(() => {
    const s = [...bids].sort(SORTS[sort].fn);
    // The winner always goes first once picked.
    return s.sort((a, b) => Number(b.status === "accepted") - Number(a.status === "accepted"));
  }, [bids, sort]);
  const winner = bids.find((b) => b.status === "accepted");
  const prices = bids.map((b) => b.priceInr);

  async function pick(id: string) {
    try {
      await acceptBid(job.id, id);
      setConfirming(null);
      refresh();
      setTimeout(() => document.getElementById("bid-result")?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not pick that bid. Try again.");
    }
  }

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Bids <span className="text-mut">({bids.length})</span></h2>
          {bids.length > 1 && (
            <p className="mt-1 text-sm text-mut">
              {formatINR(Math.min(...prices))} to {formatINR(Math.max(...prices))} · your budget {formatINR(job.budgetMin)} – {formatINR(job.budgetMax)}
            </p>
          )}
        </div>
        {bids.length > 1 && (
          <div className="flex flex-wrap items-center gap-2 text-sm" role="group" aria-label="Sort bids">
            <span className="text-mut">Sort</span>
            {(Object.keys(SORTS) as SortKey[]).map((k) => (
              <button
                key={k}
                type="button"
                aria-pressed={sort === k}
                onClick={() => setSort(k)}
                className={`rounded-full border px-3 py-1 ${sort === k ? "border-a1 bg-a1/10" : "border-line hover:border-mut"}`}
              >
                {SORTS[k].label}
              </button>
            ))}
          </div>
        )}
      </div>

      {winner && (
        <div id="bid-result" className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-cy/40 bg-cy/10 p-5">
          <div>
            <p className="font-semibold text-cy">✓ You picked {winner.shop.name} for {formatINR(winner.priceInr)}.</p>
            <p className="mt-1 text-sm text-mut">
              The other shops have been told. Next you&apos;ll pay into KSTM Pay escrow, and the money only reaches the shop when you approve the finished build (coming with issue #16).
            </p>
          </div>
          {isDemoMode && (
            <button type="button" onClick={async () => { await reopenBidding(job.id); refresh(); }} className="rounded-lg border border-line px-4 py-2 text-sm font-medium hover:bg-panel">
              Undo pick (demo)
            </button>
          )}
        </div>
      )}

      {error && <p role="alert" className="text-sm text-a1">{error}</p>}

      {bids.length === 0 ? (
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed border-line p-6">
          <p className="font-semibold">No bids yet.</p>
          <p className="text-sm text-mut">Shops usually reply within a day with a render and an itemised quote.</p>
          {isDemoMode && (
            <p className="text-sm text-mut">
              In demo mode no real shops see your job. You can{" "}
              <button type="button" onClick={async () => { await addDemoBids(job); refresh(); }} className="font-semibold text-a2 underline underline-offset-4">
                fill it with 3 sample bids
              </button>{" "}
              or switch to <b>Shop</b> above and bid on it yourself.
            </p>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sorted.map((b) => (
            <BidCard
              key={b.id}
              bid={b}
              budgetMax={job.budgetMax}
              tags={tags[b.id]}
              action={
                winner ? null : confirming === b.id ? (
                  <div className="flex flex-col gap-3 rounded-xl border border-a2/50 bg-a2/10 p-3">
                    <p className="text-sm">
                      Pick <b>{b.shop.name}</b> for <b>{formatINR(b.priceInr)}</b>? The other {bids.length - 1 === 1 ? "bid" : `${bids.length - 1} bids`} will be declined.
                    </p>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => pick(b.id)} className="flex-1 rounded-lg bg-gradient-to-r from-a1 to-a2 px-3 py-2 text-sm font-semibold text-bg">
                        Yes, pick this bid
                      </button>
                      <button type="button" onClick={() => setConfirming(null)} className="rounded-lg border border-line px-3 py-2 text-sm font-medium hover:bg-bg">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button type="button" onClick={() => setConfirming(b.id)} className="w-full rounded-lg border border-a1/60 px-4 py-2.5 font-semibold hover:bg-a1/10">
                    Pick this bid
                  </button>
                )
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ShopBids({ job, bids, refresh }: { job: Job; bids: Bid[]; refresh: () => void }) {
  const mine = bids.find((b) => b.mine);
  const others = bids.length - (mine ? 1 : 0);
  const winner = bids.find((b) => b.status === "accepted");
  const closed = Date.parse(job.closesAt) < Date.now();
  const canBid = !winner && !closed;

  return (
    <section className="flex flex-col gap-5">
      <div>
        <h2 className="text-2xl font-bold">Bid on this job</h2>
        <p className="mt-1 text-sm text-mut">
          {others === 0 ? "No other shops have bid yet." : `${others} other ${others === 1 ? "shop has" : "shops have"} bid.`} Their renders and prices are private to the owner.
        </p>
      </div>

      {winner && (
        <div className={`rounded-2xl border p-5 ${winner.mine ? "border-cy/40 bg-cy/10" : "border-line bg-panel"}`}>
          <p className={`font-semibold ${winner.mine ? "text-cy" : ""}`}>
            {winner.mine ? "🎉 The owner picked your bid." : "The owner picked another shop for this job."}
          </p>
          <p className="mt-1 text-sm text-mut">
            {winner.mine ? "They'll pay into KSTM Pay escrow before you start, so your payment is safe." : "Keep an eye on open jobs in your city for the next one."}
          </p>
        </div>
      )}

      {mine ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <BidCard
            bid={mine}
            budgetMax={job.budgetMax}
            action={
              canBid && (
                <div className="flex gap-2">
                  <Link href={`/jobs/${job.id}/bid`} className="flex-1 rounded-lg border border-line px-3 py-2 text-center text-sm font-semibold hover:bg-bg">
                    Edit bid
                  </Link>
                  <button type="button" onClick={async () => { await withdrawBid(job.id); refresh(); }} className="rounded-lg border border-line px-3 py-2 text-sm font-medium text-mut hover:border-a1 hover:text-a1">
                    Withdraw
                  </button>
                </div>
              )
            }
          />
        </div>
      ) : canBid ? (
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-line bg-panel p-6">
          <p className="font-semibold">Send the owner a render and an itemised quote.</p>
          <p className="text-sm text-mut">Owners pick on the look first, then price and timeline. A clear render wins jobs.</p>
          <Link href={`/jobs/${job.id}/bid`} className="rounded-lg bg-gradient-to-r from-a1 to-a2 px-5 py-2.5 font-semibold text-bg">
            Place a bid →
          </Link>
        </div>
      ) : (
        !winner && <p className="text-mut">Bidding has closed on this job.</p>
      )}
    </section>
  );
}
