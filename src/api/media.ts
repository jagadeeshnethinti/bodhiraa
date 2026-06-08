import { Env } from '../config/env';

/**
 * Uploaded assets come back as **relative** URLs (e.g. `/media/lessons/41/
 * master.m3u8`, `/uploads/schools/1/logo.png`) so they are host-agnostic.
 * Prepend the API origin to anything that starts with `/`; leave absolute
 * `http(s)://` URLs (external Zoom/Meet links, etc.) untouched.
 */
export function resolveMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('/')) return `${Env.apiOrigin}${url}`;
  return url;
}

/**
 * Build a `react-native-video` source that carries the bearer token on every
 * Range request. `/media/...` endpoints are auth-protected and support HTTP 206
 * partial responses, so the token must ride along for scrubbing to work.
 */
export function authedVideoSource(
  url: string | null | undefined,
  token: string | null,
): { uri: string; headers?: Record<string, string> } | null {
  const uri = resolveMediaUrl(url);
  if (!uri) return null;
  // Only attach the header for our own host — never leak the token to a
  // third-party meeting/CDN domain.
  const isOwnHost = uri.startsWith(Env.apiOrigin);
  if (token && isOwnHost) {
    return { uri, headers: { Authorization: `Bearer ${token}` } };
  }
  return { uri };
}
