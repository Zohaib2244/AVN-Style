import type { ReactElement, ReactNode } from 'react';
import { cx, fmt } from './cx';
import { EmptyState } from './primitives';
import { addDays, type DayRange } from './daterange';

/* ───────── Day helpers (ISO `YYYY-MM-DD`, UTC) ───────── */


/** "Mon, Oct 20, 2026" for an ISO day. */
export function prettyDay(day: string): string {
  return new Date(`${day}T00:00:00Z`).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

export type DayValue = { day: string; value: number };

/** One entry per day from `range.from` to `range.to` inclusive, zeros where `days` has no entry. */
export function fillDays(days: DayValue[], range: DayRange): DayValue[] {
  const counts = new Map(days.map((d) => [d.day, d.value]));
  const out: DayValue[] = [];
  for (let day = range.from; day <= range.to; day = addDays(day, 1)) out.push({ day, value: counts.get(day) || 0 });
  return out;
}

/* ───────── Per-day table: a total line, then one row per day with a relative bar ───────── */

/**
 * Activity for a range of days: the total in a sentence, then one row per day in the range (missing days
 * read 0) with a bar relative to the busiest day. Data only: the app composes it with its date picker.
 */
export function DailyTable({ days, total, unit = 'events', range, emptyText = `No ${unit} in this range.`, emptyArt }: { days: DayValue[]; total: number; unit?: string; range: DayRange; emptyText?: string; emptyArt?: ReactNode }): ReactElement {
  const rows = fillDays(days, range);
  const peak = Math.max(1, ...rows.map((d) => d.value));
  const span = rows.length;
  const Unit = unit.charAt(0).toUpperCase() + unit.slice(1);
  return (
    <div className="daily">
      <div className="range-total">
        <strong>{fmt(total)}</strong>
        <span>{unit} · {prettyDay(range.from)}{span > 1 ? ` → ${prettyDay(range.to)}` : ''} · {span} day{span === 1 ? '' : 's'}</span>
      </div>
      {total ? (
        <div className="daily-wrap">
          <table className="t">
            <thead>
              <tr>
                <th>Day</th>
                <th className="num">{Unit}</th>
                <th className="daily-bar"><span className="visually-hidden">Relative volume</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => (
                <tr key={d.day}>
                  <td>{d.day}</td>
                  <td className="num">{fmt(d.value)}</td>
                  <td className="daily-bar"><progress className="rel" max={peak} value={d.value} aria-label={`${fmt(d.value)} ${unit} on ${d.day}`} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState art={emptyArt} title={emptyText} />
      )}
    </div>
  );
}

/* ───────── Trend line: a tiny per-day line for dense tables (scale from 0, last point marked) ───────── */

export const TREND_WIDTH = 90;
export const TREND_HEIGHT = 22;

/** Polyline points for `values` in the trend box: x left to right, y from 0 at the bottom (so rows compare). */
export function trendPoints(values: number[], width = TREND_WIDTH, height = TREND_HEIGHT): Array<[number, number]> {
  const peak = Math.max(1, ...values);
  const step = values.length > 1 ? width / (values.length - 1) : 0;
  return values.map((value, index) => [index * step, height - 2 - ((height - 4) * value) / peak]);
}

/**
 * Unlike `Sparkline` (which fits each series to its own min→max for the KPI corner), the scale starts at 0
 * and the box is inline, so two rows of a table compare at a glance. The last point is marked.
 */
export function TrendLine({ values, label, className }: { values: number[]; label?: string; className?: string }): ReactElement | null {
  if (!values.length) return null;
  const points = trendPoints(values);
  const last = points[points.length - 1]!;
  return (
    <svg className={cx('trend', className)} viewBox={`0 0 ${TREND_WIDTH} ${TREND_HEIGHT}`} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <polyline points={points.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')} />
      <circle cx={last[0].toFixed(1)} cy={last[1].toFixed(1)} r={2} />
    </svg>
  );
}
