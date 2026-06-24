/**
 * Lightweight fetch-based API client (carhive-style) for the Bodhira backend.
 *
 * Base URL derives from `Env` (src/config/env.ts). Auth token is read from the app's shared
 * session store (`./storage`) so it stays in sync with the rest of the app.
 *
 * Every call resolves to the parsed JSON body, or `{ code: 2 }` on a network/
 * parse failure (so callers can branch without try/catch everywhere).
 */
import { Storage } from './storage';
import { Env } from '../config/env';

const BASE_URL = Env.apiBaseUrl;

const getToken = () => Storage.getToken();

export const executeResponse = async (url: string, body: any) => {
  const isForm = body instanceof FormData;

  // NOTE: for FormData we deliberately do NOT set Content-Type — React Native's
  // fetch appends the required `multipart/form-data; boundary=...` itself, and
  // setting it manually (without a boundary) breaks server-side parsing.
  const headers: Record<string, string> = {};
  if (!isForm) {
    headers['Content-Type'] = 'application/json';
  }
  headers['Accept'] = 'application/json';

  const token = await getToken();
  if (token && token !== '') {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${BASE_URL}/${url}`, {
      method: 'POST',
      headers,
      body: isForm ? body : JSON.stringify(body),
    });
    const data = await response.json();
    return data;
  } catch (e) {
    console.log('[api] POST', url, e);
  }

  return { code: 2 };
};

export const executeGetResponse = async (url: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  const token = await getToken();
  if (token && token !== '') {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${BASE_URL}/${url}`, {
      method: 'GET',
      headers,
    });
    const data = await response.json();
    return data;
  } catch (e) {
    console.log('[api] GET', url, e);
  }

  return { code: 2 };
};

/* ------------------------------------------------------------------ *
 * Auth
 * ------------------------------------------------------------------ */

/** Email/phone + password sign-in. */
export const login = async (identifier: any, password: any) => {
  return executeResponse('auth/login', { identifier, password });
};

/** Self-service registration. */
export const register = async (body: any) => {
  return executeResponse('auth/register', body);
};

/** Send a 6-digit OTP to a phone number. */
export const sendOtp = async (phone: any) => {
  return executeResponse('auth/otp/send', { phone });
};

/** Verify the OTP and sign in. */
export const verifyOtp = async (phone: any, otp: any) => {
  return executeResponse('auth/otp/verify', { phone, otp });
};

/** Request a password-reset link/code by email. */
export const forgotPassword = async (email: any) => {
  return executeResponse('auth/forgot-password', { email });
};

/** Current user (validates the stored token). */
export const me = async () => {
  return executeGetResponse('auth/me');
};

/** Revoke the current token. */
export const logout = async () => {
  return executeResponse('auth/logout', {});
};

/* ------------------------------------------------------------------ *
 * Profile
 * ------------------------------------------------------------------ */

/** Update the signed-in user's profile. Pass image fields as `{ uri, type, fileName }`. */
export const updateProfileApi = async (body: Record<string, any>) => {
  const data = new FormData();
  const fileKeys = ['avatar', 'profile_pic'];

  Object.entries(body).forEach(([key, value]) => {
    if (fileKeys.includes(key)) {
      if (value?.uri) {
        data.append(key, {
          uri: value.uri.startsWith('file://') ? value.uri : `file://${value.uri}`,
          type: value.type || 'image/jpeg',
          name: value.fileName || `${key}.jpg`,
        } as any);
      }
    } else if (value !== undefined && value !== null) {
      data.append(key, String(value));
    }
  });

  return executeResponse('profile/update', data);
};
