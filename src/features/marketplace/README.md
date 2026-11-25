# Marketplace track
Owners post jobs; shops and creators bid with renders and quotes. Tables in `supabase/migrations/0002_marketplace.sql`.

## Post a job (issue #5)
- Pages: `/jobs/new` (4-step form), `/jobs/[id]` (job page), `/jobs` (open jobs list).
- `options.ts` cities, mod types, budget presets. `types.ts` form rules (zod).
- `jobs-repo.ts` is the only place that stores jobs. It runs in **demo mode** today (browser
  localStorage plus `sample-jobs.ts`), so no Supabase or API keys are needed. Swap it for
  Supabase once the database and Storage bucket are live.
