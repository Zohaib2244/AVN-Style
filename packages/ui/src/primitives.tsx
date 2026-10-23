import { useEffect, useLayoutEffect, useRef, useState, type ButtonHTMLAttributes, type ReactElement, type ReactNode } from 'react';
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react';
import { cx, fmt } from './cx';
import { Icon, type IconName } from './icons';

export type StatusKind = 'ok' | 'done' | 'info' | 'new' | 'warn' | 'bad' | 'accent' | 'plain';

/** Status vocabulary: what each kind means. Verified (ok) is only ever set by a check. */
export const STATUS_MEANING: Record<StatusKind, string> = {
  ok: 'Verified: confirmed by a check or real data',
  done: 'Done: finished, not confirmed yet',
  info: 'Info: neutral news, or something running',
  new: 'New: a new or experimental feature',
  warn: 'Warning: might be wrong, needs a look',
  bad: 'Failed: broken or blocking',
  accent: 'Current: the selected or current thing',
  plain: 'Inactive: idle, archived, no data',
};

export function Tag({ kind = 'plain', dot, outline, children }: { kind?: StatusKind; dot?: boolean; outline?: boolean; children: ReactNode }): ReactElement {
  return <span className={cx('tag', kind, dot && 'dot', outline && 'o')}>{children}</span>;
}

export function Count({ n, kind }: { n: number | string; kind?: 'warn' | 'bad' | 'info' }): ReactElement {
  return <span className={cx('cnt', kind)}>{n}</span>;
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'primary' | 'ghost' | 'danger' | 'danger-o';
  size?: 'md' | 'sm';
  icon?: IconName;
  /** While true: shows a spinner and `loadingLabel`, disables the button and keeps its width. */
  loading?: boolean;
  loadingLabel?: string;
};

export function Button({ variant = 'default', size = 'md', icon, loading, loadingLabel, className, children, disabled, style, ...rest }: ButtonProps): ReactElement {
  const ref = useRef<HTMLButtonElement>(null);
  const [minWidth, setMinWidth] = useState<number | undefined>();
  useEffect(() => {
    if (loading && ref.current) setMinWidth(ref.current.offsetWidth);
    if (!loading) setMinWidth(undefined);
  }, [loading]);
  return (
    <button
      ref={ref}
      type="button"
      className={cx('btn', variant !== 'default' && variant, size === 'sm' && 'sm', className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      style={{ ...style, minWidth }}
      {...rest}
    >
      {loading ? <span className="spinner sm" aria-hidden="true" /> : icon ? <Icon name={icon} /> : null}
      {loading && loadingLabel ? loadingLabel : children}
    </button>
  );
}

/**
 * Segmented control with a rubber thumb: on click the thumb stretches toward the new option
 * (its leading edge moves first), then the trailing edge catches up and lands with a small squash.
 * ← → move by keyboard without the stretch. Reduced motion: the thumb jumps.
 */
export function Segmented<T extends string>({ options, value, onChange, label }: { options: Array<{ value: T; label: string }>; value: T; onChange: (v: T) => void; label?: string }): ReactElement {
  const reduce = useReducedMotion();
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const edgeL = useMotionValue(0);
  const edgeR = useMotionValue(0);
  const ready = useRef(false);
  const index = Math.max(0, options.findIndex((o) => o.value === value));
  const left = useTransform(edgeL, (l) => `${l}px`);
  const width = useTransform([edgeL, edgeR], ([l, r]) => `${Math.max(0, (r as number) - (l as number))}px`);

  const slot = (i: number) => { const el = refs.current[i]; return el ? { l: el.offsetLeft, r: el.offsetLeft + el.offsetWidth } : null; };

  useLayoutEffect(() => {
    const s = slot(index);
    if (!s) return;
    const from = { l: edgeL.get(), r: edgeR.get() };
    if (!ready.current || reduce || (from.l === 0 && from.r === 0)) { edgeL.jump(s.l); edgeR.jump(s.r); ready.current = true; return; }
    const dir = Math.sign((s.l + s.r) / 2 - (from.l + from.r) / 2) || 1;
    const [lead, leadTo, trail, trailTo] = dir > 0 ? [edgeR, s.r, edgeL, s.l] : [edgeL, s.l, edgeR, s.r];
    // Stretch: the leading edge goes first; the trailing edge waits, then lands with a 3 px squash.
    animate(lead, leadTo, { type: 'spring', duration: 0.32, bounce: 0.18 });
    const a = animate(trail, trailTo + dir * 3, { type: 'spring', duration: 0.3, bounce: 0, delay: 0.1 });
    a.then(() => { if (slot(index)?.l === s.l) animate(trail, trailTo, { type: 'spring', duration: 0.16, bounce: 0 }); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, reduce]);

  useEffect(() => {
    const el = refs.current[index]?.parentElement;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(() => { const s = slot(index); if (s) { edgeL.jump(s.l); edgeR.jump(s.r); } });
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const onKey = (e: React.KeyboardEvent) => {
    const last = options.length - 1;
    let next: number | null = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = Math.min(last, index + 1);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = Math.max(0, index - 1);
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = last;
    if (next === null || next === index) return;
    e.preventDefault();
    const s = slot(next); if (s) { edgeL.jump(s.l); edgeR.jump(s.r); }
    onChange(options[next]!.value);
    refs.current[next]?.focus();
  };

  return (
    <div className="seg rubber" role="radiogroup" aria-label={label}>
      <motion.i className="seg-thumb" aria-hidden="true" style={{ left, width, transition: 'none' }} />
      {options.map((o, i) => (
        <button
          key={o.value}
          ref={(el) => { refs.current[i] = el; }}
          type="button"
          role="radio"
          className={o.value === value ? 'on' : undefined}
          aria-checked={o.value === value}
          tabIndex={o.value === value ? 0 : -1}
          onClick={() => onChange(o.value)}
          onKeyDown={onKey}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** "↓ −20.6 pp · less drop": arrow = direction, colour = good or bad, words say it again. Under 0.5 reads "unchanged". */
export function formatDelta(value: number, opts: { unit?: string; lessIsGood?: boolean; goodWord?: string; badWord?: string } = {}): { text: string; tone: 'good' | 'bad' | 'flat' } {
  const { unit = 'pp', lessIsGood = true, goodWord = 'less drop', badWord = 'more drop' } = opts;
  const abs = Math.abs(value);
  const num = abs.toFixed(1).replace(/\.0$/, '');
  const u = unit === '%' ? '%' : ` ${unit}`;
  if (abs < 0.5) return { text: `${abs < 0.05 ? '' : value < 0 ? '−' : '+'}${abs < 0.05 ? '0' : num}${u} · unchanged`, tone: 'flat' };
  const down = value < 0;
  const good = lessIsGood ? down : !down;
  return { text: `${down ? '↓ −' : '↑ +'}${num}${u} · ${good ? goodWord : badWord}`, tone: good ? 'good' : 'bad' };
}

export function Delta(props: { value: number; unit?: string; lessIsGood?: boolean; goodWord?: string; badWord?: string }): ReactElement {
  const { text, tone } = formatDelta(props.value, props);
  return <span className={cx('delta', tone !== 'flat' && tone)}>{text}</span>;
}

export function Sparkline({ data, label }: { data: number[]; label?: string }): ReactElement | null {
  if (data.length < 2) return null;
  const mx = Math.max(...data), mn = Math.min(...data), W = 64, H = 22;
  const pts = data.map((v, i) => [(i / (data.length - 1)) * W, H - 2 - ((v - mn) / (mx - mn || 1)) * (H - 4)] as const);
  const last = pts[pts.length - 1]!;
  return (
    <svg className="spark" viewBox={`0 0 ${W} ${H}`} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <polyline points={pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')} fill="none" stroke="var(--muted)" strokeWidth="1.5" strokeLinejoin="round" opacity=".7" />
      <circle cx={last[0]} cy={last[1]} r="2.2" fill="var(--text)" />
    </svg>
  );
}

/** A number whose digits roll (odometer) when it changes. Static with reduced motion. */
export function RollingNumber({ value, decimals = 0 }: { value: number; decimals?: number }): ReactElement {
  const reduce = useReducedMotion();
  const text = fmt(value, decimals);
  if (reduce) return <span>{text}</span>;
  return (
    <span aria-label={text} style={{ display: 'inline-flex' }}>
      {text.split('').map((ch, i) =>
        /\d/.test(ch) ? (
          <span key={i} className="od" aria-hidden="true">
            <span className="od-c" style={{ transform: `translateY(-${Number(ch) * 10}%)`, transitionDelay: `${(text.length - 1 - i) * 50}ms` }}>
              {'0123456789'.split('').map((n) => <span key={n}>{n}</span>)}
            </span>
          </span>
        ) : (
          <span key={i} aria-hidden="true">{ch}</span>
        ),
      )}
    </span>
  );
}

export function Kpi({ label, value, context, spark, decimals, unit, definition }: { label: ReactNode; value: number | string; context?: ReactNode; spark?: number[]; decimals?: number; unit?: string; definition?: ReactNode }): ReactElement {
  return (
    <div className="kpi">
      {spark ? <Sparkline data={spark} /> : null}
      <div className="eyebrow">{definition ?? label}</div>
      <div className="k-v">
        {typeof value === 'number' ? <RollingNumber value={value} decimals={decimals} /> : value}
        {unit ? <small>{unit}</small> : null}
      </div>
      {context ? <div className="k-c">{context}</div> : null}
    </div>
  );
}

export function Panel({ title, subtitle, actions, children, className }: { title?: ReactNode; subtitle?: ReactNode; actions?: ReactNode; children?: ReactNode; className?: string }): ReactElement {
  return (
    <section className={cx('panel', className)}>
      {title ? (
        <div className="ph">
          <div>
            <h2>{title}</h2>
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
          {actions ? <div className="row-wrap">{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function EmptyState({ art, title, children, action }: { art?: ReactNode; title: string; children?: ReactNode; action?: ReactNode }): ReactElement {
  return (
    <div className="empty">
      {art}
      <h2>{title}</h2>
      {children ? <p>{children}</p> : null}
      {action}
    </div>
  );
}
