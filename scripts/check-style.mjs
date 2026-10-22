#!/usr/bin/env node
// Checks that a style folder fills every role in contract.md.
//   node scripts/check-style.mjs styles/avn-family [styles/nutstyle …]
//   node scripts/check-style.mjs --all          (every folder in styles/ that has a tokens.css)
// Exit code 1 if any role is missing. Warns when a colour role isn't defined with light-dark().
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Reads contract.md: every `--role` in the first column of a table, and which section it's in. */
export function readContract() {
  const lines = readFileSync(join(root, 'contract.md'), 'utf8').split('\n');
  const roles = [];
  let section = '';
  for (const line of lines) {
    const h = line.match(/^##\s+(.*)/);
    if (h) { section = h[1].trim(); continue; }
    if (!line.startsWith('|')) continue;
    const first = line.split('|')[1] ?? '';
    for (const m of first.matchAll(/`(--[a-z0-9-]+)`/g)) roles.push({ role: m[1], section });
  }
  // `-soft` backgrounds are listed in prose: "--ok-soft … --bad-soft"
  for (const k of ['ok', 'done', 'info', 'new', 'warn', 'bad']) roles.push({ role: `--${k}-soft`, section: 'Status' });
  return roles;
}

const COLOUR_SECTIONS = new Set(['Surfaces and text', 'Accent', 'Status', 'Highlight colours']);

export function checkStyle(dir) {
  const tokensPath = join(dir, 'tokens.css');
  const problems = [], warnings = [];
  if (!existsSync(tokensPath)) return { problems: [`${tokensPath} is missing`], warnings };
  const css = readFileSync(tokensPath, 'utf8');
  // Everything outside palette blocks: the default definitions.
  const base = css.replace(/:root\[data-palette="[^"]+"\][^{]*\{[^}]*\}/g, '');
  const defined = (name) => new RegExp(`(^|[\\s;{])${name}\\s*:`, 'm').test(base);
  const value = (name) => (base.match(new RegExp(`(?:^|[\\s;{])${name}\\s*:\\s*([^;]+);`, 'm')) ?? [])[1]?.trim() ?? '';
  for (const { role, section } of readContract()) {
    if (!defined(role)) { problems.push(`missing ${role} (${section})`); continue; }
    if (COLOUR_SECTIONS.has(section) && !/light-dark\(|color-mix\(|var\(/.test(value(role)) && !role.endsWith('-soft')) {
      warnings.push(`${role} has no light-dark(): is it defined for both themes?`);
    }
  }
  for (const needle of ['color-scheme: dark', 'data-theme="light"']) {
    if (!css.includes(needle)) problems.push(`tokens.css should include the theme switch (${needle}); see contract.md`);
  }
  return { problems, warnings };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let dirs = process.argv.slice(2);
  if (dirs.includes('--all')) dirs = readdirSync(join(root, 'styles')).map((d) => join('styles', d)).filter((d) => statSync(join(root, d)).isDirectory() && existsSync(join(root, d, 'tokens.css')));
  if (!dirs.length) { console.error('usage: node scripts/check-style.mjs styles/<name> …'); process.exit(2); }
  let bad = 0;
  for (const d of dirs) {
    const { problems, warnings } = checkStyle(resolve(root, d));
    console.log(`${problems.length ? '✗' : '✓'} ${d}${problems.length ? '' : ' fills every contract role'}`);
    for (const p of problems) console.log(`    ${p}`);
    for (const w of warnings) console.log(`    warning: ${w}`);
    bad += problems.length;
  }
  process.exit(bad ? 1 : 0);
}
