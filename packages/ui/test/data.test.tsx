import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CompareTable, FunnelHeadline, FunnelResult, HeatStrip, biggestDrop, compareSummary, dropChange, dropToNext, duration, steepest, timingText, type CompareRow } from '../src/data';

const starts = [260, 232, 210, 193, 176, 160, 140, 121, 108, 96, 82, 65, 42];

describe('level maths', () => {
  it('drop to next is the share who never started the next level', () => {
    expect(dropToNext([100, 80], 0)).toBeCloseTo(20);
    expect(dropToNext([100, 80], 1)).toBeNull();
    expect(dropToNext([0, 5], 0)).toBeNull();
  });
  it('steepest finds the biggest drops, steepest first', () => {
    expect(steepest(starts, 2)).toEqual([11, 10]);
  });
  it('biggestDrop is the step after which most players are lost', () => {
    expect(biggestDrop([260, 248, 221, 209, 161])).toBe(3);
    expect(biggestDrop([10])).toBe(-1);
    expect(biggestDrop([])).toBe(-1);
  });
});

describe('FunnelResult', () => {
  const steps = [{ label: 'first_open', count: 260, median: '12s' }, { label: 'tutorial', count: 248 }, { label: 'level 1', count: 209 }, { label: 'level 5', count: 161 }];
  it('shows share of step 1, players lost, and marks the biggest drop', () => {
    render(<FunnelResult steps={steps} />);
    expect(screen.getByText(/12 players left \(4\.6%\) · median 12s to the next step/)).toBeInTheDocument();
    expect(screen.getByText(/48 players left \(23\.0%\).*biggest drop/)).toBeInTheDocument();
    expect(document.querySelector('.fdrop.worst')).not.toBeNull();
    expect(document.querySelectorAll('.frow')).toHaveLength(4);
  });
  it('"See who" reports the step', async () => {
    const user = userEvent.setup();
    const onSeeWho = vi.fn();
    render(<FunnelResult steps={steps} onSeeWho={onSeeWho} />);
    await user.click(screen.getAllByRole('button', { name: 'See who' })[2]!);
    expect(onSeeWho).toHaveBeenCalledWith(2);
  });
  it('splits bars and shows a legend when broken down', () => {
    render(<FunnelResult steps={[{ label: 'a', count: 100, firstShare: 0.7 }, { label: 'b', count: 50, firstShare: 0.6 }]} segments={['Android', 'iOS']} />);
    expect(screen.getByText('Android')).toBeInTheDocument();
    expect(document.querySelectorAll('.fbar i.b2')).toHaveLength(2);
    expect(screen.getByText(/70 \/ 30/)).toBeInTheDocument();
  });
  it('times render as a median line with the fuller numbers on hover and for screen readers', () => {
    const times = { count: 240, median: 12, average: 20.4, min: 3, max: 125, p90: 48 };
    expect(timingText(times)).toEqual({ line: 'median 12s to the next step', detail: '240 players · average 20s · fastest 3s · slowest 2m 05s · 90% within 48s' });
    expect(duration(3700)).toBe('1h 01m');
    render(<FunnelResult steps={[{ label: 'first_open', count: 260, times }, { label: 'tutorial', count: 248 }]} />);
    const ft = document.querySelector('.fdrop .ft') as HTMLElement;
    expect(ft.title).toBe('240 players · average 20s · fastest 3s · slowest 2m 05s · 90% within 48s');
    expect(screen.getByText(/12 players left \(4\.6%\)/)).toHaveTextContent(/median 12s to the next step/);
    expect(ft.querySelector('.visually-hidden')).toHaveTextContent(/average 20s/);
  });
  it('times win over a preformatted median and a null times shows nothing', () => {
    render(<FunnelResult steps={[{ label: 'a', count: 10, median: '9s', times: null }, { label: 'b', count: 5 }]} />);
    expect(screen.getByText(/5 players left/)).toHaveTextContent(/median 9s/);
    expect(document.querySelector('.ft')).toBeNull();
  });
  it('the biggest drop carries data-worst', () => {
    render(<FunnelResult steps={steps} />);
    const worst = document.querySelector('[data-worst]');
    expect(worst).not.toBeNull();
    expect(worst!.classList.contains('worst')).toBe(true);
    expect(document.querySelectorAll('[data-worst]')).toHaveLength(1);
  });
  it('lists who stopped here as buttons (onOpenPlayer) or app links (renderLink), with "n of lost"', async () => {
    const user = userEvent.setup();
    const onOpenPlayer = vi.fn();
    const stopped = [{ id: 'p1', label: 'ab12…', meta: 'last step 3 Oct' }, { id: 'p2', label: 'cd34…' }];
    const { unmount } = render(<FunnelResult steps={[{ label: 'a', count: 100, stopped }, { label: 'b', count: 60 }]} onOpenPlayer={onOpenPlayer} />);
    expect(screen.getByText('Stopped here:')).toBeInTheDocument();
    expect(screen.getByText('2 of 40')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /ab12/ }));
    expect(onOpenPlayer).toHaveBeenCalledWith('p1');
    unmount();
    const withHref = stopped.map((p) => ({ ...p, href: `/players/${p.id}` }));
    render(<FunnelResult steps={[{ label: 'a', count: 100, stopped: withHref }, { label: 'b', count: 60 }]} renderLink={(item, children) => <a href={item.href} data-router="yes">{children}</a>} />);
    expect(screen.getByRole('link', { name: /cd34/ })).toHaveAttribute('data-router', 'yes');
    expect(screen.getByRole('link', { name: /ab12/ })).toHaveAttribute('href', '/players/p1');
  });
  it('segmentsOf splits bars into N parts with one legend entry each; two-segment behaviour is unchanged', () => {
    render(<FunnelResult steps={[{ label: 'a', count: 100, shares: [0.5, 0.3, 0.2] }, { label: 'b', count: 50, shares: [0.4, 0.4, 0.2] }]} segmentsOf={['Android', 'iOS', 'Web']} />);
    expect(document.querySelectorAll('.legend2 span')).toHaveLength(3);
    expect(screen.getByText('Web')).toBeInTheDocument();
    expect(document.querySelectorAll('.fbar')[0]!.querySelectorAll('i')).toHaveLength(3);
    expect(screen.getByText(/50 \/ 30 \/ 20/)).toBeInTheDocument();
  });
  it('the headline is one big number in a sentence', () => {
    render(<FunnelHeadline percent={61.94} sentence="of players finished level 5" started={260} finished={161} median="8m 05s" />);
    expect(screen.getByText('61.9%')).toBeInTheDocument();
    expect(screen.getByText('8m 05s')).toBeInTheDocument();
  });
});

describe('CompareTable', () => {
  const rows: CompareRow[] = [
    { key: 1, a: { start: 58, finish: 55 }, b: { start: 81, finish: 77 } },
    { key: 12, a: { start: 24, finish: 21 }, b: { start: 31, finish: 24 } },
    { key: 18, a: { start: 7, finish: 7 }, b: { start: 4, finish: 4 } },
    { key: 5, a: { start: 46, finish: 43 }, b: { start: 63, finish: 59 } },
  ];
  it('summarises worse / better / unchanged and small samples', () => {
    const s = compareSummary(rows);
    expect(s.worse).toBeGreaterThanOrEqual(1);
    expect(s.worse + s.better + s.same).toBe(rows.length);
    expect(s.small).toBe(1);
    expect(compareSummary([{ key: 1, a: { start: 4, finish: 4 }, b: { start: 30, finish: 30 } }]).small).toBe(1);
  });
  it('level 12 got worse by about 10 pp and is tinted', () => {
    render(<CompareTable rows={rows} aLabel="0.1.2" bLabel="0.1.3" />);
    expect(screen.getByText(/\+10\.1 pp · more drop/)).toBeInTheDocument();
    expect(document.querySelector('td.hotb')).not.toBeNull();
    expect(screen.getByText('0.1.2 · A')).toBeInTheDocument();
    expect(screen.getByText(/observed behaviour, not proof/)).toBeInTheDocument();
  });
  it('names the baseline: A by default, in the group header and the change column', () => {
    render(<CompareTable rows={rows} aLabel="0.1.2" bLabel="0.1.3" />);
    expect(screen.getByText('0.1.2 · A').closest('th')).toHaveTextContent('0.1.2 · A · baseline');
    expect(screen.getByText('0.1.3 · B').closest('th')).not.toHaveTextContent('baseline');
    expect(screen.getByText('Drop change · B vs A')).toBeInTheDocument();
  });
  it('baseline="b" flips the headers, the change sign and the summary', () => {
    expect(dropChange(rows[1]!, 'a')).toBeCloseTo(10.1, 1);
    expect(dropChange(rows[1]!, 'b')).toBeCloseTo(-10.1, 1);
    const a = compareSummary(rows, 'a'), b = compareSummary(rows, 'b');
    expect(b.worse).toBe(a.better);
    expect(b.better).toBe(a.worse);
    render(<CompareTable rows={rows} aLabel="0.1.2" bLabel="0.1.3" baseline="b" />);
    expect(screen.getByText('0.1.3 · B').closest('th')).toHaveTextContent('baseline');
    expect(screen.getByText('Drop change · A vs B')).toBeInTheDocument();
    expect(screen.getByText(/−10\.1 pp · less drop/)).toBeInTheDocument();
    expect(document.querySelector('td.hotg')).not.toBeNull();
  });
  it('a footnote replaces the default note under the table', () => {
    render(<CompareTable rows={rows} aLabel="a" bLabel="b" footnote={<>pp = percentage points · <b>missing next-level data is not zero drop</b></>} />);
    expect(screen.getByText('missing next-level data is not zero drop')).toBeInTheDocument();
    expect(screen.queryByText(/observed behaviour, not proof/)).toBeNull();
    expect(document.querySelectorAll('.foot-note')).toHaveLength(1);
  });
  it('small samples get one marker and one legend, not words on every row', () => {
    render(<CompareTable rows={rows} aLabel="a" bLabel="b" />);
    expect(document.querySelectorAll('td .ss').length).toBeGreaterThan(0);
    expect(screen.queryAllByText('small sample')).toHaveLength(0);
  });
});

describe('HeatStrip', () => {
  it('one cell per level; click selects it', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<HeatStrip starts={starts} onSelect={onSelect} />);
    expect(document.querySelectorAll('.heat button')).toHaveLength(starts.length);
    await user.click(screen.getByRole('button', { name: '12' }));
    expect(onSelect).toHaveBeenCalledWith(12);
  });
});
