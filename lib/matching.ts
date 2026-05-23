import type { BigFiveScores, RIASECScores, LifestyleInputs } from './scoring';
import careersData from '@/data/careers.json';
import collegesData from '@/data/colleges.json';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CareerResult {
  id: string;
  name: string;
  whyFit: string;
  dayInLife: string;
  aiRisk: string;
  aiNote: string;
  salaryFresher: string;
  salary5yr: string;
  exams: string[];
  score: number;
}

export interface EliminatedCareer {
  career: string;
  reason: string;
  specificTrait: string;
  notForYouBecause: string;
}

export interface CollegeResult {
  id: string;
  name: string;
  location: string;
  careerMatch: string;
  whyGoodFit: string;
  tier: string;
  fees_per_year_inr: number;
  entrance_exams: string[];
  nirf_rank: number | null;
  abroad: boolean;
}

export interface MatchResults {
  profileSummary: string;
  personalityHighlights: string[];
  topRIASEC: string[];
  careers: CareerResult[];
  eliminated: EliminatedCareer[];
  colleges: CollegeResult[];
}

// ─── Internal career shape from JSON ─────────────────────────────────────────

interface CareerData {
  id: string;
  name: string;
  cluster: string;
  dayInLife: string;
  riasec: string[];
  bigFiveFit: Record<string, string>;
  aiRisk: string;
  aiNote: string;
  salaryFresher: string;
  salary5yr: string;
  exams: string[];
  careerTags: string[];
}

interface CollegeData {
  id: string;
  name: string;
  location: string;
  state: string;
  fees_per_year_inr: number;
  nirf_rank: number | null;
  entrance_exams: string[];
  career_tags: string[];
  tier: string;
  type: string;
  abroad: boolean;
  notable_for: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function level(score: number): 'high' | 'medium' | 'low' {
  if (score >= 3) return 'high';
  if (score >= 0) return 'medium';
  return 'low';
}

function fits(actual: 'high' | 'medium' | 'low', required: string): number {
  if (required === 'high') return actual === 'high' ? 2 : actual === 'medium' ? 0 : -2;
  if (required === 'low') return actual === 'low' ? 2 : actual === 'medium' ? 0 : -2;
  if (required === 'low_preferred') return actual === 'low' ? 1 : actual === 'medium' ? 0 : -1;
  if (required === 'medium') return actual === 'medium' ? 1 : 0;
  return 0; // 'any'
}

// ─── Career Scoring ───────────────────────────────────────────────────────────

function scoreCareer(
  career: CareerData,
  bigFive: BigFiveScores,
  riasec: RIASECScores,
  lifestyle: LifestyleInputs,
): number {
  let score = 0;

  // RIASEC overlap (primary driver — up to 18 pts)
  for (const code of career.riasec) {
    const val = (riasec as unknown as Record<string, number>)[code] ?? 0;
    score += val * 1.5;
  }

  // Big Five fit (secondary — up to ~10 pts)
  const bf = bigFive as unknown as Record<string, number>;
  for (const [trait, req] of Object.entries(career.bigFiveFit)) {
    // Neuroticism: high N = emotionally unstable; career wants "low" N = needs stability
    const traitScore = trait === 'N' ? -bf['N'] : bf[trait];
    const actualLevel = level(traitScore);
    score += fits(actualLevel, req);
  }

  // Lifestyle bonuses (small boosts for contextual fit)
  if (lifestyle.priority === 'stability' && ['government', 'education', 'finance'].includes(career.cluster)) score += 1.5;
  if (lifestyle.priority === 'wealth' && ['finance', 'tech', 'business'].includes(career.cluster)) score += 1.5;
  if (lifestyle.priority === 'impact' && ['social', 'education', 'healthcare', 'science'].includes(career.cluster)) score += 1.5;
  if (lifestyle.priority === 'flexibility' && ['media', 'creative', 'design'].includes(career.cluster)) score += 1.5;
  if (lifestyle.riskTolerance === 'risk_lover' && ['business', 'media', 'creative'].includes(career.cluster)) score += 1;
  if (lifestyle.riskTolerance === 'risk_averse' && ['government', 'education', 'healthcare'].includes(career.cluster)) score += 1;
  if (lifestyle.aiAttitude === 'ai_excited' && ['tech', 'science'].includes(career.cluster)) score += 1;

  return score;
}

// ─── Explanation Templates ────────────────────────────────────────────────────

const RIASEC_PHRASES: Record<string, string> = {
  R: 'your hands-on, build-it mindset',
  I: 'your deep curiosity and love for research',
  Ar: 'your creative and expressive instincts',
  S: 'your natural warmth and ability to connect with people',
  En: 'your drive to lead, persuade, and make things happen',
  Cv: 'your precision and love for structure and systems',
};

const BIG_FIVE_HIGH_PHRASES: Record<string, string> = {
  E: 'your energy in social settings',
  A: 'your ability to collaborate and build trust',
  C: 'your disciplined, finish-what-you-start approach',
  N: '',  // handled separately
  O: 'your openness to new ideas and unconventional thinking',
};

const BIG_FIVE_LOW_PHRASES: Record<string, string> = {
  N: 'your calm under pressure',
};

function getTraitHighlights(bigFive: BigFiveScores, riasec: RIASECScores): string[] {
  const highlights: string[] = [];

  // Top RIASEC
  const topR = getTopRIASEC(riasec, 2);
  for (const code of topR) {
    const phrase = RIASEC_PHRASES[code];
    if (phrase) highlights.push(phrase);
  }

  // Strong Big Five traits
  if (bigFive.C >= 3) highlights.push(BIG_FIVE_HIGH_PHRASES.C);
  if (bigFive.O >= 3) highlights.push(BIG_FIVE_HIGH_PHRASES.O);
  if (bigFive.E >= 3) highlights.push(BIG_FIVE_HIGH_PHRASES.E);
  if (bigFive.A >= 3) highlights.push(BIG_FIVE_HIGH_PHRASES.A);
  if (bigFive.N <= -2) highlights.push(BIG_FIVE_LOW_PHRASES.N);

  return [...new Set(highlights)].filter(Boolean);
}

function buildWhyFit(
  career: CareerData,
  bigFive: BigFiveScores,
  riasec: RIASECScores,
  lifestyle: LifestyleInputs,
): string {
  const parts: string[] = [];

  // RIASEC match
  const matchingCodes = career.riasec.filter(
    (code) => (riasec as unknown as Record<string, number>)[code] >= 3,
  );
  if (matchingCodes.length > 0) {
    const phrases = matchingCodes.map((c) => RIASEC_PHRASES[c]).filter(Boolean);
    if (phrases.length > 0) {
      parts.push(`${phrases.join(' and ')} maps directly onto what ${career.name}s do every day`);
    }
  }

  // Big Five specifics per career cluster
  const bf = bigFive;
  switch (career.cluster) {
    case 'tech':
    case 'science':
      if (bf.O >= 2) parts.push('your openness means you\'ll enjoy constantly learning new tech and methods');
      if (bf.C >= 2) parts.push('your conscientiousness will help you write clean, reliable work');
      break;
    case 'healthcare':
      if (bf.A >= 2) parts.push('your agreeableness and care for others is exactly what patients need');
      if (bf.N <= 0) parts.push('your calm under stress is a real advantage in clinical settings');
      break;
    case 'business':
    case 'finance':
      if (bf.E >= 2) parts.push('your outgoing energy will help you build client relationships and lead teams');
      if (bf.C >= 2) parts.push('your structured thinking suits the high-stakes precision this work demands');
      break;
    case 'law':
      if (bf.O >= 2) parts.push('your love of ideas and argumentation will keep you engaged with complex cases');
      if (bf.E >= 1) parts.push('your comfort speaking up means courtroom advocacy will feel natural');
      break;
    case 'design':
    case 'creative':
    case 'media':
      if (bf.O >= 2) parts.push('your creativity and openness to new ideas is the core engine of this field');
      break;
    case 'social':
    case 'education':
      if (bf.A >= 2) parts.push('your warmth and genuine care for others is what makes great educators and counselors');
      break;
    case 'government':
      if (bf.C >= 2) parts.push('your discipline and sense of responsibility aligns with the rigor this career demands');
      break;
  }

  // Lifestyle fit
  if (lifestyle.priority === 'impact' && ['social', 'education', 'healthcare', 'science', 'government'].includes(career.cluster)) {
    parts.push('and it directly delivers the real-world impact you said you want');
  }
  if (lifestyle.priority === 'wealth' && ['tech', 'finance', 'business'].includes(career.cluster)) {
    parts.push('and the earning potential in this field matches your financial goals');
  }
  if (lifestyle.riskTolerance === 'risk_averse' && ['government', 'education', 'healthcare'].includes(career.cluster)) {
    parts.push('the stability this career offers suits your preference for security over risk');
  }

  if (parts.length === 0) {
    parts.push(`your profile's combination of traits lines up well with what ${career.name}s actually do`);
  }

  // Cap at 2-3 points, join naturally
  const selected = parts.slice(0, 3);
  if (selected.length === 1) return selected[0].charAt(0).toUpperCase() + selected[0].slice(1) + '.';
  const last = selected.pop()!;
  return (selected[0].charAt(0).toUpperCase() + selected[0].slice(1)) +
    (selected.length > 1 ? ', ' + selected.slice(1).join(', ') : '') +
    ', and ' + last + '.';
}

// ─── Elimination Logic ────────────────────────────────────────────────────────

interface MismatchInfo {
  trait: string;
  reason: string;
  notForYouBecause: string;
}

function findWorstMismatch(
  career: CareerData,
  bigFive: BigFiveScores,
  riasec: RIASECScores,
): MismatchInfo | null {
  const bf = bigFive as unknown as Record<string, number>;
  const r = riasec as unknown as Record<string, number>;

  // Check Big Five hard mismatches
  for (const [trait, req] of Object.entries(career.bigFiveFit)) {
    const rawScore = trait === 'N' ? -bf['N'] : bf[trait];
    const actualLevel = level(rawScore);

    if (req === 'low' && actualLevel === 'high') {
      const traitName = trait === 'N' ? 'emotional stability under pressure' : {
        E: 'introversion (low extraversion)', A: 'low agreeableness', C: 'low conscientiousness', O: 'low openness',
      }[trait] ?? trait;
      return {
        trait: traitName,
        reason: buildEliminationReason(career, trait, req, actualLevel, bf, r),
        notForYouBecause: buildNotForYou(career, trait, req, actualLevel),
      };
    }
    if (req === 'high' && actualLevel === 'low') {
      const traitName = trait === 'N' ? 'high stress tolerance' : {
        E: 'extraversion', A: 'agreeableness', C: 'conscientiousness', O: 'openness',
      }[trait] ?? trait;
      return {
        trait: traitName,
        reason: buildEliminationReason(career, trait, req, actualLevel, bf, r),
        notForYouBecause: buildNotForYou(career, trait, req, actualLevel),
      };
    }
  }

  // Check RIASEC mismatch — career needs codes the student scored low on
  for (const code of career.riasec.slice(0, 2)) {
    const val = r[code] ?? 0;
    if (val < 0) {
      const codeNames: Record<string, string> = {
        R: 'Realistic (hands-on work)', I: 'Investigative (research & analysis)',
        Ar: 'Artistic (creative work)', S: 'Social (people-focused work)',
        En: 'Enterprising (leadership & persuasion)', Cv: 'Conventional (structured systems)',
      };
      return {
        trait: `low interest in ${codeNames[code] ?? code}`,
        reason: `${career.name} is built around ${codeNames[code] ?? code}, which your interest profile scores low on. Spending 8 hours a day doing work you're fundamentally not drawn to leads to burnout, not mastery.`,
        notForYouBecause: `${career.name} needs people who are genuinely excited by ${codeNames[code] ?? code} — your interests point elsewhere.`,
      };
    }
  }

  return null;
}

function buildEliminationReason(
  career: CareerData,
  trait: string,
  required: string,
  actual: string,
  bf: Record<string, number>,
  _riasec: Record<string, number>,
): string {
  const careerReqs: Record<string, Record<string, string>> = {
    doctor: {
      N_low: 'Surgery and emergency medicine require split-second decisions under extreme pressure. Your profile shows high emotional reactivity — in a crisis, that can cost a patient. This isn\'t about character; it\'s about cognitive performance under acute stress.',
      A_high: 'Medicine requires you to sometimes deliver news patients don\'t want to hear and make calls they disagree with. Low agreeableness is actually a liability here.',
    },
    pilot: {
      N_low: 'A cockpit emergency at 35,000 feet demands complete calm. Your emotional stability scores suggest high-stress split-second decisions would be draining rather than energising.',
      C_high: 'Checklists, protocols, and zero-error procedures are the backbone of aviation safety. Low conscientiousness is a direct safety risk.',
    },
    civil_services: {
      C_high: 'IAS officers manage massive systems with high accountability. Without strong conscientiousness, the workload and detail-orientation will feel punishing.',
    },
    management_consultant: {
      E_high: 'Consulting is 60% managing client relationships and presenting findings confidently. Low extraversion means this will drain rather than energise you.',
    },
    entrepreneur: {
      N_low: 'Startups fail 90% of the time. If high uncertainty triggers significant emotional distress for you, the founder journey will be genuinely painful rather than exciting.',
    },
    lawyer: {
      E_high: 'Courtroom advocacy, client negotiations, and oral arguments require comfort with confrontation and public speaking. Low extraversion makes this exhausting long-term.',
      C_high: 'Legal work lives in precision — one missed clause costs a client everything. Low conscientiousness is a structural risk in law.',
    },
    chartered_accountant: {
      C_high: 'CA work is meticulous by definition — auditing, tax filings, and compliance leave zero room for imprecision.',
    },
  };

  const key = `${trait}_${required}`;
  const specificReason = careerReqs[career.id]?.[key];
  if (specificReason) return specificReason;

  // Generic fallback
  if (trait === 'N' && required === 'low' && actual === 'high') {
    return `${career.name} regularly involves high-stakes, high-pressure situations. Your profile shows elevated emotional reactivity, which means this environment would be chronically draining rather than motivating. There are excellent careers that suit high-sensitivity people — this just isn't one of them.`;
  }
  if (trait === 'C' && required === 'high' && actual === 'low') {
    return `${career.name} demands sustained precision and follow-through. Your profile suggests a preference for flexibility and spontaneity over strict structure — which is a genuine strength in creative fields, but a persistent friction point in this one.`;
  }
  if (trait === 'E' && required === 'high' && actual === 'low') {
    return `${career.name} requires daily high-energy social interaction — presentations, negotiations, managing people. As someone who recharges alone, this would be exhausting rather than energising. Your strengths shine in careers with more independent deep-work.`;
  }
  if (trait === 'O' && required === 'high' && actual === 'low') {
    return `${career.name} involves constant ambiguity, rapid change, and thinking outside established frameworks. Your profile prefers structure and proven methods — a genuine strength in many fields, but a recurring friction in this one.`;
  }
  if (trait === 'A' && required === 'high' && actual === 'low') {
    return `${career.name} puts you in a service role where empathy and patience with others is non-negotiable. Your profile shows lower agreeableness — you're more likely to thrive in roles where challenging ideas matters more than maintaining harmony.`;
  }

  return `Your profile shows a significant mismatch with what ${career.name} requires — specifically around ${trait}. This would create a persistent friction that grows harder, not easier, over time.`;
}

function buildNotForYou(career: CareerData, trait: string, required: string, actual: string): string {
  if (trait === 'N' && required === 'low' && actual === 'high') {
    return `${career.name} isn't for you because it combines high-stakes pressure with little margin for error — a combination that's genuinely hard for people with high emotional sensitivity.`;
  }
  if (trait === 'E' && required === 'high' && actual === 'low') {
    return `${career.name} isn't for you because it's built around constant social energy — and as someone who recharges alone, that's a recipe for burnout, not fulfilment.`;
  }
  if (trait === 'C' && required === 'high' && actual === 'low') {
    return `${career.name} isn't for you because precision and rigid process are baked into the job — fighting your natural style every single day.`;
  }
  if (trait === 'O' && required === 'high' && actual === 'low') {
    return `${career.name} isn't for you because it rewards people who thrive in ambiguity — and your profile shows you do your best work with clear structure.`;
  }
  return `${career.name} isn't for you because it specifically demands what your profile scores lowest on.`;
}

// ─── Profile Summary ──────────────────────────────────────────────────────────

function buildProfileSummary(
  bigFive: BigFiveScores,
  riasec: RIASECScores,
  topCareers: CareerData[],
): string {
  const topR = getTopRIASEC(riasec, 2);
  const riasecNames: Record<string, string> = {
    R: 'Realistic', I: 'Investigative', Ar: 'Artistic',
    S: 'Social', En: 'Enterprising', Cv: 'Conventional',
  };

  const profileType = topR.map((c) => riasecNames[c]).join('-');
  const topCareerName = topCareers[0]?.name ?? 'a technical field';

  let personalityNote = '';
  if (bigFive.C >= 3 && bigFive.O >= 2) personalityNote = 'You combine discipline with intellectual curiosity — a rare and powerful pairing.';
  else if (bigFive.E >= 3 && bigFive.A >= 2) personalityNote = 'You\'re naturally people-oriented and energising to be around — fields that need that will reward you well.';
  else if (bigFive.O >= 3) personalityNote = 'Your openness to ideas and new ways of thinking is your biggest differentiator.';
  else if (bigFive.C >= 3) personalityNote = 'Your discipline and follow-through set you apart — you finish what others abandon.';
  else if (bigFive.N <= -2) personalityNote = 'Your calm under pressure is a genuine edge in high-stakes environments.';
  else personalityNote = 'Your balanced profile gives you flexibility across multiple paths.';

  return `Your profile is ${profileType} — you\'re wired for ${topR[0] ? riasecNames[topR[0]].toLowerCase() + ' work' : 'analytical work'}, with a natural pull toward ${topR[1] ? riasecNames[topR[1]].toLowerCase() + ' challenges' : 'creative challenges'}. ${personalityNote} Careers like ${topCareerName} sit squarely in your zone.`;
}

// ─── College Matching ─────────────────────────────────────────────────────────

const BUDGET_MAX: Record<string, number> = {
  under_1L: 100000,
  '1L_5L': 500000,
  '5L_15L': 1500000,
  above_15L: Infinity,
  loan_open: Infinity,
  unknown: Infinity,
};

function buildWhyGoodFit(college: CollegeData, careerName: string): string {
  const base = college.notable_for;
  const snippets: string[] = [];

  if (base) snippets.push(base);

  // Add career-specific connection
  if (college.nirf_rank && college.nirf_rank <= 5) {
    snippets.push(`Being ranked #${college.nirf_rank} in India makes it one of the most credible launchpads for ${careerName}`);
  } else if (college.nirf_rank && college.nirf_rank <= 15) {
    snippets.push(`Its strong reputation gives ${careerName} graduates a real edge in placements`);
  }

  if (college.fees_per_year_inr < 100000) {
    snippets.push('and the near-zero fees mean financial constraints won\'t hold you back');
  }

  return snippets.slice(0, 2).join(' — ') + '.';
}

function matchColleges(
  topCareers: CareerData[],
  lifestyle: LifestyleInputs,
  includeAbroad = true,
): CollegeResult[] {
  const allTags = [...new Set(topCareers.flatMap((c) => c.careerTags))];
  const maxBudget = BUDGET_MAX[lifestyle.budgetBracket] ?? Infinity;
  const results: CollegeResult[] = [];

  const colleges = collegesData as CollegeData[];

  for (const college of colleges) {
    if (!includeAbroad && college.abroad) continue;
    // Include reach schools (up to 3x budget) so students have aspirational options
    const budgetOk = college.abroad || college.fees_per_year_inr <= maxBudget * 3;
    if (!budgetOk) continue;

    const matchingCareer = topCareers.find((c) =>
      c.careerTags.some((tag) => college.career_tags.includes(tag)),
    );
    if (!matchingCareer) continue;

    results.push({
      id: college.id,
      name: college.name,
      location: college.location,
      careerMatch: matchingCareer.name,
      whyGoodFit: buildWhyGoodFit(college, matchingCareer.name),
      tier: college.tier,
      fees_per_year_inr: college.fees_per_year_inr,
      entrance_exams: college.entrance_exams,
      nirf_rank: college.nirf_rank,
      abroad: college.abroad,
    });
  }

  // Sort: tier1 first, then by nirf rank, then abroad last
  return results.sort((a, b) => {
    if (a.abroad !== b.abroad) return a.abroad ? 1 : -1;
    const tierOrder: Record<string, number> = { tier1: 0, global_elite: 1, tier2: 2 };
    const tDiff = (tierOrder[a.tier] ?? 3) - (tierOrder[b.tier] ?? 3);
    if (tDiff !== 0) return tDiff;
    if (a.nirf_rank && b.nirf_rank) return a.nirf_rank - b.nirf_rank;
    if (a.nirf_rank) return -1;
    if (b.nirf_rank) return 1;
    return 0;
  });
}

// ─── Top RIASEC helper (duplicated to avoid circular import) ──────────────────

function getTopRIASEC(riasec: RIASECScores, count = 2): string[] {
  return Object.entries(riasec)
    .sort(([, a], [, b]) => b - a)
    .slice(0, count)
    .map(([code]) => code);
}

// ─── Personality Highlights ───────────────────────────────────────────────────

function buildPersonalityHighlights(bigFive: BigFiveScores, riasec: RIASECScores): string[] {
  const highlights: string[] = [];
  const topR = getTopRIASEC(riasec, 2);

  const riasecDesc: Record<string, string> = {
    R: 'You\'re a hands-on builder — you understand things best by doing them, not just reading about them.',
    I: 'You\'re wired to investigate. Give you a problem to dig into and you\'ll stay up past midnight on it.',
    Ar: 'Creativity isn\'t just a hobby for you — it\'s how you process and express the world.',
    S: 'You genuinely care about people and naturally draw others to you. That\'s rare.',
    En: 'You\'re a natural mover — persuasive, energetic, and drawn to leadership whether you ask for it or not.',
    Cv: 'You bring order to chaos. People rely on you to be the one who actually plans and follows through.',
  };

  for (const code of topR) {
    if (riasecDesc[code]) highlights.push(riasecDesc[code]);
  }

  if (bigFive.C >= 4) highlights.push('Your conscientiousness puts you in the top tier — you don\'t just start things, you finish them.');
  if (bigFive.N <= -3) highlights.push('Your emotional stability under pressure is a rare trait — it will serve you in any high-stakes career.');
  if (bigFive.O >= 4) highlights.push('Your curiosity and openness are off the charts — you\'ll thrive in fields that reward thinking differently.');

  return highlights.slice(0, 3);
}

// ─── Main Entry Point ─────────────────────────────────────────────────────────

export function computeResults(
  bigFive: BigFiveScores,
  riasec: RIASECScores,
  lifestyle: LifestyleInputs,
): MatchResults {
  const careers = careersData as CareerData[];

  // Score all careers
  const scored = careers
    .map((c) => ({ career: c, score: scoreCareer(c, bigFive, riasec, lifestyle) }))
    .sort((a, b) => b.score - a.score);

  // Top 4 matches
  const topFour = scored.slice(0, 4);
  const topIds = new Set(topFour.map((x) => x.career.id));

  const matchedCareers: CareerResult[] = topFour.map(({ career, score }) => ({
    id: career.id,
    name: career.name,
    whyFit: buildWhyFit(career, bigFive, riasec, lifestyle),
    dayInLife: career.dayInLife,
    aiRisk: career.aiRisk,
    aiNote: career.aiNote,
    salaryFresher: career.salaryFresher,
    salary5yr: career.salary5yr,
    exams: career.exams,
    score,
  }));

  // Bottom candidates for elimination — pick worst-fit careers that have clear mismatches
  const eliminated: EliminatedCareer[] = [];
  for (const { career } of scored.slice().reverse()) {
    if (topIds.has(career.id)) continue;
    if (eliminated.length >= 3) break;
    const mismatch = findWorstMismatch(career, bigFive, riasec);
    if (mismatch) {
      eliminated.push({
        career: career.name,
        reason: mismatch.reason,
        specificTrait: mismatch.trait,
        notForYouBecause: mismatch.notForYouBecause,
      });
    }
  }

  // If we couldn't find 3 with clear mismatches, add from low-scorers with generic reason
  for (const { career } of scored.slice().reverse()) {
    if (eliminated.length >= 3) break;
    if (topIds.has(career.id)) continue;
    if (eliminated.some((e) => e.career === career.name)) continue;
    eliminated.push({
      career: career.name,
      reason: `Your RIASEC profile strongly favours other directions — the interest overlap with ${career.name} is low, which means day-to-day work would feel like pushing against your grain.`,
      specificTrait: 'low interest overlap',
      notForYouBecause: `${career.name} isn't for you because your interest profile points in a different direction.`,
    });
  }

  const topCareers = topFour.map((x) => x.career);
  const colleges = matchColleges([topCareers[0]], lifestyle, true);
  const profileSummary = buildProfileSummary(bigFive, riasec, topCareers);
  const personalityHighlights = buildPersonalityHighlights(bigFive, riasec);
  const topRIASEC = getTopRIASEC(riasec, 2);

  return {
    profileSummary,
    personalityHighlights,
    topRIASEC,
    careers: matchedCareers,
    eliminated,
    colleges,
  };
}
