import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CollapsiblePanel, RememberedDetails, rememberOpen, rememberedOpen } from '../src/disclosure';

// Node 22+ ships an experimental global localStorage that is undefined without --localstorage-file,
// and it shadows jsdom's. Use an in-memory Storage so the code under test sees a working localStorage.
{
  const values = new Map<string, string>();
  const storage: Storage = {
    get length() { return values.size; },
    clear: () => values.clear(),
    getItem: (key: string) => (values.has(key) ? values.get(key)! : null),
    key: (index: number) => [...values.keys()][index] ?? null,
    removeItem: (key: string) => { values.delete(key); },
    setItem: (key: string, value: string) => { values.set(key, String(value)); },
  };
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage });
}

beforeEach(() => localStorage.clear());

const details = () => screen.getByText('Setup').closest('details')!;

describe('RememberedDetails', () => {
  it('remembers the open state per name and survives a redraw', () => {
    localStorage.setItem('player', JSON.stringify({ setup: false, session: false }));
    const view = render(<RememberedDetails storageKey="player" name="setup" summary="Setup" defaultOpen>body</RememberedDetails>);
    expect(details().open).toBe(false);
    // A toggle is remembered for this name only.
    details().open = true; fireEvent(details(), new Event('toggle'));
    expect(JSON.parse(localStorage.getItem('player')!)).toEqual({ setup: true, session: false });
    // A fold never toggled before opens by default; a remembered one keeps its state across a redraw.
    view.rerender(<><RememberedDetails storageKey="player" name="setup" summary="Setup">body</RememberedDetails><RememberedDetails storageKey="player" name="new-highlight" summary="New" defaultOpen>more</RememberedDetails></>);
    expect(details().open).toBe(true);
    expect(screen.getByText('New').closest('details')!.open).toBe(true);
    // Opened from elsewhere (match navigation): subsequent redraws keep it open.
    rememberOpen('player', 'session', true);
    view.rerender(<RememberedDetails storageKey="player" name="session" summary="Setup">body</RememberedDetails>);
    expect(details().open).toBe(true);
    expect(rememberedOpen('player', 'session', false)).toBe(true);
  });

  it('survives a full remount', () => {
    const view = render(<RememberedDetails storageKey="k" name="a" summary="Setup">body</RememberedDetails>);
    details().open = true; fireEvent(details(), new Event('toggle'));
    view.unmount();
    render(<RememberedDetails storageKey="k" name="a" summary="Setup">body</RememberedDetails>);
    expect(details().open).toBe(true);
  });

  it('remounting with another key does not leak into the previous key', () => {
    localStorage.setItem('player', JSON.stringify({ setup: false, session: true }));
    const view = render(<RememberedDetails storageKey="player" name="session" summary="Setup">body</RememberedDetails>);
    expect(details().open).toBe(true);
    view.rerender(<RememberedDetails storageKey="another-event" name="session" summary="Setup" defaultOpen>body</RememberedDetails>);
    details().open = false; fireEvent(details(), new Event('toggle'));
    expect(JSON.parse(localStorage.getItem('another-event')!)).toEqual({ session: false });
    expect(JSON.parse(localStorage.getItem('player')!).session).toBe(true);
  });

  it('works without localStorage', () => {
    const saved = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')!;
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: undefined });
    try {
      expect(rememberedOpen('x', 'y', true)).toBe(true);
      expect(() => rememberOpen('x', 'y', false)).not.toThrow();
      render(<RememberedDetails storageKey="x" name="y" summary="Setup" defaultOpen>body</RememberedDetails>);
      expect(details().open).toBe(true);
    } finally {
      Object.defineProperty(globalThis, 'localStorage', saved);
    }
  });
});

describe('CollapsiblePanel', () => {
  const panel = (key = 'game-1') => (
    <CollapsiblePanel storageKey={key} name="activity" header={<div><h2>Activity</h2><p>Events per day</p></div>} note="1,204 events · 7 days">
      <p>body</p>
    </CollapsiblePanel>
  );

  it('shows the note only while folded, keeps the body mounted, and remembers the fold', async () => {
    const user = userEvent.setup();
    let view = render(panel());
    expect(screen.queryByText('1,204 events · 7 days')).toBeNull();
    expect(screen.getByText('body')).toBeVisible();
    const toggle = screen.getByRole('button', { name: 'Collapse' });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await user.click(toggle);
    expect(screen.getByText('1,204 events · 7 days')).toBeInTheDocument();
    expect(screen.getByText('body')).not.toBeVisible();
    expect(screen.getByRole('button', { name: 'Expand' })).toHaveAttribute('aria-expanded', 'false');
    expect(document.querySelector('.panel.collapsed')).not.toBeNull();
    expect(JSON.parse(localStorage.getItem('game-1')!)).toEqual({ activity: true });

    // Remount: still folded. Another key: its own memory.
    view.unmount();
    view = render(panel());
    expect(screen.getByText('1,204 events · 7 days')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Expand' }));
    expect(screen.queryByText('1,204 events · 7 days')).toBeNull();
    expect(screen.getByText('body')).toBeVisible();

    view.unmount();
    render(panel('game-2'));
    expect(screen.queryByText('1,204 events · 7 days')).toBeNull();
  });
});
