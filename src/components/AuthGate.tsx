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
        : "Magic link sent. Open your email on this device and come back here.",
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7efe8] px-4 py-8">
      <div className="w-full max-w-md rounded-[28px] bg-[#fffaf6] p-6 shadow-sm ring-1 ring-black/5 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a26d4f]">
          Parenting Copilot
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
          Sign in from anywhere
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Use Supabase magic-link auth for a real synced app, or continue in local
          demo mode if env vars are not set yet.
        </p>

        {supabase ? (
          <div className="mt-6 space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#a26d4f] focus:ring-2 focus:ring-[#a26d4f]/20"
            />
            <button
              onClick={handleMagicLink}
              disabled={!email.trim() || loading}
              className="w-full rounded-full bg-[#2f3e34] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#243028] disabled:opacity-40"
            >
              {loading ? "Sending..." : "Send magic link"}
            </button>
            {status ? (
              <p className="text-sm leading-6 text-slate-600">{status}</p>
            ) : null}
          </div>
        ) : (
          <div className="mt-6 rounded-3xl bg-[#f3dfd2] p-4 text-sm leading-6 text-[#6f4733]">
            Supabase env vars are not set yet, so this browser will run in local
            mode until you connect the real backend.
          </div>
        )}

        <button
          onClick={onContinueLocal}
          className="mt-6 w-full rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
        >
          Continue to app
        </button>
      </div>
    </main>
  );
}
