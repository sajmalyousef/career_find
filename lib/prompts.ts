import type { BigFiveScores, RIASECScores, LifestyleInputs, SessionAnswers } from './scoring';

export const SYSTEM_PROMPT = `You are CareerFind's AI counselor — a sharp, honest, and encouraging career advisor for Indian school students in grades 8–12, especially from tier 2 cities.

You understand:
- Big Five (OCEAN) personality psychology
- RIASEC interest framework (Holland Codes)
- The Indian education system: JEE, NEET, CLAT, CUET, CAT, NID/NIFT, UPSC, state board streams
- Real-world career paths in India and abroad
- AI's impact on different professions

Your job: Given a student's assessment answers, produce a structured JSON response with:
1. A warm, direct profile summary (2–3 sentences, speak directly to the student as "you")
2. 3–4 career matches — ranked best-first, personalised to their specific answers
3. 2–3 eliminated careers — with honest, specific reasons tied to their traits
4. 10–15 college recommendations — ONLY for the matched careers, filtered by budget

Be honest, not gentle. If a kid has low emotional stability, tell them surgery isn't ideal — and explain why specifically. Students deserve real guidance, not vague encouragement.

Use simple language. No jargon. Write as if talking to a 16-year-old who's smart but has never heard of OCEAN before.

IMPORTANT: Return ONLY valid JSON. No markdown fences, no explanation outside the JSON.`;

export function buildAnalysisPrompt(
  answers: SessionAnswers,
  bigFive: BigFiveScores,
  riasec: RIASECScores,
  lifestyle: LifestyleInputs,
  collegesJson: string,
  careersJson: string,
): string {
  const budgetLabels: Record<string, string> = {
    under_1L: 'Under ₹1 lakh/year',
    '1L_5L': '₹1–5 lakh/year',
    '5L_15L': '₹5–15 lakh/year',
    above_15L: '₹15 lakh+/year',
    unknown: 'Not specified',
  };

  const gradeLabels: Record<string, string> = {
    grade_8_9: 'Grade 8–9',
    grade_10: 'Grade 10',
    grade_11_12: 'Grade 11–12',
    unknown: 'Not specified',
  };

  return `Here is a student's complete career assessment. Analyse it and return career guidance as JSON.

## Big Five Personality Scores (raw, higher = stronger trait)
- Extraversion (E): ${bigFive.E} (positive = more extraverted)
- Agreeableness (A): ${bigFive.A} (positive = more agreeable)
- Conscientiousness (C): ${bigFive.C} (positive = more conscientious)
- Neuroticism (N): ${bigFive.N} (positive = MORE emotional instability; negative = calmer under pressure)
- Openness (O): ${bigFive.O} (positive = more open/curious)

## RIASEC Interest Scores
- Realistic (R): ${riasec.R}
- Investigative (I): ${riasec.I}
- Artistic (A): ${riasec.A}
- Social (S): ${riasec.S}
- Enterprising (En): ${riasec.En}
- Conventional (C): ${riasec.C}

## Student Circumstances
- Budget: ${budgetLabels[lifestyle.budgetBracket] ?? lifestyle.budgetBracket}
- Current grade: ${gradeLabels[lifestyle.grade] ?? lifestyle.grade}
- Preferred location at 30: ${lifestyle.location}
- Career priority: ${lifestyle.priority}
- Risk tolerance: ${lifestyle.riskTolerance}
- Attitude toward AI: ${lifestyle.aiAttitude}

## How they answered key questions
${Object.entries(answers)
  .filter(([id]) => !['C1', 'C2', 'D1', 'D2', 'D3', 'D4'].includes(id))
  .map(([id, ans]) => `- Q${id}: "${ans.label}"`)
  .join('\n')}

## Available career database (JSON)
${careersJson}

## Available college database (JSON)
${collegesJson}

---

Return ONLY this JSON structure (no markdown, no extra text):

{
  "profileSummary": "2–3 sentence personalised summary speaking directly to the student",
  "personalityHighlights": [
    "One-line insight about their strongest trait",
    "One-line insight about a second key trait"
  ],
  "topRIASEC": ["code1", "code2"],
  "careers": [
    {
      "id": "career_id_from_database",
      "name": "Career Name",
      "whyFit": "2–3 sentences: why THIS student specifically is a match — reference their actual answers",
      "dayInLife": "What you'd actually do day to day (1 vivid sentence)",
      "aiRisk": "low|medium|high",
      "aiNote": "1 sentence on AI impact for this career",
      "salaryFresher": "₹X–Y LPA",
      "salary5yr": "₹X–Y LPA",
      "exams": ["exam1", "exam2"]
    }
  ],
  "eliminated": [
    {
      "career": "Career Name",
      "reason": "Specific, honest 2–3 sentence explanation tied to their actual scores or answers",
      "specificTrait": "The key trait or score that makes this a bad fit",
      "notForYouBecause": "One punchy sentence: 'Surgery isn't for you because...' "
    }
  ],
  "colleges": [
    {
      "id": "college_id_from_database",
      "name": "College Name",
      "location": "City, State",
      "careerMatch": "career_id this college is recommended for",
      "whyGoodFit": "1–2 sentences: why this college specifically fits this student's matched career and profile",
      "tier": "tier1|tier2|global_elite",
      "fees_per_year_inr": 000000,
      "entrance_exams": ["exam1"],
      "nirf_rank": null,
      "abroad": false
    }
  ]
}

Rules:
- careers: exactly 3–4, ranked best-first
- eliminated: exactly 2–3 careers NOT in the matched list
- colleges: 8–12 India colleges + 2–3 abroad colleges, ALL filtered to the matched careers
- Only include colleges whose fees_per_year_inr fits the student's budget bracket (be generous — include reach schools too)
- whyGoodFit must reference the specific career and why the college is strong for it
- Be specific and honest — no generic advice`;
}
