import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = join(__dirname, '..', '..', '..');
const script = join(root, 'scripts', 'check-style.mjs');
const run = (dir: string) => {
  try { return { code: 0, out: execFileSync('node', [script, dir], { encoding: 'utf8' }) }; }
  catch (e) { const err = e as { status: number; stdout: string }; return { code: err.status, out: err.stdout }; }
};

describe('style contract checker', () => {
  for (const style of ['avn-family', 'nutstyle', '_template']) {
    it(`${style} fills every role`, () => {
      const r = run(join(root, 'styles', style));
      expect(r.out).toContain('fills every contract role');
      expect(r.code).toBe(0);
    });
  }
  it('fails and names the role when a style leaves one out', () => {
    const dir = mkdtempSync(join(tmpdir(), 'style-'));
    const css = readFileSync(join(root, 'styles', 'avn-family', 'tokens.css'), 'utf8').replace(/--done:[^;]+;/, '');
    writeFileSync(join(dir, 'tokens.css'), css);
    const r = run(dir);
    expect(r.code).toBe(1);
    expect(r.out).toContain('missing --done');
  });
  it('fails when tokens.css is missing', () => {
    expect(run(mkdtempSync(join(tmpdir(), 'empty-'))).code).toBe(1);
  });
  it('fails when the theme switch is missing', () => {
    const dir = mkdtempSync(join(tmpdir(), 'style-'));
    const css = readFileSync(join(root, 'styles', 'avn-family', 'tokens.css'), 'utf8').replace(/:root\[data-theme="light"\][^}]*\}/, '');
    writeFileSync(join(dir, 'tokens.css'), css);
    expect(run(dir).out).toContain('theme switch');
  });
});
