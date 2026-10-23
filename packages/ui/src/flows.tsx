import { Children, isValidElement, useEffect, useLayoutEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent, type ReactElement, type ReactNode } from 'react';
import { useReducedMotion } from 'motion/react';
import { cx } from './cx';
import { Icon } from './icons';
import { Button } from './primitives';

/*
 * Flows: code slots (pairing a device, confirming a key fingerprint) and the stepper (the setup
 * flow), from ux/references/components.md and pages.md. Markup on the classes in components.css.
 */

/* ───────── Code slots ───────── */

/** Only the digits of a string. */
export const digitsOf = (text: string): string => text.replace(/\D/g, '');

/** Puts `text`'s digits into `code` from slot `from`; returns the new code and the slot to land on. */
export function insertDigits(code: string[], text: string, from: number, length = code.length): { code: string[]; active: number } {
  const digits = digitsOf(text);
  const next = code.slice(0, length);
  while (next.length < length) next.push('');
  if (!digits) return { code: next, active: from };
  let i = from;
  for (let k = 0; k < digits.length && i < length; k++, i++) next[i] = digits[k]!;
  return { code: next, active: Math.min(i, length - 1) };
}

export type SlotsStatus = 'idle' | 'error' | 'success';

/**
 * Entry for a short numeric code: one hidden input, one box per digit, a caret in the active box.
 * Typing lands a digit with a spring, paste cascades, Backspace steps back, ← → Home End move.
 * `status="error"` drains the digits out; `status="success"` washes the row and locks it.
 */
export function CodeSlots({ length = 6, value, status = 'idle', message, onChange, onComplete, disabled, label = 'Code', autoFocus, className }: {
  length?: number; value?: string; status?: SlotsStatus; message?: ReactNode;
  onChange?: (code: string) => void; onComplete?: (code: string) => void;
  disabled?: boolean; label?: string; autoFocus?: boolean; className?: string;
}): ReactElement {
  const reduce = useReducedMotion();
  const empty = () => Array.from({ length }, () => '');
  const [code, setCode] = useState<string[]>(() => (value != null ? insertDigits(empty(), value, 0, length).code : empty()));
  const [active, setActive] = useState(0);
  const [focused, setFocused] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const row = useRef<HTMLDivElement>(null);
  const [slotStep, setSlotStep] = useState(52);
  const locked = status === 'success' || disabled;

  useEffect(() => { if (value != null) setCode(insertDigits(empty(), value, 0, length).code); }, [value, length]); // eslint-disable-line react-hooks/exhaustive-deps

  // A wrong code drains out, then the slots are empty again.
  useEffect(() => {
    if (status !== 'error') return undefined;
    const id = setTimeout(() => { setCode(empty()); setActive(0); onChange?.(''); }, reduce ? 0 : 420);
    return () => clearTimeout(id);
  }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => {
    const boxes = row.current?.querySelectorAll<HTMLElement>('.slot');
    if (boxes && boxes.length > 1) setSlotStep(boxes[1]!.offsetLeft - boxes[0]!.offsetLeft);
  }, [length]);

  const commit = (next: string[], land: number) => {
    setCode(next); setActive(land);
    const joined = next.join('');
    onChange?.(joined);
    if (next.every(Boolean)) onComplete?.(joined);
  };
  const insert = (text: string, from: number) => { const r = insertDigits(code, text, from, length); commit(r.code, r.active); };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (locked) return;
    if (/^[0-9]$/.test(e.key)) { e.preventDefault(); insert(e.key, active); }
    else if (e.key === 'Backspace') {
      e.preventDefault();
      const next = [...code];
      if (next[active]) { next[active] = ''; commit(next, active); }
      else if (active > 0) { next[active - 1] = ''; commit(next, active - 1); }
    } else if (e.key === 'ArrowLeft') { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); setActive((a) => Math.min(length - 1, a + 1)); }
    else if (e.key === 'Home') { e.preventDefault(); setActive(0); }
    else if (e.key === 'End') { e.preventDefault(); setActive(length - 1); }
  };
  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => { e.preventDefault(); if (!locked) insert(e.clipboardData.getData('text'), 0); };
  const onInput = () => {
    const el = input.current; if (!el) return;
    const d = digitsOf(el.value); el.value = '';
    if (d && !locked) insert(d, d.length === 1 ? active : 0);
  };
  const pick = (i: number) => {
    if (locked) return;
    const firstEmpty = code.indexOf('');
    setActive(Math.min(i, firstEmpty < 0 ? length - 1 : firstEmpty));
    input.current?.focus();
  };

  const filled = code.filter(Boolean).length;
  const showCaret = focused && !locked && !code[active];
  const spoken = status === 'success' ? 'Code accepted' : status === 'error' ? (typeof message === 'string' ? message : 'Code rejected') : `${filled} of ${length} digits entered`;
  return (
    <div className={cx('slots', className)} data-status={status} data-disabled={disabled || undefined}>
      <div className="slots-row" ref={row} onMouseDown={(e) => { e.preventDefault(); const box = (e.target as HTMLElement).closest('.slot'); const boxes = row.current ? Array.from(row.current.querySelectorAll('.slot')) : []; pick(box ? boxes.indexOf(box) : active); }}>
        <input ref={input} className="slots-in" type="text" inputMode="numeric" autoComplete="one-time-code" aria-label={label} maxLength={length} defaultValue="" disabled={disabled} readOnly={status === 'success'} autoFocus={autoFocus}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} onKeyDown={onKey} onPaste={onPaste} onInput={onInput} />
        {code.map((d, i) => (
          <span key={i} className={cx('slot', d && 'filled', focused && !locked && i === active && 'active')} style={{ ['--k' as string]: status === 'error' ? filled - 1 - i : i }} aria-hidden="true">
            <i className="slot-fill" /><b className="slot-d">{d}</b>
          </span>
        ))}
        <span className="slots-wash" aria-hidden="true"><Icon name="check" /></span>
        <i className={cx('slots-caret', showCaret && 'on')} style={{ ['--x' as string]: `${active * slotStep}px` }} aria-hidden="true" />
      </div>
      {message != null ? <span className="slots-msg" aria-hidden="true">{message}</span> : null}
      <span className="visually-hidden" role="status" aria-live="polite">{spoken}</span>
    </div>
  );
}

/* ───────── Stepper ───────── */

export type StepProps = { title: string; description?: string; children?: ReactNode };
/** One step of a Stepper; only read by its parent. */
export function Step(_props: StepProps): ReactElement | null { return null; }

/**
 * The setup flow: a track of step tiles with a glider behind the current one, one pane at a time,
 * Back and Continue in the footer (Complete on the last step). Panes slide in the direction of
 * travel. Reached steps can be clicked back to; `linear` keeps future steps closed.
 */
export function Stepper({ children, label, step, defaultStep = 1, linear = true, nextDisabled, onStepChange, onComplete, rail, tight, backLabel = 'Back', nextLabel = 'Continue', completeLabel = 'Complete', done, className }: {
  children: ReactNode; label?: string; /** 1-based; controlled when given */ step?: number; defaultStep?: number; linear?: boolean; nextDisabled?: boolean;
  onStepChange?: (step: number) => void; onComplete?: () => void; rail?: boolean; tight?: boolean;
  backLabel?: string; nextLabel?: string; completeLabel?: string; /** What to show once complete (default: "All set"). */ done?: ReactNode; className?: string;
}): ReactElement {
  const reduce = useReducedMotion();
  const steps = Children.toArray(children).filter((c): c is ReactElement<StepProps> => isValidElement(c) && c.type === Step).map((c) => c.props);
  const n = steps.length;
  const [own, setOwn] = useState(defaultStep);
  const current = Math.max(1, Math.min(n + 1, step ?? own));
  const [dir, setDir] = useState(1);
  const [reached, setReached] = useState(current);
  const track = useRef<HTMLDivElement>(null);
  const segs = useRef<Array<HTMLButtonElement | null>>([]);
  const [glide, setGlide] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const complete = current > n;

  const go = (to: number) => {
    const next = Math.max(1, Math.min(n + 1, to));
    if (next === current) return;
    setDir(next > current ? 1 : -1);
    setReached((r) => Math.max(r, next));
    if (step === undefined) setOwn(next);
    if (next <= n) onStepChange?.(next);
    else onComplete?.();
  };

  useLayoutEffect(() => {
    const el = segs.current[Math.min(current, n) - 1];
    if (!el) return undefined;
    const place = () => setGlide({ x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight });
    place();
    if (typeof ResizeObserver === 'undefined' || !track.current) return undefined;
    const ro = new ResizeObserver(place);
    ro.observe(track.current);
    return () => ro.disconnect();
  }, [current, n]);

  const pane = steps[current - 1];
  return (
    <div className={cx('stepper', rail && 'rail', tight && 'tight', className)} data-dir={dir} role="group" aria-label={label}>
      <div className="stepper-head">
        <div className="stepper-track" role="tablist" aria-label={label} ref={track}>
          <span className={cx('stepper-glide', !complete && 'on')} aria-hidden="true" style={{ transform: `translate(${glide.x}px, ${glide.y}px)`, width: glide.w, height: glide.h }} />
          {steps.map((s, i) => {
            const k = i + 1;
            const status = complete || k < current ? 'complete' : k === current ? 'active' : 'upcoming';
            const openable = !complete && k !== current && (linear ? k <= reached : true);
            return (
              <button key={s.title} ref={(el) => { segs.current[i] = el; }} type="button" className="stepper-seg" role="tab" data-status={status} aria-selected={k === current} aria-current={k === current ? 'step' : undefined} disabled={!openable} onClick={() => go(k)}>
                <span className="stepper-badge" aria-hidden="true">{status === 'complete' ? <Icon name="check" /> : k}</span>
                <span className="stepper-text"><span className="stepper-title">{s.title}</span>{s.description ? <span className="stepper-desc">{s.description}</span> : null}</span>
                <span className="visually-hidden">{`Step ${k} of ${n}, ${status === 'complete' ? 'complete' : status === 'active' ? 'current' : 'upcoming'}`}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="stepper-body">
        <div className="stepper-view">
          <div key={complete ? 'done' : current} className={cx('stepper-pane', !reduce && 'in')} role="tabpanel" tabIndex={-1}>
            {complete ? (done ?? <div className="stepper-done"><Icon name="check" /><b>All set</b></div>) : pane?.children}
          </div>
        </div>
        <div className={cx('stepper-foot', complete && 'shut')} aria-hidden={complete || undefined}>
          <div>
            <div className="row-wrap">
              <Button className={cx(current <= 1 && 'hidden')} icon="back" onClick={() => go(current - 1)} tabIndex={current <= 1 ? -1 : undefined}>{backLabel}</Button>
              <Button variant="primary" disabled={nextDisabled} onClick={() => go(current + 1)}>{current === n ? completeLabel : nextLabel}<Icon name={current === n ? 'check' : 'arrow'} /></Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
