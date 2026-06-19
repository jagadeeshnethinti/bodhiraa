/**
 * Bodhira — form validation helpers.
 *
 * Small, composable validators that return a human, premium-sounding error
 * message string, or `null` when the value is valid. Screens call these on submit
 * (and optionally on blur) and feed the result straight into a field's `error`
 * prop. Keeping the rules here means Login / SignUp / Edit screens all validate
 * identically.
 */

// Pragmatic email check: something@something.tld — not RFC-perfect on purpose.
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const validateName = (v: string): string | null => {
  const t = v.trim();
  if (!t) return 'Please enter your full name.';
  if (t.length < 2) return 'That name looks too short.';
  if (!/^[a-zA-Z][a-zA-Z .'-]*$/.test(t)) return 'Use letters only for your name.';
  return null;
};

export const validateEmail = (v: string): string | null => {
  const t = v.trim();
  if (!t) return 'Please enter your email address.';
  if (!EMAIL_RE.test(t)) return 'That doesn’t look like a valid email.';
  return null;
};

export const validatePhone = (v: string, opts: { required?: boolean } = {}): string | null => {
  const { required = true } = opts;
  const digits = v.replace(/\D/g, '');
  if (!digits) return required ? 'Please enter your mobile number.' : null;
  if (digits.length < 10) return 'Enter a valid 10-digit mobile number.';
  if (digits.length > 13) return 'That mobile number is too long.';
  return null;
};

export const validatePassword = (v: string): string | null => {
  if (!v) return 'Please set a password.';
  if (v.length < 6) return 'Use at least 6 characters.';
  if (!/[a-zA-Z]/.test(v) || !/\d/.test(v)) return 'Mix letters and numbers for a stronger password.';
  return null;
};

export const validateConfirm = (password: string, confirm: string): string | null => {
  if (!confirm) return 'Please re-enter your password.';
  if (password !== confirm) return 'Passwords don’t match.';
  return null;
};

export const validateGrade = (v: string): string | null => {
  const t = v.trim();
  if (!t) return null; // optional
  const n = Number(t);
  if (!Number.isFinite(n) || n < 1 || n > 12) return 'Enter a class between 1 and 12.';
  return null;
};

/** Login id may be an email, a phone number, or a username — validate by shape. */
export const validateLoginIdentifier = (v: string): string | null => {
  const t = v.trim();
  if (!t) return 'Please enter your email, phone, or username.';
  if (t.includes('@')) return EMAIL_RE.test(t) ? null : 'That doesn’t look like a valid email.';
  if (/^[+\d\s-]+$/.test(t)) {
    const digits = t.replace(/\D/g, '');
    return digits.length >= 10 ? null : 'Enter a valid 10-digit phone number.';
  }
  if (t.length < 3) return 'That username looks too short.';
  return null;
};

/** Plain "required" check for simple fields (e.g. login password). */
export const validateRequired = (v: string, label = 'this field'): string | null =>
  v.trim() ? null : `Please enter ${label}.`;
