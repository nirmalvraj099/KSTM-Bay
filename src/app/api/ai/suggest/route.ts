import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { anthropic, CLAUDE_MODEL, MOD_ADVISOR_SYSTEM } from "@/lib/ai/claude";
import { createClient } from "@/lib/supabase/server";

const Body = z.object({
  vehicle: z.string().min(2).max(200), // e.g. "2021 Royal Enfield Classic 350"
  goal: z.string().min(2).max(1000), // e.g. "better touring comfort, budget 30k"
  city: z.string().max(100).optional(),
});

/** POST /api/ai/suggest: AI mod suggestions for signed-in users. */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { vehicle, goal, city } = parsed.data;

  try {
    const response = await anthropic.beta.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 16000,
      output_config: { effort: "low" },
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: MOD_ADVISOR_SYSTEM,
      messages: [
        {
          role: "user",
          content: `Vehicle: ${vehicle}\nCity: ${city ?? "not given"}\nGoal: ${goal}`,
        },
      ],
    });

    if (response.stop_reason === "refusal") {
      return NextResponse.json({ error: "Could not answer that request" }, { status: 422 });
    }

    const text = response.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n");
    return NextResponse.json({ suggestions: text });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ error: "Busy, try again shortly" }, { status: 429 });
    }
    console.error("AI suggest failed", err);
    return NextResponse.json({ error: "AI service error" }, { status: 502 });
  }
}
