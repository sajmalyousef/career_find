/**
 * 1. Tightens Commercial Pilot scoring so it doesn't surface for generic R/Cv/En profiles
 * 2. Adds adjacent aviation/operations careers as alternatives
 * Run: npx tsx scripts/fix-pilot.ts
 */
import fs from 'fs';
import path from 'path';

const filePath = path.resolve(process.cwd(), 'data/careers.json');
const careers = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

// ── 1. Tighten pilot ────────────────────────────────────────────────────────
const pilot = careers.find((c: { id: string }) => c.id === 'pilot');
if (pilot) {
  // Require I (investigative — systems/tech thinking) as primary, R secondary
  // Remove Cv — too common; pilot needs precision but it's not a paperwork job
  pilot.riasec = ['R', 'I', 'En'];
  // Raise bars: needs genuinely high C and very low N (emotional stability)
  // O must be low (follows strict SOPs, not creative thinkers)
  pilot.bigFiveFit = { C: 'high', N: 'low', E: 'high', O: 'low', A: 'medium' };
  pilot.aspirationFit = {
    wealthDrive: 'high',
    impactDrive: 'low',
    autonomyDrive: 'medium',
    stabilityDrive: 'high',  // was medium — pilots need stability mindset
    balanceDrive: 'low',
  };
  console.log('✅ Tightened Commercial Pilot requirements');
}

// ── 2. Add adjacent aviation/operations careers ─────────────────────────────
const newCareers = [
  {
    id: 'air_traffic_controller',
    name: 'Air Traffic Controller',
    cluster: 'aviation',
    dayInLife: 'Guide aircraft safely through controlled airspace, coordinate takeoffs and landings, and manage complex traffic flows from the tower.',
    riasec: ['Cv', 'I', 'R'],
    bigFiveFit: { C: 'high', N: 'low', E: 'medium', O: 'any', A: 'medium' },
    aiRisk: 'low',
    aiNote: 'Real-time human judgment in safety-critical decisions makes full automation decades away.',
    salaryFresher: '₹8–12 LPA (AAI)',
    salary5yr: '₹14–22 LPA',
    exams: ['AAI ATC Exam', 'NDA (optional path)'],
    careerTags: ['aviation', 'government'],
    streams: ['science_pcm'],
    aspirationFit: {
      wealthDrive: 'medium',
      impactDrive: 'medium',
      autonomyDrive: 'low',
      stabilityDrive: 'high',
      balanceDrive: 'medium',
    },
  },
  {
    id: 'aerospace_engineer',
    name: 'Aerospace Engineer',
    cluster: 'engineering',
    dayInLife: 'Design and test aircraft, satellites, and propulsion systems — solving the hardest physics and materials problems in engineering.',
    riasec: ['I', 'R', 'Cv'],
    bigFiveFit: { O: 'high', C: 'high', N: 'any', E: 'any', A: 'any' },
    aiRisk: 'low',
    aiNote: 'Complex systems design and safety validation require deep human expertise.',
    salaryFresher: '₹6–12 LPA',
    salary5yr: '₹15–35 LPA',
    exams: ['JEE Advanced (IIT)', 'IIST entrance', 'GATE (for PSUs)'],
    careerTags: ['engineering', 'tech', 'science'],
    streams: ['science_pcm'],
    aspirationFit: {
      wealthDrive: 'medium',
      impactDrive: 'high',
      autonomyDrive: 'medium',
      stabilityDrive: 'high',
      balanceDrive: 'medium',
    },
  },
  {
    id: 'merchant_navy_officer',
    name: 'Merchant Navy Officer',
    cluster: 'maritime',
    dayInLife: 'Navigate cargo or tanker ships across international waters, manage a crew, and ensure safe delivery of goods across oceans.',
    riasec: ['R', 'En', 'Cv'],
    bigFiveFit: { C: 'high', N: 'low', E: 'medium', O: 'medium', A: 'medium' },
    aiRisk: 'low',
    aiNote: 'On-board leadership, navigation decisions, and emergency response remain irreplaceably human.',
    salaryFresher: '₹25,000–60,000/month (cadet stipend)',
    salary5yr: '₹5–12 LPA (Officer rank)',
    exams: ['IMU CET', 'DNS Sponsorship', 'GP Rating entry'],
    careerTags: ['maritime', 'engineering', 'government'],
    streams: ['science_pcm'],
    aspirationFit: {
      wealthDrive: 'high',
      impactDrive: 'low',
      autonomyDrive: 'medium',
      stabilityDrive: 'medium',
      balanceDrive: 'low',
    },
  },
];

// Only add if not already present
for (const career of newCareers) {
  if (!careers.find((c: { id: string }) => c.id === career.id)) {
    careers.push(career);
    console.log(`✅ Added: ${career.name}`);
  } else {
    console.log(`⏭️  Already exists: ${career.name}`);
  }
}

fs.writeFileSync(filePath, JSON.stringify(careers, null, 2));
console.log(`\nTotal careers: ${careers.length}`);
