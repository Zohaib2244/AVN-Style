import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Field, FormError, useSubmit, type FormValues } from '../src/forms';

function Form({ handler }: { handler: (values: FormValues, form: HTMLFormElement) => Promise<void> | void }) {
  const { onSubmit, busy, error } = useSubmit(handler);
  return (
    <form onSubmit={onSubmit} aria-label="demo">
      <FormError error={error} />
      <Field id="name" label="Name" hint="As shown to players">
        <input name="name" defaultValue="Pigeon" />
      </Field>
      <button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
    </form>
  );
}

describe('useSubmit', () => {
  it('passes the values and the form to the handler, and ignores a second submit while busy', async () => {
    let finish: () => void = () => {};
    const handler = vi.fn((_values: FormValues, _form: HTMLFormElement) => new Promise<void>((resolve) => { finish = resolve; }));
    render(<Form handler={handler} />);
    const form = screen.getByRole('form', { name: 'demo' });
    fireEvent.submit(form);
    fireEvent.submit(form);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0]![0]).toEqual({ name: 'Pigeon' });
    expect(handler.mock.calls[0]![1]).toBe(form);
    expect(await screen.findByRole('button', { name: 'Saving…' })).toBeDisabled();
    await act(async () => { finish(); });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled());
    fireEvent.submit(form);
    expect(handler).toHaveBeenCalledTimes(2);
  });

  it('a thrown error shows in FormError and clears on the next submit', async () => {
    let fail = true;
    const handler = vi.fn(async () => { if (fail) throw new Error('Name is taken'); });
    render(<Form handler={handler} />);
    expect(screen.getByRole('alert')).toBeEmptyDOMElement();
    fireEvent.submit(screen.getByRole('form', { name: 'demo' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Name is taken'));
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
    fail = false;
    fireEvent.submit(screen.getByRole('form', { name: 'demo' }));
    await waitFor(() => expect(screen.getByRole('alert')).toBeEmptyDOMElement());
  });

  it('a cancelled request (AbortError) is not shown as an error', async () => {
    const handler = vi.fn(async () => { throw new DOMException('cancelled', 'AbortError'); });
    render(<Form handler={handler} />);
    fireEvent.submit(screen.getByRole('form', { name: 'demo' }));
    await waitFor(() => expect(handler).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled());
    expect(screen.getByRole('alert')).toBeEmptyDOMElement();
  });
});

describe('Field', () => {
  it('wires the label to the control and describes it by the hint', () => {
    render(<Field id="email" label="Email" hint="Work address"><input name="email" /></Field>);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('id', 'email');
    expect(input).toHaveAccessibleDescription('Work address');
    expect(input).not.toHaveAttribute('aria-invalid');
  });

  it('an error replaces the hint, marks the control invalid and the field bad', () => {
    render(<Field id="email" label="Email" hint="Work address" error="Needs an @"><input name="email" /></Field>);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Needs an @');
    expect(screen.queryByText('Work address')).toBeNull();
    expect(input.closest('.fld')).toHaveClass('bad');
  });
});
