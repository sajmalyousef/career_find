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
      addMessage({
        id: 'done',
        role: 'aarav',
        content: "That's everything! Give me a moment — building your career map now. 🗺️",
      }, 800);
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
      addMessage({
        id: 'intro1',
        role: 'aarav',
        content: "Hey! I'm Aarav 👋 I'm going to help you figure out which careers actually match who you are.",
      });
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        addMessage({
          id: 'intro2',
          role: 'aarav',
          content: "This takes about 8 minutes. Answer honestly — the more real you are, the better your results. Ready?",
          options: [{ label: "Let's go! 🚀", traits: {}, value: 'ready' }],
          questionId: 'intro',
          type: 'choice',
        });
      }, 1000);
    }, 800);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleAnswer = async (option: Option, questionId: string) => {
    if (submitted) return;

    addMessage({ id: `ans-${questionId}`, role: 'user', content: option.label });

    if (questionId === 'intro') {
      showNextQuestion(0, undefined);
      return;
    }

    const newAnswers = {
      ...answers,
      [questionId]: { label: option.label, traits: option.traits, value: option.value },
    };
    setAnswers(newAnswers);

    const newIndex = currentIndex + 1;
    setCurrentIndex(newIndex);

    const prevQ = allQuestions[currentIndex];
    const prevBlock = allBlocks.find((b) => b.questions.some((qb) => qb.id === prevQ?.id))?.id;

    if (newIndex >= allQuestions.length) {
      setSubmitted(true);
      setIsTyping(true);
      addMessage({
        id: 'done',
        role: 'aarav',
        content: "That's everything! Building your career map now… 🗺️",
      }, 600);

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
          addMessage({
            id: 'error',
            role: 'aarav',
            content: `Something went wrong. ${detail}. Please refresh and try again.`,
          }, 0);
        }
      }, 1200);
    } else {
      showNextQuestion(newIndex, prevBlock);
    }
  };

  const progress = Math.round((currentIndex / allQuestions.length) * 100);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <header
        className="px-4 py-3 flex items-center gap-3 sticky top-0 z-10"
        style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
          style={{ background: 'var(--accent)', fontFamily: 'var(--font-syne), sans-serif' }}
        >
          A
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-syne), sans-serif' }}>Aarav</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Career Guide · CareerFind</p>
        </div>
        <div className="text-right">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{currentIndex}/{allQuestions.length}</p>
          <div className="w-20 h-1 rounded-full mt-1" style={{ background: 'var(--border)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: 'var(--accent)' }}
            />
          </div>
        </div>
      </header>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 max-w-2xl mx-auto w-full">
        <div className="space-y-4 pb-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} chat-bubble-enter`}>
              {msg.role === 'aarav' && (
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2 mt-1 flex-shrink-0"
                  style={{ background: 'var(--accent)' }}
                >
                  A
                </div>
              )}
              <div className={`max-w-[82%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
                <div
                  className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
                  style={msg.role === 'aarav'
                    ? { background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderTopLeftRadius: '4px' }
                    : { background: 'var(--accent)', color: '#fff', borderTopRightRadius: '4px' }
                  }
                >
                  {msg.content}
                </div>
                {msg.options && msg.questionId && (
                  (!answers[msg.questionId] && msg.questionId !== 'intro') ||
                  (msg.questionId === 'intro' && messages.filter(m => m.role === 'user').length === 0)
                ) ? (
                  <div className={`flex flex-wrap gap-2 mt-1 ${msg.role === 'aarav' ? 'ml-0' : 'justify-end'}`}>
                    {msg.type === 'image_choice'
                      ? msg.options.map((opt, i) => (
                          <button
                            key={i}
                            onClick={() => msg.questionId && handleAnswer(opt, msg.questionId)}
                            className="flex items-center gap-2 text-sm px-3 py-2.5 rounded-xl transition-all"
                            style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                          >
                            <span className="text-xl">{opt.emoji}</span>
                            <span>{opt.label}</span>
                          </button>
                        ))
                      : msg.options.map((opt, i) => (
                          <button
                            key={i}
                            onClick={() => msg.questionId && handleAnswer(opt, msg.questionId)}
                            className="text-sm px-4 py-2.5 rounded-xl transition-all text-left"
                            style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                          >
                            {opt.label}
                          </button>
                        ))
                    }
                  </div>
                ) : null}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 chat-bubble-enter">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ background: 'var(--accent)' }}
              >
                A
              </div>
              <div
                className="px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1.5 items-center"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <span className="typing-dot w-2 h-2 rounded-full" style={{ background: 'var(--text-muted)' }} />
                <span className="typing-dot w-2 h-2 rounded-full" style={{ background: 'var(--text-muted)' }} />
                <span className="typing-dot w-2 h-2 rounded-full" style={{ background: 'var(--text-muted)' }} />
              </div>
            </div>
          )}

          {loading && (
            <div className="text-center py-8">
              <div className="inline-flex flex-col items-center gap-3">
                <div className="w-12 h-12 border-4 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Analysing your profile…</p>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
}
