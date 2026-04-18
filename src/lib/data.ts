import type { BabyProfile, SleepLog } from "./types";

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

const ageBands = [
  {
    maxMonths: 3,
    naps: "4 to 5 naps",
    wakeWindows: "60 to 90 minutes",
    bedtime: "later, often around 20:00 to 22:00",
  },
  {
    maxMonths: 5,
    naps: "3 to 4 naps",
    wakeWindows: "1.5 to 2.25 hours",
    bedtime: "around 19:00 to 20:30",
  },
  {
    maxMonths: 8,
    naps: "3 naps",
    wakeWindows: "2 to 3 hours",
    bedtime: "around 18:45 to 20:00",
  },
  {
    maxMonths: 13,
    naps: "2 naps",
    wakeWindows: "2.5 to 3.5 hours",
    bedtime: "around 18:30 to 19:45",
  },
  {
    maxMonths: Infinity,
    naps: "1 nap",
    wakeWindows: "4 to 5.5 hours",
    bedtime: "around 19:00 to 20:00",
  },
] as const;

function getAgeBand(ageMonths: number) {
  return ageBands.find((band) => ageMonths <= band.maxMonths) ?? ageBands[2];
}

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

function formatList(items: string[]) {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items.at(-1)}`;
}

function normalizeMessage(message: string) {
  return message.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
}

function hasAny(msg: string, terms: string[]) {
  return terms.some((term) => msg.includes(term));
}

function inferSituation(message: string) {
  const msg = normalizeMessage(message);

  return {
    askingForPlan: hasAny(msg, ["plan", "tonight", "what should i do", "what do i do"]),
    askingForSchedule: hasAny(msg, ["schedule", "routine", "wake window", "wake windows", "sample day"]),
    askingAboutNaps: hasAny(msg, ["nap", "naps"]),
    askingAboutNightWakings: hasAny(msg, ["wake", "woke", "night", "overnight", "false start"]),
    askingAboutBedtime: hasAny(msg, ["bedtime", "sleep late", "sleep earlier", "fall asleep"]),
    askingAboutRegression: hasAny(msg, ["regression", "worse than usual", "suddenly"]),
    askingAboutEarlyWake: hasAny(msg, ["early", "5am", "5 am", "6am", "6 am", "morning waking"]),
    askingForReassurance: hasAny(msg, ["normal", "worried", "stressed", "exhausted", "failing", "broken"]),
    askingForTransitionHelp: hasAny(msg, ["co sleep", "cosleep", "crib", "transfer", "independent"]),
  };
}

function createOpening(profile: BabyProfile) {
  const challenges = formatList(getActiveChallenges(profile).slice(0, 3)).toLowerCase();
  const goals = formatList(getActiveGoals(profile).slice(0, 3)).toLowerCase();
  return `${profile.babyName} is dealing with ${challenges}, and we are aiming for ${goals}.`;
}

function getScheduleSummary(profile: BabyProfile) {
  const band = getAgeBand(profile.babyAgeMonths);
  return `At ${profile.babyAgeMonths} months, I would usually expect ${band.naps}, wake windows around ${band.wakeWindows}, and a bedtime ${band.bedtime}.`;
}

function getTonightSteps(profile: BabyProfile) {
  const challengeTips = getChallengeTips(profile);
  const goalTips = getGoalTips(profile);

  return [
    challengeTips[0] ?? "Keep bedtime calm and repeatable tonight.",
    goalTips[0] ?? "Aim for a slightly earlier and calmer bedtime.",
    challengeTips[1] ?? goalTips[1] ?? "Keep overnight responses low-energy and consistent.",
  ];
}

function buildPlanResponse(profile: BabyProfile) {
  const steps = getTonightSteps(profile);

  return [
    `Here is the simplest good plan for ${profile.babyName} tonight:`,
    "",
    `1. ${steps[0]}`,
    `2. ${steps[1]}`,
    `3. ${steps[2]}`,
    "",
    `${getScheduleSummary(profile)} ${createOpening(profile)}`,
    "",
    "If tonight is messy, that does not mean the plan is wrong. We are looking for a better pattern, not a perfect night.",
  ].join("\n");
}

function buildScheduleResponse(profile: BabyProfile) {
  return `${getScheduleSummary(profile)} For ${profile.babyName}, I would anchor the morning, protect the first nap, and keep bedtime consistent before trying to optimize every detail. If you want, ask me for a sample day and I will map one out.`;
}

function buildNapResponse(profile: BabyProfile) {
  const tips = goalAdvice["Longer naps"] ?? [];
  return `Short naps are common, especially when timing is a little off. ${getScheduleSummary(profile)} My first move would be this: ${tips[0] ?? "Protect the first nap and keep conditions stable."} Then ${tips[1] ?? "Try a gentle nap rescue once before ending the nap."}`;
}

function buildNightWakingResponse(profile: BabyProfile) {
  const advice = challengeAdvice["Frequent night wakings"];
  return `Night wakings are brutal, and they usually come from some mix of overtiredness, habit, hunger, or a schedule mismatch. My first read for ${profile.babyName}: ${advice?.[0] ?? "Reduce overtiredness and simplify the last part of the day."} ${advice?.[1] ?? "Keep the last wake window calm and slightly shorter."} If you want, tell me bedtime, naps, and number of wakes, and I’ll narrow it down.`;
}

function buildBedtimeResponse(profile: BabyProfile) {
  const advice = challengeAdvice["Hard time falling asleep"];
  return `If bedtime is the messy part, I would simplify it before I make it longer. ${advice?.[0] ?? "A predictable wind-down routine matters."} ${advice?.[1] ?? "Make the room darker than you think you need."} ${getScheduleSummary(profile)}`;
}

function buildRegressionResponse() {
  const advice = challengeAdvice["Sleep regression"];
  return `This does sound like regression territory. The annoying part is that regressions feel dramatic, but the best response is usually boring consistency. ${advice?.[0] ?? "Consistency matters more than chasing new tricks."} ${advice?.[1] ?? "Get more practice with new skills during the day."}`;
}

function buildEarlyWakeResponse() {
  const advice = challengeAdvice["Early morning waking"];
  return `Early wakes are usually a schedule problem, a light problem, or overtiredness showing up at dawn. ${advice?.[0] ?? "Treat pre-6 AM like a night waking."} ${advice?.[1] ?? "An earlier bedtime often helps."}`;
}

function buildTransitionResponse() {
  const advice = challengeAdvice["Transitioning from co-sleeping"];
  return `If you are moving away from co-sleeping, I would go gradual instead of heroic. ${advice?.[0] ?? "Go gradually, naps first if possible."} ${advice?.[1] ?? "Stay reassuring, but keep the setup consistent."}`;
}

function buildReassuranceResponse(profile: BabyProfile) {
  return `You are not failing, and ${profile.babyName} is not broken. Baby sleep gets messy fast, especially when parents are depleted. I would narrow the focus to one or two repeatable changes and hold them for a few days before judging the result.`;
}

export function generateResponse(profile: BabyProfile, userMessage: string): string {
  const situation = inferSituation(userMessage);

  if (situation.askingForPlan) return buildPlanResponse(profile);
  if (situation.askingAboutNaps) return buildNapResponse(profile);
  if (situation.askingAboutNightWakings) return buildNightWakingResponse(profile);
  if (situation.askingAboutBedtime) return buildBedtimeResponse(profile);
  if (situation.askingAboutRegression) return buildRegressionResponse();
  if (situation.askingAboutEarlyWake) return buildEarlyWakeResponse();
  if (situation.askingForTransitionHelp) return buildTransitionResponse();
  if (situation.askingForSchedule) return buildScheduleResponse(profile);
  if (situation.askingForReassurance) return buildReassuranceResponse(profile);

  const allTips = [...getChallengeTips(profile), ...getGoalTips(profile)];
  const topTips = allTips.slice(0, 2);

  return [
    createOpening(profile),
    topTips[0] ?? "Keep bedtime calm and consistent tonight.",
    topTips[1] ?? "Do less, but do it more consistently.",
    "If you want, ask me for a tonight plan, a sample schedule, or help troubleshooting one specific problem.",
  ].join("\n\n");
}

export function getSuggestedPlan(profile: BabyProfile): string[] {
  return [...getTonightSteps(profile), getScheduleSummary(profile)];
}

export function getWelcomeMessage(profile: BabyProfile): string {
  return `Hi ${profile.parentName}, I am here to help you think clearly about ${profile.babyName}'s sleep. ${createOpening(profile)} Tell me what is happening today, or ask for a plan for tonight.`;
}

export function createSleepLogFeedback(profile: BabyProfile, log: SleepLog): string {
  const band = getAgeBand(profile.babyAgeMonths);
  const response: string[] = [];

  if (log.nightWakings >= 4) {
    response.push("That was a rough night. I would protect daytime sleep and avoid stretching the last wake window tonight.");
  } else if (log.nightWakings <= 1) {
    response.push("That looks like a steadier night. I would keep the same rhythm tonight instead of changing too much.");
  }

  if (log.naps === 0) {
    response.push("No naps usually makes bedtime more fragile, so I would aim for an earlier bedtime today.");
  } else if (log.naps >= 3 && profile.babyAgeMonths >= 8) {
    response.push(`At ${profile.babyAgeMonths} months, ${band.naps} is more typical, so I would watch for too much daytime sleep stealing from night sleep.`);
  }

  if (log.notes.trim()) {
    response.push(`Noted: ${log.notes.trim()}`);
  }

  return response.join(" ");
}
