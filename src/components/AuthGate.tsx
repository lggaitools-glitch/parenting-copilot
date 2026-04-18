"use client";

import { useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";

interface AuthGateProps {
  onContinueLocal: () => void;
}

export default function AuthGate({ onContinueLocal }: AuthGateProps) {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleMagicLink() {
    if (!supabase || !email.trim()) return;

    setLoading(true);
    setStatus(null);

    const redirectTo =
      typeof window !== "undefined" ? window.location.origin : undefined;

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: redirectTo },
    });

    setLoading(false);
    setStatus(
      error
        ? error.message
        : "Check your email. The sign-in link is on its way.",
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7efe8] px-4 py-8">
      <div className="w-full max-w-md rounded-[28px] bg-[#fffaf6] p-6 shadow-sm ring-1 ring-black/5 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a26d4f]">
          Gentle sleep support
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
          Welcome back
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Sign in to pick up where you left off and keep your baby&apos;s sleep
          context in one place.
        </p>

        {supabase ? (
          <div className="mt-6 space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#a26d4f] focus:ring-2 focus:ring-[#a26d4f]/20"
            />
            <button
              onClick={handleMagicLink}
              disabled={!email.trim() || loading}
              className="w-full rounded-full bg-[#2f3e34] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#243028] disabled:opacity-40"
            >
              {loading ? "Sending..." : "Email me a sign-in link"}
            </button>
            {status ? (
              <p className="text-sm leading-6 text-slate-600">{status}</p>
            ) : null}
          </div>
        ) : (
          <div className="mt-6 rounded-3xl bg-[#f3dfd2] p-4 text-sm leading-6 text-[#6f4733]">
            Sign-in is temporarily unavailable, but you can still continue and
            try the app.
          </div>
        )}

        <button
          onClick={onContinueLocal}
          className="mt-6 w-full rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
        >
          Continue for now
        </button>
      </div>
    </main>
  );
}
