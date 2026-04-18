import type { AppState } from "./types";

const STORAGE_KEY = "parenting-copilot-state";

function normalizeState(raw: unknown): AppState {
  const base: AppState = { profile: null, sleepLogs: [], chatMessages: [] };

  if (!raw || typeof raw !== "object") return base;

  const candidate = raw as Partial<AppState> & {
    profile?: Partial<AppState["profile"]> & {
      currentGoal?: string;
      currentGoals?: string[];
      currentChallenge?: string;
      currentChallenges?: string[];
    };
  };

  const profile = candidate.profile;
  if (!profile) {
    return {
      profile: null,
      sleepLogs: Array.isArray(candidate.sleepLogs) ? candidate.sleepLogs : [],
      chatMessages: Array.isArray(candidate.chatMessages) ? candidate.chatMessages : [],
    };
  }

  const currentGoals = Array.isArray(profile.currentGoals)
    ? profile.currentGoals
    : profile.currentGoal
      ? [profile.currentGoal]
      : [];

  const currentChallenges = Array.isArray(profile.currentChallenges)
    ? profile.currentChallenges
    : profile.currentChallenge
      ? [profile.currentChallenge]
      : [];

  return {
    profile: {
      id: profile.id,
      parentName: profile.parentName ?? "",
      babyName: profile.babyName ?? "",
      babyAgeMonths: Number(profile.babyAgeMonths ?? 0),
      feedingType:
        profile.feedingType === "bottle" ||
        profile.feedingType === "mixed" ||
        profile.feedingType === "solids"
          ? profile.feedingType
          : "breast",
      sleepSetup: profile.sleepSetup ?? "Crib in parents' room",
      currentChallenges,
      currentGoals,
    },
    sleepLogs: Array.isArray(candidate.sleepLogs) ? candidate.sleepLogs : [],
    chatMessages: Array.isArray(candidate.chatMessages) ? candidate.chatMessages : [],
  };
}

export function loadState(): AppState {
  if (typeof window === "undefined") {
    return { profile: null, sleepLogs: [], chatMessages: [] };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return normalizeState(JSON.parse(raw));
  } catch {
    // ignore browser storage errors
  }

  return { profile: null, sleepLogs: [], chatMessages: [] };
}

export function saveState(state: AppState): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore browser storage errors
  }
}

export function clearState(): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore browser storage errors
  }
}
