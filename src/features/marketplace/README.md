# Marketplace track
Owners post jobs; shops and creators bid with renders and quotes. Tables in `supabase/migrations/0002_marketplace.sql`.

## Post a job (issue #5)
- Pages: `/jobs/new` (4-step form), `/jobs/[id]` (job page), `/jobs` (open jobs list).
- `options.ts` cities, mod types, budget presets. `types.ts` form rules (zod).
- `jobs-repo.ts` is the only place that stores jobs. It runs in **demo mode** today (browser
  localStorage plus `sample-jobs.ts`), so no Supabase or API keys are needed. Swap it for
  Supabase once the database and Storage bucket are live.

## Bidding with renders and quotes (issue #7)
- Shop side: `/jobs/[id]/bid` form with renders (upload, or pick a built-in sample render in
  demo mode), an itemised INR quote, days to finish and notes. One bid per shop per job; sending
  again updates it. Shops only see their own bid, matching the RLS policy on `bids`.
- Owner side: the job page lists bids side by side with sorting, "Lowest price" / "Fastest" /
  "Top rated" tags and a budget check, and "Pick this bid" (with a confirm step) marks the job
  awarded and the other bids declined.
- Demo mode has no sign-in, so the job page has a "Viewing as: Car owner / Shop" switch. Your own
  jobs can be filled with 3 sample bids, and "Undo pick (demo)" reopens bidding.
- `bids.ts` types and form rules, `bids-repo.ts` storage (localStorage + `sample-bids.ts`),
  `renders.ts` + `RenderImage.tsx` draw the sample renders as SVG, `BidCard.tsx` and `JobBids.tsx` UI.
- Later: swap `bids-repo.ts` for the `bids` table and Storage; accepting a bid should be a server
  route with the service role so it can award the job and start escrow (#16) together.
