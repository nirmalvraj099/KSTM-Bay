"use client";

import { useState } from "react";
import type { Bid } from "./bids";
import { formatINR } from "./options";
import { RenderImage } from "./RenderImage";

export type BidTag = "lowest" | "fastest" | "top";

const TAG_LABEL: Record<BidTag, string> = { lowest: "Lowest price", fastest: "Fastest", top: "Top rated" };

/** One bid: render(s), shop, total, timeline and the itemised quote. `action` is the owner's or shop's button area. */
export function BidCard({
  bid,
  budgetMax,
  tags = [],
  action,
}: {
  bid: Bid;
  budgetMax: number;
  tags?: BidTag[];
  action?: React.ReactNode;
}) {
  const [shown, setShown] = useState(0);
  const over = bid.priceInr - budgetMax;
  const won = bid.status === "accepted";
  const lost = bid.status === "rejected";
  return (
    <article
      className={`flex flex-col overflow-hidden rounded-2xl border bg-panel transition ${
        won ? "border-cy shadow-[0_0_0_1px_var(--cy)]" : "border-line"
      } ${lost ? "opacity-55" : ""}`}
    >
      <div className="relative">
        <RenderImage src={bid.renders[shown] ?? ""} alt={`Render by ${bid.shop.name}`} className="aspect-[16/9] w-full" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1">
          {won && <span className="rounded-full bg-cy px-2.5 py-0.5 text-xs font-bold text-bg">✓ Winner</span>}
          {lost && <span className="rounded-full bg-bg/80 px-2.5 py-0.5 text-xs font-semibold text-mut">Declined</span>}
          {!won && !lost && tags.map((t) => (
            <span key={t} className="rounded-full bg-a2 px-2.5 py-0.5 text-xs font-bold text-bg">{TAG_LABEL[t]}</span>
          ))}
        </div>
        {bid.renders.length > 1 && (
          <div className="absolute bottom-2 right-2 flex gap-1.5">
            {bid.renders.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setShown(i)}
                aria-label={`Show render ${i + 1}`}
                aria-pressed={i === shown}
                className={`h-2.5 w-2.5 rounded-full ${i === shown ? "bg-a2" : "bg-txt/40"}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-bold">{bid.shop.name}{bid.mine && <span className="ml-2 text-xs font-semibold text-cy">You</span>}</h3>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-mut">
              {bid.shop.verified && <span className="font-semibold text-cy">◆ KSTM Pro</span>}
              <span>{bid.shop.kind === "creator" ? "3D creator" : "Shop"} · {bid.shop.city}</span>
              {bid.shop.jobsDone > 0 && <span>★ {bid.shop.rating.toFixed(1)} · {bid.shop.jobsDone} jobs</span>}
            </p>
          </div>
          <div className="text-right">
            <p className="disp text-2xl leading-none">{formatINR(bid.priceInr)}</p>
            <p className="mt-1 text-xs text-mut">{bid.daysEstimate} {bid.daysEstimate === 1 ? "day" : "days"}</p>
          </div>
        </div>

        <p className={`text-xs font-semibold ${over > 0 ? "text-a2" : "text-cy"}`}>
          {over > 0 ? `${formatINR(over)} over your max budget` : "Within your budget"}
        </p>

        <ul className="flex flex-col gap-1.5 border-t border-line pt-3 text-sm">
          {bid.lines.map((l, i) => (
            <li key={i} className="flex justify-between gap-3">
              <span className="text-mut">{l.label}</span>
              <span className="flex-none font-mono">{formatINR(l.amount)}</span>
            </li>
          ))}
          <li className="mt-1 flex justify-between gap-3 border-t border-dashed border-line pt-2 font-semibold">
            <span>Total</span>
            <span className="font-mono">{formatINR(bid.priceInr)}</span>
          </li>
        </ul>

        {bid.notes && <p className="text-sm italic text-mut">&ldquo;{bid.notes}&rdquo;</p>}

        {action && <div className="mt-auto pt-1">{action}</div>}
      </div>
    </article>
  );
}

/** Which bids get the "Lowest price", "Fastest" and "Top rated" tags (only when there is a real choice). */
export function tagBids(bids: Bid[]): Record<string, BidTag[]> {
  const tags: Record<string, BidTag[]> = {};
  if (bids.length < 2) return tags;
  const add = (b: Bid | undefined, t: BidTag) => {
    if (b) (tags[b.id] ??= []).push(t);
  };
  const best = (score: (b: Bid) => number) => bids.reduce((a, b) => (score(b) < score(a) ? b : a));
  add(best((b) => b.priceInr), "lowest");
  add(best((b) => b.daysEstimate), "fastest");
  const rated = bids.filter((b) => b.shop.jobsDone > 0);
  if (rated.length > 1) add(best((b) => -b.shop.rating), "top");
  return tags;
}
