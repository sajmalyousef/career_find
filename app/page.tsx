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

const outcomes = [
  '3–4 career paths that actually fit your personality',
  "Honest reasons why certain popular careers aren't right for you",
  'Colleges matched to your top career — with fees and entrance exams',
  'Your Big Five personality profile explained in plain language',
];

export default function Home() {
  const serif = "var(--font-serif), 'Instrument Serif', serif";

  return (
    <main style={{ background: 'var(--cream)', color: 'var(--bark-light)' }}>

      {/* ─── Nav ─── */}
      <nav style={{ background: 'var(--bark)', padding: '1.25rem 1.5rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: serif, fontSize: '1.5rem', color: 'var(--cream)' }}>
            CareerFind
          </span>
          <Link
            href="/assess"
            style={{
              background: 'var(--amber)', color: 'var(--bark)', fontWeight: 700,
              fontSize: '0.85rem', padding: '0.5rem 1.25rem', borderRadius: 6,
              textDecoration: 'none',
            }}
          >
            Start for free
          </Link>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section style={{ background: 'var(--bark)', padding: 'clamp(5rem,12vw,9rem) 1.5rem clamp(4rem,8vw,7rem)' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <p className="section-label" style={{ marginBottom: '1.25rem' }}>Free · No sign-up · Built for Indian students</p>
          <h1 style={{
            fontFamily: serif, fontSize: 'clamp(3rem,7vw,5rem)',
            color: 'var(--cream)', lineHeight: 1.05, marginBottom: '1.5rem',
          }}>
            What career was<br /><em style={{ color: 'var(--amber-light)', fontStyle: 'italic' }}>made for you?</em>
          </h1>
          <p style={{ fontSize: 'clamp(1rem,2vw,1.2rem)', color: 'rgba(255,250,243,0.72)', lineHeight: 1.7, maxWidth: 500, marginBottom: '2.5rem' }}>
            Not what your relatives suggest. Not what's trending. Based on <strong style={{ color: 'var(--cream)', fontWeight: 600 }}>who you actually are</strong> — your personality, interests, and situation.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <Link
              href="/assess"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: 'var(--amber)', color: 'var(--bark)',
                fontWeight: 700, fontSize: '0.95rem',
                padding: '0.875rem 2rem', borderRadius: 8, textDecoration: 'none',
              }}
            >
              Start your 8-minute career map →
            </Link>
          </div>
          <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'rgba(255,250,243,0.4)' }}>
            Big Five + RIASEC framework · Instant results
          </p>
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section style={{ padding: 'clamp(4rem,8vw,6rem) 1.5rem', background: 'var(--cream)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <p className="section-label" style={{ marginBottom: '0.75rem' }}>How it works</p>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.75rem,3.5vw,2.5rem)', color: 'var(--bark)', marginBottom: '2.5rem', lineHeight: 1.15 }}>
            Three steps to your career map
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '2rem' }}>
            {steps.map((step, i) => (
              <div key={i} style={{ borderTop: '2px solid var(--amber)', paddingTop: '1.5rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{step.icon}</div>
                <h3 style={{ fontFamily: serif, fontSize: '1.2rem', color: 'var(--bark)', marginBottom: '0.5rem' }}>{step.title}</h3>
                <p style={{ fontSize: '0.92rem', color: 'var(--warm-gray)', lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Student stories ─── */}
      <section style={{ padding: 'clamp(4rem,8vw,6rem) 1.5rem', background: 'var(--cream-deep)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <p className="section-label" style={{ marginBottom: '0.75rem' }}>Real students, real results</p>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.75rem,3.5vw,2.5rem)', color: 'var(--bark)', marginBottom: '0.5rem', lineHeight: 1.15 }}>
            From tier 2 cities across India
          </h2>
          <p style={{ fontSize: '0.92rem', color: 'var(--warm-gray)', marginBottom: '2.5rem' }}>These are students who stopped guessing and started knowing.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '1.5rem' }}>
            {stories.map((s, i) => (
              <div key={i} style={{ background: 'var(--warm-white)', borderRadius: 12, padding: '1.5rem', borderTop: '2px solid var(--amber)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{s.emoji}</div>
                <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--bark)', marginBottom: '0.2rem' }}>{s.name}</p>
                <p style={{ fontSize: '0.78rem', color: 'var(--amber)', fontWeight: 600, marginBottom: '0.75rem' }}>{s.stream}</p>
                <p style={{ fontSize: '0.88rem', color: 'var(--warm-gray)', lineHeight: 1.65 }}>{s.story}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── What you get ─── */}
      <section style={{ background: 'var(--bark)', padding: 'clamp(4rem,8vw,6rem) 1.5rem' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <p className="section-label" style={{ color: 'var(--amber-light)', marginBottom: '0.75rem' }}>What you&apos;ll walk away with</p>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.75rem,3.5vw,2.5rem)', color: 'var(--cream)', marginBottom: '2rem', lineHeight: 1.15 }}>
            Clarity you can act on
          </h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, marginBottom: '2.5rem' }}>
            {outcomes.map((item, i) => (
              <li key={i} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', fontSize: '0.95rem', color: 'rgba(255,250,243,0.75)', lineHeight: 1.6 }}>
                <span style={{ color: 'var(--amber)', fontWeight: 700, flexShrink: 0, marginTop: 2 }}>✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/assess"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: 'var(--amber)', color: 'var(--bark)',
              fontWeight: 700, fontSize: '0.95rem',
              padding: '0.875rem 2rem', borderRadius: 8, textDecoration: 'none',
            }}
          >
            Find my career path →
          </Link>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer style={{ background: 'var(--bark)', borderTop: '1px solid rgba(255,250,243,0.06)', padding: '2rem 1.5rem', textAlign: 'center' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--bark-mid)' }}>
          Built for India&apos;s students · Big Five + RIASEC framework
        </p>
      </footer>
    </main>
  );
}
