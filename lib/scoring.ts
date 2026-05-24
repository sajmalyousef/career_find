export interface BigFiveScores {
  E: number; // Extraversion
  A: number; // Agreeableness
  C: number; // Conscientiousness
  N: number; // Neuroticism (emotional stability — lower is more stable)
  O: number; // Openness
}

export interface RIASECScores {
  R: number;  // Realistic
  I: number;  // Investigative
  Ar: number; // Artistic (renamed from A to avoid collision with BigFive Agreeableness)
  S: number;  // Social
  En: number; // Enterprising
  Cv: number; // Conventional (renamed from C to avoid collision with BigFive Conscientiousness)
}

export interface LifestyleInputs {
  budgetBracket: string;
  grade: string;
  location: string;
  priority: string;
  riskTolerance: string;
  aiAttitude: string;
}

export interface SessionAnswers {
  [questionId: string]: {
    label: string;
    traits: Record<string, number>;
    value?: string;
  };
}

export function scoreBigFive(answers: SessionAnswers): BigFiveScores {
  const scores: BigFiveScores = { E: 0, A: 0, C: 0, N: 0, O: 0 };
  for (const answer of Object.values(answers)) {
    for (const [trait, val] of Object.entries(answer.traits)) {
      if (trait in scores) {
        (scores as unknown as Record<string, number>)[trait] += val;
      }
    }
  }
  return scores;
}

export function scoreRIASEC(answers: SessionAnswers): RIASECScores {
  const scores: RIASECScores = { R: 0, I: 0, Ar: 0, S: 0, En: 0, Cv: 0 };
  for (const answer of Object.values(answers)) {
    for (const [trait, val] of Object.entries(answer.traits)) {
      if (trait in scores) {
        (scores as unknown as Record<string, number>)[trait] += val;
      }
    }
  }
  return scores;
}

export function getTopRIASEC(riasec: RIASECScores, count = 2): string[] {
  return Object.entries(riasec)
    .sort(([, a], [, b]) => b - a)
    .slice(0, count)
    .map(([code]) => code);
}

export function getBigFiveProfile(scores: BigFiveScores): Record<string, string> {
  const profile: Record<string, string> = {};
  for (const [key, val] of Object.entries(scores)) {
    if (val >= 3) profile[key] = 'high';
    else if (val >= 1) profile[key] = 'medium_high';
    else if (val >= -1) profile[key] = 'medium';
    else if (val >= -3) profile[key] = 'medium_low';
    else profile[key] = 'low';
  }
  return profile;
}

export function extractLifestyle(answers: SessionAnswers): LifestyleInputs {
  return {
    budgetBracket: answers['C1']?.value ?? 'unknown',
    grade: answers['C2']?.value ?? 'unknown',
    location: answers['D1']?.value ?? 'unknown',
    priority: answers['D2']?.value ?? 'unknown',
    riskTolerance: answers['D3']?.value ?? 'unknown',
    aiAttitude: answers['D4']?.value ?? 'unknown',
  };
}

// ─── Aspirations ──────────────────────────────────────────────────────────────

export interface AspirationProfile {
  wealthDrive: number;     // want high income, build wealth
  impactDrive: number;     // want meaningful work, change the world
  autonomyDrive: number;   // entrepreneurship, independence, own terms
  stabilityDrive: number;  // security, predictability
  balanceDrive: number;    // work-life balance, time freedom
}

// Maps Block D answer values to aspiration dimension deltas
const ASPIRATION_MAP: Record<string, Partial<AspirationProfile>> = {
  wealth:       { wealthDrive: 2 },
  impact:       { impactDrive: 2 },
  risk_lover:   { autonomyDrive: 2, stabilityDrive: -1 },
  stability:    { stabilityDrive: 2 },
  flexibility:  { balanceDrive: 2, autonomyDrive: 0.5 },
  calculated:   { autonomyDrive: 0.5, stabilityDrive: 0.5 },
  ai_excited:   { autonomyDrive: 0.5, wealthDrive: 0.5 },
  risk_averse:  { stabilityDrive: 1 },
  hometown:     { stabilityDrive: 0.5, impactDrive: 0.5 },
  metro:        { wealthDrive: 0.5 },
};

export function scoreAspirations(answers: SessionAnswers): AspirationProfile {
  const profile: AspirationProfile = {
    wealthDrive: 0,
    impactDrive: 0,
    autonomyDrive: 0,
    stabilityDrive: 0,
    balanceDrive: 0,
  };
  // Only read Block D answers (D1–D12)
  for (const [qid, answer] of Object.entries(answers)) {
    if (!qid.startsWith('D')) continue;
    const val = answer.value;
    if (!val) continue;
    const deltas = ASPIRATION_MAP[val];
    if (!deltas) continue;
    for (const [dim, delta] of Object.entries(deltas) as [keyof AspirationProfile, number][]) {
      profile[dim] += delta;
    }
  }
  return profile;
}

export function getTopAspirations(profile: AspirationProfile, count = 2): string[] {
  const LABELS: Record<keyof AspirationProfile, string> = {
    wealthDrive: 'Wealth',
    impactDrive: 'Impact',
    autonomyDrive: 'Autonomy',
    stabilityDrive: 'Stability',
    balanceDrive: 'Work-life balance',
  };
  return (Object.entries(profile) as [keyof AspirationProfile, number][])
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, count)
    .map(([key]) => LABELS[key]);
}

export function getBigFiveLabel(key: string): string {
  const labels: Record<string, string> = {
    E: 'Extraversion',
    A: 'Agreeableness',
    C: 'Conscientiousness',
    N: 'Emotional Stability',
    O: 'Openness to Experience',
  };
  return labels[key] ?? key;
}

export function getRIASECLabel(code: string): string {
  const labels: Record<string, string> = {
    R: 'Realistic (hands-on doer)',
    I: 'Investigative (thinker & researcher)',
    Ar: 'Artistic (creative & expressive)',
    S: 'Social (helper & communicator)',
    En: 'Enterprising (leader & persuader)',
    Cv: 'Conventional (organiser & planner)',
  };
  return labels[code] ?? code;
}
