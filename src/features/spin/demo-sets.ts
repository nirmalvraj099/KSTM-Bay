import { frameUrls, type SpinSet } from "./types";

/**
 * Placeholder sets for the /spin prototype. The frames are simple 3D-rendered
 * stand-ins (not real cars) so the viewer can be tested before real AI renders
 * and shop photos exist. Swap the URLs for Supabase Storage paths later.
 */
export const DEMO_AI_SET: SpinSet = {
  id: "demo-ai",
  title: "AI concept · 8 views",
  alt: "Red coupe concept with gloss paint and black wheels",
  source: "ai",
  frames: frameUrls("/spin/demo/ai-render", 8),
};

export const DEMO_PHOTO_SET: SpinSet = {
  id: "demo-photo",
  title: "Finished build · 36 turntable photos",
  alt: "Olive green SUV with roof light bar and rear spare wheel on a shop turntable",
  source: "photo",
  verified: true,
  frames: frameUrls("/spin/demo/shop-photo", 36),
};
