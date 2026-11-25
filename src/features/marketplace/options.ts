/** Fixed choices for the Post a job form. */

export const CITIES = [
  "Chennai",
  "Coimbatore",
  "Madurai",
  "Bengaluru",
  "Mysuru",
  "Mangaluru",
  "Kochi",
  "Thiruvananthapuram",
  "Kozhikode",
  "Hyderabad",
  "Visakhapatnam",
  "Vijayawada",
  "Puducherry",
] as const;

export const MOD_TYPES = [
  { id: "wrap", label: "Wrap / PPF", hint: "Colour change, satin, chrome delete" },
  { id: "wheels", label: "Rims & tyres", hint: "Alloys, offsets, tyre upgrades" },
  { id: "bodykit", label: "Body kit", hint: "Lips, skirts, spoilers, diffusers" },
  { id: "lighting", label: "Lighting", hint: "Projectors, DRLs, tail lamps" },
  { id: "interior", label: "Interior", hint: "Seat covers, ambient light, steering" },
  { id: "audio", label: "Audio", hint: "Head unit, speakers, sub" },
  { id: "suspension", label: "Suspension", hint: "Lowering springs, coilovers" },
  { id: "detailing", label: "Detailing", hint: "Ceramic coat, paint correction" },
  { id: "full", label: "Full build", hint: "Let the shops pitch the whole look" },
] as const;

export type ModTypeId = (typeof MOD_TYPES)[number]["id"];

export const BUDGET_PRESETS = [
  { label: "Under ₹25k", min: 5000, max: 25000 },
  { label: "₹25k – ₹75k", min: 25000, max: 75000 },
  { label: "₹75k – ₹2L", min: 75000, max: 200000 },
  { label: "₹2L – ₹5L", min: 200000, max: 500000 },
  { label: "₹5L +", min: 500000, max: 1500000 },
] as const;

export const BIDDING_DAYS = [3, 5, 7, 14] as const;

export const MAX_PHOTOS = 6;

/** ₹1,25,000 style (Indian digit grouping). */
export function formatINR(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

export function modLabel(id: string) {
  return MOD_TYPES.find((m) => m.id === id)?.label ?? id;
}
