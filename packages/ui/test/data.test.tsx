import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CompareTable, FunnelHeadline, FunnelResult, HeatStrip, biggestDrop, compareSummary, dropToNext, steepest, type CompareRow } from '../src/data';

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
