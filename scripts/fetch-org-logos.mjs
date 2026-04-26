// Best-effort esports org logo fetcher.
// For each org in /content/esports-orgs/, query Wikipedia's REST summary API
// for the org's page, download the page thumbnail (typically the logo for
// company / organization pages) into /public/images/orgs/{slug}.{ext}, and
// update each org's frontmatter with the relative logo path.
//
// Failures are logged and skipped; orgs without a successful fetch keep the
// LogoImg text-mark fallback. Re-runnable: skips orgs that already have the
// logo field set in frontmatter.
//
// Editorial / legal note: company logos on Wikipedia are typically under fair
// use rationale for editorial identification of the org. PVPWire uses them on
// org profile pages and the home Esports Orgs strip for the same purpose,
// which fits the same nominative-fair-use pattern. The site footer carries
// a trademark attribution line.

import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOT = process.cwd();
const ORG_DIR = join(ROOT, 'content', 'esports-orgs');
const PUBLIC_DIR = join(ROOT, 'public', 'images', 'orgs');
const WIKI_BASE = 'https://en.wikipedia.org/api/rest_v1/page/summary/';
const USER_AGENT = 'PVPWireBot/1.0 (https://pvpwire.com; tips@pvpwire.com)';

if (!existsSync(PUBLIC_DIR)) mkdirSync(PUBLIC_DIR, { recursive: true });

// Disambiguation map: orgs whose Wikipedia title differs from the display name.
// Most orgs match their plain name; only override when needed.
const TITLE_OVERRIDES = {
  'cloud9': 'Cloud9 (esports)',
  'sentinels': 'Sentinels (esports organization)',
  'og': 'OG (esports)',
  't1': 'T1 (esports)',
  'edward-gaming': 'Edward Gaming',
  'top-esports': 'Top Esports',
  'jd-gaming': 'JD Gaming',
  'lng-esports': 'LNG Esports',
  'bilibili-gaming': 'Bilibili Gaming',
  'gen-g': 'Gen.G',
  'kt-rolster': 'KT Rolster',
  'dplus-kia': 'Dplus KIA',
  'hanwha-life-esports': 'Hanwha Life Esports',
  'tsm': 'TSM (esports)',
  'mouz': 'mousesports',
  'navi': 'Natus Vincere',
  'team-liquid': 'Team Liquid',
  'team-vitality': 'Team Vitality',
  'team-spirit': 'Team Spirit (esports)',
  'team-falcons': 'Team Falcons',
  'team-3d': 'Team 3D',
  'g2-esports': 'G2 Esports',
  'faze-clan': 'FaZe Clan',
  'evil-geniuses': 'Evil Geniuses',
  'counter-logic-gaming': 'Counter Logic Gaming',
  'mad-lions': 'MAD Lions',
  'sk-gaming': 'SK Gaming',
  'optic-gaming': 'OpTic Gaming',
  '100-thieves': '100 Thieves',
  'nrg-esports': 'NRG Esports',
  'complexity-gaming': 'Complexity Gaming',
  'pain-gaming': 'paiN Gaming',
  'mibr': 'Made in Brazil',
  'furia-esports': 'Furia Esports',
  'talon-esports': 'Talon Esports',
  'paper-rex': 'Paper Rex',
  'zeta-division': 'ZETA Division',
  'karmine-corp': 'Karmine Corp',
  'big': 'BIG (esports)',
  'ence': 'ENCE',
  'astralis': 'Astralis',
  'fnatic': 'Fnatic',
  'heroic': 'Heroic (esports)',
  'drx': 'DRX (esports)',
  'loud': 'LOUD (esports)',
};

function parseFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return null;
  return { fmText: m[1], body: raw.slice(m[0].length), fmStart: 4, fmEnd: 4 + m[1].length };
}

function getField(fmText, key) {
  const re = new RegExp(`^${key}:\\s*(.+)$`, 'm');
  const m = fmText.match(re);
  if (!m) return null;
  return m[1].trim().replace(/^['"]|['"]$/g, '');
}

function setField(raw, key, value) {
  const re = new RegExp(`^${key}:\\s*.+$`, 'm');
  const line = `${key}: ${value}`;
  if (re.test(raw)) {
    return raw.replace(re, line);
  }
  // Insert after the `name:` line, or at the end of frontmatter if not found.
  const nameRe = /^(name:\s*.+)$/m;
  if (nameRe.test(raw)) {
    return raw.replace(nameRe, `$1\n${line}`);
  }
  return raw.replace(/^---\n/, `---\n${line}\n`);
}

async function fetchSummary(title) {
  const url = WIKI_BASE + encodeURIComponent(title.replace(/ /g, '_'));
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) return null;
  return res.json();
}

async function downloadImage(url, slug) {
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, 'Accept': 'image/*,*/*' },
    redirect: 'follow',
  });
  if (!res.ok) {
    console.warn(`    download HTTP ${res.status} for ${slug}: ${url}`);
    return null;
  }
  const contentType = res.headers.get('content-type') || '';
  let ext = '.png';
  if (contentType.includes('svg')) ext = '.svg';
  else if (contentType.includes('jpeg') || contentType.includes('jpg')) ext = '.jpg';
  else if (contentType.includes('png')) ext = '.png';
  else if (contentType.includes('webp')) ext = '.webp';
  else {
    const urlExt = extname(new URL(url).pathname).toLowerCase();
    if (['.svg', '.png', '.jpg', '.jpeg', '.webp'].includes(urlExt)) ext = urlExt === '.jpeg' ? '.jpg' : urlExt;
  }
  const dest = join(PUBLIC_DIR, `${slug}${ext}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(dest, buf);
  return `/images/orgs/${slug}${ext}`;
}

async function processOrg(file) {
  const slug = file.replace(/\.mdx?$/, '');
  const path = join(ORG_DIR, file);
  const raw = readFileSync(path, 'utf8');
  const parsed = parseFrontmatter(raw);
  if (!parsed) return { slug, status: 'no-frontmatter' };

  const existingLogo = getField(parsed.fmText, 'logo');
  if (existingLogo && existingLogo !== '""' && existingLogo !== "''") {
    return { slug, status: 'already-has-logo', logo: existingLogo };
  }

  const name = getField(parsed.fmText, 'name') || slug;
  const title = TITLE_OVERRIDES[slug] || name;

  let summary;
  try {
    summary = await fetchSummary(title);
  } catch (e) {
    return { slug, status: 'fetch-failed', title, error: String(e) };
  }

  // Try a fallback title if the first lookup misses.
  if (!summary || summary.type === 'disambiguation' || !summary.thumbnail) {
    if (title !== name) {
      try {
        summary = await fetchSummary(name);
      } catch {
        // ignore
      }
    }
  }

  if (!summary || !summary.thumbnail || !summary.originalimage) {
    return { slug, status: 'no-thumbnail', title };
  }

  const imgUrl = summary.originalimage.source;
  let logoPath;
  try {
    logoPath = await downloadImage(imgUrl, slug);
  } catch (e) {
    return { slug, status: 'download-failed', error: String(e) };
  }
  if (!logoPath) return { slug, status: 'download-failed' };

  const updatedRaw = setField(raw, 'logo', logoPath);
  writeFileSync(path, updatedRaw);
  return { slug, status: 'ok', logo: logoPath, source: summary.content_urls?.desktop?.page };
}

const files = readdirSync(ORG_DIR).filter((f) => f.endsWith('.mdx') || f.endsWith('.md'));
console.log(`Processing ${files.length} esports-orgs files.`);

let ok = 0, miss = 0, skip = 0, err = 0;
const results = [];
for (const file of files) {
  // Sequential; Wikipedia API tolerates this and we want to be polite.
  const result = await processOrg(file);
  results.push(result);
  switch (result.status) {
    case 'ok': ok += 1; break;
    case 'already-has-logo': skip += 1; break;
    case 'no-thumbnail': miss += 1; break;
    default: err += 1; break;
  }
  console.log(`  ${result.status.padEnd(20)} ${result.slug}${result.title ? ` (tried "${result.title}")` : ''}`);
  // Rate-limit gap. Wikipedia is generous but commons hot-links can rate-cap.
  await new Promise((r) => setTimeout(r, 600));
}

console.log(`\nDone. Ok: ${ok}, skipped (already had logo): ${skip}, no thumbnail: ${miss}, errors: ${err}.`);
