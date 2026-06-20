import { Platform } from 'react-native';

/**
 * Single source of truth for backend connectivity.
 *
 * The Android emulator runs in its own VM and cannot reach the host machine's
 * `127.0.0.1` — the host loopback is exposed to the emulator as `10.0.2.2`.
 * The iOS simulator shares the host network, so `127.0.0.1` works there.
 *
 * To point the app at a physical device on your LAN or a deployed server,
 * change `DEV_HOST` below (e.g. `http://192.168.1.20:8000` or
 * `https://api.bodhira.ai`). Everything else derives from it.
 */
const DEV_HOST =
  Platform.select({
    android: 'http://10.0.2.2:8000',
    ios: 'http://127.0.0.1:8000',
    default: 'http://127.0.0.1:8000',
  }) ?? 'http://127.0.0.1:8000';

export const Env = {
  /**
   * UI-design mode. When true, the app runs against an in-memory mock backend
   * (see `src/api/mock`) and never touches the network — every screen renders
   * with realistic sample data and you can sign in as any role.
   *
   * SET THIS TO `false` TO USE THE REAL BACKEND at `apiBaseUrl` below. Nothing
   * else needs to change.
   *
   * Wired to the local Laravel backend in ../_bodhiraai.com (artisan serve on
   * 127.0.0.1:8000). The Android emulator reaches it via 10.0.2.2:8000 below.
   */
  useMock: false,
  /** Fully-qualified API root, e.g. `http://10.0.2.2:8000/api/v1`. */
  apiBaseUrl: `${DEV_HOST}/api/v1`,
  /**
   * Origin without the `/api/v1` suffix. Uploaded media (`/media/...`,
   * `/uploads/...`) is served from the host root, so relative asset URLs are
   * resolved against this, not `apiBaseUrl`.
   */
  apiOrigin: DEV_HOST,
  /**
   * True for local/QA builds. The backend echoes the OTP in `local` env and we
   * surface dev-only banners (e.g. the OTP code) when this is on. `__DEV__` is
   * the React Native global that is `true` in debug builds.
   */
  isLocal: typeof __DEV__ !== 'undefined' ? __DEV__ : false,
  /** Sent as the `device` / `X-Device` value on auth + telemetry. */
  device: Platform.OS,
  /** Network timeout for a single request, in milliseconds. */
  requestTimeoutMs: 20000,
} as const;
