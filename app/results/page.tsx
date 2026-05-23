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

const AI_RISK_STYLES: Record<string, { bg: string; color: string }> = {
  low:    { bg: 'rgba(34,197,94,0.12)',  color: '#4ade80' },
  medium: { bg: 'rgba(234,179,8,0.12)',  color: '#facc15' },
  high:   { bg: 'rgba(239,68,68,0.12)',  color: '#f87171' },
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
    <ResponsiveContainer width="100%" height={200}>
      <RadarChart data={data}>
        <PolarGrid stroke="var(--border)" />
        <PolarAngleAxis dataKey="trait" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
        <Radar name="You" dataKey="value" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.15} strokeWidth={2} />
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
    if (!stored) { router.push('/assess'); return; }
    try {
      const parsed = JSON.parse(stored);
      if (!parsed.result) { router.push('/assess'); return; }
      setData(parsed);
    } catch {
      router.push('/');
    }
  }, [router]);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="w-10 h-10 border-4 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
      </div>
    );
  }

  const { result, bigFive, riasec } = data;
  const careers = result.careers ?? [];
  const eliminated = result.eliminated ?? [];
  const colleges = result.colleges ?? [];
  const personalityHighlights = result.personalityHighlights ?? [];
  const topRIASEC = result.topRIASEC ?? [];

  const indiaColleges = colleges.filter((c) => !c.abroad);
  const abroadColleges = colleges.filter((c) => c.abroad);
  const displayColleges = showAbroad ? abroadColleges : indiaColleges;

  const cardStyle = { background: 'var(--bg-card)', border: '1px solid var(--border)' };
  const elevatedStyle = { background: 'var(--bg-elevated)', border: '1px solid var(--border-light)' };

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <header className="px-4 py-4 text-center" style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
        <p className="text-sm font-semibold" style={{ color: 'var(--accent)', fontFamily: 'var(--font-syne), sans-serif' }}>CareerFind</p>
        <h1 className="text-xl font-bold mt-1" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-syne), sans-serif' }}>Your Career Map 🗺️</h1>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* Profile Card */}
        <section className="rounded-2xl p-5" style={cardStyle}>
          <h2 className="font-bold text-lg mb-2" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-syne), sans-serif' }}>Your Profile</h2>
          <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>{result.profileSummary}</p>

          {personalityHighlights.length > 0 && (
            <div className="space-y-2 mb-4">
              {personalityHighlights.map((h, i) => (
                <div key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <span className="mt-0.5" style={{ color: 'var(--accent)' }}>✦</span>
                  <span>{h}</span>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 mb-4">
            {topRIASEC.map((code) => (
              <div key={code} className="rounded-xl px-3 py-2.5 text-sm" style={{ background: 'var(--accent-dim)' }}>
                <span className="font-semibold" style={{ color: 'var(--accent)', fontFamily: 'var(--font-syne), sans-serif' }}>{code}</span>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{getRIASECLabel(code)}</p>
              </div>
            ))}
          </div>

          <BigFiveRadar scores={bigFive} />

          <div className="grid grid-cols-5 gap-1 mt-1">
            {Object.entries(bigFive).map(([key]) => (
              <p key={key} className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                {key === 'N' ? 'Stability' : getBigFiveLabel(key).split(' ')[0]}
              </p>
            ))}
          </div>
        </section>

        {/* Tab Nav */}
        <div className="flex rounded-xl p-1 gap-1" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          {(['careers', 'eliminated', 'colleges'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2.5 text-sm font-medium rounded-lg transition-all"
              style={activeTab === tab
                ? { background: 'var(--accent)', color: '#fff' }
                : { color: 'var(--text-muted)' }
              }
            >
              {tab === 'careers' ? '🎯 Careers' : tab === 'eliminated' ? '❌ Not for you' : '🏛️ Colleges'}
            </button>
          ))}
        </div>

        {/* Career Matches */}
        {activeTab === 'careers' && (
          <section className="space-y-4">
            <h2 className="font-bold text-lg px-1" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-syne), sans-serif' }}>Your top career matches</h2>
            {careers.map((career, i) => {
              const riskStyle = AI_RISK_STYLES[career.aiRisk] ?? AI_RISK_STYLES.medium;
              return (
                <div key={career.id} className="rounded-2xl p-5" style={cardStyle}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-7 h-7 rounded-full text-sm font-bold flex items-center justify-center"
                        style={{ background: 'var(--accent-dim)', color: 'var(--accent)', fontFamily: 'var(--font-syne), sans-serif' }}
                      >
                        {i + 1}
                      </span>
                      <h3 className="font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-syne), sans-serif' }}>{career.name}</h3>
                    </div>
                    <span
                      className="text-xs font-medium px-2.5 py-1 rounded-full"
                      style={{ background: riskStyle.bg, color: riskStyle.color }}
                    >
                      AI risk: {career.aiRisk}
                    </span>
                  </div>

                  <p className="text-sm italic mb-3" style={{ color: 'var(--text-muted)' }}>&ldquo;{career.dayInLife}&rdquo;</p>

                  <div className="rounded-xl p-3 mb-3" style={{ background: 'var(--accent-dim)' }}>
                    <p className="text-xs font-semibold mb-1" style={{ color: 'var(--accent)' }}>Why this fits you</p>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{career.whyFit}</p>
                  </div>

                  <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>{career.aiNote}</p>

                  {career.exams?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Entrance:</span>
                      {career.exams.map((e) => (
                        <span key={e} className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(99,179,237,0.12)', color: '#63b3ed' }}>{e}</span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </section>
        )}

        {/* Eliminated */}
        {activeTab === 'eliminated' && (
          <section className="space-y-4">
            <div className="rounded-xl p-4 text-sm" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', color: '#fbbf24' }}>
              <strong>Why we show you this:</strong> Knowing what doesn&apos;t fit saves years of wrong decisions. This isn&apos;t meant to discourage you — it&apos;s meant to protect your time.
            </div>
            {eliminated.map((item, i) => (
              <div key={i} className="rounded-2xl p-5" style={cardStyle}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🚫</span>
                  <h3 className="font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-syne), sans-serif' }}>{item.career}</h3>
                </div>

                <div className="rounded-xl p-3 mb-3" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
                  <p className="text-xs font-semibold mb-1" style={{ color: '#f87171' }}>Not for you because</p>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{item.notForYouBecause}</p>
                </div>

                <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>{item.reason}</p>

                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Key trait:</span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={elevatedStyle}>{item.specificTrait}</span>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Colleges */}
        {activeTab === 'colleges' && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg px-1" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-syne), sans-serif' }}>Colleges to target</h2>
              <div className="flex rounded-xl p-1 gap-1 text-sm" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <button
                  onClick={() => setShowAbroad(false)}
                  className="px-3 py-1.5 rounded-lg transition-all"
                  style={!showAbroad ? { background: 'var(--accent)', color: '#fff' } : { color: 'var(--text-muted)' }}
                >
                  🇮🇳 India
                </button>
                <button
                  onClick={() => setShowAbroad(true)}
                  className="px-3 py-1.5 rounded-lg transition-all"
                  style={showAbroad ? { background: 'var(--accent)', color: '#fff' } : { color: 'var(--text-muted)' }}
                >
                  🌍 Abroad
                </button>
              </div>
            </div>

            <p className="text-sm px-1" style={{ color: 'var(--text-muted)' }}>
              Matched to your top career recommendation — not a generic list.
            </p>

            {displayColleges.length === 0 && (
              <div className="rounded-2xl p-6 text-center text-sm" style={{ ...cardStyle, color: 'var(--text-muted)' }}>
                No colleges found for this filter. Try the India option.
              </div>
            )}

            {displayColleges.map((college) => {
              const isTier1 = college.tier === 'tier1' || college.tier === 'global_elite';
              return (
                <div key={`${college.id}-${college.careerMatch}`} className="rounded-2xl p-5" style={cardStyle}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-syne), sans-serif' }}>{college.name}</h3>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{college.location}</p>
                    </div>
                    <span
                      className="text-xs font-medium px-2 py-1 rounded-full"
                      style={isTier1
                        ? { background: 'rgba(168,85,247,0.12)', color: '#c084fc' }
                        : { background: 'rgba(99,179,237,0.12)', color: '#63b3ed' }
                      }
                    >
                      {TIER_LABELS[college.tier] ?? college.tier}
                    </span>
                  </div>

                  <div className="rounded-xl p-3 mb-3" style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.12)' }}>
                    <p className="text-xs font-semibold mb-1" style={{ color: '#4ade80' }}>Why this college for you</p>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{college.whyGoodFit}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="rounded-lg p-2 text-center" style={elevatedStyle}>
                      <p style={{ color: 'var(--text-muted)' }}>Fees/year</p>
                      <p className="font-semibold mt-0.5" style={{ color: 'var(--text-primary)' }}>{formatFees(college.fees_per_year_inr)}</p>
                    </div>
                    <div className="rounded-lg p-2 text-center" style={elevatedStyle}>
                      <p style={{ color: 'var(--text-muted)' }}>NIRF Rank</p>
                      <p className="font-semibold mt-0.5" style={{ color: 'var(--text-primary)' }}>{college.nirf_rank ?? '—'}</p>
                    </div>
                    <div className="rounded-lg p-2 text-center" style={elevatedStyle}>
                      <p style={{ color: 'var(--text-muted)' }}>Career fit</p>
                      <p className="font-semibold mt-0.5 truncate" style={{ color: 'var(--text-primary)' }}>{college.careerMatch.replace(/_/g, ' ')}</p>
                    </div>
                  </div>

                  {college.entrance_exams?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Entrance:</span>
                      {college.entrance_exams.map((e) => (
                        <span key={e} className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(99,179,237,0.12)', color: '#63b3ed' }}>{e}</span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </section>
        )}

        {/* Retake */}
        <div className="text-center py-4">
          <button
            onClick={() => {
              sessionStorage.removeItem('careerResults');
              router.push('/assess');
            }}
            className="text-sm transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            Retake the assessment →
          </button>
        </div>
      </div>
    </main>
  );
}
