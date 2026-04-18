import type { BabyProfile } from "./types";

export const FEEDING_OPTIONS = [
  { value: "breast", label: "Breastfeeding" },
  { value: "bottle", label: "Bottle / Formula" },
  { value: "mixed", label: "Breast + Bottle" },
  { value: "solids", label: "Solids + Milk" },
] as const;

export const SLEEP_SETUP_OPTIONS = [
  "Crib in parents' room",
  "Crib in own room",
  "Co-sleeping",
  "Bassinet",
  "Other",
];

export const CHALLENGE_OPTIONS = [
  "Frequent night wakings",
  "Hard time falling asleep",
  "Short naps",
  "Early morning waking",
  "Sleep regression",
  "Transitioning from co-sleeping",
];

export const GOAL_OPTIONS = [
  "Fewer night wakings",
  "Longer naps",
  "Earlier bedtime",
  "Self-soothing",
  "Consistent schedule",
  "Sleep through the night",
];

const challengeAdvice: Record<string, string[]> = {
  "Frequent night wakings": [
    "Try moving bedtime 15 to 20 minutes earlier. Overtiredness is one of the most common causes of fragmented nights.",
    "Focus on the last wake window being calm and slightly shorter tonight. That alone can reduce false starts.",
    "If baby wakes within 45 minutes of bedtime, treat that as a clue that bedtime may be running too late.",
  ],
  "Hard time falling asleep": [
    "A very predictable wind-down routine helps more than extra soothing changes every night.",
    "Make the room darker than you think you need. Light leakage often keeps babies alert.",
    "Try putting baby down a little less asleep, not fully awake, just enough to reduce the full reset at transfer.",
  ],
  "Short naps": [
    "Short naps often improve when wake windows stretch slightly and the sleep environment stays very boring.",
    "Try protecting the first nap of the day. It is usually the easiest one to stabilize first.",
    "White noise plus a darker room can help baby connect sleep cycles during daytime sleep.",
  ],
  "Early morning waking": [
    "Treat pre-6 AM waking like a night waking. Keep it dark, quiet, and low-energy.",
    "Counterintuitively, an earlier bedtime often helps fix early morning waking.",
    "Check sunrise light leakage. Blackout curtains do real work here.",
  ],
  "Sleep regression": [
    "Regressions are messy but temporary. Consistency matters more than chasing new tricks every night.",
    "If baby is learning new skills, get more practice in during the day so nighttime carries less tension.",
    "Avoid stacking new sleep crutches during a regression unless you want to keep them later.",
  ],
  "Transitioning from co-sleeping": [
    "Go gradually, naps first if possible, then the first stretch of the night.",
    "Stay physically reassuring at first, but keep the setup itself consistent.",
    "Make the crib feel familiar and predictable before expecting full nights there.",
  ],
};

const goalAdvice: Record<string, string[]> = {
  "Fewer night wakings": [
    "Tonight, protect the last wake window and avoid letting the final nap run too late.",
    "Keep the bedtime routine short, calm, and boring. Repetition beats complexity.",
    "Pause briefly before responding overnight. Some wakes are partial and may settle without full help.",
  ],
  "Longer naps": [
    "Extend wake windows very slightly and keep the pre-nap setup identical each time.",
    "A nap rescue attempt can make sense if baby wakes at the 30 minute mark.",
    "Start by fixing one nap, not all naps at once.",
  ],
  "Earlier bedtime": [
    "Move bedtime earlier by 10 to 15 minutes every couple of days instead of forcing a huge jump.",
    "Start the wind-down routine before baby looks fully exhausted.",
    "Anchor the day with a stable morning wake time if possible.",
  ],
  "Self-soothing": [
    "Give a small pause before intervening, especially for light fussing between cycles.",
    "Aim for one repeatable settling method instead of switching techniques night to night.",
    "Independent sleep is usually built gradually, not in one dramatic night.",
  ],
  "Consistent schedule": [
    "Use a stable morning anchor and age-appropriate wake windows instead of chasing exact clock perfection.",
    "Track patterns for a few days, then shape the schedule from reality, not theory.",
    "Consistency matters more than a perfect schedule template.",
  ],
  "Sleep through the night": [
    "Prioritize a strong first stretch of the night first. Full nights usually come after that.",
    "Make sure daytime intake and daytime sleep are not working against nighttime sleep.",
    "Keep overnight interactions minimal so night feels meaningfully different from day.",
  ],
};

function getActiveChallenges(profile: BabyProfile) {
  return profile.currentChallenges.length > 0
    ? profile.currentChallenges
    : ["Frequent night wakings"];
}

function getActiveGoals(profile: BabyProfile) {
  return profile.currentGoals.length > 0
    ? profile.currentGoals
    : ["Fewer night wakings"];
}

function getChallengeTips(profile: BabyProfile) {
  return getActiveChallenges(profile).flatMap(
    (challenge) => challengeAdvice[challenge] ?? [],
  );
}

function getGoalTips(profile: BabyProfile) {
  return getActiveGoals(profile).flatMap((goal) => goalAdvice[goal] ?? []);
}

export function generateResponse(profile: BabyProfile, userMessage: string): string {
  const msg = userMessage.toLowerCase();
  const challengeTips = getChallengeTips(profile);
  const firstChallenge = getActiveChallenges(profile)[0];

  if (msg.includes("plan") || msg.includes("tonight")) {
    const tips = getGoalTips(profile);
    return `Here is a focused plan for ${profile.babyName} tonight:\n\n1. ${challengeTips[0] ?? "Keep bedtime calm and repeatable."}\n2. ${tips[0] ?? "Aim for an age-appropriate bedtime."}\n3. ${tips[1] ?? "Keep the routine short and consistent."}\n\nWe are balancing ${getActiveChallenges(profile)
      .slice(0, 2)
      .join(" and ")} while working toward ${getActiveGoals(profile)
      .slice(0, 2)
      .join(" and ")
      .toLowerCase()}.`;
  }

  if (msg.includes("nap")) {
    const age = profile.babyAgeMonths;
    const napCount = age < 4 ? "4 to 5" : age < 7 ? "3" : age < 13 ? "2" : "1";
    return `At ${age} months, ${profile.babyName} will usually land around ${napCount} naps. ${goalAdvice["Longer naps"]?.[0] ?? "Protect the first nap and keep conditions stable."} Want me to sketch a sample day?`;
  }

  if (msg.includes("wake") || msg.includes("woke") || msg.includes("night")) {
    return `Night wakings are brutal. For ${profile.babyName}, my first read is this: ${challengeAdvice[firstChallenge]?.[0] ?? "Reduce overtiredness and simplify the last part of the day."} How many wakes are we seeing most nights right now?`;
  }

  if (msg.includes("schedule") || msg.includes("routine")) {
    return `For a ${profile.babyAgeMonths} month old, I would start with a stable morning wake, age-appropriate wake windows, and an earlier calmer bedtime. I can map a full day for ${profile.babyName} if you want.`;
  }

  const allTips = [...challengeTips, ...getGoalTips(profile)];
  const tip = allTips[Math.floor(Math.random() * allTips.length)];
  return `Based on ${profile.babyName}'s current mix of ${getActiveChallenges(profile)
    .slice(0, 2)
    .join(" and ")}, I would start here: ${tip ?? "Keep things consistent and avoid overcomplicating tonight."}\n\nYou are not starting from zero, ${profile.parentName}. We can tighten this one step at a time.`;
}

export function getSuggestedPlan(profile: BabyProfile): string[] {
  const tips = [...getChallengeTips(profile), ...getGoalTips(profile)];
  return tips.slice(0, 3);
}

export function getWelcomeMessage(profile: BabyProfile): string {
  return `Hi ${profile.parentName}, I am your baby sleep coach for ${profile.babyName}. I can help with ${getActiveChallenges(profile)
    .join(", ")
    .toLowerCase()} while working toward ${getActiveGoals(profile)
    .join(", ")
    .toLowerCase()}. Log today’s sleep or ask me what to change tonight.`;
}
