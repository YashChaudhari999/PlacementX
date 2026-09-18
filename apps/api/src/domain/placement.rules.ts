export const DRIVE_STATUSES = [
  'WAITING_FOR_HR',
  'DRAFT',
  'SUBMITTED',
  'CHANGES_REQUESTED',
  'REJECTED',
  'PUBLISHED',
  'ACTIVE',
  'COMPLETED',
  'CANCELLED',
] as const;

export type DriveStatus = (typeof DRIVE_STATUSES)[number];

const DRIVE_TRANSITIONS: Record<DriveStatus, readonly DriveStatus[]> = {
  WAITING_FOR_HR: ['DRAFT', 'SUBMITTED', 'CANCELLED'],
  DRAFT: ['SUBMITTED', 'PUBLISHED', 'CANCELLED'],
  SUBMITTED: ['CHANGES_REQUESTED', 'REJECTED', 'PUBLISHED', 'CANCELLED'],
  CHANGES_REQUESTED: ['DRAFT', 'SUBMITTED', 'CANCELLED'],
  REJECTED: ['DRAFT', 'CANCELLED'],
  PUBLISHED: ['ACTIVE', 'COMPLETED', 'CANCELLED'],
  ACTIVE: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

export const isDriveStatus = (value: unknown): value is DriveStatus =>
  typeof value === 'string' && DRIVE_STATUSES.includes(value as DriveStatus);

export const canTransitionDriveStatus = (from: string, to: DriveStatus): boolean =>
  from === to || (isDriveStatus(from) && DRIVE_TRANSITIONS[from].includes(to));

type ApplicationWindow = {
  status: string;
  registrationStart?: Date | null;
  registrationEnd?: Date | null;
  applicationDeadline?: Date | null;
};

export const getApplicationWindowError = (
  drive: ApplicationWindow,
  now = new Date(),
): string | null => {
  if (!['PUBLISHED', 'ACTIVE'].includes(drive.status)) {
    return 'This drive is not currently accepting applications';
  }

  if (drive.registrationStart && now < drive.registrationStart) {
    return 'Registration for this drive has not started yet';
  }

  const deadline = drive.applicationDeadline ?? drive.registrationEnd;
  if (deadline && now > deadline) {
    return 'The application deadline for this drive has passed';
  }

  return null;
};

export const APPLICATION_STATUSES = [
  'APPLIED',
  'SHORTLISTED',
  'TEST_PENDING',
  'TEST_COMPLETED',
  'SELECTED_FOR_INTERVIEW',
  'INTERVIEW_SCHEDULED',
  'INTERVIEWED',
  'FINAL_SELECTED',
  'OFFERED',
  'ACCEPTED',
  'REJECTED',
  'WAITLISTED',
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const isApplicationStatus = (value: unknown): value is ApplicationStatus =>
  typeof value === 'string' && APPLICATION_STATUSES.includes(value as ApplicationStatus);
