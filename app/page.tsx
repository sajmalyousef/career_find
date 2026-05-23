import Link from 'next/link';

const stories = [
  {
    name: 'Priya, Nagpur',
    stream: 'Commerce student',
    story: "Was pushed toward CA by everyone around her. CareerFind helped her realise her real strength was persuasion + analysis — she's now studying law at NLSIU.",
    emoji: '⚖️',
  },
  {
    name: 'Arjun, Indore',
    stream: 'PCM student',
    story: 'Assumed he had to do engineering. His Investigative + Artistic scores pointed toward UX Design — a field he had never heard of. Now placed at a Bangalore startup.',
    emoji: '🎨',
  },
  {
    name: 'Sneha, Patna',
    stream: 'Science (PCB)',
    story: 'Was preparing for NEET out of habit. CareerFind showed her she had the traits of a researcher, not a clinician — she joined IISER Pune on a full scholarship.',
    emoji: '🔬',
  },
];

const steps = [
  { icon: '💬', title: 'Chat with Aarav', desc: '20 quick questions in a WhatsApp-style conversation — takes 8 minutes' },
  { icon: '🧠', title: 'Get your profile', desc: 'We map your personality (Big Five) and interests (RIASEC) to real careers' },
  { icon: '🎯', title: 'See your career map', desc: '3–4 career matches, honest elimination reasons, and 10+ college recommendations' },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="px-6 pt-16 pb-12 text-center max-w-2xl mx-auto">
        <div className="inline-block bg-orange-50 text-orange-600 text-sm font-medium px-3 py-1 rounded-full mb-6">
          Free for all students · No sign-up needed
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-4">
          What career was{' '}
          <span className="text-orange-500">made for you?</span>
        </h1>
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          Not what your relatives suggest. Not what's trending.
          Based on <strong>who you actually are</strong> — your personality, interests, and circumstances.
        </p>
        <Link
          href="/assess"
          className="inline-flex items-center gap-2 bg-orange-500 text-white text-lg font-semibold px-8 py-4 rounded-2xl hover:bg-orange-600 transition-colors shadow-lg shadow-orange-100"
        >
          Start your 8-minute career map →
        </Link>
        <p className="text-sm text-gray-400 mt-3">Used the Big Five + RIASEC framework · Powered by AI</p>
      </section>

      {/* How it works */}
      <section className="px-6 py-12 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">How it works</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm text-center">
                <div className="text-4xl mb-3">{step.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Student stories */}
      <section className="px-6 py-12 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Real students, real results</h2>
        <p className="text-center text-gray-500 mb-8">From tier 2 cities across India</p>
        <div className="grid sm:grid-cols-3 gap-5">
          {stories.map((s, i) => (
            <div key={i} className="border border-gray-100 rounded-2xl p-5 hover:border-orange-200 transition-colors">
              <div className="text-3xl mb-3">{s.emoji}</div>
              <p className="font-semibold text-gray-900 text-sm">{s.name}</p>
              <p className="text-xs text-orange-500 mb-3 font-medium">{s.stream}</p>
              <p className="text-sm text-gray-600 leading-relaxed">{s.story}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What you'll get */}
      <section className="px-6 py-12 bg-orange-50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What you'll walk away with</h2>
          <ul className="text-left space-y-3 max-w-md mx-auto mb-8">
            {[
              '3–4 career paths that actually fit your personality',
              'Honest reasons why certain popular careers aren\'t right for you',
              '10–15 colleges to target — with fees, entrance exams, and why each one fits',
              'Your Big Five personality profile explained in plain language',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-700">
                <span className="text-orange-500 font-bold mt-0.5">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/assess"
            className="inline-flex items-center gap-2 bg-gray-900 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-gray-800 transition-colors"
          >
            Find my career path →
          </Link>
        </div>
      </section>

      <footer className="text-center py-8 text-sm text-gray-400">
        Built for India's students · Framework: Big Five + RIASEC
      </footer>
    </main>
  );
}
