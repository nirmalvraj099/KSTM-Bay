"use client";

import { isDemoMode } from "./jobs-repo";

export function DemoBanner() {
  if (!isDemoMode) return null;
  return (
    <p className="mt-4 rounded-lg border border-a2/40 bg-a2/10 px-4 py-2 text-sm text-a2">
      <b>Demo mode.</b> Jobs, bids and picks are saved in this browser only, and renders are samples. Nothing is sent to shops yet.
    </p>
  );
}
