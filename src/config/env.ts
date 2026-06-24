import { Platform } from 'react-native';

/**
 * Single source of truth for backend connectivity. Everything below derives
 * from `API_HOST`.
 *
<<<<<<< HEAD
 * Currently pointed at the deployed backend (`https://bodhiraai.com`). For local
 * development against `artisan serve`, set this back to the host loopback:
 * iOS simulator → `http://127.0.0.1:8000`; Android emulator → `http://10.0.2.2:8000`
 * (the emulator runs in its own VM and reaches the host loopback as `10.0.2.2`);
 * a physical device → your machine's LAN IP, e.g. `http://192.168.1.20:8000`.
 */
const API_HOST = 'https://bodhiraai.com';
=======
 * Points at the production backend. To run against a local server instead,
 * change `DEV_HOST` (e.g. `http://10.0.2.2:8000` for the Android emulator,
 * `http://127.0.0.1:8000` for the iOS simulator, or `http://<LAN-IP>:8000`
 * for a physical device). Everything else derives from it.
 */
const DEV_HOST = 'https://bodhiraai.com';
>>>>>>> a80b3b1d96ea33198959875760c9afca6eac9e88

export const Env = {
  /**
   * UI-design mode. When true, the app runs against an in-memory mock backend
   * (see `src/api/mock`) and never touches the network — every screen renders
   * with realistic sample data and you can sign in as any role.
   *
   * SET THIS TO `false` TO USE THE REAL BACKEND at `apiBaseUrl` below. Nothing
   * else needs to change.
   *
   * Wired to the deployed Laravel backend at https://bodhiraai.com.
   */
  useMock: false,
  /** Fully-qualified API root, e.g. `https://bodhiraai.com/api/v1`. */
  apiBaseUrl: `${API_HOST}/api/v1`,
  /**
   * Origin without the `/api/v1` suffix. Uploaded media (`/media/...`,
   * `/uploads/...`) is served from the host root, so relative asset URLs are
   * resolved against this, not `apiBaseUrl`.
   */
  apiOrigin: API_HOST,
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
