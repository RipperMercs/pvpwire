#!/usr/bin/env node
// Scans the repo for known API key patterns.
// Belt-and-suspenders alongside the husky pre-commit hook.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOTS = ['src', 'worker', 'content', 'scripts', 'public'];
const SKIP_DIRS = new Set(['node_modules', '.next', 'out', 'dist', '.git', '.wrangler']);
const PATTERNS = [
  { name: 'Anthropic key', re: /sk-ant-[a-zA-Z0-9_-]{20,}/g },
  { name: 'Google API key', re: /AIza[0-9A-Za-z_-]{35}/g },
  { name: 'Resend key', re: /re_[a-zA-Z0-9_-]{20,}/g },
  { name: 'OpenAI key', re: /sk-[a-zA-Z0-9]{32,}/g },
  { name: 'Generic 32+ hex token', re: /(?:secret|token|api[_-]?key|password)["'`\s:=]+[a-fA-F0-9]{32,}/gi },
];

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
    } else {
      const ext = extname(path);
      if (!['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.mdx', '.toml', '.env', '.txt'].includes(ext)) continue;
      const content = readFileSync(path, 'utf8');
      for (const { name, re } of PATTERNS) {
        const matches = content.match(re);
        if (matches) {
          for (const m of matches) {
            hits.push(`${path}: ${name}: ${m.slice(0, 12)}...`);
          }
        }
      }
    }
  }
}

for (const root of ROOTS) {
  walk(root);
}

if (hits.length > 0) {
  console.error('Possible API keys found in tracked files:');
  hits.forEach(h => console.error('  ' + h));
  process.exit(1);
}

console.log('Secret scan passed. No exposed API keys found.');
process.exit(0);
