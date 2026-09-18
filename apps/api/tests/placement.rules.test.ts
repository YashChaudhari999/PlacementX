import {
  canTransitionDriveStatus,
  getApplicationWindowError,
  isApplicationStatus,
  isDriveStatus,
} from '../src/domain/placement.rules';

describe('placement drive rules', () => {
  it('allows a published drive to become active', () => {
    expect(canTransitionDriveStatus('PUBLISHED', 'ACTIVE')).toBe(true);
  });

  it('prevents a completed drive from being reopened', () => {
    expect(canTransitionDriveStatus('COMPLETED', 'ACTIVE')).toBe(false);
  });

  it('accepts published and active drives during their registration window', () => {
    const now = new Date('2026-09-18T12:00:00.000Z');
    const window = {
      registrationStart: new Date('2026-09-17T00:00:00.000Z'),
      registrationEnd: new Date('2026-09-19T00:00:00.000Z'),
    };

    expect(getApplicationWindowError({ ...window, status: 'PUBLISHED' }, now)).toBeNull();
    expect(getApplicationWindowError({ ...window, status: 'ACTIVE' }, now)).toBeNull();
  });

  it('rejects applications before registration opens or after the deadline', () => {
    const now = new Date('2026-09-18T12:00:00.000Z');

    expect(getApplicationWindowError({
      status: 'PUBLISHED',
      registrationStart: new Date('2026-09-19T00:00:00.000Z'),
    }, now)).toMatch(/not started/i);

    expect(getApplicationWindowError({
      status: 'ACTIVE',
      applicationDeadline: new Date('2026-09-18T11:59:59.000Z'),
    }, now)).toMatch(/deadline/i);
  });

  it('rejects unknown drive and application statuses', () => {
    expect(isDriveStatus('UNKNOWN')).toBe(false);
    expect(isApplicationStatus('PROMOTED')).toBe(false);
  });
});
