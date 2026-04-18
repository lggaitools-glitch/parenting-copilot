import { generateResponse, getWelcomeMessage } from "./data";
import { getSupabaseBrowserClient } from "./supabase";
import type { AppState, BabyProfile, ChatMessage, SleepLog } from "./types";

const PROFILE_TABLE = "baby_profiles";
const LOGS_TABLE = "sleep_logs";
const MESSAGES_TABLE = "chat_messages";

export async function loadRemoteState(): Promise<AppState | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: profileRows }, { data: logRows }, { data: messageRows }] =
    await Promise.all([
      supabase.from(PROFILE_TABLE).select("*").limit(1).maybeSingle(),
      supabase
        .from(LOGS_TABLE)
        .select("*")
        .order("date", { ascending: false })
        .limit(20),
      supabase
        .from(MESSAGES_TABLE)
        .select("*")
        .order("timestamp", { ascending: true })
        .limit(100),
    ]);

  const profile = profileRows
    ? {
        id: profileRows.id,
        parentName: profileRows.parent_name,
        babyName: profileRows.baby_name,
        babyAgeMonths: profileRows.baby_age_months,
        feedingType: profileRows.feeding_type,
        sleepSetup: profileRows.sleep_setup,
        currentChallenge: profileRows.current_challenge,
        currentGoal: profileRows.current_goal,
      }
    : null;

  const sleepLogs: SleepLog[] = (logRows ?? []).map((row) => ({
    id: row.id,
    date: row.date,
    bedtime: row.bedtime,
    nightWakings: row.night_wakings,
    longestStretch: row.longest_stretch,
    naps: row.naps,
    notes: row.notes ?? "",
  }));

  const chatMessages: ChatMessage[] = (messageRows ?? []).map((row) => ({
    id: row.id,
    role: row.role,
    text: row.text,
    timestamp: row.timestamp,
  }));

  return { profile, sleepLogs, chatMessages };
}

export async function saveProfile(profile: BabyProfile) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return profile;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return profile;

  const payload = {
    user_id: user.id,
    parent_name: profile.parentName,
    baby_name: profile.babyName,
    baby_age_months: profile.babyAgeMonths,
    feeding_type: profile.feedingType,
    sleep_setup: profile.sleepSetup,
    current_challenge: profile.currentChallenge,
    current_goal: profile.currentGoal,
  };

  const { data, error } = await supabase
    .from(PROFILE_TABLE)
    .upsert(payload, { onConflict: "user_id" })
    .select()
    .single();

  if (error || !data) return profile;

  return {
    ...profile,
    id: data.id,
  };
}

export async function addSleepLog(log: SleepLog) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return log;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return log;

  const { data, error } = await supabase
    .from(LOGS_TABLE)
    .insert({
      user_id: user.id,
      date: log.date,
      bedtime: log.bedtime,
      night_wakings: log.nightWakings,
      longest_stretch: log.longestStretch,
      naps: log.naps,
      notes: log.notes,
    })
    .select()
    .single();

  if (error || !data) return log;

  return {
    ...log,
    id: data.id,
  };
}

export async function addChatMessage(message: ChatMessage) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return message;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return message;

  const { data, error } = await supabase
    .from(MESSAGES_TABLE)
    .insert({
      user_id: user.id,
      role: message.role,
      text: message.text,
      timestamp: message.timestamp,
    })
    .select()
    .single();

  if (error || !data) return message;

  return {
    ...message,
    id: data.id,
  };
}

export async function createCoachReply(profile: BabyProfile, userText: string) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ profile, message: userText }),
  });

  if (response.ok) {
    const data = (await response.json()) as { reply?: string };
    if (data.reply) return data.reply;
  }

  return generateResponse(profile, userText);
}

export function bootstrapMessages(profile: BabyProfile): ChatMessage[] {
  return [
    {
      role: "assistant",
      text: getWelcomeMessage(profile),
      timestamp: Date.now(),
    },
  ];
}
