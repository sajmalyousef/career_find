'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import questionsData from '@/data/questions.json';

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
const allQuestions: Question[] = allBlocks.flatMap((b) => b.questions);

const BLOCK_INTROS: Record<string, string> = {
  A: "Let's start with some fun scenarios. I want to see how you think — there are no right or wrong answers here.",
  B: "Now let's talk about what actually excites you. What kind of work gets you going?",
  C: "Quick practical stuff — this helps me find colleges that actually work for your situation.",
  D: "Last section! Tell me what you want your life to look like.",
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

  const addMessage = (msg: ChatMessage, delay = 0) => {
    setTimeout(() => {
      setMessages((prev) => [...prev, { ...msg, id: `${msg.id}-${Date.now()}` }]);
      setIsTyping(false);
    }, delay);
  };

  const showNextQuestion = (index: number, prevBlock?: string) => {
    if (index >= allQuestions.length) {
      // done
      setIsTyping(true);
      addMessage({
        id: 'done',
        role: 'aarav',
        content: "That's everything! Give me a moment — I'm building your career map now. 🗺️",
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

  // Initial greeting
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
      const prevBlock = undefined;
      showNextQuestion(0, prevBlock);
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
    const nextQ = allQuestions[newIndex];
    const nextBlock = nextQ ? allBlocks.find((b) => b.questions.some((qb) => qb.id === nextQ.id))?.id : undefined;

    if (newIndex >= allQuestions.length) {
      // submit
      setSubmitted(true);
      setIsTyping(true);
      addMessage({
        id: 'done',
        role: 'aarav',
        content: "That's everything! Give me a moment — I'm building your career map now. 🗺️",
      }, 600);

      setTimeout(async () => {
        setLoading(true);
        try {
          const res = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ answers: newAnswers }),
          });
          const data = await res.json();
          sessionStorage.setItem('careerResults', JSON.stringify(data));
          router.push('/results');
        } catch {
          setLoading(false);
          setIsTyping(false);
          addMessage({
            id: 'error',
            role: 'aarav',
            content: "Hmm, something went wrong. Please refresh and try again.",
          }, 0);
        }
      }, 1500);
    } else {
      showNextQuestion(newIndex, prevBlock);
    }
  };

  const progress = Math.round((currentIndex / allQuestions.length) * 100);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm">A</div>
        <div className="flex-1">
          <p className="font-semibold text-gray-900 text-sm">Aarav</p>
          <p className="text-xs text-gray-400">Career Guide · CareerFind</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">{currentIndex}/{allQuestions.length} questions</p>
          <div className="w-24 h-1.5 bg-gray-100 rounded-full mt-1">
            <div
              className="h-full bg-orange-400 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
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
                <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold mr-2 mt-1 flex-shrink-0">A</div>
              )}
              <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'aarav'
                    ? 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-sm'
                    : 'bg-orange-500 text-white rounded-tr-sm'
                }`}>
                  {msg.content}
                </div>
                {msg.options && msg.questionId && ((!answers[msg.questionId] && msg.questionId !== 'intro') || (msg.questionId === 'intro' && messages.filter(m => m.role === 'user').length === 0)) ? (
                  <div className={`flex flex-wrap gap-2 mt-1 ${msg.role === 'aarav' ? 'ml-0' : 'justify-end'}`}>
                    {msg.type === 'image_choice'
                      ? msg.options.map((opt, i) => (
                          <button
                            key={i}
                            onClick={() => msg.questionId && handleAnswer(opt, msg.questionId)}
                            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 text-sm px-3 py-2.5 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-all shadow-sm"
                          >
                            <span className="text-xl">{opt.emoji}</span>
                            <span>{opt.label}</span>
                          </button>
                        ))
                      : msg.options.map((opt, i) => (
                          <button
                            key={i}
                            onClick={() => msg.questionId && handleAnswer(opt, msg.questionId)}
                            className="bg-white border border-gray-200 text-gray-700 text-sm px-4 py-2.5 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-all shadow-sm text-left"
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
              <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">A</div>
              <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 flex gap-1.5 items-center">
                <span className="typing-dot w-2 h-2 bg-gray-400 rounded-full" />
                <span className="typing-dot w-2 h-2 bg-gray-400 rounded-full" />
                <span className="typing-dot w-2 h-2 bg-gray-400 rounded-full" />
              </div>
            </div>
          )}

          {loading && (
            <div className="text-center py-8">
              <div className="inline-flex flex-col items-center gap-3">
                <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
                <p className="text-sm text-gray-500">Analysing your profile with AI...</p>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
}
