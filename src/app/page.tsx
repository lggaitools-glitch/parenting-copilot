"use client";

import { useEffect, useMemo, useState } from "react";
import AuthGate from "@/components/AuthGate";
import Onboarding from "@/components/Onboarding";
import {
  addChatMessage,
  addSleepLog,
  bootstrapMessages,
  createCoachReply,
  loadRemoteState,
  saveProfile,
} from "@/lib/app-sync";
import { getSuggestedPlan } from "@/lib/data";
import { clearState, loadState, saveState } from "@/lib/storage";
import {
  exchangeCodeForSession,
  hasSupabaseEnv,
  hasSupabaseSession,
} from "@/lib/supabase";
import type { AppState, BabyProfile, ChatMessage, SleepLog } from "@/lib/types";

const emptyLog = {
  date: new Date().toISOString().slice(0, 10),
  bedtime: "19:30",
  nightWakings: 2,
  longestStretch: "4h 00m",
  naps: 3,
  notes: "",
};

function formatFeedingType(value: BabyProfile["feedingType"]) {
  switch (value) {
    case "breast":
      return "Breastfeeding";
    case "bottle":
      return "Bottle / Formula";
    case "mixed":
      return "Breast + Bottle";
    case "solids":
      return "Solids + Milk";
    default:
      return value;
  }
}

function createAssistantMessage(text: string): ChatMessage {
  return {
    role: "assistant",
    text,
    timestamp: Date.now(),
  };
}

function createUserMessage(text: string): ChatMessage {
  return {
    role: "user",
    text,
    timestamp: Date.now(),
  };
}

export default function Home() {
  const [state, setState] = useState<AppState>(() => loadState());
  const [draftMessage, setDraftMessage] = useState("");
  const [logDraft, setLogDraft] = useState(emptyLog);
  const [showLogForm, setShowLogForm] = useState(false);
  const [authScreenDismissed, setAuthScreenDismissed] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      if (!hasSupabaseEnv()) {
        setIsBootstrapping(false);
        return;
      }

      await exchangeCodeForSession();
      const sessionExists = await hasSupabaseSession();

      if (!cancelled && sessionExists) {
        setAuthScreenDismissed(true);
      }

      const remoteState = await loadRemoteState();
      if (!cancelled && remoteState) {
        setState(remoteState);
      }

      if (!cancelled) {
        setIsBootstrapping(false);
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const profile = state.profile;
  const latestLog = state.sleepLogs[0] ?? null;

  const suggestedPlan = useMemo(() => {
    return profile ? getSuggestedPlan(profile) : [];
  }, [profile]);

  async function handleOnboardingComplete(profileData: BabyProfile) {
    const savedProfile = await saveProfile(profileData);
    const initialMessages = bootstrapMessages(savedProfile);

    setState({
      profile: savedProfile,
      sleepLogs: [],
      chatMessages: initialMessages,
    });

    await Promise.all(initialMessages.map((message) => addChatMessage(message)));
  }

  async function handleSendMessage() {
    if (!profile || !draftMessage.trim() || isSending) return;

    const userText = draftMessage.trim();
    const userMessage = createUserMessage(userText);

    setIsSending(true);
    setState((current) => ({
      ...current,
      chatMessages: [...current.chatMessages, userMessage],
    }));
    setDraftMessage("");
    await addChatMessage(userMessage);

    const replyText = await createCoachReply(profile, userText);
    const assistantReply = createAssistantMessage(replyText);

    setState((current) => ({
      ...current,
      chatMessages: [...current.chatMessages, assistantReply],
    }));
    await addChatMessage(assistantReply);
    setIsSending(false);
  }

  function handleQuickPrompt(prompt: string) {
    setDraftMessage(prompt);
  }

  async function handleAddLog() {
    if (!profile) return;

    const newLog: SleepLog = {
      id: crypto.randomUUID(),
      date: logDraft.date,
      bedtime: logDraft.bedtime,
      nightWakings: logDraft.nightWakings,
      longestStretch: logDraft.longestStretch,
      naps: logDraft.naps,
      notes: logDraft.notes.trim(),
    };

    const savedLog = await addSleepLog(newLog);

    const summaryPrompt = `I logged today's sleep: bedtime ${savedLog.bedtime}, ${savedLog.nightWakings} night wakings, longest stretch ${savedLog.longestStretch}, ${savedLog.naps} naps. Notes: ${savedLog.notes || "none"}. What should I focus on tonight?`;

    const userMessage = createUserMessage(summaryPrompt);
    setState((current) => ({
      ...current,
      sleepLogs: [savedLog, ...current.sleepLogs],
      chatMessages: [...current.chatMessages, userMessage],
    }));
    await addChatMessage(userMessage);

    const replyText = await createCoachReply(profile, summaryPrompt);
    const assistantReply = createAssistantMessage(replyText);

    setState((current) => ({
      ...current,
      chatMessages: [...current.chatMessages, assistantReply],
    }));
    await addChatMessage(assistantReply);

    setShowLogForm(false);
    setLogDraft({
      ...emptyLog,
      date: new Date().toISOString().slice(0, 10),
    });
  }

  function handleReset() {
    clearState();
    setState({ profile: null, sleepLogs: [], chatMessages: [] });
    setDraftMessage("");
    setShowLogForm(false);
    setAuthScreenDismissed(false);
    setLogDraft({
      ...emptyLog,
      date: new Date().toISOString().slice(0, 10),
    });
  }

  if (isBootstrapping) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7efe8] text-slate-700">
        Getting everything ready...
      </main>
    );
  }

  if (!authScreenDismissed) {
    return <AuthGate onContinueLocal={() => setAuthScreenDismissed(true)} />;
  }

  if (!profile) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <main className="min-h-screen bg-[#f7efe8] text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-4 lg:flex-row lg:px-6 lg:py-6">
        <aside className="w-full rounded-[28px] bg-[#fffaf6] p-5 shadow-sm ring-1 ring-black/5 lg:max-w-sm">
          <div className="mb-6 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a26d4f]">
                Tonight’s support
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                Baby Sleep Coach
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setState((current) => ({ ...current, profile: null }))}
                className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-500 ring-1 ring-slate-200 transition hover:text-slate-900"
              >
                Edit profile
              </button>
              <button
                onClick={handleReset}
                className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-500 ring-1 ring-slate-200 transition hover:text-slate-900"
              >
                Reset
              </button>
            </div>
          </div>

          <p className="text-sm leading-6 text-slate-600">
            Gentle, practical guidance for {profile.babyName}, tailored to what is
            happening right now and what you want to improve next.
          </p>

          <section className="mt-8 rounded-3xl bg-white p-4 ring-1 ring-black/5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Baby profile
                </p>
                <h2 className="mt-1 text-lg font-semibold">{profile.babyName}</h2>
              </div>
              <div className="rounded-full bg-[#eef4ea] px-3 py-1 text-xs font-medium text-[#4d6b44]">
                {profile.babyAgeMonths} months
              </div>
            </div>

            <dl className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="flex justify-between gap-4">
                <dt>Parent</dt>
                <dd className="font-medium text-slate-900">{profile.parentName}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Current goals</dt>
                <dd className="text-right font-medium text-slate-900">
                  {profile.currentGoals.join(", ")}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Challenges</dt>
                <dd className="text-right font-medium text-slate-900">
                  {profile.currentChallenges.join(", ")}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Sleep setup</dt>
                <dd className="text-right font-medium text-slate-900">
                  {profile.sleepSetup}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Feeding</dt>
                <dd className="text-right font-medium text-slate-900">
                  {formatFeedingType(profile.feedingType)}
                </dd>
              </div>
            </dl>
          </section>

          <section className="mt-5 rounded-3xl bg-[#2f3e34] p-4 text-white">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs uppercase tracking-[0.18em] text-white/60">
                Today&rsquo;s snapshot
              </p>
              <button
                onClick={() => setShowLogForm((value) => !value)}
                className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white transition hover:bg-white/20"
              >
                {showLogForm ? "Hide form" : "Log sleep"}
              </button>
            </div>

            {latestLog ? (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <SummaryCard label="Date" value={latestLog.date} />
                <SummaryCard label="Bedtime" value={latestLog.bedtime} />
                <SummaryCard
                  label="Night wakings"
                  value={String(latestLog.nightWakings)}
                />
                <SummaryCard
                  label="Longest stretch"
                  value={latestLog.longestStretch}
                />
                <SummaryCard label="Naps" value={String(latestLog.naps)} />
                <SummaryCard
                  label="Status"
                  value={latestLog.nightWakings <= 2 ? "Improving" : "Needs support"}
                />
              </div>
            ) : (
              <p className="mt-4 text-sm leading-6 text-white/75">
                No sleep log yet. Add one to ground the coach in today&rsquo;s
                actual night and nap pattern.
              </p>
            )}

            {showLogForm && (
              <div className="mt-4 space-y-3 rounded-3xl bg-white/8 p-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Date">
                    <input
                      type="date"
                      value={logDraft.date}
                      onChange={(e) =>
                        setLogDraft((current) => ({
                          ...current,
                          date: e.target.value,
                        }))
                      }
                      className="w-full rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none"
                    />
                  </Field>
                  <Field label="Bedtime">
                    <input
                      type="time"
                      value={logDraft.bedtime}
                      onChange={(e) =>
                        setLogDraft((current) => ({
                          ...current,
                          bedtime: e.target.value,
                        }))
                      }
                      className="w-full rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none"
                    />
                  </Field>
                  <Field label="Night wakings">
                    <input
                      type="number"
                      min={0}
                      value={logDraft.nightWakings}
                      onChange={(e) =>
                        setLogDraft((current) => ({
                          ...current,
                          nightWakings: Math.max(0, Number(e.target.value) || 0),
                        }))
                      }
                      className="w-full rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none"
                    />
                  </Field>
                  <Field label="Naps">
                    <input
                      type="number"
                      min={0}
                      value={logDraft.naps}
                      onChange={(e) =>
                        setLogDraft((current) => ({
                          ...current,
                          naps: Math.max(0, Number(e.target.value) || 0),
                        }))
                      }
                      className="w-full rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none"
                    />
                  </Field>
                </div>

                <Field label="Longest stretch">
                  <input
                    type="text"
                    value={logDraft.longestStretch}
                    onChange={(e) =>
                      setLogDraft((current) => ({
                        ...current,
                        longestStretch: e.target.value,
                      }))
                    }
                    placeholder="e.g. 4h 20m"
                    className="w-full rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40"
                  />
                </Field>

                <Field label="Notes">
                  <textarea
                    value={logDraft.notes}
                    onChange={(e) =>
                      setLogDraft((current) => ({
                        ...current,
                        notes: e.target.value,
                      }))
                    }
                    placeholder="Late last nap, fought bedtime, woke crying at 01:30..."
                    className="min-h-24 w-full rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40"
                  />
                </Field>

                <button
                  onClick={() => void handleAddLog()}
                  className="w-full rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-[#2f3e34] transition hover:bg-[#f3ede8]"
                >
                  Save log and update coach
                </button>
              </div>
            )}
          </section>

          <section className="mt-5 rounded-3xl bg-white p-4 ring-1 ring-black/5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
              Suggested tonight
            </p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
              {suggestedPlan.map((tip) => (
                <li key={tip}>• {tip}</li>
              ))}
            </ul>
          </section>

          <section className="mt-5 rounded-3xl bg-[#f3dfd2] p-4 text-sm text-[#6f4733]">
            <p className="font-semibold">Quick prompts</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                "What should I change tonight?",
                "Make me a 3-night plan",
                "Help with short naps",
                "What schedule fits this age?",
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleQuickPrompt(prompt)}
                  className="rounded-full bg-white px-3 py-2 text-xs font-medium transition hover:bg-[#fff7f2]"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </section>
        </aside>

        <section className="flex min-h-[720px] flex-1 flex-col rounded-[28px] bg-white shadow-sm ring-1 ring-black/5">
          <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Chat
              </p>
              <h2 className="mt-1 text-xl font-semibold">Sleep support</h2>
            </div>
          </header>

          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-5">
            {state.chatMessages.map((message, index) => {
              const isAssistant = message.role === "assistant";

              return (
                <div
                  key={`${message.timestamp}-${index}`}
                  className={`flex ${isAssistant ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[90%] rounded-3xl px-4 py-3 text-sm leading-6 shadow-sm sm:max-w-[80%] ${
                      isAssistant
                        ? "bg-[#f8f4ef] text-slate-800"
                        : "bg-[#2f3e34] text-white"
                    }`}
                  >
                    <p className="whitespace-pre-line">{message.text}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-slate-100 p-4">
            <div className="rounded-[24px] bg-[#fcfaf8] p-3 ring-1 ring-slate-200">
              <textarea
                className="min-h-24 w-full resize-none bg-transparent text-sm leading-6 text-slate-700 outline-none placeholder:text-slate-400"
                placeholder="Ask about bedtime, naps, night wakings, or ask for a 3-night plan..."
                value={draftMessage}
                onChange={(e) => setDraftMessage(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                    void handleSendMessage();
                  }
                }}
              />
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-xs text-slate-400">
                  Your sleep coach keeps today’s context in mind as you keep chatting.
                </p>
                <button
                  onClick={() => void handleSendMessage()}
                  disabled={!draftMessage.trim() || isSending}
                  className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-40"
                >
                  {isSending ? "Sending..." : "Send"}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/8 p-3">
      <p className="text-xs text-white/60">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm text-white/80">
      <span className="mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}
