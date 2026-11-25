"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  async function signInWithGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  async function signInWithEmail(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setStatus(error ? error.message : "Check your inbox for a sign-in link.");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-4">
      <h1 className="disp text-3xl">Sign in to KSTM Bay</h1>
      <button
        onClick={signInWithGoogle}
        className="rounded-lg border border-line px-4 py-2 font-medium hover:bg-panel"
      >
        Continue with Google
      </button>
      <form onSubmit={signInWithEmail} className="flex flex-col gap-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="rounded-lg border border-line bg-panel px-3 py-2"
        />
        <button className="rounded-lg bg-gradient-to-r from-a1 to-a2 px-4 py-2 font-semibold text-bg">
          Email me a link
        </button>
      </form>
      {/* TODO(auth track): phone OTP via supabase.auth.signInWithOtp({ phone }) */}
      {status && <p className="text-sm text-mut">{status}</p>}
    </main>
  );
}
