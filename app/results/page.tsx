'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import type { BigFiveScores, RIASECScores } from '@/lib/scoring';
import { getBigFiveLabel, getRIASECLabel } from '@/lib/scoring';

interface CareerResult {
  id: string;
  name: string;
  whyFit: string;
  dayInLife: string;
  aiRisk: string;
  aiNote: string;
  salaryFresher: string;
  salary5yr: string;
  exams: string[];
}

interface EliminatedCareer {
  career: string;
  reason: string;
  specificTrait: string;
  notForYouBecause: string;
}

interface CollegeResult {
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

interface AnalysisResult {
  profileSummary: string;
  personalityHighlights: string[];
  topRIASEC: string[];
  careers: CareerResult[];
  eliminated: EliminatedCareer[];
  colleges: CollegeResult[];
}

interface ApiResponse {
  result: AnalysisResult;
  bigFive: BigFiveScores;
  riasec: RIASECScores;
}

const AI_RISK_COLORS: Record<string, string> = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
};

const TIER_LABELS: Record<string, string> = {
  tier1: 'Top Tier',
  tier2: 'Good Tier',
  global_elite: 'Global Elite',
};

function formatFees(fees: number): string {
  if (fees < 100000) return `₹${(fees / 1000).toFixed(0)}K/yr`;
  return `₹${(fees / 100000).toFixed(1)}L/yr`;
}

function BigFiveRadar({ scores }: { scores: BigFiveScores }) {
  const data = Object.entries(scores).map(([key, val]) => ({
    trait: key === 'N' ? 'Stability' : key,
    value: Math.max(0, key === 'N' ? -val + 5 : val + 5),
    fullMark: 10,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart data={data}>
        <PolarGrid stroke="#f3f4f6" />
        <PolarAngleAxis dataKey="trait" tick={{ fontSize: 12, fill: '#6b7280' }} />
        <Radar name="You" dataKey="value" stroke="#f97316" fill="#f97316" fillOpacity={0.2} strokeWidth={2} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

export default function ResultsPage() {
  const router = useRouter();
  const [data, setData] = useState<ApiResponse | null>(null);
  const [showAbroad, setShowAbroad] = useState(false);
  const [activeTab, setActiveTab] = useState<'careers' | 'eliminated' | 'colleges'>('careers');

  useEffect(() => {
    const stored = sessionStorage.getItem('careerResults');
    if (!stored) {
      router.push('/assess');
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      if (!parsed.result) {
        router.push('/assess');
        return;
      }
      setData(parsed);
    } catch {
      router.push('/');
    }
  }, [router]);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  const { result, bigFive, riasec } = data;

  // Safety fallbacks so the page never crashes on missing fields
  const careers = result.careers ?? [];
  const eliminated = result.eliminated ?? [];
  const colleges = result.colleges ?? [];
  const personalityHighlights = result.personalityHighlights ?? [];
  const topRIASEC = result.topRIASEC ?? [];

  const indiaColleges = colleges.filter((c) => !c.abroad);
  const abroadColleges = colleges.filter((c) => c.abroad);
  const displayColleges = showAbroad ? abroadColleges : indiaColleges;

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 py-4 text-center">
        <p className="text-orange-500 font-semibold text-sm">CareerFind</p>
        <h1 className="text-xl font-bold text-gray-900 mt-1">Your Career Map 🗺️</h1>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* Profile Card */}
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-900 mb-2 text-lg">Your Profile</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">{result.profileSummary}</p>

          {personalityHighlights.length > 0 && (
            <div className="space-y-2 mb-4">
              {personalityHighlights.map((h, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-orange-500 mt-0.5">✦</span>
                  <span>{h}</span>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mb-4">
            {topRIASEC.map((code) => (
              <div key={code} className="bg-orange-50 rounded-xl px-3 py-2.5 text-sm">
                <span className="font-semibold text-orange-600">{code}</span>
                <p className="text-gray-600 text-xs mt-0.5">{getRIASECLabel(code)}</p>
              </div>
            ))}
          </div>

          <BigFiveRadar scores={bigFive} />

          <div className="grid grid-cols-5 gap-1 mt-2">
            {Object.entries(bigFive).map(([key]) => (
              <p key={key} className="text-xs text-center text-gray-400">
                {key === 'N' ? 'Stability' : getBigFiveLabel(key).split(' ')[0]}
              </p>
            ))}
          </div>
        </section>

        {/* Tab Nav */}
        <div className="flex bg-white rounded-xl p-1 shadow-sm border border-gray-100 gap-1">
          {(['careers', 'eliminated', 'colleges'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                activeTab === tab
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'careers' ? '🎯 Careers' : tab === 'eliminated' ? '❌ Not for you' : '🏛️ Colleges'}
            </button>
          ))}
        </div>

        {/* Career Matches */}
        {activeTab === 'careers' && (
          <section className="space-y-4">
            <h2 className="font-bold text-gray-900 text-lg px-1">Your top career matches</h2>
            {careers.map((career, i) => (
              <div key={career.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 text-sm font-bold flex items-center justify-center">{i + 1}</span>
                    <h3 className="font-bold text-gray-900">{career.name}</h3>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${AI_RISK_COLORS[career.aiRisk]}`}>
                    AI risk: {career.aiRisk}
                  </span>
                </div>

                <p className="text-sm text-gray-500 italic mb-3">"{career.dayInLife}"</p>

                <div className="bg-orange-50 rounded-xl p-3 mb-3">
                  <p className="text-xs font-semibold text-orange-600 mb-1">Why this fits you</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{career.whyFit}</p>
                </div>

                <p className="text-xs text-gray-500 mb-3">{career.aiNote}</p>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400">Starting salary</p>
                    <p className="font-semibold text-gray-800 text-sm">{career.salaryFresher}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400">At 5 years</p>
                    <p className="font-semibold text-gray-800 text-sm">{career.salary5yr}</p>
                  </div>
                </div>

                {career.exams?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="text-xs text-gray-400">Entrance:</span>
                    {career.exams.map((e) => (
                      <span key={e} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">{e}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </section>
        )}

        {/* Eliminated */}
        {activeTab === 'eliminated' && (
          <section className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              <strong>Why we show you this:</strong> Knowing what doesn't fit you saves years. These aren't meant to discourage you — they're meant to help you avoid spending 4 years on the wrong path.
            </div>
            {eliminated.map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🚫</span>
                  <h3 className="font-bold text-gray-900">{item.career}</h3>
                </div>

                <div className="bg-red-50 rounded-xl p-3 mb-3">
                  <p className="text-xs font-semibold text-red-600 mb-1">Not for you because</p>
                  <p className="text-sm text-gray-700 font-medium">{item.notForYouBecause}</p>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed mb-3">{item.reason}</p>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Key trait:</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{item.specificTrait}</span>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Colleges */}
        {activeTab === 'colleges' && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900 text-lg px-1">Colleges to target</h2>
              <div className="flex bg-white rounded-xl p-1 border border-gray-100 text-sm gap-1">
                <button
                  onClick={() => setShowAbroad(false)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${!showAbroad ? 'bg-orange-500 text-white' : 'text-gray-500'}`}
                >
                  🇮🇳 India
                </button>
                <button
                  onClick={() => setShowAbroad(true)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${showAbroad ? 'bg-orange-500 text-white' : 'text-gray-500'}`}
                >
                  🌍 Abroad
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-500 px-1">
              These colleges are specifically matched to your career recommendations — not a generic list.
            </p>

            {displayColleges.length === 0 && (
              <div className="bg-white rounded-2xl p-6 text-center text-gray-500 text-sm">
                No colleges found for this filter. Try the India option.
              </div>
            )}

            {displayColleges.map((college) => (
              <div key={`${college.id}-${college.careerMatch}`} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-gray-900">{college.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{college.location}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    college.tier === 'tier1' || college.tier === 'global_elite'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {TIER_LABELS[college.tier] ?? college.tier}
                  </span>
                </div>

                <div className="bg-green-50 rounded-xl p-3 mb-3">
                  <p className="text-xs font-semibold text-green-600 mb-1">Why this college for you</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{college.whyGoodFit}</p>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-gray-50 rounded-lg p-2 text-center">
                    <p className="text-gray-400">Fees/year</p>
                    <p className="font-semibold text-gray-800">{formatFees(college.fees_per_year_inr)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2 text-center">
                    <p className="text-gray-400">NIRF Rank</p>
                    <p className="font-semibold text-gray-800">{college.nirf_rank ?? '—'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2 text-center">
                    <p className="text-gray-400">Career fit</p>
                    <p className="font-semibold text-gray-800 truncate">{college.careerMatch.replace(/_/g, ' ')}</p>
                  </div>
                </div>

                {college.entrance_exams?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="text-xs text-gray-400">Entrance:</span>
                    {college.entrance_exams.map((e) => (
                      <span key={e} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">{e}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </section>
        )}

        {/* Retake */}
        <div className="text-center py-4">
          <button
            onClick={() => {
              sessionStorage.removeItem('careerResults');
              router.push('/assess');
            }}
            className="text-sm text-gray-400 hover:text-orange-500 transition-colors"
          >
            Retake the assessment →
          </button>
        </div>
      </div>
    </main>
  );
}
