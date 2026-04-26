// One-shot editorial pass for PIVOT.md Step 6.
// Adds trending, coming_soon, priority, current_meta_note, and scene_status
// to selected catalog entries per the v2 catalog rework. Re-runnable: skips
// fields already present so manual edits stick.
//
// Founder-named home-page exemplars (Marathon, ARC Raiders, Counter-Strike,
// World of Warcraft) get trending: true plus a hand-written meta note per
// docs/seed-rationale.md D.1 #6.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const SRC = join(ROOT, 'content', 'catalog');

// Editorial config. Order is by priority (lower = more prominent).
// Each entry: { trending?, coming_soon?, priority, scene_status?, meta_note? }
const EDITORIAL = [
  {
    slug: 'marathon',
    coming_soon: true,
    priority: 1,
    scene_status: 'hot',
    meta_note: "Bungie's extraction shooter. Pre-release marketing has emphasized stylized art and a distinct PvP ruleset; the audience question is whether the threat density satisfies the Tarkov-Hunt crowd.",
  },
  {
    slug: 'arc-raiders',
    trending: true,
    priority: 2,
    scene_status: 'hot',
    meta_note: 'Embark Studios extraction shooter, third-person PvPvE on a surface world overrun by machines. The post-launch population has held; Embark patches monthly.',
  },
  {
    slug: 'counter-strike-2',
    trending: true,
    priority: 3,
    scene_status: 'hot',
    meta_note: 'Source 2 era CS. Premier matchmaking is the ranked ladder; Faceit and ESEA still anchor the third-party competitive scene.',
  },
  {
    slug: 'world-of-warcraft',
    trending: true,
    priority: 4,
    scene_status: 'steady',
    meta_note: 'PvP is alive in 2026: 3v3 Arena ladder, Rated Solo Shuffle, Battleground Blitz, and Rated Battlegrounds. The MDI / AWC circuit runs alongside.',
  },
  {
    slug: 'marvel-rivals',
    trending: true,
    priority: 5,
    scene_status: 'hot',
    meta_note: '6v6 hero shooter that took the audience left behind by the Overwatch League collapse. Marvel IP draws the population; the competitive scene is rebuilding the third-party tournament infrastructure.',
  },
  {
    slug: 'valorant',
    trending: true,
    priority: 6,
    scene_status: 'hot',
    meta_note: 'VCT Pacific, Americas, EMEA, and China feed VCT Masters and the year-end Champions. The franchise league infrastructure is the most stable in modern esports.',
  },
  {
    slug: 'dota-2',
    trending: true,
    priority: 7,
    scene_status: 'steady',
    meta_note: 'Patch 7.x cycles continue. The International remains the genre-defining event even with the post-Battle-Pass prize-pool reset; mid-season Majors anchor the calendar.',
  },
  {
    slug: 'league-of-legends',
    priority: 8,
    scene_status: 'hot',
    meta_note: 'LCK, LPL, LEC, LCS feed Worlds and MSI. The single most-watched esports calendar of the year by global viewership; T1 vs the field is the through-line.',
  },
  {
    slug: 'apex-legends',
    trending: true,
    priority: 9,
    scene_status: 'steady',
    meta_note: 'ALGS is the Match Point format BR competition that anchors the year. Roster turnover post-EA-acquisition aside, the competitive structure is intact.',
  },
  {
    slug: 'tekken-8',
    trending: true,
    priority: 10,
    scene_status: 'hot',
    meta_note: 'Tekken World Tour active. Heat system and chip damage are the cycle-defining mechanics; the FGC has stayed engaged through the 2024 to 2026 patches.',
  },
  {
    slug: 'street-fighter-6',
    priority: 11,
    scene_status: 'hot',
    meta_note: 'Capcom Cup XII cycle. Modern controls expanded the audience; Drive Impact and Drive Rush are the system mechanics that define the meta.',
  },
  {
    slug: 'rocket-league',
    priority: 12,
    scene_status: 'steady',
    meta_note: 'RLCS continues year-over-year as one of the most stable competitive calendars in esports. Free-to-play conversion is fully in.',
  },
  {
    slug: 'overwatch-2',
    scene_status: 'steady',
    meta_note: 'OWCS third-party tournament circuit replaces the post-OWL franchise era. 5v5 has settled; the audience question is whether OW2 can hold against Marvel Rivals.',
  },
  {
    slug: 'rainbow-six-siege',
    scene_status: 'steady',
    meta_note: 'Six Invitational anchors the year, R6 SI Major Championship circuit feeds it. Operator pool depth is the perpetual balance question.',
  },
  {
    slug: 'escape-from-tarkov',
    scene_status: 'steady',
    meta_note: 'Wipes still drive engagement cycles; flea market changes and labs raids continue as the competitive flashpoints.',
  },
  {
    slug: 'hunt-showdown',
    scene_status: 'steady',
    meta_note: "Hunt 1896 era. Crytek's bayou extraction PvPvE remains the format reference for tense long-range engagements.",
  },
  {
    slug: 'dark-and-darker',
    scene_status: 'hot',
    meta_note: 'Fantasy dungeon extraction with class-based loadouts. The early-access turbulence is past; the audience has stayed for the format.',
  },
  {
    slug: 'path-of-exile',
    scene_status: 'steady',
    meta_note: 'Path of Exile 2 in early access alongside PoE 1 league cycles. PvP modes are minor compared to the trade league economy, but the scene exists.',
  },
  {
    slug: 'new-world',
    scene_status: 'declining',
    meta_note: 'Aeternum still runs Wars and Outpost Rush. The competitive territory layer is small but persistent; population skews heavily NA East.',
  },
  {
    slug: 'throne-and-liberty',
    scene_status: 'steady',
    meta_note: 'Korean MMO with siege-anchored PvP loop. The monetization layer remains the audience dispute; the siege design is the clear answer to a decade of weak Korean PvP shipments.',
  },
  {
    slug: 'final-fantasy-xiv',
    scene_status: 'steady',
    meta_note: 'Crystalline Conflict, Frontline, and Rival Wings are the active PvP modes. PvP design has improved patch over patch but population is dwarfed by the PvE side.',
  },
  {
    slug: 'eve-online',
    scene_status: 'steady',
    meta_note: 'Null sec power blocs continue as the structural metagame. CCP balance changes hit the macro layer every quarter; the politics outlast any single patch.',
  },
  {
    slug: 'black-desert-online',
    scene_status: 'steady',
    meta_note: 'Node wars and siege wars still run. The Korean version continues to lead content; the global server has narrowed the gap.',
  },
  {
    slug: 'albion-online',
    scene_status: 'steady',
    meta_note: 'GvG and Crystal League runs as the recurring competitive structure. Mists update reshaped the small-scale PvP audience; Hellgates remain the duo / trio entry.',
  },
  {
    slug: 'chess',
    scene_status: 'hot',
    meta_note: 'Champions Chess Tour 2026 in motion; FIDE cycle continues. The Magnus / Hikaru / Caruana axis still defines the top of the rapid and blitz scene.',
  },
];

let updated = 0;
let skipped = 0;
let missing = 0;

for (const entry of EDITORIAL) {
  const file = join(SRC, `${entry.slug}.mdx`);
  if (!existsSync(file)) {
    console.warn(`  missing file for slug "${entry.slug}"; skipping`);
    missing += 1;
    continue;
  }
  let raw = readFileSync(file, 'utf8');
  const fmEnd = raw.indexOf('\n---', 4);
  if (fmEnd < 0) {
    console.warn(`  no closing frontmatter delim in ${entry.slug}; skipping`);
    missing += 1;
    continue;
  }
  const fm = raw.slice(0, fmEnd);
  const body = raw.slice(fmEnd);
  let newFm = fm;
  let touched = false;

  function addField(key, value) {
    if (new RegExp(`^${key}:`, 'm').test(newFm)) return;
    let line;
    if (typeof value === 'string') {
      const escaped = value.replace(/"/g, '\\"');
      line = `${key}: "${escaped}"`;
    } else {
      line = `${key}: ${value}`;
    }
    newFm = newFm.trimEnd() + '\n' + line;
    touched = true;
  }

  if (entry.trending) addField('trending', true);
  if (entry.coming_soon) addField('coming_soon', true);
  if (entry.priority !== undefined) addField('priority', entry.priority);
  if (entry.scene_status) addField('scene_status', entry.scene_status);
  if (entry.meta_note) addField('current_meta_note', entry.meta_note);

  if (touched) {
    writeFileSync(file, newFm + body, 'utf8');
    updated += 1;
    console.log(`  updated ${entry.slug}`);
  } else {
    skipped += 1;
  }
}

console.log(`\nEditorial pass complete. Updated ${updated}, skipped ${skipped}, missing ${missing}.`);
