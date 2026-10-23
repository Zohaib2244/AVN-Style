import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { DailyTable, TrendLine, fillDays, trendPoints } from '../src/activity';
import { addDays } from '../src/daterange';

describe('day helpers', () => {
  it('addDays crosses month ends in UTC', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });
  it('fillDays gives one entry per day in the range with zeros filled in', () => {
    expect(fillDays([{ day: '2026-10-02', value: 5 }], { from: '2026-10-01', to: '2026-10-03' })).toEqual([
      { day: '2026-10-01', value: 0 },
      { day: '2026-10-02', value: 5 },
      { day: '2026-10-03', value: 0 },
    ]);
  });
});

describe('DailyTable', () => {
  const range = { from: '2026-10-20', to: '2026-10-23' };

  it('renders the total line, one row per day in the range (zeros filled in) and bars relative to the peak', () => {
    render(<DailyTable days={[{ day: '2026-10-21', value: 1200 }, { day: '2026-10-23', value: 300 }]} total={1500} range={range} />);
    expect(screen.getByText('1,500')).toBeInTheDocument();
    expect(screen.getByText(/events · .* → .* · 4 days/)).toBeInTheDocument();
    const rows = within(screen.getByRole('table')).getAllByRole('row').slice(1);
    expect(rows.map((r) => r.querySelector('td')!.textContent)).toEqual(['2026-10-20', '2026-10-21', '2026-10-22', '2026-10-23']);
    expect(rows.map((r) => r.querySelectorAll('td')[1]!.textContent)).toEqual(['0', '1,200', '0', '300']);
    const bars = screen.getAllByRole('progressbar') as HTMLProgressElement[];
    expect(bars).toHaveLength(4);
    expect(bars.every((b) => b.max === 1200)).toBe(true);
    expect(bars[1]!.value).toBe(1200);
    expect(bars[3]).toHaveAccessibleName('300 events on 2026-10-23');
    // The bar column's header is read by screen readers but not shown.
    expect(screen.getByText('Relative volume')).toHaveClass('visually-hidden');
  });

  it('a single day reads "1 day" with no arrow', () => {
    render(<DailyTable days={[{ day: '2026-10-20', value: 2 }]} total={2} range={{ from: '2026-10-20', to: '2026-10-20' }} />);
    expect(screen.getByText(/events · [^→]* · 1 day$/)).toBeInTheDocument();
  });

  it('shows the empty state instead of the table when the total is 0', () => {
    render(<DailyTable days={[]} total={0} range={range} />);
    expect(screen.queryByRole('table')).toBeNull();
    expect(screen.getByText('No events in this range.')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('uses the unit in the header, the empty text and the bar names', () => {
    render(<DailyTable days={[{ day: '2026-10-20', value: 7 }]} total={7} unit="players" range={{ from: '2026-10-20', to: '2026-10-20' }} />);
    expect(screen.getByRole('columnheader', { name: 'Players' })).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAccessibleName('7 players on 2026-10-20');
    render(<DailyTable days={[]} total={0} unit="players" range={range} emptyText="Nobody played." />);
    expect(screen.getByText('Nobody played.')).toBeInTheDocument();
  });
});

describe('TrendLine', () => {
  it('scales from 0 so rows compare, and marks the last point', () => {
    const pts = trendPoints([0, 5, 10], 90, 22);
    expect(pts[0]).toEqual([0, 20]); // 0 sits on the baseline, not at the top of the box
    expect(pts[2]).toEqual([90, 2]);
    // The same value is the same height in every row: a flat row of 5s is not drawn as a full-height line.
    expect(trendPoints([5, 5], 90, 22).map((p) => p[1])).toEqual([2, 2]);
    expect(trendPoints([5, 10], 90, 22)[0]![1]).toBe(11);
    const { container } = render(<TrendLine values={[1, 3, 2]} label="Events per day" />);
    expect(screen.getByRole('img', { name: 'Events per day' })).toBeInTheDocument();
    const circle = container.querySelector('circle')!;
    expect(circle.getAttribute('cx')).toBe('90.0');
    expect(trendPoints([1, 3, 2]).length).toBe(3);
  });
  it('renders nothing for an empty series and is decorative without a label', () => {
    const { container } = render(<TrendLine values={[]} />);
    expect(container.querySelector('svg')).toBeNull();
    const { container: c2 } = render(<TrendLine values={[1, 2]} />);
    expect(c2.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });
});
