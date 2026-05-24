/**
 * Patches careers.json to add aspirationFit to every career.
 * Run: npx tsx scripts/add-aspiration-fit.ts
 */
import fs from 'fs';
import path from 'path';

const ASPIRATION_FIT: Record<string, Record<string, string>> = {
  // Tech
  software_engineer:       { wealthDrive: 'high',   impactDrive: 'low',    autonomyDrive: 'medium', stabilityDrive: 'medium', balanceDrive: 'low'    },
  data_scientist:          { wealthDrive: 'high',   impactDrive: 'medium', autonomyDrive: 'medium', stabilityDrive: 'medium', balanceDrive: 'medium' },
  product_manager:         { wealthDrive: 'high',   impactDrive: 'medium', autonomyDrive: 'high',   stabilityDrive: 'medium', balanceDrive: 'low'    },
  game_developer:          { wealthDrive: 'medium', impactDrive: 'low',    autonomyDrive: 'high',   stabilityDrive: 'low',    balanceDrive: 'medium' },
  digital_marketer:        { wealthDrive: 'medium', impactDrive: 'low',    autonomyDrive: 'medium', stabilityDrive: 'medium', balanceDrive: 'medium' },
  // Science / Research
  biotech_researcher:      { wealthDrive: 'low',    impactDrive: 'high',   autonomyDrive: 'high',   stabilityDrive: 'medium', balanceDrive: 'high'   },
  drdo_scientist:          { wealthDrive: 'medium', impactDrive: 'high',   autonomyDrive: 'medium', stabilityDrive: 'high',   balanceDrive: 'medium' },
  // Healthcare
  doctor:                  { wealthDrive: 'high',   impactDrive: 'high',   autonomyDrive: 'medium', stabilityDrive: 'high',   balanceDrive: 'low'    },
  psychologist:            { wealthDrive: 'medium', impactDrive: 'high',   autonomyDrive: 'medium', stabilityDrive: 'medium', balanceDrive: 'high'   },
  sports_physio:           { wealthDrive: 'medium', impactDrive: 'medium', autonomyDrive: 'medium', stabilityDrive: 'medium', balanceDrive: 'high'   },
  veterinarian:            { wealthDrive: 'medium', impactDrive: 'high',   autonomyDrive: 'medium', stabilityDrive: 'medium', balanceDrive: 'high'   },
  // Finance
  finance_investment:      { wealthDrive: 'high',   impactDrive: 'low',    autonomyDrive: 'low',    stabilityDrive: 'low',    balanceDrive: 'low'    },
  chartered_accountant:    { wealthDrive: 'high',   impactDrive: 'low',    autonomyDrive: 'medium', stabilityDrive: 'high',   balanceDrive: 'medium' },
  ca_acca:                 { wealthDrive: 'high',   impactDrive: 'low',    autonomyDrive: 'medium', stabilityDrive: 'high',   balanceDrive: 'medium' },
  cfa_portfolio:           { wealthDrive: 'high',   impactDrive: 'low',    autonomyDrive: 'medium', stabilityDrive: 'medium', balanceDrive: 'medium' },
  actuary:                 { wealthDrive: 'high',   impactDrive: 'low',    autonomyDrive: 'low',    stabilityDrive: 'high',   balanceDrive: 'high'   },
  // Business
  entrepreneur:            { wealthDrive: 'high',   impactDrive: 'high',   autonomyDrive: 'high',   stabilityDrive: 'low',    balanceDrive: 'low'    },
  management_consultant:   { wealthDrive: 'high',   impactDrive: 'medium', autonomyDrive: 'medium', stabilityDrive: 'low',    balanceDrive: 'low'    },
  hr_manager:              { wealthDrive: 'medium', impactDrive: 'medium', autonomyDrive: 'low',    stabilityDrive: 'high',   balanceDrive: 'high'   },
  event_manager:           { wealthDrive: 'medium', impactDrive: 'low',    autonomyDrive: 'medium', stabilityDrive: 'low',    balanceDrive: 'low'    },
  // Law
  lawyer:                  { wealthDrive: 'high',   impactDrive: 'medium', autonomyDrive: 'medium', stabilityDrive: 'medium', balanceDrive: 'low'    },
  // Engineering
  civil_engineer:          { wealthDrive: 'medium', impactDrive: 'medium', autonomyDrive: 'medium', stabilityDrive: 'high',   balanceDrive: 'medium' },
  // Government / Defence
  civil_services:          { wealthDrive: 'low',    impactDrive: 'high',   autonomyDrive: 'low',    stabilityDrive: 'high',   balanceDrive: 'medium' },
  army_officer:            { wealthDrive: 'medium', impactDrive: 'high',   autonomyDrive: 'low',    stabilityDrive: 'high',   balanceDrive: 'low'    },
  navy_officer:            { wealthDrive: 'medium', impactDrive: 'high',   autonomyDrive: 'low',    stabilityDrive: 'high',   balanceDrive: 'low'    },
  airforce_officer:        { wealthDrive: 'medium', impactDrive: 'high',   autonomyDrive: 'low',    stabilityDrive: 'high',   balanceDrive: 'low'    },
  pilot:                   { wealthDrive: 'high',   impactDrive: 'low',    autonomyDrive: 'medium', stabilityDrive: 'medium', balanceDrive: 'medium' },
  // Education
  teacher_professor:       { wealthDrive: 'low',    impactDrive: 'high',   autonomyDrive: 'medium', stabilityDrive: 'high',   balanceDrive: 'high'   },
  // Creative / Design / Media
  architect:               { wealthDrive: 'medium', impactDrive: 'medium', autonomyDrive: 'high',   stabilityDrive: 'medium', balanceDrive: 'medium' },
  ux_designer:             { wealthDrive: 'medium', impactDrive: 'medium', autonomyDrive: 'high',   stabilityDrive: 'medium', balanceDrive: 'high'   },
  graphic_designer:        { wealthDrive: 'medium', impactDrive: 'low',    autonomyDrive: 'high',   stabilityDrive: 'low',    balanceDrive: 'high'   },
  fashion_designer:        { wealthDrive: 'medium', impactDrive: 'low',    autonomyDrive: 'high',   stabilityDrive: 'low',    balanceDrive: 'medium' },
  content_creator:         { wealthDrive: 'medium', impactDrive: 'low',    autonomyDrive: 'high',   stabilityDrive: 'low',    balanceDrive: 'high'   },
  journalist:              { wealthDrive: 'low',    impactDrive: 'high',   autonomyDrive: 'medium', stabilityDrive: 'low',    balanceDrive: 'medium' },
  // Social
  social_worker_ngo:       { wealthDrive: 'low',    impactDrive: 'high',   autonomyDrive: 'medium', stabilityDrive: 'low',    balanceDrive: 'medium' },
  // Hospitality
  hotel_manager:           { wealthDrive: 'medium', impactDrive: 'low',    autonomyDrive: 'medium', stabilityDrive: 'medium', balanceDrive: 'low'    },
  chef:                    { wealthDrive: 'medium', impactDrive: 'low',    autonomyDrive: 'high',   stabilityDrive: 'low',    balanceDrive: 'low'    },
  // Agriculture
  agronomist:              { wealthDrive: 'low',    impactDrive: 'high',   autonomyDrive: 'medium', stabilityDrive: 'medium', balanceDrive: 'high'   },
  agri_tech_entrepreneur:  { wealthDrive: 'medium', impactDrive: 'high',   autonomyDrive: 'high',   stabilityDrive: 'low',    balanceDrive: 'medium' },
  // Sports
  sports_athlete:          { wealthDrive: 'medium', impactDrive: 'medium', autonomyDrive: 'medium', stabilityDrive: 'low',    balanceDrive: 'medium' },
  sports_coach:            { wealthDrive: 'medium', impactDrive: 'high',   autonomyDrive: 'medium', stabilityDrive: 'medium', balanceDrive: 'medium' },
  sports_analyst:          { wealthDrive: 'medium', impactDrive: 'medium', autonomyDrive: 'medium', stabilityDrive: 'medium', balanceDrive: 'high'   },
};

const filePath = path.resolve(process.cwd(), 'data/careers.json');
const careers = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

let patched = 0;
let missing = 0;

for (const career of careers) {
  const fit = ASPIRATION_FIT[career.id];
  if (fit) {
    career.aspirationFit = fit;
    patched++;
  } else {
    // Default fallback so nothing crashes
    career.aspirationFit = {
      wealthDrive: 'any', impactDrive: 'any', autonomyDrive: 'any',
      stabilityDrive: 'any', balanceDrive: 'any',
    };
    console.warn(`⚠️  No aspirationFit defined for: ${career.id} — using 'any' fallback`);
    missing++;
  }
}

fs.writeFileSync(filePath, JSON.stringify(careers, null, 2));
console.log(`✅ Patched ${patched} careers. Missing definitions: ${missing}`);
