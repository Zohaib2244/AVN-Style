// Date range control: quick presets (Today, Last 7/30/90 days…) and a calendar for any From–To days.
// Compact variant: one row (preset menu, the days, ‹ › steps that move the range by its own length).
// Full variant: every preset as a pressed button, then the days with the same steps.
// Days are ISO `YYYY-MM-DD` strings; the calendar is the package `Calendar` (Monday first).
import { useCallback, useMemo, useRef, useState, type ReactElement } from 'react';
import { cx } from './cx';
import { Icon } from './icons';
import { Calendar, Popover, SingleSelect } from './overlays';

export type DayRange = { from: string; to: string; preset?: string };
export type Preset = { key: string; label: string; range: (today: string) => [string, string] };

/* ───────── ISO day helpers ───────── */

/** Today as `YYYY-MM-DD` in the local time zone. */
export function todayISO(now: Date = new Date()): string {
  return dateToDay(now);
}
export const dayToDate = (value: string): Date => { const [y, m, d] = value.split('-').map(Number); return new Date(y!, (m ?? 1) - 1, d ?? 1); };
export const dateToDay = (date: Date): string => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
export const addDays = (value: string, days: number): string => { const date = new Date(`${value}T00:00:00Z`); date.setUTCDate(date.getUTCDate() + days); return date.toISOString().slice(0, 10); };
export const daysBetween = (from: string, to: string): number => Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000);
const monthStart = (value: string): string => `${value.slice(0, 8)}01`;
const monthEnd = (value: string): string => { const date = new Date(`${value}T00:00:00Z`); return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).toISOString().slice(0, 10); };
const shiftMonth = (value: string, months: number): string => { const date = new Date(`${value}T00:00:00Z`); return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1)).toISOString().slice(0, 10); };
/** "Oct 16". */
export const shortDay = (value: string): string => new Date(`${value}T00:00:00Z`).toLocaleDateString('en-US', { day: 'numeric', month: 'short', timeZone: 'UTC' });

/* ───────── Presets ───────── */

export const PRESETS: Preset[] = [
  { key: 'today', label: 'Today', range: (t) => [t, t] },
  { key: 'yesterday', label: 'Yesterday', range: (t) => [addDays(t, -1), addDays(t, -1)] },
  { key: '7', label: 'Last 7 days', range: (t) => [addDays(t, -6), t] },
  { key: '30', label: 'Last 30 days', range: (t) => [addDays(t, -29), t] },
  { key: '90', label: 'Last 90 days', range: (t) => [addDays(t, -89), t] },
  { key: 'month', label: 'This month', range: (t) => [monthStart(t), t] },
  { key: 'lastmonth', label: 'Last month', range: (t) => { const first = shiftMonth(t, -1); return [first, monthEnd(first)]; } },
];
const DEFAULT_PRESET = '7';

export const presetLabel = (preset: string | undefined): string => (preset === 'custom' || !preset ? 'Custom days' : PRESETS.find((p) => p.key === preset)?.label || 'Custom days');

/** The range a preset resolves to; `saved` is used for 'custom' (or an unknown preset); otherwise the default preset. */
export function resolveRange(preset: string = DEFAULT_PRESET, saved: DayRange | null = null, today: string = todayISO()): DayRange {
  const found = PRESETS.find((p) => p.key === preset);
  if (found && preset !== 'custom') { const [from, to] = found.range(today); return { from, to, preset }; }
  if (saved) return { from: saved.from, to: saved.to, preset: 'custom' };
  const [from, to] = PRESETS.find((p) => p.key === DEFAULT_PRESET)!.range(today);
  return { from, to, preset: DEFAULT_PRESET };
}

/** "Oct 16 – Oct 22", or one day. */
export const rangeText = (range: Pick<DayRange, 'from' | 'to'>): string => (range.from === range.to ? shortDay(range.from) : `${shortDay(range.from)} – ${shortDay(range.to)}`);

/** Moves the range forward (+1) or back (−1) by its own length; the result is a custom range. */
export function shiftRange(range: DayRange, direction: 1 | -1): DayRange {
  const span = daysBetween(range.from, range.to) + 1;
  return { from: addDays(range.from, direction * span), to: addDays(range.to, direction * span), preset: 'custom' };
}

/* ───────── Component ───────── */

export type DateRangeProps = {
  value: DayRange;
  onChange: (range: DayRange) => void;
  /** One row: preset menu, the days, ‹ › steps. Default is the full variant (preset row + days + steps). */
  compact?: boolean;
  /** Accessible name of the preset control. */
  label?: string;
  /** ISO day the presets resolve against (defaults to today). */
  today?: string;
};

export function DateRange({ value, onChange, compact = false, label = 'Date range', today = todayISO() }: DateRangeProps): ReactElement {
  const [menu, setMenu] = useState(false);
  const [calendar, setCalendar] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const daysButton = useRef<HTMLButtonElement>(null);
  const closeMenu = useCallback(() => setMenu(false), []);
  const closeCalendar = useCallback(() => setCalendar(false), []);

  const choose = (key: string) => {
    if (key === 'custom') { setCalendar(true); return; }
    const preset = PRESETS.find((p) => p.key === key);
    if (!preset) return;
    const [from, to] = preset.range(today);
    onChange({ from, to, preset: key });
  };
  const step = (direction: 1 | -1) => onChange(shiftRange(value, direction));

  const options = useMemo(() => [
    ...PRESETS.map((p) => { const [from, to] = p.range(today); return { value: p.key, label: p.label, hint: rangeText({ from, to }) }; }),
    { value: 'custom', label: 'Custom range…' },
  ], [today]);

  const steps = (side: 'prev' | 'next') => (
    <button type="button" className="btn sm range-nav" aria-label={side === 'prev' ? 'Previous range' : 'Next range'} onClick={() => step(side === 'prev' ? -1 : 1)}>{side === 'prev' ? '‹' : '›'}</button>
  );
  const days = (
    <button ref={daysButton} type="button" className="select mono range-days" aria-label="Selected days" aria-haspopup="dialog" aria-expanded={calendar} onClick={() => setCalendar((o) => !o)}>{rangeText(value)}</button>
  );
  const picker = (
    <Popover open={calendar} onClose={closeCalendar} anchor={daysButton} width={300} className="range-pop">
      <Calendar value={{ start: dayToDate(value.from), end: dayToDate(value.to) }} today={dayToDate(today)} onChange={(r) => onChange({ from: dateToDay(r.start), to: dateToDay(r.end), preset: 'custom' })} />
      <div className="pop-foot"><span className="muted">{rangeText(value)}</span><button type="button" className="btn sm" onClick={closeCalendar}>Done</button></div>
    </Popover>
  );

  if (compact) {
    return (
      <div className={cx('range', 'range-compact')}>
        <button ref={menuButton} type="button" className="select" aria-haspopup="menu" aria-expanded={menu} aria-label={label} onClick={() => setMenu((o) => !o)}>{presetLabel(value.preset)}<Icon name="caret" /></button>
        {steps('prev')}
        {days}
        {steps('next')}
        <Popover open={menu} onClose={closeMenu} anchor={menuButton} width={280}>
          <SingleSelect options={options} value={value.preset || 'custom'} onChange={(key) => { closeMenu(); choose(key); }} />
        </Popover>
        {picker}
      </div>
    );
  }
  return (
    <div className="range">
      <div className="range-modes" role="group" aria-label={label}>
        {PRESETS.map((p) => <button key={p.key} type="button" className="btn sm" aria-pressed={value.preset === p.key} onClick={() => choose(p.key)}>{p.label}</button>)}
        <button type="button" className="btn sm" aria-pressed={value.preset === 'custom'} onClick={() => choose('custom')}>Custom</button>
      </div>
      <div className="range-body">
        {steps('prev')}
        {days}
        {steps('next')}
      </div>
      {picker}
    </div>
  );
}
