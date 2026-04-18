import type { AppState } from "./types";

const STORAGE_KEY = "parenting-copilot-state";

export function loadState(): AppState {
  if (typeof window === "undefined") {
    return { profile: null, sleepLogs: [], chatMessages: [] };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AppState;
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
