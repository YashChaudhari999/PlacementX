/**
 * Shared TypeScript types for PlacementX Mobile
 * Mirrors the web application's data models.
 */

// ─── Auth ───────────────────────────────────────────────

export type Role = 'STUDENT' | 'COORDINATOR' | 'SUPER_ADMIN';

export interface User {
  id: string;
  email: string;
  role: Role;
  firstName?: string;
  lastName?: string;
  name?: string;
  isProfileComplete?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  role: Role;
}

// ─── Student Profile ────────────────────────────────────

export interface StudentProfile {
  firstName: string;
  lastName: string;
  phone: string;
  branch: string;
  cgpa: string;
  passingYear: string;
  activeBacklogs: string;
  yearGap: string;
  nationality: string;
  gender: string;
  resumeUrl: string;
  portfolioUrl: string;
  githubUrl: string;
  address?: string;
  skills?: string[];
  academics?: any;
  department?: string;
  graduationYear?: string | number;
}

// ─── Drives ─────────────────────────────────────────────

export interface Company {
  id?: string;
  name: string;
  logoUrl?: string;
  profile?: string;
  hrName?: string;
}

export interface SelectionRound {
  id: string;
  title: string;
  date?: string;
  time?: string;
  duration?: string;
  venue?: string;
}

export interface Drive {
  id: string;
  company: Company;
  jobRole: string;
  jobDescription?: string;
  employmentType: string;
  workMode?: string;
  fixedSalary?: number | string;
  variablePay?: number | string;
  internshipStipend?: number | string;
  ppoAvailable?: boolean;
  bondDetails?: string;
  status: DriveStatus;
  registrationEnd?: string;
  vacancies?: number;
  eligibleStudentsCount?: number;
  selectionRounds?: SelectionRound[];
  applications?: Application[];
  minimumCgpa?: number;
  passingYear?: number;
  activeBacklogsAllowed?: number;
  maximumGapYears?: number;
  location?: string;
  remarks?: string;
  assessments?: any[];
}

export type DriveStatus = 'DRAFT' | 'SUBMITTED' | 'PUBLISHED' | 'OPEN' | 'UPCOMING' | 'CLOSED';

// ─── Applications ───────────────────────────────────────

export interface Application {
  id: string;
  driveId: string;
  drive: Drive;
  status: ApplicationStatus;
  appliedAt: string;
  student?: {
    firstName: string;
    lastName: string;
    branch: string;
    cgpa: number;
    resumeUrl?: string;
    user: { email: string };
  };
}

export type ApplicationStatus =
  | 'APPLIED'
  | 'ASSESSMENT_SCHEDULED'
  | 'TECHNICAL_INTERVIEW'
  | 'HR_INTERVIEW'
  | 'SELECTED'
  | 'REJECTED';

// ─── Interviews ─────────────────────────────────────────

export interface Interview {
  applicationId: string;
  company: string;
  role: string;
  status: string;
  rounds: SelectionRound[];
}

// ─── Notifications ──────────────────────────────────────

export type NotificationCategory =
  | 'placement'
  | 'interview'
  | 'meeting'
  | 'assignment'
  | 'submission'
  | 'mentor'
  | 'admin'
  | 'announcement'
  | 'message'
  | 'reminder'
  | 'payment'
  | 'order'
  | 'warning'
  | 'success'
  | 'error'
  | 'security'
  | 'system';

export type NotificationPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  image?: string;
  receiverId: string;
  receiverRole: string;
  senderId?: string;
  senderRole?: string;
  metadata?: Record<string, any>;
  actionUrl?: string;
  deepLinkRoute?: string;
  deepLinkParams?: Record<string, any>;
  isRead: boolean;
  isArchived: boolean;
  isDeleted: boolean;
  readAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPreferences {
  placement: boolean;
  interviews: boolean;
  meetings: boolean;
  messages: boolean;
  assignments: boolean;
  marketing: boolean;
  promotions: boolean;
  system: boolean;
  pushEnabled: boolean;
  emailEnabled: boolean;
}

export interface NotificationFilters {
  category?: string;
  type?: string;
  isRead?: boolean;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface PaginatedNotifications {
  data: Notification[];
  pagination: {
    hasMore: boolean;
    nextCursor: string | null;
    total: number;
  };
}

// ─── Admin Dashboard ────────────────────────────────────

export interface DashboardData {
  drives: {
    today: number;
    upcomingClosed: number;
    open: number;
  };
  students: {
    eligibleByCompany: Array<{ company: string; count: number }>;
    applicationsByCompany: Array<{ company: string; applications: number }>;
  };
  packages: {
    placementPercentage: number;
    highest: number;
    average: number;
    median: number;
  };
  overall: {
    companiesVisited: number;
    totalOffers: number;
  };
}

// ─── Calendar ───────────────────────────────────────────

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  backgroundColor?: string;
  extendedProps?: {
    type: string;
    company?: string;
    description?: string;
  };
}

// ─── Coordinators ───────────────────────────────────────

export interface Coordinator {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
}

// ─── Documents ──────────────────────────────────────────

export interface StudentDocuments {
  resumeUrl: string;
  offers: Array<{
    id: string;
    company: string;
    role: string;
    uploadedAt: string;
    offerLetterUrl?: string;
  }>;
}

// ─── Eligibility ────────────────────────────────────────

export interface EligibilityResult {
  isEligible: boolean;
  reasons: string[];
}

// ─── Public Stats ───────────────────────────────────────

export interface PublicStats {
  companies: number;
  placementRate: number;
  avgPackageLPA: number;
}
