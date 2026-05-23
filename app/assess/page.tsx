'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import questionsData from '@/data/questions.json';
import { scoreBigFive, scoreRIASEC, extractLifestyle } from '@/lib/scoring';
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

interface ChatMessage {
  id: string;
  role: 'aarav' | 'user';
  content: string;
  options?: Option[];
  questionId?: string;
  type?: string;
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

const BLOCK_INTROS: Record<string, string> = {
  A: "Let's start with some real-life scenarios. No right or wrong answers — just be honest.",
  B: "Now let's figure out what kind of work actually excites you.",
  C: "Quick practical stuff — helps me find colleges that suit your situation.",
  D: "Last section! Tell me what you want your life to actually look like.",
};

const serif = "var(--font-serif), 'Instrument Serif', serif";

export default function AssessPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<SessionAnswers>({});
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  const sessionQuestions = useRef<Question[]>([]);

  if (sessionQuestions.current.length === 0) {
    sessionQuestions.current = pickQuestionsForSession(allBlocks);
  }
  const allQuestions = sessionQuestions.current;

  const addMessage = (msg: ChatMessage, delay = 0) => {
    setTimeout(() => {
      setMessages((prev) => [...prev, { ...msg, id: `${msg.id}-${Date.now()}` }]);
      setIsTyping(false);
    }, delay);
  };

  const showNextQuestion = (index: number, prevBlock?: string) => {
    if (index >= allQuestions.length) {
      setIsTyping(true);
      addMessage({ id: 'done', role: 'aarav', content: "That's everything! Give me a moment — building your career map now. 🗺️" }, 800);
      return;
    }
    const q = allQuestions[index];
    const currentBlock = allBlocks.find((b) => b.questions.some((qb) => qb.id === q.id))?.id;
    if (currentBlock && currentBlock !== prevBlock) {
      const intro = BLOCK_INTROS[currentBlock];
      if (intro) {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          addMessage({ id: `block-${currentBlock}`, role: 'aarav', content: intro });
          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);
            addMessage({ id: q.id, role: 'aarav', content: q.text, options: q.options, questionId: q.id, type: q.type });
          }, 600);
        }, 800);
        return;
      }
    }
    setIsTyping(true);
    addMessage({ id: q.id, role: 'aarav', content: q.text, options: q.options, questionId: q.id, type: q.type }, 600);
  };

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMessage({ id: 'intro1', role: 'aarav', content: "Hey! I'm Aarav 👋 I'm going to help you figure out which careers actually match who you are." });
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        addMessage({
          id: 'intro2', role: 'aarav',
          content: "This takes about 8 minutes. Answer honestly — the more real you are, the better your results. Ready?",
          options: [{ label: "Let's go! 🚀", traits: {}, value: 'ready' }],
          questionId: 'intro', type: 'choice',
        });
      }, 1000);
    }, 800);
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

  const handleAnswer = async (option: Option, questionId: string) => {
    if (submitted) return;
    addMessage({ id: `ans-${questionId}`, role: 'user', content: option.label });
    if (questionId === 'intro') { showNextQuestion(0, undefined); return; }

    const newAnswers = { ...answers, [questionId]: { label: option.label, traits: option.traits, value: option.value } };
    setAnswers(newAnswers);
    const newIndex = currentIndex + 1;
    setCurrentIndex(newIndex);

    const prevQ = allQuestions[currentIndex];
    const prevBlock = allBlocks.find((b) => b.questions.some((qb) => qb.id === prevQ?.id))?.id;

    if (newIndex >= allQuestions.length) {
      setSubmitted(true);
      setIsTyping(true);
      addMessage({ id: 'done', role: 'aarav', content: "That's everything! Building your career map now… 🗺️" }, 600);
      setTimeout(() => {
        try {
          const bigFive = scoreBigFive(newAnswers);
          const riasec = scoreRIASEC(newAnswers);
          const lifestyle = extractLifestyle(newAnswers);
          const result = computeResults(bigFive, riasec, lifestyle);
          sessionStorage.setItem('careerResults', JSON.stringify({ result, bigFive, riasec, lifestyle }));
          router.push('/results');
        } catch (err) {
          setLoading(false);
          setIsTyping(false);
          const detail = err instanceof Error ? err.message : 'Unknown error';
          addMessage({ id: 'error', role: 'aarav', content: `Something went wrong. ${detail}. Please refresh and try again.` }, 0);
        }
      }, 1200);
    } else {
      showNextQuestion(newIndex, prevBlock);
    }
  };

  const progress = Math.round((currentIndex / allQuestions.length) * 100);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bark)' }}>

      {/* Header */}
      <header style={{ background: 'rgba(26,18,7,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,250,243,0.06)', padding: '0.875rem 1rem', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bark)', fontWeight: 700, fontSize: '0.85rem', fontFamily: serif, flexShrink: 0 }}>A</div>
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: serif, fontSize: '1rem', color: 'var(--cream)', margin: 0, lineHeight: 1 }}>Aarav</p>
            <p style={{ fontSize: '0.72rem', color: 'var(--warm-gray)', margin: 0, marginTop: 2 }}>Career Guide · CareerFind</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.72rem', color: 'var(--warm-gray)', margin: 0, marginBottom: 4 }}>{currentIndex}/{allQuestions.length}</p>
            <div style={{ width: 80, height: 3, background: 'rgba(255,250,243,0.1)', borderRadius: 2 }}>
              <div style={{ width: `${progress}%`, height: '100%', background: 'var(--amber)', borderRadius: 2, transition: 'width 0.5s ease' }} />
            </div>
          </div>
        </div>
      </header>

      {/* Chat */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1rem' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '1rem' }}>
            {messages.map((msg) => (
              <div key={msg.id} className="chat-bubble-enter" style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                {msg.role === 'aarav' && (
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bark)', fontSize: '0.75rem', fontWeight: 700, marginRight: '0.5rem', marginTop: 4, flexShrink: 0 }}>A</div>
                )}
                <div style={{ maxWidth: '82%', display: 'flex', flexDirection: 'column', gap: 8, alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    padding: '0.75rem 1rem', borderRadius: msg.role === 'aarav' ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                    fontSize: '0.9rem', lineHeight: 1.6,
                    background: msg.role === 'aarav' ? 'rgba(255,250,243,0.06)' : 'var(--amber)',
                    color: msg.role === 'aarav' ? 'rgba(255,250,243,0.88)' : 'var(--bark)',
                    border: msg.role === 'aarav' ? '1px solid rgba(255,250,243,0.08)' : 'none',
                    fontWeight: msg.role === 'user' ? 600 : 400,
                  }}>
                    {msg.content}
                  </div>

                  {msg.options && msg.questionId && (
                    ((!answers[msg.questionId] && msg.questionId !== 'intro') ||
                    (msg.questionId === 'intro' && messages.filter(m => m.role === 'user').length === 0))
                  ) && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: 4 }}>
                      {msg.type === 'image_choice'
                        ? msg.options.map((opt, i) => (
                            <button key={i} onClick={() => msg.questionId && handleAnswer(opt, msg.questionId)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,250,243,0.05)', border: '1px solid rgba(255,250,243,0.1)', color: 'rgba(255,250,243,0.82)', fontSize: '0.85rem', padding: '0.6rem 0.875rem', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit' }}>
                              <span style={{ fontSize: '1.2rem' }}>{opt.emoji}</span>
                              <span>{opt.label}</span>
                            </button>
                          ))
                        : msg.options.map((opt, i) => (
                            <button key={i} onClick={() => msg.questionId && handleAnswer(opt, msg.questionId)} style={{ background: 'rgba(255,250,243,0.05)', border: '1px solid rgba(255,250,243,0.1)', color: 'rgba(255,250,243,0.82)', fontSize: '0.85rem', padding: '0.6rem 0.875rem', borderRadius: 10, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', lineHeight: 1.4 }}>
                              {opt.label}
                            </button>
                          ))
                      }
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="chat-bubble-enter" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bark)', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>A</div>
                <div style={{ background: 'rgba(255,250,243,0.06)', border: '1px solid rgba(255,250,243,0.08)', borderRadius: '4px 16px 16px 16px', padding: '0.75rem 1rem', display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span className="typing-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--warm-gray)', display: 'inline-block' }} />
                  <span className="typing-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--warm-gray)', display: 'inline-block' }} />
                  <span className="typing-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--warm-gray)', display: 'inline-block' }} />
                </div>
              </div>
            )}

            {loading && (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{ width: 40, height: 40, border: '3px solid rgba(255,250,243,0.1)', borderTopColor: 'var(--amber)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 0.75rem' }} />
                <p style={{ fontSize: '0.85rem', color: 'var(--warm-gray)' }}>Analysing your profile…</p>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
