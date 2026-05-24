'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { trackEvent } from '@/lib/gtag';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import type { BigFiveScores, RIASECScores } from '@/lib/scoring';
import { getRIASECLabel } from '@/lib/scoring';

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

const AI_RISK_COLORS: Record<string, { bg: string; color: string }> = {
  low:    { bg: 'rgba(34,197,94,0.1)',   color: '#16a34a' },
  medium: { bg: 'rgba(234,179,8,0.1)',   color: '#b45309' },
  high:   { bg: 'rgba(239,68,68,0.1)',   color: '#dc2626' },
};


const serif = "var(--font-serif), 'Instrument Serif', serif";

function BigFiveRadar({ scores }: { scores: BigFiveScores }) {
  const traitNames: Record<string, string> = {
    E: 'Extraversion', A: 'Agreeableness', C: 'Conscientiousness', N: 'Stability', O: 'Openness',
  };
  const data = Object.entries(scores).map(([key, val]) => ({
    trait: traitNames[key] ?? key,
    value: Math.max(0, key === 'N' ? -val + 5 : val + 5),
    fullMark: 10,
  }));
  return (
    <ResponsiveContainer width="100%" height={210}>
      <RadarChart data={data}>
        <PolarGrid stroke="rgba(26,18,7,0.1)" />
        <PolarAngleAxis dataKey="trait" tick={{ fontSize: 11, fill: '#8b7d6b' }} />
        <Radar name="You" dataKey="value" stroke="#d4942a" fill="#d4942a" fillOpacity={0.2} strokeWidth={2} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

export default function ResultsPage() {
  const router = useRouter();
  const [data, setData] = useState<ApiResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'careers' | 'eliminated'>('careers');
  const [downloading, setDownloading] = useState(false);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [ratingDone, setRatingDone] = useState(false);

  async function downloadReport() {
    if (!data) return;
    setDownloading(true);
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result: data.result, bigFive: data.bigFive, riasec: data.riasec }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'careerfind-report.pdf'; a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  useEffect(() => {
    const stored = sessionStorage.getItem('careerResults');
    if (!stored) { router.push('/assess'); return; }
    try {
      const parsed = JSON.parse(stored);
      if (!parsed.result) { router.push('/assess'); return; }
      setData(parsed);
    } catch { router.push('/'); }
  }, [router]);

  if (!data) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)' }}>
        <div style={{ width: 36, height: 36, border: '3px solid rgba(212,148,42,0.2)', borderTopColor: 'var(--amber)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  const { result, bigFive, riasec } = data;
  const careers = result.careers ?? [];
  const eliminated = result.eliminated ?? [];
  const personalityHighlights = result.personalityHighlights ?? [];
  const topRIASEC = result.topRIASEC ?? [];
  const topAspirations: string[] = (result as { topAspirations?: string[] }).topAspirations ?? [];

  return (
    <main style={{ background: 'var(--cream)', minHeight: '100vh' }}>

      {/* Header */}
      <header style={{ background: 'var(--bark)', padding: '1rem 1.25rem', textAlign: 'center' }}>
        <p style={{ fontFamily: serif, fontSize: '0.9rem', color: 'var(--amber)', margin: 0, marginBottom: 4 }}>CareerFind</p>
        <h1 style={{ fontFamily: serif, fontSize: '1.5rem', color: 'var(--cream)', margin: 0 }}>Your Career Map 🗺️</h1>
      </header>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* Profile Card */}
        <section style={{ background: 'var(--warm-white)', borderRadius: 12, padding: '1.5rem', borderTop: '3px solid var(--amber)' }}>
          <h2 style={{ fontFamily: serif, fontSize: '1.35rem', color: 'var(--bark)', margin: '0 0 0.75rem' }}>Your Profile</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--warm-gray)', lineHeight: 1.7, margin: '0 0 1.25rem' }}>{result.profileSummary}</p>

          {personalityHighlights.length > 0 && (
            <div style={{ marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {personalityHighlights.map((h, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.88rem', color: 'var(--bark-mid)' }}>
                  <span style={{ color: 'var(--amber)', marginTop: 2, flexShrink: 0 }}>✦</span>
                  <span>{h}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
            {topRIASEC.map((code) => (
              <div key={code} style={{ background: 'rgba(212,148,42,0.08)', borderRadius: 8, padding: '0.75rem' }}>
                <span style={{ fontFamily: serif, fontSize: '1.1rem', color: 'var(--amber-dark)', display: 'block' }}>{code}</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--warm-gray)' }}>{getRIASECLabel(code)}</span>
              </div>
            ))}
          </div>

          {topAspirations.length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--amber-dark)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.5rem' }}>You&apos;re optimising for</p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {topAspirations.map((label) => (
                  <span key={label} style={{ fontSize: '0.82rem', fontWeight: 600, padding: '0.35rem 0.75rem', background: 'rgba(212,148,42,0.12)', color: 'var(--amber-dark)', borderRadius: 20, border: '1px solid rgba(212,148,42,0.25)' }}>
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}

          <BigFiveRadar scores={bigFive} />
        </section>

        {/* Tab Nav */}
        <div style={{ display: 'flex', background: 'var(--warm-white)', borderRadius: 10, padding: 4, gap: 4, border: '1px solid rgba(26,18,7,0.08)' }}>
          {(['careers', 'eliminated'] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              flex: 1, padding: '0.625rem 0', fontSize: '0.82rem', fontWeight: 600,
              borderRadius: 7, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              background: activeTab === tab ? 'var(--amber)' : 'transparent',
              color: activeTab === tab ? 'var(--bark)' : 'var(--warm-gray)',
              transition: 'all 0.2s',
            }}>
              {tab === 'careers' ? '🎯 Career Matches' : '❌ Not For You'}
            </button>
          ))}
        </div>

        {/* Career Matches */}
        {activeTab === 'careers' && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h2 style={{ fontFamily: serif, fontSize: '1.25rem', color: 'var(--bark)', margin: 0 }}>Your top career matches</h2>
            {careers.map((career, i) => {
              const risk = AI_RISK_COLORS[career.aiRisk] ?? AI_RISK_COLORS.medium;
              return (
                <div key={career.id} style={{ background: 'var(--warm-white)', borderRadius: 12, padding: '1.25rem', borderTop: '2px solid var(--amber)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(212,148,42,0.15)', color: 'var(--amber-dark)', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: serif }}>{i + 1}</span>
                      <h3 style={{ fontFamily: serif, fontSize: '1.1rem', color: 'var(--bark)', margin: 0 }}>{career.name}</h3>
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '0.3rem 0.6rem', borderRadius: 20, background: risk.bg, color: risk.color, whiteSpace: 'nowrap', flexShrink: 0 }}>AI risk: {career.aiRisk}</span>
                  </div>

                  <p style={{ fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--warm-gray)', margin: '0 0 0.875rem' }}>&ldquo;{career.dayInLife}&rdquo;</p>

                  <div style={{ background: 'rgba(212,148,42,0.07)', borderRadius: 8, padding: '0.875rem', marginBottom: '0.75rem' }}>
                    <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--amber-dark)', margin: '0 0 0.35rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Why this fits you</p>
                    <p style={{ fontSize: '0.88rem', color: 'var(--bark-mid)', lineHeight: 1.65, margin: 0 }}>{career.whyFit}</p>
                  </div>

                  <p style={{ fontSize: '0.78rem', color: 'var(--warm-gray)', margin: '0 0 0.75rem' }}>{career.aiNote}</p>

                  {career.exams?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--warm-gray)' }}>Entrance:</span>
                      {career.exams.map((e) => (
                        <span key={e} style={{ fontSize: '0.72rem', background: 'rgba(26,18,7,0.06)', color: 'var(--bark-mid)', padding: '0.2rem 0.6rem', borderRadius: 20, fontWeight: 600 }}>{e}</span>
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
          <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'rgba(212,148,42,0.08)', border: '1px solid rgba(212,148,42,0.2)', borderRadius: 10, padding: '1rem', fontSize: '0.85rem', color: 'var(--bark-mid)', lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--amber-dark)' }}>Why we show you this:</strong> Knowing what doesn&apos;t fit saves years of wrong decisions. This isn&apos;t meant to discourage you — it&apos;s meant to protect your time.
            </div>
            {eliminated.map((item, i) => (
              <div key={i} style={{ background: 'var(--warm-white)', borderRadius: 12, padding: '1.25rem', borderTop: '2px solid rgba(239,68,68,0.4)' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.875rem' }}>
                  <span style={{ fontSize: '1.1rem' }}>🚫</span>
                  <h3 style={{ fontFamily: serif, fontSize: '1.1rem', color: 'var(--bark)', margin: 0 }}>{item.career}</h3>
                </div>
                <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)', borderRadius: 8, padding: '0.875rem', marginBottom: '0.75rem' }}>
                  <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#dc2626', margin: '0 0 0.35rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Not for you because</p>
                  <p style={{ fontSize: '0.88rem', color: 'var(--bark-mid)', fontWeight: 500, margin: 0 }}>{item.notForYouBecause}</p>
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--warm-gray)', lineHeight: 1.65, margin: '0 0 0.75rem' }}>{item.reason}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--warm-gray)' }}>Key trait:</span>
                  <span style={{ fontSize: '0.72rem', background: 'rgba(26,18,7,0.06)', color: 'var(--bark-mid)', padding: '0.2rem 0.6rem', borderRadius: 20, fontWeight: 600 }}>{item.specificTrait}</span>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Rating widget */}
        {!ratingDone ? (
          <div style={{ background: 'var(--warm-white)', borderRadius: 12, padding: '1.25rem', marginBottom: '2rem', textAlign: 'center', border: '1px solid rgba(26,18,7,0.06)' }}>
            <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--bark)', margin: '0 0 0.25rem' }}>Was this useful?</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--warm-gray)', margin: '0 0 1rem' }}>Your rating helps us improve CareerFind</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              {[1, 2, 3, 4, 5].map((star) => {
                const filled = hoveredStar ? star <= hoveredStar : star <= (selectedRating ?? 0);
                return (
                  <button
                    key={star}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(null)}
                    onClick={() => {
                      setSelectedRating(star);
                      trackEvent('rating_submitted', { rating: star });
                      setTimeout(() => setRatingDone(true), 600);
                    }}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem',
                      fontSize: '1.75rem', lineHeight: 1,
                      filter: filled ? 'none' : 'grayscale(1) opacity(0.25)',
                      transform: filled ? 'scale(1.2)' : 'scale(1)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    ⭐
                  </button>
                );
              })}
            </div>
            {selectedRating && (
              <p style={{ fontSize: '0.78rem', color: 'var(--amber-dark)', fontWeight: 600, margin: 0 }}>
                {['', 'Not great', 'Could be better', 'Pretty good', 'Really good', 'Loved it! 🎉'][selectedRating]}
              </p>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', marginBottom: '0.5rem', padding: '0.75rem' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--warm-gray)' }}>Thanks for the feedback ✦</p>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingBottom: '2rem' }}>
          <button
            onClick={downloadReport}
            disabled={downloading}
            style={{
              width: '100%', padding: '0.9rem', borderRadius: 10, border: 'none',
              background: 'var(--amber)', color: 'var(--bark)', fontWeight: 700,
              fontSize: '0.95rem', cursor: downloading ? 'wait' : 'pointer',
              opacity: downloading ? 0.7 : 1, fontFamily: 'inherit',
            }}
          >
            {downloading ? 'Generating your report…' : '↓ Download Full Report (PDF)'}
          </button>
          <button
            onClick={() => { sessionStorage.removeItem('careerResults'); router.push('/assess'); }}
            style={{ fontSize: '0.82rem', color: 'var(--warm-gray)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Retake the assessment →
          </button>
        </div>

      </div>
    </main>
  );
}
