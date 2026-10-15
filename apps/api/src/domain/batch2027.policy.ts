export const BATCH_2027_POLICY = {
  version: 'BATCH_2027_EXTRACTED_V1',
  timezone: 'Asia/Kolkata',
  sourceStatus: 'EXTRACTED_REQUIREMENTS_ONLY',
  minimumTrainingAttendance: 75,
  phases: [
    { code: 'PHASE_1', startsAt: '2026-07-20T00:00:00+05:30', endsAt: '2026-12-31T23:59:59+05:30' },
    { code: 'PHASE_2', startsAt: '2027-01-04T00:00:00+05:30', endsAt: '2027-05-15T23:59:59+05:30' },
  ],
  noCampusProcessDates: ['2026-11-09', '2026-11-10', '2026-11-11', '2026-12-25'],
  companyChoiceSkipLimit: 10,
  offerEligibilityDecision: 'REQUIRES_AUTHORIZED_REVIEW',
} as const;

export const getPlacementPhase = (at: Date) => {
  const timestamp = at.getTime();
  return BATCH_2027_POLICY.phases.find((phase) => {
    const start = new Date(phase.startsAt).getTime();
    const end = new Date(phase.endsAt).getTime();
    return timestamp >= start && timestamp <= end;
  })?.code ?? null;
};

