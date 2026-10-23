import { useEffect, useState, type ReactElement, type ReactNode, type SyntheticEvent } from 'react';
import { cx } from './cx';
import { Icon } from './icons';

/* ───────── Remembered open state: one localStorage entry per storageKey, one flag per name ───────── */

type Remembered = Record<string, boolean>;

function readRemembered(storageKey: string): Remembered {
  try {
    if (typeof localStorage === 'undefined') return {};
    const raw = localStorage.getItem(storageKey);
    const parsed: unknown = raw == null ? null : JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as Remembered) : {};
  } catch {
    return {};
  }
}

function writeRemembered(storageKey: string, value: Remembered): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(storageKey, JSON.stringify(value));
  } catch {
    /* storage unavailable or full: the fold still works, it just won't be remembered */
  }
}

/** The remembered open state of `name` under `storageKey`, or `fallback` when it was never toggled. */
export function rememberedOpen(storageKey: string, name: string, fallback: boolean): boolean {
  const saved = readRemembered(storageKey);
  return Object.hasOwn(saved, name) ? Boolean(saved[name]) : fallback;
}

/** Remembers `open` for `name` under `storageKey` (no write when nothing changed). */
export function rememberOpen(storageKey: string, name: string, open: boolean): void {
  const saved = readRemembered(storageKey);
  if (saved[name] !== open) writeRemembered(storageKey, { ...saved, [name]: open });
}

/**
 * A `<details>` that remembers whether it is open, per `name`, in one localStorage entry per `storageKey`
 * (an event's panel remembers its own folds, a player's story its own). Works without localStorage.
 */
export function RememberedDetails({ storageKey, name, summary, defaultOpen = false, className, children }: { storageKey: string; name: string; summary: ReactNode; defaultOpen?: boolean; className?: string; children: ReactNode }): ReactElement {
  const [open, setOpen] = useState(() => rememberedOpen(storageKey, name, defaultOpen));
  // Another key (another event, another player) has its own memory: re-read it instead of carrying this one over.
  useEffect(() => { setOpen(rememberedOpen(storageKey, name, defaultOpen)); }, [storageKey, name, defaultOpen]);
  const onToggle = (event: SyntheticEvent<HTMLDetailsElement>) => {
    const next = event.currentTarget.open;
    setOpen(next);
    rememberOpen(storageKey, name, next);
  };
  return (
    <details className={cx('fold', className)} data-disclosure={name} open={open} onToggle={onToggle}>
      <summary>{summary}</summary>
      {children}
    </details>
  );
}

/* ───────── Collapsible panel: folds to its header, with a one-line note beside it while folded ───────── */

/** Folded state of a panel, remembered like a disclosure (`storageKey` + `name`). */
export function useCollapsed(storageKey: string, name: string): [boolean, (collapsed: boolean) => void] {
  const [collapsed, setCollapsed] = useState(() => rememberedOpen(storageKey, name, false));
  useEffect(() => { setCollapsed(rememberedOpen(storageKey, name, false)); }, [storageKey, name]);
  const set = (value: boolean) => { setCollapsed(value); rememberOpen(storageKey, name, value); };
  return [collapsed, set];
}

/**
 * A `.panel` that folds down to its header. `header` is the header content (title and one line under it);
 * `note` shows beside it only while folded, so a folded panel still says what it holds. The body stays
 * mounted (hidden) so its state survives a fold. Remembered per `storageKey` + `name`.
 */
export function CollapsiblePanel({ storageKey, name, header, note, actions, children, className, id }: { storageKey: string; name: string; header: ReactNode; note?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string; id?: string }): ReactElement {
  const [collapsed, setCollapsed] = useCollapsed(storageKey, name);
  const bodyId = `${name}-body`;
  return (
    <section className={cx('panel', collapsed && 'collapsed', className)} id={id}>
      <div className="ph">
        <button type="button" className="icon-btn collapse-toggle" aria-expanded={!collapsed} aria-controls={bodyId} aria-label={collapsed ? 'Expand' : 'Collapse'} title={collapsed ? 'Expand' : 'Collapse'} onClick={() => setCollapsed(!collapsed)}>
          <Icon name="caret" />
        </button>
        <div className="collapse-head">{header}</div>
        {actions ? <div className="row-wrap">{actions}</div> : null}
        {collapsed && note ? <span className="collapse-note">{note}</span> : null}
      </div>
      <div className="collapse-body" id={bodyId} hidden={collapsed}>{children}</div>
    </section>
  );
}
