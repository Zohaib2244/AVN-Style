import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Guard: every CSS class a component names in a string literal must exist in ux/assets/components.css
 * (or be one of the shared utility classes). Catches typos and components drifting from the stylesheet.
 */
const root = join(__dirname, '..', '..', '..');
const css = readFileSync(join(root, 'ux', 'assets', 'components.css'), 'utf8');
const known = new Set([...css.matchAll(/\.([a-zA-Z][\w-]*)/g)].map((m) => m[1]!));
// Utility classes defined by the style or the page, not by components.css.
const shared = new Set(['px', 'px-mark', 'mono', 'dim', 'muted', 'hint', 'row-wrap', 'ic', 'eyebrow', 'sp1', 'okc']);

function classNamesIn(src: string): string[] {
  const out: string[] = [];
  for (const m of src.matchAll(/className=(?:"([^"]+)"|\{`([^`]+)`\})/g)) out.push(...(m[1] ?? m[2] ?? '').split(/\s+/));
  for (const m of src.matchAll(/cx\(([^)]*)\)/g)) // only strings that stand alone as an argument, or follow && / ? / :, are class names (not `x !== 'did'`)
    for (const s of (m[1] ?? '').matchAll(/(?:\(|,|&&|\?|:)\s*'([^']+)'/g)) out.push(...(s[1] ?? '').split(/\s+/));
  return out.filter((c) => /^[a-z][\w-]*$/.test(c));
}

describe('components use only classes that exist in components.css', () => {
  const dir = join(__dirname, '..', 'src');
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.tsx'))) {
    it(file, () => {
      const missing = [...new Set(classNamesIn(readFileSync(join(dir, file), 'utf8')))].filter((c) => !known.has(c) && !shared.has(c));
      expect(missing).toEqual([]);
    });
  }
});
