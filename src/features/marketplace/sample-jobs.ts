import type { Job } from "./types";

const day = 86_400_000;
// Relative to now, so the samples always look fresh in demo mode.
const base = Date.now() - day;
const at = (offsetDays: number) => new Date(base + offsetDays * day).toISOString();

/** Example jobs so the list is not empty in demo mode. Photos are empty: the UI draws a placeholder. */
export const SAMPLE_JOBS: Job[] = [
  {
    id: "sample-swift-kochi",
    sample: true,
    title: "Maruti Swift 2019 · Wrap / PPF + Rims & tyres",
    make: "Maruti",
    model: "Swift",
    year: 2019,
    photos: [],
    modTypes: ["wrap", "wheels"],
    description: "Want a satin black wrap with gloss black 16 inch alloys. Daily driver, needs to survive the monsoon.",
    city: "Kochi",
    budgetMin: 60000,
    budgetMax: 90000,
    status: "open",
    createdAt: at(0),
    closesAt: at(7),
    bidCount: 4,
  },
  {
    id: "sample-thar-coimbatore",
    sample: true,
    title: "Mahindra Thar 2023 · Lighting + Suspension +1",
    make: "Mahindra",
    model: "Thar",
    year: 2023,
    photos: [],
    modTypes: ["lighting", "suspension", "bodykit"],
    description: "Weekend trips to Valparai. Looking for RTO-legal aux lights, a mild lift and steel bumpers.",
    city: "Coimbatore",
    budgetMin: 150000,
    budgetMax: 250000,
    status: "open",
    createdAt: at(-0.5),
    closesAt: at(4),
    bidCount: 7,
  },
  {
    id: "sample-city-bengaluru",
    sample: true,
    title: "Honda City 2021 · Interior + Audio",
    make: "Honda",
    model: "City",
    year: 2021,
    photos: [],
    modTypes: ["interior", "audio"],
    description: "Tan leather seat covers, ambient lighting and a better 9 inch head unit with wireless CarPlay.",
    city: "Bengaluru",
    budgetMin: 40000,
    budgetMax: 70000,
    status: "open",
    createdAt: at(-0.8),
    closesAt: at(3),
    bidCount: 2,
  },
];
