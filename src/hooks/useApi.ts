import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '../api';

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  /** Normalised, user-facing error message (null while OK). */
  error: string | null;
  /** The raw error, for callers that need `kind` / field errors. */
  errorObject: ApiError | Error | null;
  /** Re-run the fetcher (e.g. pull-to-refresh / retry). */
  refetch: () => void;
  /** True only during an explicit refetch, not the initial load. */
  refreshing: boolean;
  /** Imperatively replace the data (optimistic updates). */
  setData: (updater: T | ((prev: T | null) => T | null)) => void;
}

/**
 * Run an async API call tied to a screen's lifecycle. Aborts in-flight work on
 * unmount and when `deps` change, and ignores stale results so the latest call
 * always wins.
 *
 * The `fetcher` receives an AbortSignal — forward it to the API layer so the
 * request is actually cancelled.
 */
export function useApi<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  deps: ReadonlyArray<unknown> = [],
): UseApiState<T> {
  const [data, setDataState] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorObject, setErrorObject] = useState<ApiError | Error | null>(null);

  const mounted = useRef(true);
  const reqId = useRef(0);
  // Keep the latest fetcher without making it a dependency (avoids refetch loops
  // when callers pass an inline function).
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const run = useCallback((isRefresh: boolean) => {
    const id = ++reqId.current;
    const controller = new AbortController();
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    setErrorObject(null);

    fetcherRef.current(controller.signal)
      .then(result => {
        if (!mounted.current || id !== reqId.current) return;
        setDataState(result);
      })
      .catch((err: unknown) => {
        if (!mounted.current || id !== reqId.current) return;
        // Ignore cancellations — a newer request (or unmount) superseded this one.
        if (err instanceof ApiError && err.kind === 'network' && err.status === 0 && controller.signal.aborted) {
          return;
        }
        const e = err instanceof Error ? err : new Error('Something went wrong.');
        setError(e.message);
        setErrorObject(e);
      })
      .finally(() => {
        if (!mounted.current || id !== reqId.current) return;
        setLoading(false);
        setRefreshing(false);
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const cancel = run(false);
    return cancel;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const refetch = useCallback(() => {
    run(true);
  }, [run]);

  const setData = useCallback((updater: T | ((prev: T | null) => T | null)) => {
    setDataState(prev =>
      typeof updater === 'function' ? (updater as (p: T | null) => T | null)(prev) : updater,
    );
  }, []);

  return { data, loading, error, errorObject, refetch, refreshing, setData };
}
