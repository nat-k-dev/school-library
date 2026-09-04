import { FREE_TIER_COPIES, planInfo } from './plan';

describe('planInfo', () => {
  const today = '2026-09-04';

  it('is a trial until the trial end date, inclusive', () => {
    expect(planInfo({ plan: 'trial', trialEndsAt: '2026-12-03', paidUntil: null, copyCount: 500 }, today)).toEqual({
      status: 'trial',
      daysLeft: 90,
      until: '2026-12-03',
      locked: false,
    });
    expect(planInfo({ plan: 'trial', trialEndsAt: today, paidUntil: null, copyCount: 500 }, today).status).toBe('trial');
  });

  it('falls back to the free tier for a small library after the trial', () => {
    const info = planInfo({ plan: 'trial', trialEndsAt: '2026-09-03', paidUntil: null, copyCount: FREE_TIER_COPIES }, today);
    expect(info.status).toBe('free');
    expect(info.locked).toBeFalse();
  });

  it('locks a large library after the trial', () => {
    const info = planInfo({ plan: 'trial', trialEndsAt: '2026-09-03', paidUntil: null, copyCount: FREE_TIER_COPIES + 1 }, today);
    expect(info.status).toBe('locked');
    expect(info.locked).toBeTrue();
  });

  it('is paid until paidUntil and locks afterwards when large', () => {
    expect(planInfo({ plan: 'paid', trialEndsAt: null, paidUntil: '2027-09-03', copyCount: 2000 }, today)).toEqual({
      status: 'paid',
      daysLeft: 364,
      until: '2027-09-03',
      locked: false,
    });
    expect(planInfo({ plan: 'paid', trialEndsAt: null, paidUntil: '2026-09-03', copyCount: 2000 }, today).status).toBe('locked');
  });
});
