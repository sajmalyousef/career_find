export interface BigFiveScores {
  E: number; // Extraversion
  A: number; // Agreeableness
  C: number; // Conscientiousness
  N: number; // Neuroticism (emotional stability — lower is more stable)
  O: number; // Openness
}

export interface RIASECScores {
  R: number; // Realistic
  I: number; // Investigative
  A: number; // Artistic
  S: number; // Social
  En: number; // Enterprising
  C: number; // Conventional
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
  const scores: RIASECScores = { R: 0, I: 0, A: 0, S: 0, En: 0, C: 0 };
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
    A: 'Artistic (creative & expressive)',
    S: 'Social (helper & communicator)',
    En: 'Enterprising (leader & persuader)',
    C: 'Conventional (organiser & planner)',
  };
  return labels[code] ?? code;
}
