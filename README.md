# KSTM Bay

**Post your car. Get competing mods.** A marketplace and community for custom car culture in South India. Owners post their car and a budget; verified detailing shops and 3D creators reply with renders and itemised quotes; payment sits in escrow until the owner approves the finished build. Around that: build showcases, comments, city chat rooms, and AI mod suggestions that respect Indian road rules (RTO, CMVR).

Brand: "Render Stack" logo (`src/components/ui/Logo.tsx`), dark theme with signal red `#FF3B2F`, amber `#FFB300` and trust cyan `#19E3C8` (tokens in `src/app/globals.css`).

## Stack

- **Next.js 15** (App Router, TypeScript) + **Tailwind CSS 4**, deployed on **Vercel**
- **Supabase**: Auth (email, Google, phone OTP), Postgres, Storage, Realtime, pgvector
- **Claude API** for mod suggestions (`@anthropic-ai/sdk`)
- Later: Razorpay, Google Maps, Tamil / Malayalam / Kannada / Telugu i18n

## Getting started

**Quick look (no accounts needed):** run `npm install` then `npm run dev`. Without Supabase keys the site runs in demo mode: the Post a job flow (`/jobs/new`) saves jobs in your browser and shows sample jobs, and on any job page you can switch between **Car owner** and **Shop** to place bids (sample renders + itemised INR quotes), compare them and pick a winner. Follow the steps below when you want real sign-ins and data.


1. Install Node.js 20 or newer, then:
   ```bash
   npm install
   cp .env.example .env.local
   ```
2. Create a free project at [supabase.com](https://supabase.com). From **Project Settings > API**, copy the URL and anon key into `.env.local`.
3. Create the database tables: open **SQL Editor** in Supabase and run the files in `supabase/migrations/` in order (or use `supabase db push` with the Supabase CLI).
4. In Supabase **Authentication > Providers**, enable Email and Google. Add `http://localhost:3000/auth/callback` to the redirect URLs.
5. Get a Claude API key at [console.anthropic.com](https://console.anthropic.com) and set `ANTHROPIC_API_KEY` in `.env.local`.
6. Run it:
   ```bash
   npm run dev
   ```
   Open http://localhost:3000.

## Project layout

```
src/
  app/                 Pages and API routes (App Router)
    api/ai/suggest/    POST endpoint for AI mod suggestions
    auth/callback/     OAuth / magic-link callback
    login/             Sign-in page
  components/ui/       Shared UI components
  components/ui/Logo.tsx  Render Stack logo
  features/            One folder per task track (auth, marketplace, community, ai, payments)
  lib/supabase/        Browser, server and middleware Supabase clients
  lib/ai/              Claude client and system prompt
  middleware.ts        Keeps the Supabase session fresh
supabase/migrations/   Database schema with Row Level Security
scripts/               One-off helpers (GitHub labels and issues)
```

## Task tracks

Work is tracked as GitHub issues with these labels: `track:auth`, `track:database`, `track:marketplace`, `track:community`, `track:ai`, `track:ui`, `track:payments`. Run `scripts/setup-github.sh` once (needs the `gh` CLI, logged in) to create them.

## Deploying

Import the repo in Vercel, add the same environment variables from `.env.example`, and add your Vercel domain's `/auth/callback` to Supabase redirect URLs.

## Security notes

- Never commit `.env.local`. Only `.env.example` (no secrets) is tracked.
- `SUPABASE_SERVICE_ROLE_KEY` and `ANTHROPIC_API_KEY` are server-only. Never prefix them with `NEXT_PUBLIC_`.
- Every table has Row Level Security on. Add a policy whenever you add a table.
