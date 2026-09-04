import { School } from './models';

/** A klassenbieb up to this many copies stays free forever. */
export const FREE_TIER_COPIES = 150;
/** Every new school gets the full product for this long. */
export const TRIAL_DAYS = 90;

export type PlanStatus = 'trial' | 'paid' | 'free' | 'locked';

export interface PlanInfo {
  status: PlanStatus;
  /** Days until the trial or paid period ends; null for free and locked. */
  daysLeft: number | null;
  /** yyyy-mm-dd the current period ends; null for free and locked. */
  until: string | null;
  /** True when the school may not add books or lend. */
  locked: boolean;
}

/**
 * Decides what a school may do today. `plan`, `trialEndsAt` and `paidUntil`
 * are only ever changed by hand in the Firestore console after an invoice is
 * paid; the security rules stop the app from editing them.
 */
export function planInfo(
  school: Pick<School, 'plan' | 'trialEndsAt' | 'paidUntil' | 'copyCount'>,
  today: string,
): PlanInfo {
  if (school.plan === 'paid' && school.paidUntil && school.paidUntil >= today) {
    return { status: 'paid', daysLeft: daysBetween(today, school.paidUntil), until: school.paidUntil, locked: false };
  }
  if (school.plan === 'trial' && school.trialEndsAt && school.trialEndsAt >= today) {
    return { status: 'trial', daysLeft: daysBetween(today, school.trialEndsAt), until: school.trialEndsAt, locked: false };
  }
  if (school.copyCount <= FREE_TIER_COPIES) {
    return { status: 'free', daysLeft: null, until: null, locked: false };
  }
  return { status: 'locked', daysLeft: null, until: null, locked: true };
}

function daysBetween(from: string, to: string): number {
  const ms = Date.parse(to + 'T00:00:00Z') - Date.parse(from + 'T00:00:00Z');
  return Math.round(ms / 86_400_000);
}
