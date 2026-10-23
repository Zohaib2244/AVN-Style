import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Calendar, ConfirmDelete, Drawer, MultiSelect, Popover, SingleSelect, confirmsName, monthGrid, pickDay, sameDay } from '../src/overlays';
import { Button } from '../src/primitives';

describe('typed confirmation', () => {
  it('confirms only the exact name (trimmed, any case)', () => {
    expect(confirmsName('  nut sort PUZZLE ', 'Nut Sort Puzzle')).toBe(true);
    expect(confirmsName('nut sort', 'Nut Sort Puzzle')).toBe(false);
    expect(confirmsName('', 'x')).toBe(false);
  });
  it('the delete button stays disabled until the name is typed', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<ConfirmDelete open onClose={() => {}} onConfirm={onConfirm} name="Nut Sort Puzzle" title="Delete all data?" consequences={['3,235 events', '2 saved funnels']} />);
    const del = screen.getByRole('button', { name: 'Delete everything' });
    expect(del).toBeDisabled();
    expect(screen.getByText('3,235 events')).toBeInTheDocument();
    await user.type(screen.getByLabelText(/Type/), 'nut sort puzzle');
    expect(del).toBeEnabled();
    await user.click(del);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});

describe('Drawer', () => {
  it('shows title and content, and Esc closes it', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Drawer open onClose={onClose} title="Level 12" subtitle="Nut Sort Puzzle" footer={<Button>Compare</Button>}><p>details</p></Drawer>);
    expect(screen.getByRole('dialog', { name: 'Level 12' })).toBeInTheDocument();
    expect(screen.getByText('details')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });
  it('shows a back arrow only when asked', () => {
    const { rerender } = render(<Drawer open onClose={() => {}} title="A"><i /></Drawer>);
    expect(screen.queryByRole('button', { name: 'Back' })).toBeNull();
    rerender(<Drawer open onClose={() => {}} onBack={() => {}} title="A"><i /></Drawer>);
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
  });
  it('renders nothing when closed', () => {
    render(<Drawer open={false} onClose={() => {}} title="A"><i /></Drawer>);
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

describe('pickers', () => {
  it('MultiSelect toggles values per group and shows counts', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<MultiSelect groups={[{ label: 'Environment', options: [{ value: 'production', label: 'production', count: 1468 }, { value: 'editor', label: 'editor', count: 1 }] }]} value={{ Environment: ['editor'] }} onChange={onChange} />);
    expect(screen.getByText('1,468')).toBeInTheDocument();
    expect(screen.getByRole('menuitemcheckbox', { name: /editor/ })).toHaveAttribute('aria-checked', 'true');
    await user.click(screen.getByRole('menuitemcheckbox', { name: /production/ }));
    expect(onChange).toHaveBeenCalledWith('Environment', ['editor', 'production']);
    await user.click(screen.getByRole('menuitemcheckbox', { name: /editor/ }));
    expect(onChange).toHaveBeenLastCalledWith('Environment', []);
  });
  it('MultiSelect pinned toggle and Clear / Done', async () => {
    const user = userEvent.setup();
    const pin = vi.fn(), clear = vi.fn(), done = vi.fn();
    render(<MultiSelect groups={[]} value={{}} onChange={() => {}} pinned={{ label: 'Hide editor & development data', checked: true, onChange: pin }} onClear={clear} onDone={done} />);
    await user.click(screen.getByRole('menuitemcheckbox', { name: /Hide editor/ }));
    expect(pin).toHaveBeenCalledWith(false);
    await user.click(screen.getByRole('button', { name: 'Clear' }));
    await user.click(screen.getByRole('button', { name: 'Done' }));
    expect(clear).toHaveBeenCalled();
    expect(done).toHaveBeenCalled();
  });
  it('SingleSelect marks the current option and picks', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SingleSelect value="30" onChange={onChange} options={[{ value: '7', label: 'Last 7 days', hint: 'Oct 16 – Oct 22' }, { value: '30', label: 'Last 30 days' }]} />);
    expect(screen.getByRole('menuitemradio', { name: /Last 30 days/ })).toHaveAttribute('aria-checked', 'true');
    await user.click(screen.getByRole('menuitemradio', { name: /Last 7 days/ }));
    expect(onChange).toHaveBeenCalledWith('7');
  });
  it('Popover closes on Esc and on an outside click', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const anchor = createRef<HTMLButtonElement>();
    render(<><button ref={anchor}>anchor</button><p>outside</p><Popover open onClose={onClose} anchor={anchor}><span>content</span></Popover></>);
    expect(screen.getByText('content')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
    await user.click(screen.getByText('outside'));
    expect(onClose).toHaveBeenCalledTimes(2);
    await user.click(screen.getByText('anchor'));
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});

describe('date range', () => {
  const d = (y: number, m: number, day: number) => new Date(y, m, day);
  it('two taps make a range; the first sets the start', () => {
    const a = pickDay({ start: null, end: null }, d(2026, 9, 10));
    expect(a.complete).toBe(false);
    const b = pickDay(a, d(2026, 9, 15));
    expect(b.complete).toBe(true);
    expect(sameDay(b.start, d(2026, 9, 10)) && sameDay(b.end, d(2026, 9, 15))).toBe(true);
  });
  it('an earlier second tap swaps the ends', () => {
    const a = pickDay({ start: null, end: null }, d(2026, 9, 15));
    const b = pickDay(a, d(2026, 9, 3));
    expect(sameDay(b.start, d(2026, 9, 3)) && sameDay(b.end, d(2026, 9, 15))).toBe(true);
  });
  it('a tap after a complete range starts over', () => {
    const done = { start: d(2026, 9, 1), end: d(2026, 9, 5) };
    const next = pickDay(done, d(2026, 9, 20));
    expect(next.complete).toBe(false);
    expect(next.end).toBeNull();
  });
  it('the grid is 42 days, Monday first', () => {
    const g = monthGrid(2026, 9); // October 2026 starts on a Thursday
    expect(g).toHaveLength(42);
    expect(g[0]!.getDay()).toBe(1);
    expect(sameDay(g[3], d(2026, 9, 1))).toBe(true);
  });
  it('the calendar reports the range after two taps and moves by month', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Calendar value={null} today={d(2026, 9, 22)} onChange={onChange} />);
    expect(screen.getByText('OCTOBER 2026')).toBeInTheDocument();
    await user.click(screen.getByLabelText(d(2026, 9, 10).toDateString()));
    expect(screen.getByText('Now pick the end date')).toBeInTheDocument();
    await user.click(screen.getByLabelText(d(2026, 9, 14).toDateString()));
    expect(onChange).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', { name: 'Next month' }));
    expect(screen.getByText('NOVEMBER 2026')).toBeInTheDocument();
  });
});
