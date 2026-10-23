// Builds board/day-night.html: every palette of the default style in Day and Night, side by side, self-contained.
//   npx vite-node scripts/build-day-night.tsx
import React from 'react';
import { readFileSync, writeFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { Banner, Button, Delta, Kpi, Panel, Segmented, Tag } from '../packages/ui/src';

const read = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const css = ['styles/avn-family/tokens.css', 'ux/assets/components.css', 'styles/avn-family/flavour.css'].map(read).join('\n')
  .replace(/@import[^;]+;/g, '');
const PALETTES = [['', 'Nutmeg'], ['slate', 'Slate'], ['moss', 'Moss'], ['hibiscus', 'Hibiscus'], ['white', 'White build']] as const;

const sample = renderToStaticMarkup(
  <div style={{ padding: 16, display: 'grid', gap: 12 }}>
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      <Button variant="primary" icon="plus">New funnel</Button><Button>Export</Button>
      <Segmented label="Range" value="30" onChange={() => {}} options={[{ value: '7', label: '7 d' }, { value: '30', label: '30 d' }]} />
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      <Kpi label="Retention D1" value={41.2} unit="%" decimals={1} spark={[30, 33, 31, 36, 39, 41]} context={<Delta value={2.4} lessIsGood={false} goodWord="better" badWord="worse" />} />
      <Kpi label="Crash-free" value={99.3} unit="%" decimals={1} spark={[99.6, 99.5, 99.4, 99.3, 99.3, 99.3]} context={<Delta value={-0.3} lessIsGood={false} goodWord="better" badWord="worse" />} />
    </div>
    <Panel title="Statuses" subtitle="Done is not Verified">
      <div className="pb" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <Tag kind="ok" dot>Verified</Tag><Tag kind="done" dot>Done</Tag><Tag kind="info">Info</Tag><Tag kind="new">New</Tag><Tag kind="warn">Needs a look</Tag><Tag kind="bad">Failed</Tag><Tag>Plain</Tag>
      </div>
    </Panel>
    <Banner icon="refresh">Updated 12 s ago</Banner>
  </div>,
);

const doc = (palette: string, theme: 'light' | 'dark') =>
  `<!doctype html><html data-theme="${theme}"${palette ? ` data-palette="${palette}"` : ''}><head><meta charset="utf-8"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=JetBrains+Mono:wght@400;500;600&family=Pixelify+Sans:wght@400;500;600&display=swap"><style>${css}
html,body{margin:0;background:var(--bg);color:var(--text);font-family:var(--font-ui);font-size:14px}</style></head><body>${sample}</body></html>`;

const cell = (p: string, t: 'light' | 'dark') => `<iframe title="${p || 'nutmeg'} ${t === 'light' ? 'day' : 'night'}" loading="lazy" srcdoc="${doc(p, t).replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"></iframe>`;

const page = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>AVN Day and Night</title>
<style>
:root{color-scheme:light dark;--pg:light-dark(#f3efe8,#0e0c0a);--pt:light-dark(#211b13,#efe6d5);--pm:light-dark(#5a4d3e,#b5a893);--pl:light-dark(#d9cfbd,#2d261f)}
:root[data-t=day]{color-scheme:light}:root[data-t=night]{color-scheme:dark}
body{margin:0;background:var(--pg);color:var(--pt);font:15px/1.5 system-ui,sans-serif}
main{max-width:1100px;margin:0 auto;padding:24px 16px 64px}
h1{font-size:26px;margin:0 0 4px}p.sub{color:var(--pm);margin:0 0 20px;max-width:62ch}
.bar{display:flex;gap:8px;align-items:center;margin-bottom:24px;flex-wrap:wrap}
.bar button{font:inherit;padding:6px 14px;border-radius:9px;border:1px solid var(--pl);background:none;color:var(--pm);cursor:pointer}
.bar button[aria-pressed=true]{background:var(--pl);color:var(--pt);font-weight:700}
section{margin-bottom:28px}h2{font-size:16px;margin:0 0 10px}
.pair{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.pair>div>span{display:block;color:var(--pm);font-size:12.5px;margin-bottom:4px}
iframe{width:100%;height:370px;border:1px solid var(--pl);border-radius:12px;background:transparent;color-scheme:normal}
@media(max-width:700px){.pair{grid-template-columns:1fr}}
</style></head><body><main>
<h1>Day and night, every palette</h1>
<p class="sub">Every palette has a Day and a Night look made for it, not one inverted from the other. Apps ship a switch: Day, Night or System (follows the device, the default). This page: the same sample screen in AVN Family's five palettes.</p>
<div class="bar" role="group" aria-label="This page's theme"><span>This page:</span>
<button aria-pressed="true" data-t="system">System</button><button aria-pressed="false" data-t="day">Day</button><button aria-pressed="false" data-t="night">Night</button></div>
${PALETTES.map(([p, n]) => `<section><h2>${n}</h2><div class="pair"><div><span>Day</span>${cell(p, 'light')}</div><div><span>Night</span>${cell(p, 'dark')}</div></div></section>`).join('\n')}
</main><script>
document.querySelectorAll('.bar button').forEach(function(b){b.onclick=function(){var t=b.dataset.t;
if(t==='system')document.documentElement.removeAttribute('data-t');else document.documentElement.setAttribute('data-t',t);
document.querySelectorAll('.bar button').forEach(function(x){x.setAttribute('aria-pressed',x===b)})}});
</script></body></html>`;

writeFileSync(new URL('../board/day-night.html', import.meta.url), page);
console.log('board/day-night.html', Math.round(page.length / 1024) + ' kB');
