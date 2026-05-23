import Link from 'next/link';

const stories = [
  {
    name: 'Priya, Nagpur',
    stream: 'Commerce student',
    story: "Everyone pushed her toward CA. CareerFind showed her real strength was persuasion + analysis — she's now studying law at NLSIU.",
    emoji: '⚖️',
  },
  {
    name: 'Arjun, Indore',
    stream: 'PCM student',
    story: 'Assumed he had to do engineering. His Investigative + Artistic scores pointed toward UX Design. Now placed at a Bangalore startup.',
    emoji: '🎨',
  },
  {
    name: 'Sneha, Patna',
    stream: 'Science (PCB)',
    story: 'Was prepping for NEET out of habit. CareerFind showed she had researcher traits, not clinician traits — joined IISER Pune on scholarship.',
    emoji: '🔬',
  },
];

const steps = [
  { icon: '💬', title: 'Chat with Aarav', desc: '20 questions in a WhatsApp-style conversation. Takes about 8 minutes.' },
  { icon: '🧠', title: 'Get your profile', desc: 'We map your personality (Big Five) and interests (RIASEC) to real careers.' },
  { icon: '🎯', title: 'See your career map', desc: '3–4 matches, honest elimination reasons, and targeted college recommendations.' },
];

export default function Home() {
  return (
    <main className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Nav */}
      <nav className="px-6 py-4 flex items-center justify-between max-w-5xl mx-auto">
        <span className="font-display text-lg font-bold" style={{ color: 'var(--accent)', fontFamily: 'var(--font-syne), sans-serif' }}>
          CareerFind
        </span>
        <Link
          href="/assess"
          className="text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
        >
          Take the test →
        </Link>
      </nav>

      {/* Hero */}
      <section className="px-6 pt-12 pb-16 text-center max-w-2xl mx-auto">
        <div
          className="inline-block text-sm font-medium px-3 py-1 rounded-full mb-8"
          style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}
        >
          Free · No sign-up · Built for Indian students
        </div>
        <h1
          className="text-4xl sm:text-5xl font-bold leading-tight mb-5"
          style={{ fontFamily: 'var(--font-syne), sans-serif', color: 'var(--text-primary)' }}
        >
          What career was{' '}
          <span style={{ color: 'var(--accent)' }}>made for you?</span>
        </h1>
        <p className="text-lg leading-relaxed mb-10 max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
          Not what your relatives suggest. Not what&apos;s trending.
          Based on <strong style={{ color: 'var(--text-primary)' }}>who you actually are</strong> — your personality, interests, and situation.
        </p>
        <Link
          href="/assess"
          className="inline-flex items-center gap-2 text-white text-base font-semibold px-8 py-4 rounded-2xl transition-colors"
          style={{ background: 'var(--accent)' }}
        >
          Start your 8-minute career map →
        </Link>
        <p className="text-sm mt-4" style={{ color: 'var(--text-muted)' }}>
          Big Five + RIASEC framework · Instant results
        </p>
      </section>

      {/* How it works */}
      <section className="px-6 py-12" style={{ background: 'var(--bg-card)' }}>
        <div className="max-w-3xl mx-auto">
          <h2
            className="text-2xl font-bold text-center mb-8"
            style={{ fontFamily: 'var(--font-syne), sans-serif', color: 'var(--text-primary)' }}
          >
            How it works
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {steps.map((step, i) => (
              <div
                key={i}
                className="rounded-2xl p-5 text-center"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
              >
                <div className="text-3xl mb-3">{step.icon}</div>
                <h3
                  className="font-semibold mb-2 text-sm"
                  style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-syne), sans-serif' }}
                >
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Student stories */}
      <section className="px-6 py-12 max-w-3xl mx-auto">
        <h2
          className="text-2xl font-bold text-center mb-2"
          style={{ fontFamily: 'var(--font-syne), sans-serif', color: 'var(--text-primary)' }}
        >
          Real students, real results
        </h2>
        <p className="text-center mb-8 text-sm" style={{ color: 'var(--text-secondary)' }}>
          From tier 2 cities across India
        </p>
        <div className="grid sm:grid-cols-3 gap-4">
          {stories.map((s, i) => (
            <div
              key={i}
              className="rounded-2xl p-5"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <div className="text-3xl mb-3">{s.emoji}</div>
              <p className="font-semibold text-sm mb-0.5" style={{ color: 'var(--text-primary)' }}>{s.name}</p>
              <p className="text-xs font-medium mb-3" style={{ color: 'var(--accent)' }}>{s.stream}</p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{s.story}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What you get */}
      <section className="px-6 py-12" style={{ background: 'var(--bg-card)' }}>
        <div className="max-w-xl mx-auto text-center">
          <h2
            className="text-2xl font-bold mb-6"
            style={{ fontFamily: 'var(--font-syne), sans-serif', color: 'var(--text-primary)' }}
          >
            What you&apos;ll walk away with
          </h2>
          <ul className="text-left space-y-3 mb-8">
            {[
              '3–4 career paths that actually fit your personality',
              "Honest reasons why certain popular careers aren't right for you",
              'Colleges to target — matched to your career, with fees and entrance exams',
              'Your Big Five personality profile explained in plain language',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <span className="font-bold mt-0.5" style={{ color: 'var(--accent)' }}>✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/assess"
            className="inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-2xl transition-colors"
            style={{ background: 'var(--accent)' }}
          >
            Find my career path →
          </Link>
        </div>
      </section>

      <footer className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>
        Built for India&apos;s students · Big Five + RIASEC framework
      </footer>
    </main>
  );
}
