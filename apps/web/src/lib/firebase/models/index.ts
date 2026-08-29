export interface Student {
  id?: string;
  authUid?: string;
  role?: string;
  accountStatus?: string;
  studentRollNumber?: string;
  emailVerified?: boolean;

  personalInfo: {
    firstName: string;
    lastName: string;
    gender: string;
    dob: string;
  };
  academicInfo: {
    departmentId: string;
    branchId: string;
    cgpa: number;
    batch: number;
    semester: number;
  };
  eligibility: {
    isEligible: boolean;
    activeBacklogs: number;
    totalBacklogs: number;
  };
  contactDetails: {
    email: string;
    phone: string;
    linkedin: string;
  };
  profileCompletion: number;
  resumeVersion: string;

  createdAt: string;
  updatedAt: string;
  importedBy?: string;
  importBatchId?: string;
  lastLogin?: string | null;
}

export interface ActivityLog {
  id?: string;
  actorId: string;
  actorType: string;
  action: string;
  targetId?: string;
  metadata: Record<string, any>;
  timestamp: string;
}

export interface CSVStudentRow {
  'Roll Number': string;
  'First Name': string;
  'Last Name': string;
  Email: string;
  Phone: string;
  Gender: string;
  Branch: string;
  Password?: string;
}

export interface Admin {
  id: string;
  role: string;
  profile?: { name: string; email: string };
  permissions?: string[];
  departmentId?: string;
}
export interface PlacementEvent {
  id: string;
  companyId: string;
  title: string;
}
export interface Application {
  id: string;
  studentId: string;
  eventId: string;
  status: string;
}
export interface Notification {
  id: string;
  userId: string;
  message: string;
  read: boolean;
}
export interface RecruiterSubmission {
  id: string;
  eventToken: string;
  status: string;
}
export interface Department {
  id: string;
  name: string;
  code?: string;
}
export interface Branch {
  id: string;
  name: string;
  departmentId: string;
}
export interface Settings {
  id: string;
  notificationsEnabled: boolean;
}
