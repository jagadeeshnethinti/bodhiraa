import { api } from '../client';
import type { ApiUser, AuthPayload, Role } from '../types';

export interface RegisterInput {
  name: string;
  email: string;
  phone?: string;
  password: string;
  password_confirmation: string;
  role: Extract<Role, 'student' | 'teacher' | 'parent'>;
  grade?: string;
  school_code?: string;
}

export interface LoginInput {
  identifier: string; // email | phone | username
  password: string;
  device?: string;
  /** Present when a student signs in *with their school* (vs a personal account). */
  school_code?: string;
  /**
   * UI-design/mock only — lets the mock backend return the selected role so you
   * can preview each role's app. The real backend ignores/validates this and
   * derives the role from the credentials.
   */
  role?: Extract<Role, 'student' | 'teacher' | 'parent' | 'admin'>;
}

export interface OtpVerifyInput {
  phone: string;
  otp: string;
  device?: string;
}

export const AuthApi = {
  /** Self-service B2C registration. Returns the same shape as login. */
  async register(input: RegisterInput): Promise<AuthPayload> {
    return (await api.post<AuthPayload>('/auth/register', input, { auth: false })).data;
  },

  async login(input: LoginInput): Promise<AuthPayload> {
    return (await api.post<AuthPayload>('/auth/login', input, { auth: false })).data;
  },

  /** Request a password-reset link/code to be sent to the account's email. */
  async forgotPassword(email: string): Promise<{ email: string }> {
    return (await api.post<{ email: string }>('/auth/forgot-password', { email }, { auth: false })).data;
  },

  /**
   * Sends a 6-digit OTP. In `local` env the backend echoes the code back as
   * `otp` for QA convenience.
   */
  async otpSend(phone: string): Promise<{ phone: string; otp?: string }> {
    return (await api.post<{ phone: string; otp?: string }>('/auth/otp/send', { phone }, { auth: false })).data;
  },

  async otpVerify(input: OtpVerifyInput): Promise<AuthPayload> {
    return (await api.post<AuthPayload>('/auth/otp/verify', input, { auth: false })).data;
  },

  /** Verify the stored token is still valid and refresh the user object. */
  async me(): Promise<ApiUser> {
    return (await api.get<ApiUser>('/auth/me')).data;
  },

  /** Revoke the current token only. */
  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  /** Revoke every token for the user (sign out everywhere). */
  async logoutAll(): Promise<void> {
    await api.post('/auth/logout-all');
  },
};
