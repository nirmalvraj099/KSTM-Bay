import { z } from "zod";
import { CITIES, MOD_TYPES, MAX_PHOTOS } from "./options";

const modIds = MOD_TYPES.map((m) => m.id) as [string, ...string[]];
const thisYear = new Date().getFullYear();

/** What the owner fills in. Mirrors the `jobs` table plus the car and mod types. */
export const JobDraft = z
  .object({
    make: z.string().trim().min(2, "Enter the car make, e.g. Hyundai").max(40),
    model: z.string().trim().min(1, "Enter the model, e.g. Creta").max(60),
    year: z.number().int().min(1980, `Enter a year between 1980 and ${thisYear + 1}`).max(thisYear + 1, `Enter a year between 1980 and ${thisYear + 1}`),
    photos: z.array(z.string()).min(1, "Add at least one photo of your car").max(MAX_PHOTOS),
    modTypes: z.array(z.enum(modIds)).min(1, "Pick at least one kind of mod"),
    description: z.string().trim().min(20, "Tell shops a bit more (at least 20 characters)").max(1500),
    city: z.enum(CITIES, { message: "Pick your city" }),
    budgetMin: z.number().int().min(1000, "Minimum budget is ₹1,000"),
    budgetMax: z.number().int().max(5000000, "Maximum budget is ₹50L"),
    biddingDays: z.number().int().min(1).max(30),
  })
  .refine((d) => d.budgetMax >= d.budgetMin, {
    message: "Max budget must be at least the min budget",
    path: ["budgetMax"],
  });

export type JobDraft = z.infer<typeof JobDraft>;

export type Job = Omit<JobDraft, "biddingDays"> & {
  id: string;
  title: string;
  status: "open" | "awarded" | "in_progress" | "completed" | "cancelled";
  createdAt: string;
  closesAt: string;
  bidCount: number;
  /** true for the built-in examples, false for jobs posted in this browser */
  sample: boolean;
};
