import { BATCH_2027_POLICY, getPlacementPhase } from '../src/domain/batch2027.policy';
import { evaluateOfferEligibility } from '../src/services/offer-eligibility.service';

describe('Batch 2027 extracted policy configuration', () => {
  it('uses the documented timezone-aware phase boundaries', () => {
    expect(getPlacementPhase(new Date('2026-07-20T00:00:00+05:30'))).toBe('PHASE_1');
    expect(getPlacementPhase(new Date('2027-01-04T00:00:00+05:30'))).toBe('PHASE_2');
    expect(getPlacementPhase(new Date('2027-01-02T12:00:00+05:30'))).toBeNull();
    expect(BATCH_2027_POLICY.noCampusProcessDates).toContain('2026-12-25');
  });

  it('escalates confirmed-offer eligibility instead of inventing a rule', () => {
    expect(evaluateOfferEligibility(0, 'REQUIRES_AUTHORIZED_REVIEW').requiresReview).toBe(false);
    expect(evaluateOfferEligibility(1, 'REQUIRES_AUTHORIZED_REVIEW')).toEqual({
      eligible: null,
      requiresReview: true,
      reasonCode: 'OFFER_POLICY_AMBIGUOUS',
    });
    expect(BATCH_2027_POLICY.offerEligibilityDecision).toBe('REQUIRES_AUTHORIZED_REVIEW');
  });
});
