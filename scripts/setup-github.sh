#!/usr/bin/env bash
# Creates track labels and starter issues. Usage: scripts/setup-github.sh [owner/repo]
set -euo pipefail
REPO="${1:-$(gh repo view --json nameWithOwner -q .nameWithOwner)}"

label() { gh label create "$1" --repo "$REPO" --color "$2" --description "$3" --force; }
label "track:auth"      "1d76db" "Sign-in, profiles, sessions"
label "track:database"  "5319e7" "Schema, migrations, RLS"
label "track:marketplace" "c2185b" "Jobs, bids, renders, shops"
label "track:community" "0e8a16" "Builds, comments, chat"
label "track:ai"        "d93f0b" "Claude-powered mod suggestions"
label "track:ui"        "fbca04" "Design, pages, i18n"
label "track:payments"  "b60205" "Razorpay and monetisation"

issue() { gh issue create --repo "$REPO" --label "$1" --title "$2" --body "$3"; }
issue track:auth "Add phone OTP sign-in" "Enable Phone provider in Supabase with an Indian SMS provider (MSG91 or Twilio) and add a phone OTP form to /login."
issue track:auth "Profile onboarding" "After first sign-in, ask for username, city and state, and preferred language. Store in profiles."
issue track:database "Apply initial migration to Supabase" "Run supabase/migrations/0001_init.sql against the project and verify RLS policies."
issue track:database "Create Storage bucket for build photos" "Create a public 'builds' bucket with policies so users can only upload into their own folder."
issue track:marketplace "Post a job flow" "Owner uploads car photos, picks city, budget range and mod types, and publishes a job (jobs table)."
issue track:marketplace "Shop and creator onboarding" "Sign-up flow for shops and 3D creators (shops table), portfolio, and admin verification for the KSTM Pro badge."
issue track:marketplace "Bidding with renders and quotes" "Shops submit renders, price and timeline on open jobs. Owner compares bids side by side and accepts one."
issue track:community "Build showcase pages" "List, detail and create pages for builds with photo upload."
issue track:community "Comments and likes on builds" "Comment thread with realtime updates, plus like button."
issue track:community "City chat rooms" "Realtime chat per room (General, Chennai, Bengaluru, Kochi, Hyderabad)."
issue track:ai "AI mod advisor page" "UI for /api/ai/suggest: vehicle, goal, budget, city. Show suggestions with INR prices and legal notes."
issue track:ai "Ground AI suggestions in the parts catalog" "Embed mod_parts with pgvector and pass the closest matches to Claude."
issue track:ai "Rate-limit AI requests per user" "Limit calls per user per day to control API cost."
issue track:ui "Design system and navigation" "Header, footer, mobile nav, shared components in src/components/ui."
issue track:ui "Regional language support" "Add i18n for Tamil, Malayalam, Kannada and Telugu."
issue track:payments "KSTM Pay escrow with Razorpay" "Prototype escrow: owner pays on bid acceptance, funds release to the shop on owner approval (Razorpay Route or similar)."
