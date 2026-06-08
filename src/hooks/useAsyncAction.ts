import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '../api';

interface AsyncActionState {
  submitting: boolean;
  error: string | null;
  errorObject: ApiError | Error | null;
}

/**
 * For one-shot, user-triggered async actions (login, submit quiz, send message).
 * Guards against double-submit and post-unmount state updates, and surfaces a
 * normalised error message.
 *
 * `run` resolves to the action's value on success, or `undefined` if it threw
 * (the error is captured in state). Throwing callers can read `errorObject`.
 */
export function useAsyncAction(): AsyncActionState & {
  run: <T>(action: () => Promise<T>) => Promise<T | undefined>;
  reset: () => void;
} {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorObject, setErrorObject] = useState<ApiError | Error | null>(null);
  const mounted = useRef(true);
  const inFlight = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const run = useCallback(async <T>(action: () => Promise<T>): Promise<T | undefined> => {
    if (inFlight.current) return undefined;
    inFlight.current = true;
    setSubmitting(true);
    setError(null);
    setErrorObject(null);
    try {
      const result = await action();
      return result;
    } catch (err: unknown) {
      const e = err instanceof Error ? err : new Error('Something went wrong.');
      if (mounted.current) {
        setError(e.message);
        setErrorObject(e);
      }
      return undefined;
    } finally {
      inFlight.current = false;
      if (mounted.current) setSubmitting(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setErrorObject(null);
  }, []);

  return { submitting, error, errorObject, run, reset };
}
