import { Env } from '../config/env';
import type { ApiEnvelope, ApiMeta } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// Error model
// ─────────────────────────────────────────────────────────────────────────────

export type ApiErrorKind =
  | 'network' // could not reach the server (DNS/TCP/timeout)
  | 'auth' // 401 — token missing/expired
  | 'forbidden' // 403
  | 'not_found' // 404
  | 'gone' // 410 — resource cancelled
  | 'validation' // 422
  | 'rate_limited' // 429
  | 'server' // 5xx
  | 'http'; // any other non-2xx

export class ApiError extends Error {
  readonly status: number;
  readonly kind: ApiErrorKind;
  /** Machine-readable hint from the body (`otp_invalid`, `account_inactive`, …). */
  readonly code?: string;
  /** 422 field errors, keyed by field name. */
  readonly errors?: Record<string, string[]>;
  /** Seconds to wait, parsed from the `Retry-After` header on 429. */
  readonly retryAfter?: number;

  constructor(
    message: string,
    opts: {
      status: number;
      kind: ApiErrorKind;
      code?: string;
      errors?: Record<string, string[]>;
      retryAfter?: number;
    },
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = opts.status;
    this.kind = opts.kind;
    this.code = opts.code;
    this.errors = opts.errors;
    this.retryAfter = opts.retryAfter;
  }

  /** First field error for `field`, if any — handy for inline form errors. */
  fieldError(field: string): string | undefined {
    return this.errors?.[field]?.[0];
  }
}

function kindForStatus(status: number): ApiErrorKind {
  switch (status) {
    case 401:
      return 'auth';
    case 403:
      return 'forbidden';
    case 404:
      return 'not_found';
    case 410:
      return 'gone';
    case 422:
      return 'validation';
    case 429:
      return 'rate_limited';
    default:
      return status >= 500 ? 'server' : 'http';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Module state: bearer token + 401 handler, wired by the auth layer
// ─────────────────────────────────────────────────────────────────────────────

let authToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

/** Set (or clear) the bearer token sent on every authenticated request. */
export function setAuthToken(token: string | null): void {
  authToken = token;
}

/** Register a callback invoked once when a 401 is seen mid-session. */
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

// ─────────────────────────────────────────────────────────────────────────────
// Request
// ─────────────────────────────────────────────────────────────────────────────

export interface ApiResult<T> {
  data: T;
  meta: ApiMeta | null;
  message: string | null;
}

type Query = Record<string, string | number | boolean | null | undefined>;

interface RequestOptions {
  body?: unknown;
  query?: Query;
  /** Send the Authorization header (default true). */
  auth?: boolean;
  /** Caller-supplied abort signal (e.g. screen unmount). */
  signal?: AbortSignal;
}

function buildUrl(path: string, query?: Query): string {
  const base = `${Env.apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  if (!query) return base;
  const qs = Object.entries(query)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  return qs ? `${base}?${qs}` : base;
}

async function request<T>(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  path: string,
  options: RequestOptions = {},
): Promise<ApiResult<T>> {
  const { body, query, auth = true, signal } = options;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'X-Device': Env.device,
  };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth && authToken) headers.Authorization = `Bearer ${authToken}`;

  // Compose the caller's signal with an internal timeout.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Env.requestTimeoutMs);
  const onAbort = () => controller.abort();
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener('abort', onAbort);
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (err: unknown) {
    // fetch rejects on network failure or abort.
    const aborted = (err as { name?: string })?.name === 'AbortError';
    if (aborted && signal?.aborted) {
      // Genuine caller cancellation — propagate so callers can ignore it.
      throw new ApiError('Request cancelled.', { status: 0, kind: 'network' });
    }
    throw new ApiError(
      aborted ? 'The request timed out. Check your connection.' : 'Unable to reach the server.',
      { status: 0, kind: 'network' },
    );
  } finally {
    clearTimeout(timeout);
    if (signal) signal.removeEventListener('abort', onAbort);
  }

  // Parse the body (tolerate empty / non-JSON responses).
  const text = await response.text();
  let parsed: ApiEnvelope<T> | null = null;
  if (text) {
    try {
      parsed = JSON.parse(text) as ApiEnvelope<T>;
    } catch {
      parsed = null;
    }
  }

  if (!response.ok || (parsed && parsed.success === false)) {
    if (response.status === 401) {
      // Token rejected mid-session — let the auth layer tear down the session.
      onUnauthorized?.();
    }
    const failure = (parsed && parsed.success === false ? parsed : null) ?? null;
    const retryAfterHeader = response.headers.get('Retry-After');
    throw new ApiError(failure?.message || defaultMessage(response.status), {
      status: response.status,
      kind: kindForStatus(response.status),
      code: failure?.code,
      errors: failure?.errors,
      retryAfter: retryAfterHeader ? Number(retryAfterHeader) || undefined : undefined,
    });
  }

  if (!parsed || parsed.success !== true) {
    // 2xx but unparseable / unexpected envelope.
    throw new ApiError('Received an unexpected response from the server.', {
      status: response.status,
      kind: 'server',
    });
  }

  return {
    data: parsed.data,
    meta: parsed.meta ?? null,
    message: parsed.message ?? null,
  };
}

function defaultMessage(status: number): string {
  switch (status) {
    case 401:
      return 'Your session has expired. Please sign in again.';
    case 403:
      return "You don't have access to this.";
    case 404:
      return 'Not found.';
    case 410:
      return 'This is no longer available.';
    case 422:
      return 'Please check the highlighted fields.';
    case 429:
      return 'Too many requests — please slow down.';
    default:
      return status >= 500 ? 'Something went wrong on our end.' : 'Request failed.';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Public verbs — each returns the full result; helpers unwrap as needed.
// ─────────────────────────────────────────────────────────────────────────────

export const api = {
  get: <T>(path: string, opts?: Omit<RequestOptions, 'body'>) => request<T>('GET', path, opts),
  post: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, 'body'>) =>
    request<T>('POST', path, { ...opts, body }),
  patch: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, 'body'>) =>
    request<T>('PATCH', path, { ...opts, body }),
  del: <T>(path: string, opts?: Omit<RequestOptions, 'body'>) => request<T>('DELETE', path, opts),

  /** Convenience: GET and return just `data`. */
  getData: async <T>(path: string, opts?: Omit<RequestOptions, 'body'>) =>
    (await request<T>('GET', path, opts)).data,
};
