import { useEffect, useRef, useState, type ReactElement, type ReactNode } from 'react';
import { cx, fmt, niceStep } from './cx';
import { Delta, Tag } from './primitives';

/* ───────── Sizing: draw charts at their real width so text stays readable ───────── */

export function useWidth<T extends HTMLElement>(): [React.RefObject<T>, number] {
  const ref = useRef<T>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const cs = getComputedStyle(el);
      setW(Math.floor(el.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0)));
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

/* ───────── Bar chart (activity per day, events per hour) ───────── */

export function BarChart({ data, labels, label, highlightLast = true, showLast = true }: { data: number[]; labels?: string[]; label: string; highlightLast?: boolean; showLast?: boolean }): ReactElement {
  const [ref, w] = useWidth<HTMLDivElement>();
  const top = Math.max(1, ...data), step = niceStep(top / 4), max = Math.ceil(top / step) * step;
  const H = w < 420 ? 170 : 210, L = 30, R = 4, T = 8, B = 24;
  const iw = Math.max(0, w - L - R), ih = H - T - B, bw = data.length ? iw / data.length : 0;
  const every = Math.max(1, Math.ceil(64 / (bw || 1)));
  const ticks: number[] = [];
  for (let v = 0; v <= max + 1e-9; v += step) ticks.push(+v.toFixed(6));
  return (
    <div className="chart pb" ref={ref}>
      {w > 0 ? (
        <svg width={w} height={H} viewBox={`0 0 ${w} ${H}`} role="img" aria-label={label}>
          {ticks.map((v) => {
            const y = T + ih - (v / max) * ih;
            return (
              <g key={v}>
                <line x1={L} x2={w - R} y1={y} y2={y} stroke="var(--line)" strokeDasharray={v ? '2 4' : undefined} />
                <text x={L - 6} y={y + 3} textAnchor="end">{v >= 1000 ? `${(v / 1000).toFixed(v % 1000 ? 1 : 0)}k` : v}</text>
              </g>
            );
          })}
          {data.map((v, i) => {
            const h = (v / max) * ih, x = L + i * bw + 1.5, last = i === data.length - 1;
            return (
              <g key={i}>
                <rect className="bar" x={x} y={T + ih - h} width={Math.max(1, bw - 3)} height={Math.max(0, h)} rx={2} fill={last && highlightLast ? 'var(--accent)' : 'var(--bar)'} style={{ ['--i' as string]: i }} />
                {labels && ((i % every === 0 && data.length - 1 - i >= every) || last) ? <text x={x + (bw - 3) / 2} y={H - 7} textAnchor="middle">{labels[i]}</text> : null}
              </g>
            );
          })}
          {showLast && data.length ? <text x={L + (data.length - 1) * bw + 1.5 + (bw - 3) / 2} y={T + ih - (data[data.length - 1]! / max) * ih - 5} textAnchor="middle" style={{ fill: 'var(--text)', fontWeight: 600 }}>{fmt(data[data.length - 1]!)}</text> : null}
        </svg>
      ) : null}
    </div>
  );
}

/* ───────── Survival curve + heat strip (level by level) ───────── */

/** Percent of the previous level's starters who never started the next one; null for the last level. */
export function dropToNext(starts: number[], i: number): number | null {
  const next = starts[i + 1];
  const cur = starts[i];
  return next === undefined || !cur ? null : ((cur - next) / cur) * 100;
}

/** Indices of the n steepest drops, steepest first. */
export function steepest(starts: number[], n = 2): number[] {
  return starts.map((_, i) => ({ i, d: dropToNext(starts, i) ?? 0 })).sort((a, b) => b.d - a.d).slice(0, n).map((o) => o.i);
}

export function SurvivalCurve({ starts, label, onSelect }: { starts: number[]; label: string; onSelect?: (level: number) => void }): ReactElement {
  const [ref, w] = useWidth<HTMLDivElement>();
  const n = starts.length, H = w < 420 ? 190 : 230, L = 34, R = 12, T = 22, B = 24, iw = Math.max(0, w - L - R), ih = H - T - B;
  const stp = niceStep((starts[0] ?? 1) / 3), max = Math.ceil((starts[0] ?? 1) / stp) * stp;
  const X = (i: number) => L + (i / Math.max(1, n - 1)) * iw;
  const Y = (v: number) => T + ih - (v / max) * ih;
  const d = starts.map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join(' ');
  const hot = steepest(starts, 2);
  const every = Math.max(1, Math.ceil(26 / (iw / Math.max(1, n - 1) || 1)));
  const ticks: number[] = [];
  for (let v = 0; v <= max; v += stp) ticks.push(v);
  return (
    <div className="chart" ref={ref}>
      {w > 0 ? (
        <svg width={w} height={H} viewBox={`0 0 ${w} ${H}`} role="img" aria-label={label}>
          {ticks.map((v) => (
            <g key={v}>
              <line x1={L} x2={w - R} y1={Y(v)} y2={Y(v)} stroke="var(--line)" strokeDasharray={v ? '2 4' : undefined} />
              <text x={L - 6} y={Y(v) + 3} textAnchor="end">{v}</text>
            </g>
          ))}
          <path d={`${d} L${X(n - 1)} ${Y(0)} L${X(0)} ${Y(0)}Z`} fill="var(--accent)" opacity={0.1} />
          <path d={d} className="surv-line" />
          {starts.map((v, i) => {
            const big = hot.includes(i), dd = dropToNext(starts, i);
            return (
              <g key={i}>
                <circle cx={X(i)} cy={Y(v)} r={big ? 4.5 : 2.6} fill={big ? 'var(--bad)' : 'var(--panel)'} stroke={big ? undefined : 'var(--accent)'} strokeWidth={big ? undefined : 1.5} />
                {big && dd != null ? <text x={X(i) + 7} y={Y(v) - 7} style={{ fill: 'var(--bad)', fontWeight: 600 }}>L{i + 1} −{Math.round(dd)}%</text> : null}
                {i % every === 0 || i === n - 1 ? <text x={X(i)} y={H - 7} textAnchor="middle">{i + 1}</text> : null}
                <rect className="hit" x={X(i) - iw / Math.max(1, n - 1) / 2} y={T} width={iw / Math.max(1, n - 1)} height={ih} onClick={() => onSelect?.(i + 1)}><title>{`Level ${i + 1}: ${v} players`}</title></rect>
              </g>
            );
          })}
        </svg>
      ) : null}
    </div>
  );
}

export function HeatStrip({ starts, onSelect }: { starts: number[]; onSelect?: (level: number) => void }): ReactElement {
  const drops = starts.map((_, i) => dropToNext(starts, i) ?? 0);
  const mx = Math.max(1, ...drops);
  return (
    <div>
      <div className="heat" style={{ gridTemplateColumns: `repeat(${starts.length}, minmax(0, 1fr))` }}>
        {starts.map((_, i) => {
          const dd = dropToNext(starts, i);
          return (
            <button key={i} type="button" style={{ ['--h' as string]: Math.round((drops[i]! / mx) * 85) }} title={`Level ${i + 1}: ${dd == null ? 'no next level yet' : `${dd.toFixed(1)}% did not start the next`}`} onClick={() => onSelect?.(i + 1)}>{i + 1}</button>
          );
        })}
      </div>
      <div className="heat-l"><span>Drop to next level: low<i />high</span><span>Click a level to inspect</span></div>
    </div>
  );
}

/* ───────── Funnel ───────── */

/** Time from this step to the next, in seconds (as the AVN Analytics server reports it). */
export type FunnelTimes = { count: number; median: number; average: number; min: number; max: number; p90: number };
/** A player who did this step and never did the next. `href` makes it a link (through `renderLink`); otherwise `onOpenPlayer(id)` fires. */
export type FunnelStopped = { id: string; label: string; href?: string; meta?: string };

export type FunnelStep = {
  label: ReactNode;
  count: number;
  /** share of this step belonging to the first segment, when broken down by two segments */
  firstShare?: number;
  /** share of this step per segment (same order as `segmentsOf`), when broken down by N segments */
  shares?: number[];
  /** preformatted median to the next step; `times` wins when both are given */
  median?: string;
  /** timing to the next step; the line shows the median, hover / screen readers get the rest */
  times?: FunnelTimes | null;
  /** example players who stopped after this step ("Stopped here: …") */
  stopped?: FunnelStopped[];
};

/** Seconds as "12s", "1m 05s", "2h 03m" or "1d 4h". */
export function duration(seconds: number): string {
  const v = Math.round(seconds);
  if (v < 60) return `${v}s`;
  if (v < 3600) return `${Math.floor(v / 60)}m ${String(v % 60).padStart(2, '0')}s`;
  if (v < 86400) return `${Math.floor(v / 3600)}h ${String(Math.floor((v % 3600) / 60)).padStart(2, '0')}m`;
  return `${Math.floor(v / 86400)}d ${Math.floor((v % 86400) / 3600)}h`;
}

/** The timing line between two funnel steps ("median 12s to the next step") and the fuller numbers shown on hover. */
export function timingText(times: FunnelTimes): { line: string; detail: string } {
  return {
    line: `median ${duration(times.median)} to the next step`,
    detail: `${fmt(times.count)} players · average ${duration(times.average)} · fastest ${duration(times.min)} · slowest ${duration(times.max)} · 90% within ${duration(times.p90)}`,
  };
}

/** Bar and legend colours for N segments: the neutral bar first, then the highlight roles. */
export const SEGMENT_COLOURS = ['var(--bar)', 'var(--hl-cyan)', 'var(--hl-orange)', 'var(--hl-green)', 'var(--hl-pink)', 'var(--hl-violet)', 'var(--hl-gold)'];
const segColour = (i: number) => SEGMENT_COLOURS[i % SEGMENT_COLOURS.length]!;

export function FunnelHeadline({ percent, sentence, started, finished, median }: { percent: number; sentence: ReactNode; started: number; finished: number; median?: string }): ReactElement {
  return (
    <div className="fhead">
      <span className="big">{percent.toFixed(1)}%</span>
      <span className="lead">{sentence}</span>
      <span className="st"><b>{fmt(started)}</b><span>started</span></span>
      <span className="st"><b>{fmt(finished)}</b><span>finished</span></span>
      {median ? <span className="st"><b>{median}</b><span>median to finish</span></span> : null}
    </div>
  );
}

export type FunnelResultProps = {
  steps: FunnelStep[];
  /** two-segment breakdown (bars split by `firstShare`) */
  segments?: [string, string];
  /** N-segment breakdown (bars split by `shares`); ignored when `segments` is given */
  segmentsOf?: string[];
  onSeeWho?: (stepIndex: number) => void;
  /** a player in a "Stopped here" list was chosen (used when the item has no `href`, or no `renderLink` is given) */
  onOpenPlayer?: (id: string) => void;
  /** renders a stopped player's `href` with the app's router; the package never routes */
  renderLink?: (item: FunnelStopped, children: ReactNode) => ReactNode;
};

/**
 * Result rows: label and count, a full-width bar, and between rows the players lost with the time to the next step and
 * "See who". The biggest drop is marked (`.worst`, `data-worst`). Steps can list example players who stopped there.
 */
export function FunnelResult({ steps, segments, segmentsOf, onSeeWho, onOpenPlayer, renderLink }: FunnelResultProps): ReactElement {
  const n0 = steps[0]?.count ?? 1;
  const worst = biggestDrop(steps.map((x) => x.count));
  const names: string[] | null = segments ? [segments[0], segments[1]] : segmentsOf && segmentsOf.length ? segmentsOf : null;
  const sharesOf = (s: FunnelStep): number[] | null => {
    if (!names) return null;
    if (segments) return s.firstShare == null ? null : [s.firstShare, 1 - s.firstShare];
    return s.shares ?? null;
  };
  return (
    <div>
      {names ? <div className="legend2">{names.map((name, k) => <span key={k}><i style={{ background: segColour(k) }} />{name}</span>)}</div> : null}
      <div className="fun">
        {steps.map((s, i) => {
          const pct = (s.count / n0) * 100;
          const shares = sharesOf(s);
          const parts = shares ? shares.map((sh) => Math.round(s.count * sh)) : [s.count];
          const next = steps[i + 1];
          const lost = next ? s.count - next.count : 0;
          const timing = s.times ? timingText(s.times) : null;
          const isWorst = i === worst;
          return (
            <div key={i}>
              <div className={cx('frow', i === steps.length - 1 && 'last')}>
                <span className="n">{i + 1}</span>
                <span className="fl">{s.label}</span>
                <div className="fbar">
                  {parts.map((p, k) => (
                    <i key={k} className={cx(k === 1 && 'b2')} style={{ ['--i' as string]: i, width: `${(p / n0) * 100}%`, ...(k > 1 ? { background: segColour(k) } : {}) }} />
                  ))}
                </div>
                <span className="fv">{fmt(s.count)} <small>{pct.toFixed(1)}%{shares ? ` · ${parts.join(' / ')}` : ''}</small></span>
              </div>
              {next ? (
                <div className={cx('fdrop', isWorst && 'worst')} data-worst={isWorst ? '' : undefined}>
                  <span>
                    ↓ {fmt(lost)} players left ({((lost / s.count) * 100).toFixed(1)}%)
                    {timing ? <> · <span className="ft" title={timing.detail}>{timing.line}<span className="visually-hidden"> ({timing.detail})</span></span></> : s.median ? ` · median ${s.median} to the next step` : ''}
                    {isWorst ? ' · biggest drop' : ''}
                  </span>
                  {onSeeWho ? <button type="button" className="btn sm ghost" onClick={() => onSeeWho(i)}>See who</button> : null}
                </div>
              ) : null}
              {s.stopped && s.stopped.length ? (
                <div className={cx('fstop', isWorst && 'worst')}>
                  <span className="fstop-l">Stopped here:</span>
                  {s.stopped.map((p) => {
                    const body = <><span className="mono">{p.label}</span>{p.meta ? <small>{p.meta}</small> : null}</>;
                    const inner = p.href && renderLink ? renderLink(p, body) : p.href && !onOpenPlayer ? <a href={p.href}>{body}</a> : <button type="button" onClick={() => onOpenPlayer?.(p.id)}>{body}</button>;
                    return <span key={p.id} className="fstop-p">{inner}</span>;
                  })}
                  {lost > s.stopped.length ? <span className="fstop-more">{fmt(s.stopped.length)} of {fmt(lost)}</span> : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Index of the step after which the most players are lost (-1 when there are fewer than two steps). */
export function biggestDrop(counts: number[]): number {
  let worst = -1, most = -Infinity;
  for (let i = 0; i < counts.length - 1; i++) {
    const lost = (counts[i] as number) - (counts[i + 1] as number);
    if (lost > most) { most = lost; worst = i; }
  }
  return worst;
}

/** Funnel options are chips that light up when changed from their default. */
export function OptionChip({ label, value, changed, onClick }: { label: string; value: string; changed?: boolean; onClick?: () => void }): ReactElement {
  return <button type="button" className={cx('ochip', changed && 'set')} onClick={onClick}>{label} <b>{value}</b></button>;
}

/* ───────── Compare table ───────── */

export type CompareRow = { key: string | number; a: { start: number; finish: number }; b: { start: number; finish: number } };
const pct = (s: number, f: number) => (s ? ((s - f) / s) * 100 : 0);
const fmtp = (p: number) => `${p.toFixed(1).replace(/\.0$/, '')}%`;
export const SMALL_SAMPLE = 5;

export type CompareBaseline = 'a' | 'b';

/** Change in drop for one row, in percentage points, relative to the baseline group (positive = more drop than the baseline). */
export function dropChange(r: CompareRow, baseline: CompareBaseline = 'a'): number {
  const da = pct(r.a.start, r.a.finish), db = pct(r.b.start, r.b.finish);
  return baseline === 'a' ? db - da : da - db;
}

/** Worse / better / unchanged counts, read against the baseline ("worse" = more drop than the baseline group). */
export function compareSummary(rows: CompareRow[], baseline: CompareBaseline = 'a'): { worse: number; better: number; same: number; small: number } {
  let worse = 0, better = 0, same = 0, small = 0;
  for (const r of rows) {
    const d = dropChange(r, baseline);
    if (r.a.start < SMALL_SAMPLE || r.b.start < SMALL_SAMPLE) small++;
    if (d >= 0.5) worse++; else if (d <= -0.5) better++; else same++;
  }
  return { worse, better, same, small };
}

export type CompareTableProps = {
  rows: CompareRow[];
  aLabel: string;
  bLabel: string;
  firstColumn?: string;
  /** which group the change is measured against; its header says "baseline" and the change column says "vs A" / "vs B" */
  baseline?: CompareBaseline;
  /** units and caveats under the table; replaces the default note */
  footnote?: ReactNode;
};

/** A vs B, level by level: summary strip, grouped headers (the baseline named), pinned first column, change cell last, footnote. */
export function CompareTable({ rows, aLabel, bLabel, firstColumn = 'Level', baseline = 'a', footnote }: CompareTableProps): ReactElement {
  const s = compareSummary(rows, baseline);
  const mark = (n: number) => (n < SMALL_SAMPLE ? <i className="ss" title={`Small sample: fewer than ${SMALL_SAMPLE} players`}>◦</i> : null);
  const base = baseline === 'a' ? 'A' : 'B', other = baseline === 'a' ? 'B' : 'A';
  return (
    <>
      <div className="sumstrip">
        <Tag kind="bad" dot>{s.worse} worse</Tag>
        <Tag kind="ok" dot>{s.better} better</Tag>
        <Tag kind="plain">{s.same} unchanged</Tag>
        <span>{s.small} with small samples <i className="ss" style={{ margin: 0 }}>◦</i></span>
        <span className="cmp-base">relative to {base} · {baseline === 'a' ? aLabel : bLabel} (baseline)</span>
      </div>
      <div className="cmp-wrap">
        <table className="cmp">
          <thead>
            <tr className="g1">
              <th rowSpan={2} className="lvh">{firstColumn}</th>
              <th colSpan={3} className={cx('grp', baseline === 'a' && 'base')}>{aLabel} · A{baseline === 'a' ? <small> · baseline</small> : null}</th>
              <th colSpan={3} className={cx('grp sep', baseline === 'b' && 'base')}>{bLabel} · B{baseline === 'b' ? <small> · baseline</small> : null}</th>
              <th rowSpan={2} className="sep">Drop change · {other} vs {base}</th>
            </tr>
            <tr className="g2">
              <th className="n">Start</th><th className="n">Finish</th><th className="n">Drop</th>
              <th className="n sep">Start</th><th className="n">Finish</th><th className="n">Drop</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const pa = pct(r.a.start, r.a.finish), pb = pct(r.b.start, r.b.finish), d = dropChange(r, baseline);
              return (
                <tr key={r.key}>
                  <td className="lv mono">{r.key}</td>
                  <td className="n">{r.a.start}</td><td className="n">{r.a.finish}</td><td className="n">{fmtp(pa)} · {r.a.start - r.a.finish}{mark(r.a.start)}</td>
                  <td className="n sep">{r.b.start}</td><td className="n">{r.b.finish}</td><td className="n">{fmtp(pb)} · {r.b.start - r.b.finish}{mark(r.b.start)}</td>
                  <td className={cx('sep', d >= 5 && 'hotb', d <= -5 && 'hotg')}><Delta value={d} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="foot-note">{footnote ?? <>pp = percentage points · ◦ small sample (under {SMALL_SAMPLE} players) · observed behaviour, not proof that a release caused a change</>}</div>
    </>
  );
}
