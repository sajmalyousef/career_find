import collegesData from '@/data/colleges.json';

export interface College {
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

export function getCollegesForCareers(
  careerTags: string[],
  budgetBracket: string,
  includeAbroad = false,
): College[] {
  const budgetMap: Record<string, number> = {
    under_1L: 100000,
    '1L_5L': 500000,
    '5L_15L': 1500000,
    above_15L: Infinity,
    unknown: Infinity,
  };
  const maxBudget = budgetMap[budgetBracket] ?? Infinity;

  return (collegesData as College[]).filter((c) => {
    if (c.abroad && !includeAbroad) return false;
    if (!c.abroad && c.fees_per_year_inr > maxBudget * 2) return false; // include reach schools
    return c.career_tags.some((tag) => careerTags.includes(tag));
  });
}

export function getAllColleges(): College[] {
  return collegesData as College[];
}
