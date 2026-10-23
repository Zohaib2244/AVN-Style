import { describe, expect, it, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BellButton, ErrorPanel, LoadBar, MAX_TOASTS, NotificationList, TOAST_MS, ToastProvider, stackToast, useToast } from '../src/feedback';

const live = (id: number, kind: 'ok' | 'info' | 'warn' | 'bad', title: string) => ({ id, key: `${kind}|${title}|`, count: 1, kind, title });

describe('stackToast (pure rules)', () => {
  it('the same message becomes one toast with a count', () => {
    const a = stackToast([], { kind: 'ok', title: 'Copied' }, 1);
    const b = stackToast(a.list, { kind: 'ok', title: 'Copied' }, 2);
    expect(b.deduped).toBe(true);
    expect(b.list).toHaveLength(1);
    expect(b.list[0]!.count).toBe(2);
    expect(b.id).toBe(1);
  });
  it('different kinds with the same title are different toasts', () => {
    const a = stackToast([], { kind: 'ok', title: 'X' }, 1);
    expect(stackToast(a.list, { kind: 'bad', title: 'X' }, 2).list).toHaveLength(2);
  });
  it('keeps at most 4 and removes the oldest non-error first', () => {
    let list = [live(1, 'bad', 'err'), live(2, 'ok', 'a'), live(3, 'ok', 'b'), live(4, 'info', 'c')];
    list = stackToast(list, { kind: 'ok', title: 'new' }, 5).list;
    expect(list).toHaveLength(MAX_TOASTS);
    expect(list.map((t) => t.id)).toEqual([1, 3, 4, 5]);
  });
  it('when every toast is an error, the oldest goes', () => {
    const list = [1, 2, 3, 4].map((i) => live(i, 'bad', `e${i}`));
    expect(stackToast(list, { kind: 'bad', title: 'e5' }, 5).list.map((t) => t.id)).toEqual([2, 3, 4, 5]);
  });
  it('errors stay until dismissed; success and info fade', () => {
    expect(TOAST_MS.bad).toBe(0);
    expect(TOAST_MS.ok).toBe(5000);
    expect(TOAST_MS.warn).toBe(8000);
  });
});

function Harness() {
  const { toast } = useToast();
  return (
    <>
      <button onClick={() => toast({ kind: 'ok', title: 'Saved', message: 'Funnel saved' })}>save</button>
      <button onClick={() => toast({ kind: 'bad', title: 'Export failed', action: { label: 'Retry', onClick: () => (window as unknown as { retried: boolean }).retried = true } })}>fail</button>
      <BellButton onClick={() => {}} />
      <NotificationList />
    </>
  );
}

describe('ToastProvider', () => {
  it('shows a toast, counts duplicates, and dismisses', async () => {
    const user = userEvent.setup();
    render(<ToastProvider><Harness /></ToastProvider>);
    await user.click(screen.getByText('save'));
    await user.click(screen.getByText('save'));
    expect(await screen.findAllByText('Saved')).not.toHaveLength(0);
    expect(screen.getByText('×2')).toBeInTheDocument();
    await user.click(screen.getAllByLabelText('Dismiss')[0]!);
    await waitFor(() => expect(document.querySelector('.toast')).toBeNull());
  });
  it('an error toast offers an action that runs and dismisses', async () => {
    const user = userEvent.setup();
    render(<ToastProvider><Harness /></ToastProvider>);
    await user.click(screen.getByText('fail'));
    await user.click(await screen.findByRole('button', { name: 'Retry' }));
    expect((window as unknown as { retried: boolean }).retried).toBe(true);
    await waitFor(() => expect(document.querySelector('.toast')).toBeNull());
  });
  it('every toast is kept in the bell, unread until viewed', async () => {
    const user = userEvent.setup();
    render(<ToastProvider><Harness /></ToastProvider>);
    await user.click(screen.getByText('save'));
    await user.click(screen.getByText('fail'));
    expect(screen.getByRole('button', { name: /Notifications, 2 unread/ })).toBeInTheDocument();
    expect(document.querySelectorAll('.note-i')).toHaveLength(2);
  });
  it('useToast outside a provider explains itself', () => {
    const Bad = () => { useToast(); return null; };
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Bad />)).toThrow(/ToastProvider/);
    spy.mockRestore();
  });
});

describe('loading and errors', () => {
  it('LoadBar shows what is happening and elapsed seconds', () => {
    vi.useFakeTimers();
    render(<LoadBar text="Reading your events." slowAfter={3} onRetry={() => {}} />);
    expect(screen.getByRole('status')).toHaveTextContent('Reading your events.');
    act(() => { vi.advanceTimersByTime(3600); });
    expect(screen.getByRole('status')).toHaveTextContent('taking longer than usual');
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
    vi.useRealTimers();
  });
  it('ErrorPanel says what happened and offers a way out', async () => {
    const user = userEvent.setup();
    const retry = vi.fn();
    render(<ErrorPanel title="Couldn’t load levels" message="The server didn’t answer in time. Your data is safe." onRetry={retry} details="504" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Your data is safe');
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(retry).toHaveBeenCalled();
    expect(screen.getByText('Technical details')).toBeInTheDocument();
  });
});
