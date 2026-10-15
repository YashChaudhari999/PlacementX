export type OfferEligibilityMode =
  | 'REQUIRES_AUTHORIZED_REVIEW'
  | 'BLOCK_AFTER_CONFIRMED_OFFER'
  | 'ALLOW_AFTER_CONFIRMED_OFFER';

export const evaluateOfferEligibility = (
  confirmedOfferCount: number,
  mode: OfferEligibilityMode,
) => {
  if (confirmedOfferCount <= 0) {
    return { eligible: true, requiresReview: false, reasonCode: null };
  }
  if (mode === 'BLOCK_AFTER_CONFIRMED_OFFER') {
    return { eligible: false, requiresReview: false, reasonCode: 'CONFIRMED_OFFER_RESTRICTION' };
  }
  if (mode === 'ALLOW_AFTER_CONFIRMED_OFFER') {
    return { eligible: true, requiresReview: false, reasonCode: null };
  }
  return { eligible: null, requiresReview: true, reasonCode: 'OFFER_POLICY_AMBIGUOUS' };
};
