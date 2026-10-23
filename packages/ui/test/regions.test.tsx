import { describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryRegion, SkeletonBlock, errorText, type QueryLike } from '../src/regions';

type Row = { id: number; name: string };

const pending = (refetch = vi.fn()): QueryLike<Row[]> => ({ data: undefined, error: undefined, isPending: true, isFetching: true, isError: false, refetch });
const failed = (refetch = vi.fn()): QueryLike<Row[]> => ({ data: undefined, error: new Error('Server said no'), isPending: false, isFetching: false, isError: true, refetch });
const ready = (fetching: boolean, refetch = vi.fn()): QueryLike<Row[]> => ({ data: [{ id: 1, name: 'Pigeon' }], error: undefined, isPending: false, isFetching: fetching, isError: false, refetch });

const content = (rows: Row[]) => <ul>{rows.map((r) => <li key={r.id}>{r.name}</li>)}</ul>;

describe('QueryRegion', () => {
  it('shows a skeleton, then the error with Try again (which refetches), then the content', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    const { rerender } = render(<QueryRegion query={pending(refetch)} skeletonAfter={0}>{content}</QueryRegion>);
    expect(await screen.findByRole('status', { name: 'Loading' })).toBeInTheDocument();
    expect(document.querySelectorAll('.sk').length).toBeGreaterThan(0);

    rerender(<QueryRegion query={failed(refetch)} skeletonAfter={0}>{content}</QueryRegion>);
    expect(screen.getByRole('alert')).toHaveTextContent('Server said no');
    expect(document.querySelector('.sk')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(refetch).toHaveBeenCalledTimes(1);

    rerender(<QueryRegion query={ready(false, refetch)} skeletonAfter={0}>{content}</QueryRegion>);
    expect(screen.getByText('Pigeon')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.queryByText(/Updating…/)).toBeNull();
  });

  it('shows nothing before the skeleton delay, then the skeleton, then the status line', () => {
    vi.useFakeTimers();
    try {
      render(<QueryRegion query={pending()} loadingText="Loading levels" skeletonAfter={300} statusAfter={1000}>{content}</QueryRegion>);
      expect(document.querySelector('.sk')).toBeNull();
      act(() => { vi.advanceTimersByTime(300); });
      expect(document.querySelectorAll('.sk').length).toBeGreaterThan(0);
      expect(screen.queryByText('Loading levels')).toBeNull();
      act(() => { vi.advanceTimersByTime(700); });
      expect(screen.getByText('Loading levels')).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('says "Updating… Showing previous results." only while refetching with previous data, and keeps the data', () => {
    const { rerender } = render(<QueryRegion query={ready(true)} skeletonAfter={0}>{content}</QueryRegion>);
    expect(screen.getByText('Updating… Showing previous results.')).toBeInTheDocument();
    expect(screen.getByText('Pigeon')).toBeInTheDocument();
    expect(document.querySelector('.sk')).toBeNull();

    rerender(<QueryRegion query={ready(false)} skeletonAfter={0}>{content}</QueryRegion>);
    expect(screen.queryByText('Updating… Showing previous results.')).toBeNull();
    expect(screen.getByText('Pigeon')).toBeInTheDocument();

    rerender(<QueryRegion query={pending()} skeletonAfter={0}>{content}</QueryRegion>);
    expect(screen.queryByText('Updating… Showing previous results.')).toBeNull();
  });

  it('a failed refetch keeps the previous data under a banner with Try again', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    const q: QueryLike<Row[]> = { ...ready(false, refetch), isError: true, error: new Error('Timed out') };
    render(<QueryRegion query={q} skeletonAfter={0}>{content}</QueryRegion>);
    expect(screen.getByText('Pigeon')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Timed out');
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('accepts a custom skeleton', async () => {
    render(<QueryRegion query={pending()} skeletonAfter={0} skeleton={<SkeletonBlock kind="stats" stats={2} />}>{content}</QueryRegion>);
    await screen.findByRole('status', { name: 'Loading' });
    expect(document.querySelectorAll('.kpi')).toHaveLength(2);
  });
});

describe('SkeletonBlock', () => {
  it('draws rows × columns for tables, key-number cards for stats, bars for charts', () => {
    const { rerender } = render(<SkeletonBlock kind="table" rows={3} columns={4} />);
    expect(document.querySelectorAll('.skb-row')).toHaveLength(3);
    expect(document.querySelector('.skb-row')!.querySelectorAll('.sk')).toHaveLength(4);
    rerender(<SkeletonBlock kind="stats" />);
    expect(document.querySelectorAll('.kpi')).toHaveLength(3);
    rerender(<SkeletonBlock kind="chart" />);
    expect(document.querySelector('.skb-chart')!.querySelectorAll('.sk').length).toBeGreaterThan(0);
  });
});

describe('errorText', () => {
  it('reads an Error or a string and falls back otherwise', () => {
    expect(errorText(new Error('Nope'))).toBe('Nope');
    expect(errorText('Plain')).toBe('Plain');
    expect(errorText(undefined, 'Fallback')).toBe('Fallback');
    expect(errorText(new Error(''), 'Fallback')).toBe('Fallback');
  });
});
