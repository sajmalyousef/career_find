import {
  Document, Page, Text, View, StyleSheet,
} from '@react-pdf/renderer';

const AMBER    = '#c4821e';
const BARK     = '#1a1207';
const BARK_MID = '#5c4a2a';
const CREAM    = '#fffaf3';
const GRAY     = '#8b7d6b';
const LIGHT    = '#f0e8d8';
const GREEN    = '#3d8c60';
const RED      = '#c0444a';

const s = StyleSheet.create({
  page: { backgroundColor: CREAM, paddingHorizontal: 44, paddingVertical: 44, fontFamily: 'Helvetica', color: BARK },
  accentBar: { height: 5, backgroundColor: AMBER, marginBottom: 40 },
  eyebrow: { fontSize: 8, color: AMBER, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 },
  h1: { fontSize: 32, fontFamily: 'Helvetica-Bold', color: BARK, lineHeight: 1.15, marginBottom: 10 },
  subtitle: { fontSize: 11, color: BARK_MID, lineHeight: 1.65, maxWidth: 360, marginBottom: 36 },
  coverMeta: { fontSize: 8, color: GRAY, marginTop: 'auto' },
  coverLine: { height: 1, backgroundColor: LIGHT, marginBottom: 8, marginTop: 8 },
  pageTitle: { fontSize: 19, fontFamily: 'Helvetica-Bold', color: BARK, marginBottom: 5 },
  titleBar: { height: 3, width: 36, backgroundColor: AMBER, marginBottom: 18 },
  sectionEye: { fontSize: 8, color: AMBER, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 5 },
  traitRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  traitLabel: { fontSize: 9.5, color: BARK_MID, width: 136 },
  barBg: { flex: 1, height: 7, backgroundColor: LIGHT, borderRadius: 4 },
  barFill: { height: 7, backgroundColor: AMBER, borderRadius: 4 },
  barScore: { fontSize: 8.5, color: GRAY, width: 28, textAlign: 'right' },
  divider: { height: 1, backgroundColor: LIGHT, marginVertical: 14 },
  card: { backgroundColor: '#fff', borderRadius: 6, padding: 15, marginBottom: 13, borderLeftWidth: 3, borderLeftColor: AMBER },
  cardAlt: { backgroundColor: '#fff', borderRadius: 6, padding: 15, marginBottom: 13, borderLeftWidth: 3, borderLeftColor: LIGHT },
  cardTag: { fontSize: 8, color: AMBER, fontFamily: 'Helvetica-Bold', marginBottom: 3 },
  cardTitle: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: BARK, marginBottom: 5 },
  cardBody: { fontSize: 9, color: GRAY, lineHeight: 1.55, marginBottom: 9 },
  fitLabel: { fontSize: 7.5, color: AMBER, fontFamily: 'Helvetica-Bold', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 5 },
  fitRow: { flexDirection: 'row', marginBottom: 3, alignItems: 'flex-start' },
  fitBullet: { fontSize: 8.5, color: AMBER, marginRight: 5 },
  fitText: { fontSize: 8.5, color: BARK_MID, lineHeight: 1.55, flex: 1 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 7 },
  chip: { backgroundColor: LIGHT, borderRadius: 10, paddingHorizontal: 7, paddingVertical: 3, marginRight: 5, marginBottom: 4 },
  chipText: { fontSize: 7.5, color: BARK_MID },
  riskRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  riskLabel: { fontSize: 7.5, color: GRAY, marginRight: 5 },
  riskBadge: { borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  riskText: { fontSize: 7.5, fontFamily: 'Helvetica-Bold' },
  aiNote: { fontSize: 8, color: GRAY, fontStyle: 'italic', lineHeight: 1.5, marginTop: 5 },
  elimCard: { backgroundColor: '#fff', borderRadius: 6, padding: 13, marginBottom: 11, borderLeftWidth: 3, borderLeftColor: '#ddd' },
  elimName: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: BARK_MID, marginBottom: 5 },
  elimLbl: { fontSize: 7.5, color: RED, fontFamily: 'Helvetica-Bold', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  elimText: { fontSize: 8.5, color: GRAY, lineHeight: 1.6 },
  darkBox: { backgroundColor: BARK, borderRadius: 7, padding: 18, marginBottom: 14 },
  darkTitle: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: CREAM, marginBottom: 8 },
  darkRow: { flexDirection: 'row', marginBottom: 6, alignItems: 'flex-start' },
  darkBullet: { fontSize: 9, color: AMBER, marginRight: 7 },
  darkText: { fontSize: 8.5, color: '#e8d8c0', lineHeight: 1.6, flex: 1 },
  lightBox: { backgroundColor: LIGHT, borderRadius: 7, padding: 15 },
  lightTitle: { fontSize: 10.5, fontFamily: 'Helvetica-Bold', color: BARK, marginBottom: 10 },
  stepRow: { flexDirection: 'row', marginBottom: 7, alignItems: 'flex-start' },
  stepNum: { fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: AMBER, width: 16 },
  stepText: { fontSize: 8.5, color: BARK_MID, lineHeight: 1.6, flex: 1 },
  footer: { position: 'absolute', bottom: 22, left: 44, right: 44, flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { fontSize: 7.5, color: GRAY },
  riasecRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  riasecChip: { backgroundColor: LIGHT, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, marginRight: 6, marginBottom: 6 },
  riasecText: { fontSize: 8.5, color: AMBER, fontFamily: 'Helvetica-Bold' },
});

const BIG5: Record<string, string> = { E: 'Extraversion', A: 'Agreeableness', C: 'Conscientiousness', N: 'Emotional Stability', O: 'Openness' };
const RIASEC_FULL: Record<string, string> = {
  R: 'Realistic — hands-on doer', I: 'Investigative — thinker & researcher',
  Ar: 'Artistic — creative & expressive', S: 'Social — helper & communicator',
  En: 'Enterprising — leader & persuader', Cv: 'Conventional — organiser & planner',
};

function pct(score: number) { return `${Math.min(100, Math.max(4, Math.round(((score + 10) / 20) * 100)))}%`; }
function riskColors(r: string) {
  if (r === 'low')  return { bg: '#e6f4ec', color: GREEN };
  if (r === 'high') return { bg: '#fce8e8', color: RED };
  return { bg: '#fef3e0', color: AMBER };
}

function Footer({ label }: { label: string }) {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerText}>CareerFind — Confidential Career Report</Text>
      <Text style={s.footerText}>{label}</Text>
    </View>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function CareerReportDoc({ result, bigFive, riasec }: { result: any; bigFive: any; riasec: any }) {
  const date = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const topRIASEC: string[] = result.topRIASEC ?? [];
  const careers = result.careers ?? [];
  const eliminated = result.eliminated ?? [];
  const highlights: string[] = result.personalityHighlights ?? [];

  return (
    <Document title="CareerFind Career Report" author="CareerFind">

      {/* ── Page 1: Cover ── */}
      <Page size="A4" style={s.page}>
        <View style={s.accentBar} />
        <Text style={s.eyebrow}>CareerFind · Personal Report</Text>
        <Text style={s.h1}>{'Your\nCareer Map'}</Text>
        <Text style={s.subtitle}>
          A personalised analysis based on your personality traits, interests, and circumstances —
          built for Indian school students.
        </Text>
        <View style={{ marginBottom: 28 }}>
          {['Personality & Interest Profile — What your scores reveal',
            'Career Matches — Your top fits with detailed reasoning',
            'Eliminated Careers — Why certain paths don\'t suit you',
            'Action Plan — What to do next'].map((item, i) => (
            <View key={i} style={{ flexDirection: 'row', marginBottom: 9, alignItems: 'flex-start' }}>
              <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: AMBER, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                <Text style={{ fontSize: 8, color: '#fff', fontFamily: 'Helvetica-Bold' }}>{i + 1}</Text>
              </View>
              <Text style={{ fontSize: 9.5, color: BARK_MID, lineHeight: 1.5, flex: 1 }}>{item}</Text>
            </View>
          ))}
        </View>
        <View style={s.coverLine} />
        <Text style={s.coverMeta}>Generated {date} · Science-backed · Built for India's students</Text>
      </Page>

      {/* ── Page 2: Profile ── */}
      <Page size="A4" style={s.page}>
        <Text style={s.sectionEye}>Section 1</Text>
        <Text style={s.pageTitle}>Your Personality & Interest Profile</Text>
        <View style={s.titleBar} />

        <Text style={{ fontSize: 10.5, fontFamily: 'Helvetica-Bold', color: BARK, marginBottom: 10 }}>Big Five Personality Scores</Text>
        <Text style={{ fontSize: 8.5, color: GRAY, lineHeight: 1.6, marginBottom: 13 }}>
          Scores reflect how your answers map across five personality dimensions used to match careers to your natural style.
        </Text>
        {Object.entries(bigFive as Record<string, number>).map(([k, v]) => (
          <View key={k} style={s.traitRow}>
            <Text style={s.traitLabel}>{BIG5[k] ?? k}</Text>
            <View style={s.barBg}><View style={[s.barFill, { width: pct(v) }]} /></View>
            <Text style={s.barScore}>{v > 0 ? `+${v}` : v}</Text>
          </View>
        ))}

        <View style={s.divider} />

        <Text style={{ fontSize: 10.5, fontFamily: 'Helvetica-Bold', color: BARK, marginBottom: 10 }}>RIASEC Interest Profile</Text>
        {Object.entries(riasec as Record<string, number>).sort(([,a],[,b]) => b-a).map(([code, score]) => (
          <View key={code} style={s.traitRow}>
            <Text style={[s.traitLabel, { fontFamily: topRIASEC.includes(code) ? 'Helvetica-Bold' : 'Helvetica', color: topRIASEC.includes(code) ? BARK : GRAY }]}>
              {RIASEC_FULL[code]?.split('—')[0].trim() ?? code}
            </Text>
            <View style={s.barBg}>
              <View style={[s.barFill, { width: `${Math.min(100, Math.max(4, (score as number) * 14))}%`, backgroundColor: topRIASEC.includes(code) ? AMBER : '#d4b896' }]} />
            </View>
            <Text style={s.barScore}>{score}</Text>
          </View>
        ))}

        <View style={s.riasecRow}>
          {topRIASEC.map(code => (
            <View key={code} style={s.riasecChip}>
              <Text style={s.riasecText}>★ {RIASEC_FULL[code] ?? code}</Text>
            </View>
          ))}
        </View>

        {highlights.length > 0 && (
          <>
            <View style={s.divider} />
            <Text style={{ fontSize: 10.5, fontFamily: 'Helvetica-Bold', color: BARK, marginBottom: 10 }}>Your Standout Traits</Text>
            {highlights.map((h: string, i: number) => (
              <View key={i} style={{ flexDirection: 'row', marginBottom: 6 }}>
                <Text style={{ fontSize: 8.5, color: AMBER, marginRight: 6 }}>✦</Text>
                <Text style={{ fontSize: 8.5, color: BARK_MID, lineHeight: 1.55, flex: 1 }}>{h}</Text>
              </View>
            ))}
          </>
        )}
        <Footer label="Page 2 of 5" />
      </Page>

      {/* ── Pages 3–4: Career Matches ── */}
      <Page size="A4" style={s.page}>
        <Text style={s.sectionEye}>Section 2</Text>
        <Text style={s.pageTitle}>Your Career Matches</Text>
        <View style={s.titleBar} />
        <Text style={{ fontSize: 8.5, color: GRAY, lineHeight: 1.6, marginBottom: 15 }}>
          These careers were selected because your personality traits and interest scores align with what
          these roles require day-to-day. The starred match is your strongest overall fit.
        </Text>
        {careers.slice(0, 2).map((cr: any, i: number) => {
          const rc = riskColors(cr.aiRisk);
          return (
            <View key={cr.id} style={i === 0 ? s.card : s.cardAlt}>
              <Text style={s.cardTag}>{i === 0 ? '★ Top Match' : `Match #${i + 1}`}</Text>
              <Text style={s.cardTitle}>{cr.name}</Text>
              <Text style={s.cardBody}>{cr.dayInLife}</Text>
              <Text style={s.fitLabel}>Why this fits you</Text>
              <Text style={{ fontSize: 8.5, color: BARK_MID, lineHeight: 1.6, marginBottom: 8 }}>{cr.whyFit}</Text>
              <View style={s.riskRow}>
                <Text style={s.riskLabel}>AI disruption risk:</Text>
                <View style={[s.riskBadge, { backgroundColor: rc.bg }]}>
                  <Text style={[s.riskText, { color: rc.color }]}>{cr.aiRisk?.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={s.aiNote}>{cr.aiNote}</Text>
              {cr.exams?.length > 0 && (
                <View style={s.chips}>
                  {cr.exams.map((e: string, j: number) => (
                    <View key={j} style={s.chip}><Text style={s.chipText}>{e}</Text></View>
                  ))}
                </View>
              )}
            </View>
          );
        })}
        <Footer label="Page 3 of 5" />
      </Page>

      {careers.length > 2 && (
        <Page size="A4" style={s.page}>
          <Text style={s.sectionEye}>Section 2 (continued)</Text>
          <Text style={s.pageTitle}>Your Career Matches</Text>
          <View style={s.titleBar} />
          {careers.slice(2).map((cr: any, i: number) => {
            const rc = riskColors(cr.aiRisk);
            return (
              <View key={cr.id} style={s.cardAlt}>
                <Text style={s.cardTag}>{`Match #${i + 3}`}</Text>
                <Text style={s.cardTitle}>{cr.name}</Text>
                <Text style={s.cardBody}>{cr.dayInLife}</Text>
                <Text style={s.fitLabel}>Why this fits you</Text>
                <Text style={{ fontSize: 8.5, color: BARK_MID, lineHeight: 1.6, marginBottom: 8 }}>{cr.whyFit}</Text>
                <View style={s.riskRow}>
                  <Text style={s.riskLabel}>AI disruption risk:</Text>
                  <View style={[s.riskBadge, { backgroundColor: rc.bg }]}>
                    <Text style={[s.riskText, { color: rc.color }]}>{cr.aiRisk?.toUpperCase()}</Text>
                  </View>
                </View>
                <Text style={s.aiNote}>{cr.aiNote}</Text>
                {cr.exams?.length > 0 && (
                  <View style={s.chips}>
                    {cr.exams.map((e: string, j: number) => (
                      <View key={j} style={s.chip}><Text style={s.chipText}>{e}</Text></View>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
          <Footer label="Page 4 of 5" />
        </Page>
      )}

      {/* ── Page 5: Eliminations + Action Plan ── */}
      <Page size="A4" style={s.page}>
        <Text style={s.sectionEye}>Section 3</Text>
        <Text style={s.pageTitle}>Eliminated Careers & Next Steps</Text>
        <View style={s.titleBar} />
        <Text style={{ fontSize: 8.5, color: GRAY, lineHeight: 1.6, marginBottom: 13 }}>
          Understanding why certain paths don't fit is just as valuable as knowing what does.
        </Text>

        {eliminated.map((el: any, i: number) => (
          <View key={i} style={s.elimCard}>
            <Text style={s.elimName}>{el.career}</Text>
            <Text style={s.elimLbl}>Why it was eliminated</Text>
            <Text style={s.elimText}>{el.notForYouBecause}</Text>
            {el.reason && el.reason !== el.notForYouBecause && (
              <Text style={[s.elimText, { marginTop: 5, fontStyle: 'italic' }]}>{el.reason}</Text>
            )}
          </View>
        ))}

        <View style={s.divider} />

        <View style={s.darkBox}>
          <Text style={s.darkTitle}>Your Profile in a Nutshell</Text>
          {[
            result.profileSummary,
            ...(highlights.slice(0, 2)),
          ].filter(Boolean).map((pt: string, i: number) => (
            <View key={i} style={s.darkRow}>
              <Text style={s.darkBullet}>→</Text>
              <Text style={s.darkText}>{pt}</Text>
            </View>
          ))}
        </View>

        <View style={s.lightBox}>
          <Text style={s.lightTitle}>Suggested Next Steps</Text>
          {[
            'Research your top match in depth — find a day-in-the-life video or talk to someone in that field.',
            'Identify the entrance exam for your top career and build a preparation timeline.',
            'Explore school subjects or extracurriculars that build relevant skills now.',
            'Share this report with a parent, teacher, or counsellor.',
            'Retake this assessment in 6–12 months — interests and priorities shift as you grow.',
          ].map((step, i) => (
            <View key={i} style={s.stepRow}>
              <Text style={s.stepNum}>{i + 1}.</Text>
              <Text style={s.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        <Footer label="Page 5 of 5" />
      </Page>
    </Document>
  );
}
