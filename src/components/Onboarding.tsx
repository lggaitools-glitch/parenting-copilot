"use client";

import { useState } from "react";
import type { BabyProfile } from "@/lib/types";
import {
  FEEDING_OPTIONS,
  SLEEP_SETUP_OPTIONS,
  CHALLENGE_OPTIONS,
  GOAL_OPTIONS,
} from "@/lib/data";

interface OnboardingProps {
  onComplete: (profile: BabyProfile) => void;
}

const TOTAL_STEPS = 4;

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [parentName, setParentName] = useState("");
  const [babyName, setBabyName] = useState("");
  const [babyAgeMonths, setBabyAgeMonths] = useState(6);
  const [feedingType, setFeedingType] =
    useState<BabyProfile["feedingType"]>("breast");
  const [sleepSetup, setSleepSetup] = useState(SLEEP_SETUP_OPTIONS[0]);
  const [currentChallenges, setCurrentChallenges] = useState<string[]>([
    CHALLENGE_OPTIONS[0],
  ]);
  const [currentGoal, setCurrentGoal] = useState(GOAL_OPTIONS[0]);

  const challengeGoalPreview =
    currentChallenges.length > 0
      ? `${currentChallenges.join(", ")} → ${currentGoal}`
      : currentGoal;

  function canAdvance(): boolean {
    if (step === 0) return parentName.trim().length > 0;
    if (step === 1)
      return babyName.trim().length > 0 && babyAgeMonths >= 0;
    if (step === 3) return currentChallenges.length > 0;
    return true;
  }

  function handleNext() {
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
    } else {
      onComplete({
        parentName: parentName.trim(),
        babyName: babyName.trim(),
        babyAgeMonths,
        feedingType,
        sleepSetup,
        currentChallenges,
        currentGoal,
      });
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7efe8] px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center gap-2">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= step ? "bg-[#2f3e34]" : "bg-[#d9cec5]"
              }`}
            />
          ))}
        </div>

        <div className="rounded-[28px] bg-[#fffaf6] p-6 shadow-sm ring-1 ring-black/5 sm:p-8">
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a26d4f]">
              Step {step + 1} of {TOTAL_STEPS}
            </p>
            {step > 0 ? (
              <div className="rounded-full bg-[#f3dfd2] px-3 py-1 text-[11px] font-medium text-[#6f4733]">
                {babyName ? babyName : "Baby profile in progress"}
              </div>
            ) : null}
          </div>

          {step === 0 && (
            <div className="mt-4">
              <h1 className="text-2xl font-semibold tracking-tight">
                Welcome to Parenting Copilot
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Let&apos;s set up your sleep coaching experience. First,
                what&apos;s your name?
              </p>
              <input
                type="text"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="Your name"
                className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#a26d4f] focus:ring-2 focus:ring-[#a26d4f]/20"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && canAdvance() && handleNext()}
              />
            </div>
          )}

          {step === 1 && (
            <div className="mt-4">
              <h1 className="text-2xl font-semibold tracking-tight">
                Tell me about your baby
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                What&apos;s your baby&apos;s name and age?
              </p>
              <input
                type="text"
                value={babyName}
                onChange={(e) => setBabyName(e.target.value)}
                placeholder="Baby's name"
                className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#a26d4f] focus:ring-2 focus:ring-[#a26d4f]/20"
                autoFocus
              />
              <label className="mt-4 block text-sm font-medium text-slate-700">
                Age in months
              </label>
              <input
                type="number"
                value={babyAgeMonths}
                onChange={(e) =>
                  setBabyAgeMonths(Math.max(0, parseInt(e.target.value) || 0))
                }
                min={0}
                max={36}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#a26d4f] focus:ring-2 focus:ring-[#a26d4f]/20"
              />
            </div>
          )}

          {step === 2 && (
            <div className="mt-4">
              <h1 className="text-2xl font-semibold tracking-tight">
                Sleep setup
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                How does {babyName || "your baby"} sleep, and what are they
                eating?
              </p>

              <label className="mt-4 block text-sm font-medium text-slate-700">
                Feeding type
              </label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {FEEDING_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setFeedingType(opt.value)}
                    className={`rounded-2xl border px-3 py-2.5 text-sm transition ${
                      feedingType === opt.value
                        ? "border-[#2f3e34] bg-[#2f3e34] text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <label className="mt-5 block text-sm font-medium text-slate-700">
                Sleep setup
              </label>
              <div className="mt-2 flex flex-col gap-2">
                {SLEEP_SETUP_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setSleepSetup(opt)}
                    className={`rounded-2xl border px-3 py-2.5 text-left text-sm transition ${
                      sleepSetup === opt
                        ? "border-[#2f3e34] bg-[#2f3e34] text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="mt-4">
              <h1 className="text-2xl font-semibold tracking-tight">
                Your focus
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                What sleep challenge(s) is {babyName || "your baby"} dealing
                with right now, and what is your main goal?
              </p>

              <label className="mt-4 block text-sm font-medium text-slate-700">
                Current challenges
              </label>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Select all that apply.
              </p>
              <div className="mt-2 flex flex-col gap-2">
                {CHALLENGE_OPTIONS.map((opt) => {
                  const selected = currentChallenges.includes(opt);

                  return (
                    <button
                      key={opt}
                      onClick={() =>
                        setCurrentChallenges((current) =>
                          selected
                            ? current.filter((item) => item !== opt)
                            : [...current, opt],
                        )
                      }
                      className={`rounded-2xl border px-3 py-2.5 text-left text-sm transition ${
                        selected
                          ? "border-[#2f3e34] bg-[#2f3e34] text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              <label className="mt-5 block text-sm font-medium text-slate-700">
                Your goal
              </label>
              <div className="mt-2 flex flex-col gap-2">
                {GOAL_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setCurrentGoal(opt)}
                    className={`rounded-2xl border px-3 py-2.5 text-left text-sm transition ${
                      currentGoal === opt
                        ? "border-[#2f3e34] bg-[#2f3e34] text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 rounded-3xl bg-[#f8f2ed] p-4 text-sm text-slate-700 ring-1 ring-black/5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Setup preview
            </p>
            <dl className="mt-3 space-y-2">
              <div className="flex justify-between gap-3">
                <dt>Parent</dt>
                <dd className="font-medium text-slate-900">
                  {parentName.trim() || "Not set yet"}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Baby</dt>
                <dd className="font-medium text-slate-900">
                  {babyName.trim()
                    ? `${babyName}, ${babyAgeMonths} months`
                    : "Not set yet"}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Sleep setup</dt>
                <dd className="text-right font-medium text-slate-900">
                  {step >= 2 ? sleepSetup : "Choose in next steps"}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Focus</dt>
                <dd className="text-right font-medium text-slate-900">
                  {step >= 3 ? challengeGoalPreview : "Choose in next steps"}
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            {step > 0 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="rounded-full px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:text-slate-900"
              >
                Back
              </button>
            ) : (
              <div />
            )}
            <button
              onClick={handleNext}
              disabled={!canAdvance()}
              className="rounded-full bg-[#2f3e34] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[#243028] disabled:opacity-40"
            >
              {step === TOTAL_STEPS - 1 ? "Start coaching" : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
