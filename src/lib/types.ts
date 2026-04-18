export interface BabyProfile {
  id?: string;
  parentName: string;
  babyName: string;
  babyAgeMonths: number;
  feedingType: "breast" | "bottle" | "mixed" | "solids";
  sleepSetup: string;
  currentChallenges: string[];
  currentGoals: string[];
}

export interface SleepLog {
  id: string;
  date: string;
  bedtime: string;
  nightWakings: number;
  longestStretch: string;
  naps: number;
  notes: string;
}

export interface ChatMessage {
  id?: string;
  role: "user" | "assistant";
  text: string;
  timestamp: number;
}

export interface AppState {
  profile: BabyProfile | null;
  sleepLogs: SleepLog[];
  chatMessages: ChatMessage[];
}

export interface UserSession {
  email: string;
}
