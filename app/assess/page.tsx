'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { trackEvent } from '@/lib/gtag';
import questionsData from '@/data/questions.json';
import { scoreBigFive, scoreRIASEC, extractLifestyle, scoreAspirations } from '@/lib/scoring';
import { computeResults } from '@/lib/matching';

interface Option {
  label: string;
  emoji?: string;
  traits: Record<string, number>;
  value?: string;
}

interface Question {
  id: string;
  text: string;
  type: string;
  options: Option[];
}

interface Block {
  id: string;
  title: string;
  pickCount?: number;
  questions: Question[];
}

interface SessionAnswers {
  [questionId: string]: {
    label: string;
    traits: Record<string, number>;
    value?: string;
  };
}

const allBlocks: Block[] = questionsData.blocks as Block[];

function pickQuestionsForSession(blocks: Block[]): Question[] {
  return blocks.flatMap((block) => {
    const qs = [...block.questions];
    const count = block.pickCount ?? qs.length;
    for (let i = qs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [qs[i], qs[j]] = [qs[j], qs[i]];
    }
    return qs.slice(0, count);
  });
}

const BLOCK_LABELS: Record<string, { label: string; emoji: string }> = {
  A: { label: 'About You', emoji: '🧠' },
  B: { label: 'Your Interests', emoji: '✨' },
  C: { label: 'Your Situation', emoji: '🎯' },
  D: { label: 'Your Future', emoji: '🌅' },
};

const serif = "var(--font-serif), 'Instrument Serif', serif";

type CardState = 'intro' | 'block-intro' | 'question' | 'loading';

export default function AssessPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<SessionAnswers>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardState, setCardState] = useState<CardState>('intro');
  const [pendingBlockId, setPendingBlockId] = useState<string | null>(null);
  const [animating, setAnimating] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const initialized = useRef(false);
  const sessionQuestions = useRef<Question[]>([]);

  if (sessionQuestions.current.length === 0) {
    sessionQuestions.current = pickQuestionsForSession(allBlocks);
  }
  const allQuestions = sessionQuestions.current;

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    setCardState('intro');
  }, []);

  const advance = (nextState: CardState, fn: () => void) => {
    setAnimating(true);
    setTimeout(() => {
      fn();
      setCardState(nextState);
      setAnimating(false);
      setSelectedOption(null);
    }, 280);
  };

  const getBlockForIndex = (idx: number) =>
    allBlocks.find((b) => b.questions.some((q) => q.id === allQuestions[idx]?.id))?.id ?? null;

  const handleStart = () => {
    const firstBlock = getBlockForIndex(0);
    advance('block-intro', () => setPendingBlockId(firstBlock));
  };

  const handleBlockContinue = () => {
    advance('question', () => {});
  };

  const handleAnswer = async (option: Option) => {
    if (animating) return;
    const q = allQuestions[currentIndex];
    setSelectedOption(option.label);

    const newAnswers = { ...answers, [q.id]: { label: option.label, traits: option.traits, value: option.value } };
    setAnswers(newAnswers);

    const newIndex = currentIndex + 1;

    if (newIndex >= allQuestions.length) {
      setAnimating(true);
      setTimeout(() => {
        setCardState('loading');
        setAnimating(false);
        setTimeout(() => {
          try {
            const bigFive = scoreBigFive(newAnswers);
            const riasec = scoreRIASEC(newAnswers);
            const lifestyle = extractLifestyle(newAnswers);
            const aspirations = scoreAspirations(newAnswers);
            const result = computeResults(bigFive, riasec, lifestyle, aspirations);
            sessionStorage.setItem('careerResults', JSON.stringify({ result, bigFive, riasec, lifestyle, aspirations }));
            trackEvent('assessment_completed');
            router.push('/results');
          } catch (err) {
            const detail = err instanceof Error ? err.message : 'Unknown error';
            setError(detail);
            setCardState('question');
          }
        }, 1200);
      }, 280);
      return;
    }

    const prevBlock = getBlockForIndex(currentIndex);
    const nextBlock = getBlockForIndex(newIndex);

    if (nextBlock && nextBlock !== prevBlock) {
      advance('block-intro', () => {
        setCurrentIndex(newIndex);
        setPendingBlockId(nextBlock);
      });
    } else {
      advance('question', () => setCurrentIndex(newIndex));
    }
  };

  const progress = Math.round((currentIndex / allQuestions.length) * 100);
  const currentQ = allQuestions[currentIndex];
  const blockId = cardState === 'block-intro' ? pendingBlockId : getBlockForIndex(currentIndex);
  const blockMeta = blockId ? BLOCK_LABELS[blockId] : null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bark)', display: 'flex', flexDirection: 'column' }}>

      {/* Progress bar */}
      {cardState !== 'intro' && cardState !== 'loading' && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 20, background: 'rgba(26,18,7,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,250,243,0.06)', padding: '0.875rem 1.25rem' }}>
          <div style={{ maxWidth: 480, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontFamily: serif, fontSize: '0.82rem', color: 'var(--amber)', letterSpacing: '0.04em' }}>CareerFind</span>
              <span style={{ fontSize: '0.72rem', color: 'rgba(255,250,243,0.35)', fontVariantNumeric: 'tabular-nums' }}>
                {currentIndex} / {allQuestions.length}
              </span>
            </div>
            <div style={{ height: 3, background: 'rgba(255,250,243,0.08)', borderRadius: 2 }}>
              <div style={{ height: '100%', width: `${progress}%`, background: 'var(--amber)', borderRadius: 2, transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)' }} />
            </div>
          </div>
        </div>
      )}

      {/* Card area */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: cardState !== 'intro' && cardState !== 'loading' ? '5rem 1.25rem 2rem' : '2rem 1.25rem' }}>
        <div
          style={{
            width: '100%', maxWidth: 480,
            opacity: animating ? 0 : 1,
            transform: animating ? 'translateY(16px) scale(0.98)' : 'translateY(0) scale(1)',
            transition: 'opacity 0.28s ease, transform 0.28s ease',
          }}
        >

          {/* Intro card */}
          {cardState === 'intro' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '1.75rem' }}>🧭</div>
              <h1 style={{ fontFamily: serif, fontSize: '2rem', color: 'var(--cream)', margin: '0 0 0.75rem', lineHeight: 1.2 }}>What career was<br />made for you?</h1>
              <p style={{ fontSize: '0.92rem', color: 'rgba(255,250,243,0.55)', lineHeight: 1.7, margin: '0 0 2.5rem', maxWidth: 320, marginLeft: 'auto', marginRight: 'auto' }}>
                Answer 20 questions honestly — we'll match your personality and interests to real careers.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                {['~8 min', '4 sections', 'No sign-up'].map((badge) => (
                  <span key={badge} style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', background: 'rgba(255,250,243,0.06)', border: '1px solid rgba(255,250,243,0.1)', borderRadius: 20, color: 'rgba(255,250,243,0.5)' }}>{badge}</span>
                ))}
              </div>
              <button onClick={handleStart} style={{ width: '100%', padding: '1rem', background: 'var(--amber)', color: 'var(--bark)', fontFamily: 'inherit', fontWeight: 700, fontSize: '1rem', border: 'none', borderRadius: 14, cursor: 'pointer', letterSpacing: '0.01em' }}>
                Start your career map →
              </button>
            </div>
          )}

          {/* Block intro card */}
          {cardState === 'block-intro' && blockMeta && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{blockMeta.emoji}</div>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 0.5rem' }}>
                Section {Object.keys(BLOCK_LABELS).indexOf(blockId!) + 1} of 4
              </p>
              <h2 style={{ fontFamily: serif, fontSize: '1.75rem', color: 'var(--cream)', margin: '0 0 0.875rem' }}>{blockMeta.label}</h2>
              {blockId === 'A' && (
                <div style={{ margin: '0 0 2.5rem' }}>
                  <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 0.5rem' }}>Checking: Personality</p>
                  <p style={{ fontSize: '0.88rem', color: 'rgba(255,250,243,0.6)', lineHeight: 1.75, margin: 0 }}>
                    These are real-life scenarios based on the Big Five — the most validated personality framework in psychology. Your instinctive reactions reveal how you handle pressure, people, and uncertainty. This is the foundation of career fit: how you naturally operate, not how you wish you did.
                  </p>
                </div>
              )}
              {blockId === 'B' && (
                <div style={{ margin: '0 0 2.5rem' }}>
                  <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 0.5rem' }}>Checking: Interests</p>
                  <p style={{ fontSize: '0.88rem', color: 'rgba(255,250,243,0.6)', lineHeight: 1.75, margin: 0 }}>
                    These questions map your RIASEC interest profile — the same framework used by career counsellors worldwide. Interests predict job satisfaction better than test scores do. We're not asking what you're good at. We're asking what actually pulls your attention when nothing is forcing you.
                  </p>
                </div>
              )}
              {blockId === 'C' && (
                <div style={{ margin: '0 0 2.5rem' }}>
                  <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 0.5rem' }}>Checking: Your Situation</p>
                  <p style={{ fontSize: '0.88rem', color: 'rgba(255,250,243,0.6)', lineHeight: 1.75, margin: 0 }}>
                    One quick practical question. Your college budget shapes which paths are actually accessible — we use it to filter out options that don't fit your reality, not to limit your ambitions. Being honest here makes your results more useful.
                  </p>
                </div>
              )}
              {blockId === 'D' && (
                <div style={{ margin: '0 0 2.5rem' }}>
                  <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 0.5rem' }}>Checking: Life Goals</p>
                  <p style={{ fontSize: '0.88rem', color: 'rgba(255,250,243,0.6)', lineHeight: 1.75, margin: 0 }}>
                    The same career can feel like a dream or a trap depending on what you want your life to look like. These questions measure your aspiration profile — wealth, impact, autonomy, stability, balance — so we can separate careers that match your ambitions from ones that technically fit your personality but would make you miserable.
                  </p>
                </div>
              )}
              <button onClick={handleBlockContinue} style={{ width: '100%', padding: '1rem', background: 'rgba(255,250,243,0.07)', color: 'var(--cream)', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.95rem', border: '1px solid rgba(255,250,243,0.12)', borderRadius: 14, cursor: 'pointer' }}>
                Let's go →
              </button>
            </div>
          )}

          {/* Question card */}
          {cardState === 'question' && currentQ && (
            <div>
              {blockMeta && (
                <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 1.25rem', opacity: 0.7 }}>
                  {blockMeta.emoji} {blockMeta.label}
                </p>
              )}
              <h2 style={{ fontFamily: serif, fontSize: '1.45rem', color: 'var(--cream)', lineHeight: 1.4, margin: '0 0 1.75rem' }}>
                {currentQ.text}
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {currentQ.options.map((opt, i) => {
                  const isSelected = selectedOption === opt.label;
                  return (
                    <button
                      key={i}
                      onClick={() => handleAnswer(opt)}
                      disabled={!!selectedOption}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        width: '100%', padding: '1rem 1.1rem',
                        background: isSelected ? 'var(--amber)' : 'rgba(255,250,243,0.05)',
                        border: `1.5px solid ${isSelected ? 'var(--amber)' : 'rgba(255,250,243,0.1)'}`,
                        borderRadius: 12, cursor: selectedOption ? 'default' : 'pointer',
                        textAlign: 'left', fontFamily: 'inherit',
                        color: isSelected ? 'var(--bark)' : 'rgba(255,250,243,0.85)',
                        fontSize: '0.9rem', lineHeight: 1.4, fontWeight: isSelected ? 600 : 400,
                        transition: 'all 0.18s ease',
                        transform: isSelected ? 'scale(1.01)' : 'scale(1)',
                      }}
                    >
                      {opt.emoji && <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>{opt.emoji}</span>}
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>

              {error && (
                <p style={{ fontSize: '0.8rem', color: '#f87171', marginTop: '1rem', textAlign: 'center' }}>{error}</p>
              )}
            </div>
          )}

          {/* Loading card */}
          {cardState === 'loading' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, border: '3px solid rgba(255,250,243,0.08)', borderTopColor: 'var(--amber)', borderRadius: '50%', animation: 'spin 0.9s linear infinite', margin: '0 auto 1.5rem' }} />
              <h2 style={{ fontFamily: serif, fontSize: '1.5rem', color: 'var(--cream)', margin: '0 0 0.5rem' }}>Building your career map…</h2>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,250,243,0.4)' }}>Analysing your personality and interests</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
