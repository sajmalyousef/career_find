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
  { icon: '🃏', title: 'Answer 20 cards', desc: 'One question at a time. Real-life scenarios — no right or wrong answers. Takes about 8 minutes.' },
  { icon: '🧠', title: 'Get your profile', desc: 'We map your personality (Big Five), interests (RIASEC), and life goals to real careers.' },
  { icon: '🎯', title: 'See your career map', desc: '3–4 matches with honest reasoning, plus careers that don\'t fit you — and exactly why.' },
];

const outcomes = [
  '3–4 career paths that actually fit your personality',
  "Honest reasons why certain popular careers aren't right for you",
  'Colleges matched to your top career — with fees and entrance exams',
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
            Science-backed · Instant results
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

      {/* ─── Science section ─── */}
      <section style={{ padding: 'clamp(4rem,8vw,6rem) 1.5rem', background: 'var(--cream)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <p className="section-label" style={{ marginBottom: '0.75rem' }}>The science behind it</p>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.75rem,3.5vw,2.5rem)', color: 'var(--bark)', marginBottom: '0.75rem', lineHeight: 1.15 }}>
            Not opinions. Frameworks used by psychologists.
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--warm-gray)', lineHeight: 1.7, maxWidth: 560, marginBottom: '3rem' }}>
            We don&apos;t ask you to describe yourself. We put you through scenarios and measure your response pattern — then match it against career requirements. The difference between a doctor asking &ldquo;do you feel sick?&rdquo; versus running a blood test.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>

            {/* Big Five */}
            <div style={{ background: 'var(--warm-white)', borderRadius: 12, padding: '1.75rem', borderTop: '2px solid var(--amber)' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--amber)', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Framework 1</p>
              <h3 style={{ fontFamily: serif, fontSize: '1.25rem', color: 'var(--bark)', marginBottom: '0.625rem' }}>Big Five Personality (OCEAN)</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--warm-gray)', lineHeight: 1.7, marginBottom: '1rem' }}>
                The most validated personality model in psychology. 40+ years of peer-reviewed research. Used by universities, military recruitment, and clinical psychology worldwide.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '0.375rem' }}>
                {['Openness', 'Conscientiousness', 'Extraversion', 'Agreeableness', 'Stability'].map(t => (
                  <span key={t} style={{ fontSize: '0.72rem', padding: '0.25rem 0.625rem', background: 'rgba(212,148,42,0.1)', color: 'var(--amber-dark)', borderRadius: 20, fontWeight: 600 }}>{t}</span>
                ))}
              </div>
            </div>

            {/* RIASEC */}
            <div style={{ background: 'var(--warm-white)', borderRadius: 12, padding: '1.75rem', borderTop: '2px solid var(--amber)' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--amber)', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Framework 2</p>
              <h3 style={{ fontFamily: serif, fontSize: '1.25rem', color: 'var(--bark)', marginBottom: '0.625rem' }}>RIASEC (Holland Codes)</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--warm-gray)', lineHeight: 1.7, marginBottom: '1rem' }}>
                Developed at Johns Hopkins. Used by the US Department of Labor&apos;s O*NET — the world&apos;s largest career classification database. Maps the work environments you&apos;re drawn to, not just job titles.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '0.375rem' }}>
                {['Realistic', 'Investigative', 'Artistic', 'Social', 'Enterprising', 'Conventional'].map(t => (
                  <span key={t} style={{ fontSize: '0.72rem', padding: '0.25rem 0.625rem', background: 'rgba(212,148,42,0.1)', color: 'var(--amber-dark)', borderRadius: 20, fontWeight: 600 }}>{t}</span>
                ))}
              </div>
            </div>

            {/* Aspirations */}
            <div style={{ background: 'var(--warm-white)', borderRadius: 12, padding: '1.75rem', borderTop: '2px solid var(--amber)' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--amber)', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Framework 3</p>
              <h3 style={{ fontFamily: serif, fontSize: '1.25rem', color: 'var(--bark)', marginBottom: '0.625rem' }}>Life Aspiration Profile</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--warm-gray)', lineHeight: 1.7, marginBottom: '1rem' }}>
                What do you want your life to actually look like? Wealth, impact, autonomy, stability, balance — we measure what you&apos;re optimising for and filter careers accordingly.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '0.375rem' }}>
                {['Wealth', 'Impact', 'Autonomy', 'Stability', 'Balance'].map(t => (
                  <span key={t} style={{ fontSize: '0.72rem', padding: '0.25rem 0.625rem', background: 'rgba(212,148,42,0.1)', color: 'var(--amber-dark)', borderRadius: 20, fontWeight: 600 }}>{t}</span>
                ))}
              </div>
            </div>
          </div>

          {/* vs Gemini callout */}
          <div style={{ background: 'var(--bark)', borderRadius: 12, padding: '1.5rem 2rem', display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.5rem', flexShrink: 0, marginTop: 2 }}>💡</span>
            <div>
              <p style={{ fontFamily: serif, fontSize: '1rem', color: 'var(--cream)', margin: '0 0 0.4rem' }}>Why not just ask ChatGPT or Gemini?</p>
              <p style={{ fontSize: '0.88rem', color: 'rgba(255,250,243,0.55)', lineHeight: 1.7, margin: 0 }}>
                AI chatbots respond to what you <em>say</em> about yourself — which means they amplify your existing assumptions. CareerFind doesn&apos;t ask you to describe yourself. It measures you across 20 scenario-based questions and matches the pattern to career requirements. That&apos;s the difference between asking &ldquo;do you think you&apos;re creative?&rdquo; and actually measuring it.
              </p>
            </div>
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
          Built for India&apos;s students
        </p>
      </footer>
    </main>
  );
}
