import type { Bid, Shop } from "./bids";

export const SAMPLE_SHOPS: Shop[] = [
  { id: "shop-wrapcult", name: "WrapCult Kochi", kind: "shop", city: "Kochi", verified: true, rating: 4.8, jobsDone: 126 },
  { id: "shop-torque", name: "Torque Garage", kind: "shop", city: "Coimbatore", verified: true, rating: 4.6, jobsDone: 88 },
  { id: "shop-renderarjun", name: "Renders by Arjun", kind: "creator", city: "Chennai", verified: true, rating: 4.9, jobsDone: 212 },
  { id: "shop-blr-detail", name: "BLR Detailing Co.", kind: "shop", city: "Bengaluru", verified: false, rating: 4.3, jobsDone: 31 },
  { id: "shop-offroad", name: "Western Ghats Offroad", kind: "shop", city: "Coimbatore", verified: true, rating: 4.7, jobsDone: 64 },
  { id: "shop-hyd-custom", name: "Hyderabad Custom Works", kind: "shop", city: "Hyderabad", verified: false, rating: 4.4, jobsDone: 19 },
];

const shop = (id: string) => SAMPLE_SHOPS.find((s) => s.id === id)!;
const hour = 3_600_000;
const ago = (h: number) => new Date(Date.now() - h * hour).toISOString();

function bid(b: Omit<Bid, "priceInr" | "status" | "mine" | "shop"> & { shopId: string }): Bid {
  const { shopId, ...rest } = b;
  return { ...rest, shop: shop(shopId), priceInr: b.lines.reduce((s, l) => s + l.amount, 0), status: "pending", mine: false };
}

/** Example bids on the sample jobs, so the compare view has something to show in demo mode. */
export const SAMPLE_BIDS: Bid[] = [
  // Maruti Swift, Kochi: satin black wrap + rims, budget ₹60k – ₹90k
  bid({
    id: "sb-swift-1", jobId: "sample-swift-kochi", shopId: "shop-wrapcult", createdAt: ago(20), daysEstimate: 4,
    renders: ["preset:satin-black:hatch", "preset:gloss-black-rims:hatch"],
    lines: [
      { label: "Satin black wrap (3M 2080), full body", amount: 52000 },
      { label: "16 inch gloss black alloys, set of 4", amount: 26000 },
      { label: "Wheel alignment and balancing", amount: 1500 },
    ],
    notes: "Door shuts included. 2 year warranty on the wrap. We seal edges for the monsoon.",
  }),
  bid({
    id: "sb-swift-2", jobId: "sample-swift-kochi", shopId: "shop-renderarjun", createdAt: ago(14), daysEstimate: 6,
    renders: ["preset:satin-black:hatch"],
    lines: [
      { label: "Satin black wrap (Avery SW900), body only", amount: 41000 },
      { label: "16 inch alloys (Neo Wheels), set of 4", amount: 22000 },
    ],
    notes: "Render plus partner install at a Kochi shop. Door shuts are ₹6,000 extra.",
  }),
  bid({
    id: "sb-swift-3", jobId: "sample-swift-kochi", shopId: "shop-blr-detail", createdAt: ago(9), daysEstimate: 3,
    renders: ["preset:nardo-grey:hatch"],
    lines: [
      { label: "Satin wrap, full body incl. door shuts", amount: 58000 },
      { label: "16 inch gloss black alloys + new tyres", amount: 38000 },
    ],
    notes: "Also mocked up Nardo grey in case you want options. Price includes Apollo tyres.",
  }),
  bid({
    id: "sb-swift-4", jobId: "sample-swift-kochi", shopId: "shop-hyd-custom", createdAt: ago(3), daysEstimate: 5,
    renders: ["preset:satin-black:hatch"],
    lines: [
      { label: "Satin black wrap, full body", amount: 46000 },
      { label: "15 inch alloys, set of 4", amount: 18000 },
    ],
    notes: "",
  }),

  // Mahindra Thar, Coimbatore: lights, lift, bumpers, budget ₹1.5L – ₹2.5L
  bid({
    id: "sb-thar-1", jobId: "sample-thar-coimbatore", shopId: "shop-offroad", createdAt: ago(10), daysEstimate: 7,
    renders: ["preset:army-green-offroad:suv"],
    lines: [
      { label: "2 inch lift kit with OME shocks", amount: 78000 },
      { label: "Steel front + rear bumpers", amount: 64000 },
      { label: "Aux fog lamps, RTO-legal amber", amount: 18000 },
      { label: "Fitment and alignment", amount: 6000 },
    ],
    notes: "We do Valparai and Topslip runs ourselves. Lift stays within CMVR height limits.",
  }),
  bid({
    id: "sb-thar-2", jobId: "sample-thar-coimbatore", shopId: "shop-torque", createdAt: ago(6), daysEstimate: 10,
    renders: ["preset:sand-offroad:suv"],
    lines: [
      { label: "1.5 inch spacer lift", amount: 32000 },
      { label: "Steel bumpers with winch mount", amount: 82000 },
      { label: "LED aux lights + wiring harness", amount: 24000 },
    ],
    notes: "Winch-ready bumper, winch not included.",
  }),
  bid({
    id: "sb-thar-3", jobId: "sample-thar-coimbatore", shopId: "shop-renderarjun", createdAt: ago(2), daysEstimate: 12,
    renders: ["preset:army-green-offroad:suv", "preset:stealth-grey:suv"],
    lines: [
      { label: "2.5 inch lift kit, full suspension", amount: 120000 },
      { label: "Steel bumpers, powder coated", amount: 70000 },
      { label: "Aux lights, RTO-legal", amount: 22000 },
    ],
    notes: "Two looks rendered. Install through a partner shop in Coimbatore.",
  }),

  // Honda City, Bengaluru: interior + audio, budget ₹40k – ₹70k
  bid({
    id: "sb-city-1", jobId: "sample-city-bengaluru", shopId: "shop-blr-detail", createdAt: ago(8), daysEstimate: 2,
    renders: ["preset:pearl-white-interior:sedan"],
    lines: [
      { label: "Tan leatherette seat covers", amount: 18000 },
      { label: "Ambient lighting, 64 colour", amount: 9000 },
      { label: "9 inch Android head unit, wireless CarPlay", amount: 24000 },
    ],
    notes: "Can do it at your place in Bengaluru.",
  }),
  bid({
    id: "sb-city-2", jobId: "sample-city-bengaluru", shopId: "shop-hyd-custom", createdAt: ago(1), daysEstimate: 3,
    renders: ["preset:pearl-white-interior:sedan"],
    lines: [
      { label: "Nappa tan seat covers", amount: 26000 },
      { label: "Ambient lighting", amount: 7000 },
      { label: "Pioneer 9 inch head unit", amount: 32000 },
    ],
    notes: "",
  }),
];
