/**
 * Persistent key/value storage for the auth session.
 *
 * Uses `@react-native-async-storage/async-storage` when it is installed
 * (the documented secure-storage swap-in point for production), and falls back
 * to an in-memory store if the native module isn't present yet — so the bundle
 * still builds and runs before `npm install` / `pod install` has been run. In
 * the fallback the token simply doesn't survive an app restart.
 */

interface KeyValueStore {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

let store: KeyValueStore;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  store = require('@react-native-async-storage/async-storage').default as KeyValueStore;
} catch {
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    // eslint-disable-next-line no-console
    console.warn(
      '[bodhira] @react-native-async-storage/async-storage not installed — ' +
        'using an in-memory session store. Install it so logins persist across restarts.',
    );
  }
  const mem = new Map<string, string>();
  store = {
    getItem: async key => (mem.has(key) ? (mem.get(key) as string) : null),
    setItem: async (key, value) => {
      mem.set(key, value);
    },
    removeItem: async key => {
      mem.delete(key);
    },
  };
}

const TOKEN_KEY = '@bodhira/token';
const USER_KEY = '@bodhira/user';

export const Storage = {
  async getToken(): Promise<string | null> {
    try {
      return await store.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  async setToken(token: string): Promise<void> {
    try {
      await store.setItem(TOKEN_KEY, token);
    } catch {
      /* best-effort */
    }
  },

  /** Cache the last-known user so the app can render instantly on cold start. */
  async getUser<T>(): Promise<T | null> {
    try {
      const raw = await store.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },

  async setUser(user: unknown): Promise<void> {
    try {
      await store.setItem(USER_KEY, JSON.stringify(user));
    } catch {
      /* best-effort */
    }
  },

  async clear(): Promise<void> {
    try {
      await store.removeItem(TOKEN_KEY);
      await store.removeItem(USER_KEY);
    } catch {
      /* best-effort */
    }
  },

  /** Generic string get/set for small preferences (language, flags, …). */
  async getItem(key: string): Promise<string | null> {
    try {
      return await store.getItem(key);
    } catch {
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      await store.setItem(key, value);
    } catch {
      /* best-effort */
    }
  },
};
