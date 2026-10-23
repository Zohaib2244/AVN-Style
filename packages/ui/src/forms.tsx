import { cloneElement, isValidElement, useCallback, useRef, useState, type FormEvent, type ReactElement, type ReactNode } from 'react';
import { cx } from './cx';
import { Icon } from './icons';

/* ───────── Submitting ───────── */

export type FormValues = Record<string, string>;

/** The form's named controls as strings (files become ''). */
export function formValues(form: HTMLFormElement): FormValues {
  return Object.fromEntries([...new FormData(form).entries()].map(([key, value]) => [key, typeof value === 'string' ? value : ''])) as FormValues;
}

/** True for a cancelled request (`AbortError`), which is not an error the person needs to read. */
function isAbort(error: unknown): boolean {
  return !!error && typeof error === 'object' && (error as { name?: unknown }).name === 'AbortError';
}

/**
 * One submit in flight at a time: `handler` receives the form's values and the form element; while it runs
 * `busy` is true and further submits are ignored; a thrown error's message lands in `error` (for `FormError`).
 */
export function useSubmit(handler: (values: FormValues, form: HTMLFormElement) => Promise<void> | void): {
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  busy: boolean;
  error: string;
  setError: (error: string) => void;
} {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const inFlight = useRef(false);
  const onSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inFlight.current) return;
    const form = event.currentTarget;
    inFlight.current = true;
    setError('');
    setBusy(true);
    try {
      await handler(formValues(form), form);
    } catch (caught) {
      if (!isAbort(caught)) setError(caught instanceof Error ? caught.message || 'Something went wrong.' : String(caught) || 'Something went wrong.');
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }, [handler]);
  return { onSubmit, busy, error, setError };
}

/* ───────── Form-level error ───────── */

/** The form's one alert line. Always rendered (empty when there is no error) so screen readers hear it appear. */
export function FormError({ error }: { error?: string | null }): ReactElement {
  return <div className="form-err" role="alert">{error || null}</div>;
}

/* ───────── Field ───────── */

/**
 * Label + control + hint or error under it. The label points at `id`; when the child is a single element
 * it also gets that `id`, `aria-describedby` for the hint/error and `aria-invalid` when there is an error.
 */
export function Field({ id, label, hint, error, children, className }: { id: string; label: ReactNode; hint?: ReactNode; error?: ReactNode; children: ReactNode; className?: string }): ReactElement {
  const noteId = `${id}-note`;
  const note = error || hint;
  const control = isValidElement<{ id?: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean | 'true' | 'false' }>(children)
    ? cloneElement(children, {
        id: children.props.id ?? id,
        'aria-describedby': note ? cx(children.props['aria-describedby'], noteId) : children.props['aria-describedby'],
        'aria-invalid': error ? true : children.props['aria-invalid'],
      })
    : children;
  return (
    <div className={cx('fld', !!error && 'bad', className)}>
      <label htmlFor={id}>{label}</label>
      {control}
      {error ? (
        <span className="msg" id={noteId}><Icon name="alert" />{error}</span>
      ) : hint ? (
        <span className="hint" id={noteId}>{hint}</span>
      ) : null}
    </div>
  );
}
