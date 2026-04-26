#!/usr/bin/env node
// Scans content and source files for em dashes (U+2014) and en dashes (U+2013).
// PVPWire writing rule. Em dashes are forbidden across all surfaces.
// Run before any deploy. Exits 1 if any hits found.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOTS = ['src', 'content', 'public'];
const EXTS = new Set(['.md', '.mdx', '.ts', '.tsx', '.js', '.jsx', '.html', '.css', '.txt', '.json']);
const SKIP_FILES = new Set(['package-lock.json', 'package.json', 'tsconfig.json']);
const SKIP_DIRS = new Set(['node_modules', '.next', 'out', 'dist', '.git', '.wrangler']);

const PATTERN = /[\u2014\u2013]/g;
let hits = [];

function walk(dir) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry)) continue;
    const path = join(dir, entry);
    let stat;
    try {
      stat = statSync(path);
    } catch {
      continue;
    }
    if (stat.isDirectory()) {
      walk(path);
    } else if (EXTS.has(extname(path)) && !SKIP_FILES.has(entry)) {
      const content = readFileSync(path, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, i) => {
        if (PATTERN.test(line)) {
          hits.push(`${path}:${i + 1}: ${line.trim()}`);
        }
        PATTERN.lastIndex = 0;
      });
    }
  }
}

for (const root of ROOTS) {
  walk(root);
}

if (hits.length > 0) {
  console.error('Em dash or en dash found in tracked files:');
  hits.forEach(h => console.error('  ' + h));
  console.error(`\nTotal: ${hits.length} occurrences. Fix all before deploy.`);
  process.exit(1);
}

console.log('Em dash scan passed. No occurrences found.');
process.exit(0);
