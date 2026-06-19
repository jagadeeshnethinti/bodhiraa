/**
 * Bodhira — subscription helpers.
 *
 * Small utilities around a user's billing plan: how many days remain in the
 * current cycle, and human labels. Drives the "X days left" countdowns on the
 * student Home banner and Profile plan card.
 */
import type { PlanTier } from '../api/types';

const DAY = 24 * 60 * 60 * 1000;

/** Whole days until `expiresAt` (>= 0), or null when there's no expiry. */
export const planDaysLeft = (expiresAt: string | null | undefined): number | null => {
  if (!expiresAt) return null;
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (Number.isNaN(ms)) return null;
  return Math.max(0, Math.ceil(ms / DAY));
};

export const PLAN_LABEL: Record<PlanTier, string> = {
  free: 'Free',
  monthly: 'Monthly',
  yearly: 'Yearly',
  school: 'School',
};

/** A short countdown phrase, e.g. "12 days left" / "Last day" / "Expired". */
export const daysLeftLabel = (days: number | null): string | null => {
  if (days == null) return null;
  if (days <= 0) return 'Expired';
  if (days === 1) return 'Last day';
  return `${days} days left`;
};
