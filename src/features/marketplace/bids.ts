import { z } from "zod";
import { CITIES } from "./options";

/** A detailing shop or 3D creator. Mirrors the `shops` table. */
export type Shop = {
  id: string;
  name: string;
  kind: "shop" | "creator";
  city: string;
  /** KSTM Pro badge, set by admins only */
  verified: boolean;
  rating: number;
  jobsDone: number;
};

export type QuoteLine = { label: string; amount: number };

/** Mirrors the `bids` table, with the shop joined in. */
export type Bid = {
  id: string;
  jobId: string;
  shop: Shop;
  /** Image URLs (data URLs in demo mode) or `preset:<style>` for the built-in sample renders. */
  renders: string[];
  lines: QuoteLine[];
  /** Total of `lines`, in rupees. */
  priceInr: number;
  daysEstimate: number;
  notes: string;
  status: "pending" | "accepted" | "rejected" | "withdrawn";
  createdAt: string;
  /** true for bids placed from "your shop" in this browser */
  mine: boolean;
};

export const MAX_RENDERS = 4;

/** What a shop fills in on the bid form. */
export const BidDraft = z.object({
  shopName: z.string().trim().min(2, "Enter your shop or studio name").max(60),
  shopCity: z.enum(CITIES, { message: "Pick your city" }),
  renders: z.array(z.string()).min(1, "Add at least one render so the owner can see the look").max(MAX_RENDERS),
  lines: z
    .array(
      z.object({
        label: z.string().trim().min(2, "Describe each line, e.g. Satin black wrap").max(80),
        amount: z.number().int().min(100, "Each line needs a price of at least ₹100").max(5000000),
      }),
    )
    .min(1, "Add at least one line to your quote")
    .max(12),
  daysEstimate: z.number().int().min(1, "Enter how many days the work takes (1 to 120)").max(120, "Enter how many days the work takes (1 to 120)"),
  notes: z.string().trim().max(800),
});

export type BidDraft = z.infer<typeof BidDraft>;

export const quoteTotal = (lines: QuoteLine[]) => lines.reduce((s, l) => s + (Number.isFinite(l.amount) ? l.amount : 0), 0);
