import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateRange, PRESETS, rangeText, resolveRange, shiftRange } from '../src/daterange';
import { FilterBar } from '../src/cards';

const TODAY = '2026-10-22'; // a Thursday

describe('presets', () => {
  const by = (key: string) => resolveRange(key, null, TODAY);
  it('resolve to the right days for a fixed today', () => {
    expect(by('today')).toEqual({ from: '2026-10-22', to: '2026-10-22', preset: 'today' });
    expect(by('yesterday')).toEqual({ from: '2026-10-21', to: '2026-10-21', preset: 'yesterday' });
    expect(by('7')).toEqual({ from: '2026-10-16', to: '2026-10-22', preset: '7' });
    expect(by('30')).toEqual({ from: '2026-09-23', to: '2026-10-22', preset: '30' });
    expect(by('90')).toEqual({ from: '2026-07-25', to: '2026-10-22', preset: '90' });
    expect(by('month')).toEqual({ from: '2026-10-01', to: '2026-10-22', preset: 'month' });
    expect(by('lastmonth')).toEqual({ from: '2026-09-01', to: '2026-09-30', preset: 'lastmonth' });
  });
  it('custom keeps the saved days; an unknown preset without saved days falls back to last 7', () => {
    expect(resolveRange('custom', { from: '2026-01-01', to: '2026-01-05' }, TODAY)).toEqual({ from: '2026-01-01', to: '2026-01-05', preset: 'custom' });
    expect(resolveRange('nope', null, TODAY)).toEqual({ from: '2026-10-16', to: '2026-10-22', preset: '7' });
  });
  it('every preset has a label and rangeText reads naturally', () => {
    expect(PRESETS.map((p) => p.label)).toContain('Last 30 days');
    expect(rangeText({ from: '2026-10-16', to: '2026-10-22' })).toBe('Oct 16 – Oct 22');
    expect(rangeText({ from: '2026-10-22', to: '2026-10-22' })).toBe('Oct 22');
  });
  it('shiftRange moves by the range length (inclusive) and becomes custom', () => {
    expect(shiftRange({ from: '2026-10-16', to: '2026-10-22', preset: '7' }, -1)).toEqual({ from: '2026-10-09', to: '2026-10-15', preset: 'custom' });
    expect(shiftRange({ from: '2026-10-22', to: '2026-10-22' }, 1)).toEqual({ from: '2026-10-23', to: '2026-10-23', preset: 'custom' });
  });
});

describe('DateRange', () => {
  const value = { from: '2026-10-16', to: '2026-10-22', preset: '7' };
  it('compact ‹ › shift the range by its own length', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DateRange compact value={value} onChange={onChange} today={TODAY} />);
    expect(screen.getByRole('button', { name: 'Selected days' })).toHaveTextContent('Oct 16 – Oct 22');
    await user.click(screen.getByRole('button', { name: 'Previous range' }));
    expect(onChange).toHaveBeenLastCalledWith({ from: '2026-10-09', to: '2026-10-15', preset: 'custom' });
    await user.click(screen.getByRole('button', { name: 'Next range' }));
    expect(onChange).toHaveBeenLastCalledWith({ from: '2026-10-23', to: '2026-10-29', preset: 'custom' });
  });
  it('the compact preset menu lists presets with their span and applies one', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DateRange compact value={value} onChange={onChange} today={TODAY} />);
    await user.click(screen.getByRole('button', { name: 'Date range' }));
    expect(screen.getByRole('menuitemradio', { name: /Last 7 days/ })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByText('Sep 23 – Oct 22')).toBeInTheDocument();
    await user.click(screen.getByRole('menuitemradio', { name: /Last 30 days/ }));
    expect(onChange).toHaveBeenCalledWith({ from: '2026-09-23', to: '2026-10-22', preset: '30' });
    expect(screen.queryByRole('menu')).toBeNull();
  });
  it('"Custom range…" shows the calendar and two taps call onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DateRange compact value={value} onChange={onChange} today={TODAY} />);
    await user.click(screen.getByRole('button', { name: 'Date range' }));
    await user.click(screen.getByRole('menuitemradio', { name: /Custom range/ }));
    expect(screen.getByText('OCTOBER 2026')).toBeInTheDocument();
    await user.click(screen.getByLabelText(new Date(2026, 9, 5).toDateString()));
    expect(onChange).not.toHaveBeenCalled();
    await user.click(screen.getByLabelText(new Date(2026, 9, 9).toDateString()));
    expect(onChange).toHaveBeenCalledWith({ from: '2026-10-05', to: '2026-10-09', preset: 'custom' });
  });
  it('the full variant has a pressed preset row and the days', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DateRange value={value} onChange={onChange} today={TODAY} />);
    expect(screen.getByRole('button', { name: 'Last 7 days' })).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: 'Today' }));
    expect(onChange).toHaveBeenCalledWith({ from: TODAY, to: TODAY, preset: 'today' });
    await user.click(screen.getByRole('button', { name: 'Custom' }));
    expect(screen.getByText('OCTOBER 2026')).toBeInTheDocument();
  });
});

describe('filter chips', () => {
  it('each applied chip is removable', async () => {
    const user = userEvent.setup();
    const remove = vi.fn();
    render(<FilterBar range="Last 7 days" dates="Oct 16 – Oct 22" onRange={() => {}} onDates={() => {}} tz="local" onTz={() => {}} filterCount={1} onFilters={() => {}} density="comfort" onDensity={() => {}}
      chips={[{ key: 'country:US', label: 'Country: US', onRemove: remove }, { key: 'platform:ios', label: 'Platform: iOS', onRemove: () => {} }]} />);
    await user.click(screen.getByRole('button', { name: 'Remove Country: US' }));
    expect(remove).toHaveBeenCalledTimes(1);
  });
});
