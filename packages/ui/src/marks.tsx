import { useEffect, useLayoutEffect, useRef, useState, type ReactElement, type ReactNode, type RefObject } from 'react';
import { useReducedMotion } from 'motion/react';
import { cx, fmt } from './cx';
import { Icon, type IconName } from './icons';

/*
 * Marks: the small live glyphs from ux/references/components.md ("Status mark", "Spring check",
 * "Heartbeat", "Branch list") and feedback.md ("lattice"). Plain markup on the classes in
 * ux/assets/components.css; the CSS does the morphing, this file only sets state.
 */

/** Seconds as "2.3s" or "1m 12.0s". */
export function fmtElapsed(s: number): string {
  return s < 60 ? `${s.toFixed(1)}s` : `${Math.floor(s / 60)}m ${(s % 60).toFixed(1)}s`;
}

/** The element's box, kept current through a ResizeObserver. */
export function useRect(ref: RefObject<HTMLElement | null>): { left: number; top: number; width: number; height: number } {
  const [rect, setRect] = useState({ left: 0, top: 0, width: 0, height: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const read = () => setRect({ left: el.offsetLeft, top: el.offsetTop, width: el.offsetWidth, height: el.offsetHeight });
    read();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return rect;
}

/* ───────── Pixel burst ───────── */

/** The small pixel burst that marks Done becoming Verified: `n` squares flying out from the centre. */
export function Bits({ n = 8 }: { n?: number }): ReactElement {
  return (
    <span className="bits" aria-hidden="true">
      {Array.from({ length: n }, (_, i) => <span key={i} style={{ ['--a' as string]: `${(360 / n) * i}deg` }} />)}
    </span>
  );
}

/* ───────── Status mark ───────── */

export type MarkState = 'todo' | 'wait' | 'done' | 'ok' | 'bad';
export const MARK_WORDS: Record<MarkState, string> = { todo: 'To do', wait: 'Waiting', done: 'Done · to confirm', ok: 'Verified', bad: 'Failed' };

/**
 * One 20 px glyph for the status vocabulary; it morphs between states instead of swapping icons.
 * `progress` (0–1) turns the waiting arc into a filling arc. With `label` and `task`, Verified
 * strikes the label through. `burst` plays the pixel burst when the mark becomes Verified.
 */
export function StatusMark({ state, label, task, burst, progress, className }: {
  state: MarkState; label?: ReactNode; task?: boolean; burst?: boolean; progress?: number; className?: string;
}): ReactElement {
  const reduce = useReducedMotion();
  const prev = useRef(state);
  const [bits, setBits] = useState(false);
  useEffect(() => {
    if (burst && !reduce && state === 'ok' && prev.current !== 'ok') {
      setBits(true);
      const id = setTimeout(() => setBits(false), 700);
      prev.current = state;
      return () => clearTimeout(id);
    }
    prev.current = state;
    return undefined;
  }, [state, burst, reduce]);
  const style = progress != null && state === 'wait' ? { ['--p' as string]: Math.max(0, Math.min(1, progress)) } : undefined;
  return (
    <span className={cx('smark', className)} data-state={state} data-task={task || undefined} style={style} role={label ? undefined : 'img'} aria-label={label ? undefined : MARK_WORDS[state]}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle className="smark-track" cx="12" cy="12" r="9" />
        <circle className="smark-ring" cx="12" cy="12" r="9" pathLength="100" transform="rotate(-90 12 12)" />
        <path className="smark-check" d="M7.5 12.5l3 3 6.5-6.5" pathLength="100" />
        <path className="smark-cross" d="M8.5 8.5l7 7M15.5 8.5l-7 7" pathLength="100" />
      </svg>
      {label != null ? <b className="smark-l">{label}<i className="smark-strike" aria-hidden="true" /></b> : null}
      {bits ? <Bits /> : null}
    </span>
  );
}

/* ───────── Spring check ───────── */

/**
 * A checkbox row for tasks a person ticks by hand. The box fills from the centre with a spring, the
 * tick draws, the label dims and is struck through. Never produces Verified: only a check sets that.
 */
export function SpringCheck({ checked, defaultChecked = false, onChange, label, disabled, className }: {
  checked?: boolean; defaultChecked?: boolean; onChange?: (checked: boolean) => void; label: ReactNode; disabled?: boolean; className?: string;
}): ReactElement {
  const [own, setOwn] = useState(defaultChecked);
  const on = checked ?? own;
  const toggle = () => { if (disabled) return; const next = !on; if (checked === undefined) setOwn(next); onChange?.(next); };
  return (
    <button type="button" className={cx('schk', className)} role="checkbox" aria-checked={on} disabled={disabled} onClick={toggle}>
      <span className="schk-box" aria-hidden="true">
        <i className="schk-fill" />
        <svg className="schk-tick" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" pathLength="1" /></svg>
      </span>
      <span className="schk-l"><span className="schk-w">{label}</span><i className="schk-rule" aria-hidden="true" /></span>
    </button>
  );
}

/* ───────── Lattice ───────── */

/** Cell order (0–8, row by row) → the step at which each cell lights; `null` is a hole that never lights. */
export const LATTICE_PATTERNS = {
  orbit: [0, 1, 2, 7, null, 3, 6, 5, 4],
  snake: [0, 1, 2, 5, 4, 3, 6, 7, 8],
  pulse: [2, 1, 2, 1, 0, 1, 2, 1, 2],
  ripple: [4, 3, 4, 3, 0, 3, 4, 3, 4],
} as const;
export type LatticePattern = keyof typeof LATTICE_PATTERNS;
export type LatticeStatus = 'working' | 'done' | 'error';

const CHECK_CELLS = new Set([2, 3, 5, 7]);
const CROSS_CELLS = new Set([0, 2, 4, 6, 8]);

/**
 * A 3 × 3 pixel grid that lights cells in a pattern while waiting, says how long so far, and turns
 * into a check or a cross when the wait ends ("Done in 2.3s", "Failed after 8.1s").
 */
export function Lattice({ status = 'working', label = 'Loading', doneLabel = 'Done in', errorLabel = 'Failed after', elapsed, pattern = 'orbit', round, timer = true, className }: {
  status?: LatticeStatus; label?: string; doneLabel?: string; errorLabel?: string;
  /** Seconds, when the app knows; otherwise a clock runs while working and stops at the end. */
  elapsed?: number; pattern?: LatticePattern; round?: boolean; timer?: boolean; className?: string;
}): ReactElement {
  const [t, setT] = useState(elapsed ?? 0);
  useEffect(() => {
    if (elapsed != null) { setT(elapsed); return undefined; }
    if (status !== 'working') return undefined;
    const t0 = performance.now();
    setT(0);
    const id = setInterval(() => setT((performance.now() - t0) / 1000), 100);
    return () => { clearInterval(id); setT((performance.now() - t0) / 1000); };
  }, [status, elapsed]);
  const steps = LATTICE_PATTERNS[pattern];
  const markCells = status === 'error' ? CROSS_CELLS : CHECK_CELLS;
  const word = status === 'working' ? label : status === 'done' ? doneLabel : errorLabel;
  return (
    <span className={cx('lattice', round && 'round', className)} data-status={status} role="status" aria-live="polite">
      <span className="lat-grid" aria-hidden="true">
        <span className="lat-run">{steps.map((u, i) => (u === null ? <i key={i} className="hole" /> : <i key={i} style={{ ['--u' as string]: u }} />))}</span>
        <span className="lat-mark">{Array.from({ length: 9 }, (_, i) => <i key={i} className={markCells.has(i) ? 'on' : undefined} />)}</span>
      </span>
      <span className="lat-l" aria-hidden="true">
        <span className={cx('lat-x', status === 'working' && 'on')}>{label}</span>
        <span className={cx('lat-x', status === 'done' && 'on')}>{doneLabel}</span>
        <span className={cx('lat-x', status === 'error' && 'on')}>{errorLabel}</span>
      </span>
      {timer ? <span className="lat-t" aria-hidden="true">{fmtElapsed(t)}</span> : null}
      <span className="visually-hidden">{timer ? `${word} ${fmtElapsed(t)}` : word}</span>
    </span>
  );
}

/* ───────── Heartbeat ───────── */

/** A number that remounts when it changes, so the CSS can roll it. */
export function RollingText({ value, className }: { value: string | number; className?: string }): ReactElement {
  return <span key={String(value)} className={className}>{value}</span>;
}

/**
 * The live dot: beats when `tick` changes (a packet, an event), rests with a slow glow in between,
 * and goes grey when `live` is false. The optional count rolls next to it.
 */
export function Heartbeat({ live = true, tick, count, label, className }: { live?: boolean; tick?: number | string; count?: number; label?: string; className?: string }): ReactElement {
  const reduce = useReducedMotion();
  const [beat, setBeat] = useState(false);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return undefined; }
    if (!live || reduce) return undefined;
    setBeat(false);
    const raf = requestAnimationFrame(() => setBeat(true));
    const id = setTimeout(() => setBeat(false), 600);
    return () => { cancelAnimationFrame(raf); clearTimeout(id); };
  }, [tick, live, reduce]);
  return (
    <span className={cx('beat', !live && 'off', className)} role="status" data-beat={beat || undefined}>
      <i className="beat-d" aria-hidden="true" />
      {count != null ? <RollingText className="beat-n" value={fmt(count)} /> : null}
      {label ? <span className="visually-hidden">{label}{count != null ? ` · ${fmt(count)}` : ''}{live ? '' : ' · stopped'}</span> : null}
    </span>
  );
}

/* ───────── Branch list ───────── */

export type BranchItem = { id: string; label?: ReactNode; icon?: IconName; /** Custom row content (a call chip); the row is then static. */ node?: ReactNode };

const ROW = 32, PAD = 4, R = 8, TRUNK = 10, END = 26;
const rowY = (k: number) => PAD + k * ROW + ROW / 2;

/**
 * Children hanging off a trunk with rounded branch lines; the current child's branch is drawn in
 * the accent. For steps under a thought line, condition groups, related items in a drawer.
 */
export function BranchList({ items, current, onSelect, label, className }: { items: BranchItem[]; current?: string; onSelect?: (id: string) => void; label?: string; className?: string }): ReactElement {
  const n = items.length;
  const h = PAD * 2 + n * ROW;
  const cur = items.findIndex((it) => it.id === current);
  const arc = (k: number) => `M ${TRUNK} ${rowY(k) - R} A ${R} ${R} 0 0 0 ${TRUNK + R} ${rowY(k)} H ${END}`;
  const interactive = Boolean(onSelect);
  return (
    <div className={cx('branch', className)} role={interactive ? 'listbox' : 'list'} aria-label={label} style={{ padding: `${PAD}px 0` }}>
      {n ? (
        <svg className="branch-lines" width={END + 8} height={h} aria-hidden="true">
          <path className="br-base" d={`M ${TRUNK} 0 V ${rowY(n - 1) - R}`} />
          {items.map((it, k) => <path key={`b${it.id}`} className="br-base" d={arc(k)} />)}
          {items.map((it, k) => {
            const len = rowY(k) - R + (Math.PI * R) / 2 + (END - TRUNK - R);
            return <path key={`r${it.id}`} className={cx('br-reach', k === cur && 'on')} style={{ ['--len' as string]: len.toFixed(1) }} d={`M ${TRUNK} 0 V ${rowY(k) - R} A ${R} ${R} 0 0 0 ${TRUNK + R} ${rowY(k)} H ${END}`} />;
          })}
        </svg>
      ) : null}
      {items.map((it, k) => {
        const on = k === cur;
        if (it.node || !interactive) {
          return <div key={it.id} className={cx('br-i', 'static', on && 'on')} role={interactive ? 'option' : 'listitem'} aria-selected={interactive ? on : undefined}>{it.node ?? <>{it.icon ? <Icon name={it.icon} /> : null}{it.label}</>}</div>;
        }
        return (
          <button key={it.id} type="button" className={cx('br-i', on && 'on')} role="option" aria-selected={on} onClick={() => onSelect?.(it.id)}>
            {it.icon ? <Icon name={it.icon} /> : null}{it.label}
          </button>
        );
      })}
    </div>
  );
}
