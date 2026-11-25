# AI track
`POST /api/ai/suggest` calls Claude with a South-India-aware mod advisor prompt (`src/lib/ai/claude.ts`). Next: ground answers in the `mod_parts` catalog via pgvector, rate-limit per user, save suggestion history.
