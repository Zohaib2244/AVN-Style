import { useEffect, useState, type ReactElement, type ReactNode } from 'react';
import { cx } from './cx';
import { Banner, ErrorPanel, LoadBar, Skeleton, StatusLine } from './feedback';
import { Button } from './primitives';

/* ───────── Query regions ───────── */

/**
 * The shape of an async read a region waits on. TanStack Query's `UseQueryResult` satisfies it; so does
 * anything you build by hand (`{ data, isFetching: false, isError: false, refetch }`).
 */
export type QueryLike<T> = {
  data?: T;
  error?: unknown;
  /** True on the first load, before there is data or an error (TanStack v5 `isPending`, v4 `isLoading`). */
  isPending?: boolean;
  isLoading?: boolean;
  /** True whenever a request is in flight, including background refetches. */
  isFetching: boolean;
  isError: boolean;
  refetch: () => unknown;
};

/** A readable sentence from whatever was thrown, or the fallback. */
export function errorText(error: unknown, fallback = 'Couldn’t load this data.'): string {
  if (typeof error === 'string' && error.trim()) return error;
  if (error && typeof error === 'object' && 'message' in error && typeof (error as { message: unknown }).message === 'string' && (error as { message: string }).message.trim()) return (error as { message: string }).message;
  return fallback;
}

export type QueryRegionProps<T> = {
  query: QueryLike<T>;
  /** Renders the data. Called only once there is data. */
  children: (data: T) => ReactNode;
  /** A content-shaped placeholder for the first load; defaults to a table-shaped `SkeletonBlock`. */
  skeleton?: ReactNode;
  /** What the status line says once the first load passes a second. */
  loadingText?: string;
  /** Milliseconds before the skeleton appears; a flash of skeleton on a fast read is worse than nothing. */
  skeletonAfter?: number;
  /** Milliseconds before the status line (spinner, text, elapsed seconds) joins the skeleton. */
  statusAfter?: number;
  /** Title of the error panel when the first load fails. */
  errorTitle?: string;
  className?: string;
};

/**
 * One region of a page that waits on a read: a content-shaped skeleton on first load (with a status line
 * past a second), an error panel with Try again when the read fails, otherwise the content.
 * While refetching with previous data it keeps the content and says "Updating… Showing previous results."
 * A failed refetch keeps the data under a banner with Try again. Never blanks a region that has data.
 */
export function QueryRegion<T>({ query, children, skeleton, loadingText = 'Loading…', skeletonAfter = 300, statusAfter = 1000, errorTitle = 'Couldn’t load this', className }: QueryRegionProps<T>): ReactElement {
  const hasData = query.data !== undefined;
  const firstLoad = !hasData && !query.isError;
  const [phase, setPhase] = useState<0 | 1 | 2>(0);

  useEffect(() => {
    if (!firstLoad) { setPhase(0); return; }
    const timers = [
      setTimeout(() => setPhase(1), skeletonAfter),
      setTimeout(() => setPhase(2), Math.max(statusAfter, skeletonAfter)),
    ];
    return () => timers.forEach(clearTimeout);
  }, [firstLoad, skeletonAfter, statusAfter]);

  const retry = () => { void query.refetch(); };

  if (!hasData) {
    if (query.isError) {
      return (
        <div className={cx('qr', className)}>
          <ErrorPanel title={errorTitle} message={errorText(query.error)} onRetry={retry} />
        </div>
      );
    }
    return (
      <div className={cx('qr', className)} aria-busy="true">
        {phase >= 2 ? <LoadBar text={loadingText} onRetry={retry} /> : null}
        {phase >= 1 ? (skeleton ?? <SkeletonBlock />) : null}
      </div>
    );
  }

  return (
    <div className={cx('qr', className)} aria-busy={query.isFetching || undefined}>
      {query.isFetching ? (
        <div className="qr-upd" role="status">
          <StatusLine><span className="spinner sm" aria-hidden="true" />Updating… Showing previous results.</StatusLine>
        </div>
      ) : query.isError ? (
        <Banner>
          {errorText(query.error, 'Couldn’t refresh.')} Showing previous results.
          <Button size="sm" onClick={retry}>Try again</Button>
        </Banner>
      ) : null}
      {children(query.data as T)}
    </div>
  );
}

/* ───────── Content-shaped skeletons ───────── */

export type SkeletonBlockKind = 'table' | 'stats' | 'chart';

/**
 * A skeleton shaped like the content it stands in for, so nothing jumps when the data lands:
 * `stats` (a row of key numbers), `table` (`rows` × `columns`) or `chart` (bars).
 */
export function SkeletonBlock({ kind = 'table', rows = 5, columns = 4, stats = 3, label = 'Loading' }: { kind?: SkeletonBlockKind; rows?: number; columns?: number; stats?: number; label?: string }): ReactElement {
  let content: ReactNode;
  if (kind === 'stats') {
    content = (
      <div className="kpis">
        {Array.from({ length: stats }, (_, i) => (
          <div className="kpi" key={i}>
            <Skeleton width="60%" height={10} />
            <Skeleton width="45%" height={26} style={{ margin: '14px 0 10px' }} />
            <Skeleton width="80%" height={10} />
          </div>
        ))}
      </div>
    );
  } else if (kind === 'chart') {
    content = (
      <div className="skb-chart">
        {Array.from({ length: 12 }, (_, i) => <Skeleton key={i} height={`${[35, 55, 85][i % 3]}%`} />)}
      </div>
    );
  } else {
    content = (
      <div className="skb-rows">
        {Array.from({ length: rows }, (_, r) => (
          <div className="skb-row" key={r}>
            {Array.from({ length: columns }, (_, c) => <Skeleton key={c} width={c === 0 ? `${56 - ((r * 9) % 18)}%` : undefined} />)}
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className={cx('skb', kind)} role="status" aria-label={label} aria-busy="true">
      <div aria-hidden="true">{content}</div>
    </div>
  );
}
