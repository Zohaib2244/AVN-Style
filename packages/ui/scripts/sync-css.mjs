// Copies the CSS that lives at the repo root into the package, so it ships with it.
import { cpSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..', '..');
const out = join(here, '..', 'css');
mkdirSync(out, { recursive: true });
cpSync(join(root, 'ux', 'assets', 'components.css'), join(out, 'components.css'));
const styles = readdirSync(join(root, 'styles'), { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith('_')).map((d) => d.name);
for (const style of styles) {
  for (const f of ['fonts.css', 'tokens.css', 'skin.css', 'flavour.css']) {
    try { cpSync(join(root, 'styles', style, f), join(out, style, f)); } catch { /* optional files */ }
  }
}
console.log('css synced');
