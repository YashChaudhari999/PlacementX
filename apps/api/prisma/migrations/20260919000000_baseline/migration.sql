-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "firebaseUid" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'STUDENT',
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deviceName" TEXT,
    "platform" TEXT NOT NULL DEFAULT 'android',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeviceToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "phone" TEXT,
    "branch" TEXT,
    "cgpa" DOUBLE PRECISION,
    "passingYear" INTEGER,
    "activeBacklogs" INTEGER NOT NULL DEFAULT 0,
    "yearGap" INTEGER NOT NULL DEFAULT 0,
    "nationality" TEXT,
    "gender" TEXT,
    "resumeUrl" TEXT,
    "photoUrl" TEXT,
    "portfolioUrl" TEXT,
    "githubUrl" TEXT,
    "linkedinUrl" TEXT,
    "skills" JSONB,
    "programmingLanguages" JSONB,
    "projects" JSONB,
    "codingProfiles" JSONB,
    "educationDetails" TEXT,
    "isProfileComplete" BOOLEAN NOT NULL DEFAULT false,
    "profileStatus" TEXT NOT NULL DEFAULT 'NOT_COMPLETED',
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "address" TEXT,
    "alternatePhone" TEXT,
    "category" TEXT,
    "tenthBoard" TEXT,
    "tenthYear" INTEGER,
    "tenthPercentage" DOUBLE PRECISION,
    "twelfthBoard" TEXT,
    "twelfthYear" INTEGER,
    "twelfthPercentage" DOUBLE PRECISION,
    "diplomaBoard" TEXT,
    "diplomaYear" INTEGER,
    "diplomaPercentage" DOUBLE PRECISION,
    "currentSemester" INTEGER,
    "totalBacklogs" INTEGER NOT NULL DEFAULT 0,
    "semesterMarks" JSONB,
    "certifications" JSONB,
    "experience" JSONB,
    "languages" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "adminNotes" JSONB,

    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoordinatorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "department" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoordinatorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "website" TEXT,
    "industry" TEXT,
    "profile" TEXT,
    "hrName" TEXT,
    "hrEmail" TEXT,
    "hrContact" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "linkedInUrl" TEXT,
    "location" TEXT,
    "workMode" TEXT,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlacementDrive" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'WAITING_FOR_HR',
    "jobRole" TEXT,
    "jobDescription" TEXT,
    "fixedSalary" DOUBLE PRECISION,
    "variableSalary" DOUBLE PRECISION,
    "internshipStipend" DOUBLE PRECISION,
    "employmentType" TEXT,
    "ppoAvailable" BOOLEAN NOT NULL DEFAULT false,
    "bondDetails" TEXT,
    "vacancies" INTEGER,
    "location" TEXT,
    "workMode" TEXT,
    "eligibleBranches" TEXT,
    "passingYear" INTEGER,
    "minimumCgpa" DOUBLE PRECISION,
    "activeBacklogsAllowed" INTEGER NOT NULL DEFAULT 0,
    "yearGapAllowed" INTEGER NOT NULL DEFAULT 0,
    "maximumLiveOffers" INTEGER NOT NULL DEFAULT 1,
    "genderRestriction" TEXT,
    "registrationStart" TIMESTAMP(3),
    "registrationEnd" TIMESTAMP(3),
    "nominationLink" TEXT,
    "maximumApplicants" INTEGER,
    "resumeMandatory" BOOLEAN NOT NULL DEFAULT true,
    "portfolioRequired" BOOLEAN NOT NULL DEFAULT false,
    "githubRequired" BOOLEAN NOT NULL DEFAULT false,
    "attachments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "academicYear" TEXT,
    "applicationDeadline" TIMESTAMP(3),
    "benefits" TEXT,
    "campus" TEXT,
    "consentGiven" BOOLEAN NOT NULL DEFAULT false,
    "department" TEXT,
    "driveTitle" TEXT,
    "driveType" TEXT,
    "expectedDriveDate" TIMESTAMP(3),
    "historyOfBacklogsAllowed" INTEGER NOT NULL DEFAULT 0,
    "joiningBonus" DOUBLE PRECISION,
    "linkedinRequired" BOOLEAN NOT NULL DEFAULT false,
    "maximumGapYears" INTEGER NOT NULL DEFAULT 0,
    "minimumAttendance" DOUBLE PRECISION,
    "placementSeason" TEXT,
    "preferredSkills" TEXT,
    "remarks" TEXT,
    "requiredSkills" TEXT,
    "semester" INTEGER,
    "specialInstructions" TEXT,
    "technologyStack" TEXT,
    "trainingPeriod" TEXT,

    CONSTRAINT "PlacementDrive_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SelectionRound" (
    "id" TEXT NOT NULL,
    "driveId" TEXT NOT NULL,
    "roundNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3),
    "time" TEXT,
    "duration" TEXT,
    "venue" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "evaluationCriteria" TEXT,
    "instructions" TEXT,
    "interviewer" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "platform" TEXT,
    "roundType" TEXT,
    "weightage" DOUBLE PRECISION,

    CONSTRAINT "SelectionRound_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DriveApplication" (
    "id" TEXT NOT NULL,
    "driveId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'APPLIED',
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "interviewSchedule" JSONB,

    CONSTRAINT "DriveApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfferLetter" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "offerLetterUrl" TEXT,
    "joiningLetterUrl" TEXT,
    "internshipLetterUrl" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OfferLetter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationRoundResult" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "score" DOUBLE PRECISION,
    "percentage" DOUBLE PRECISION,
    "rank" INTEGER,
    "result" TEXT,
    "remarks" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadedBy" TEXT,

    CONSTRAINT "ApplicationRoundResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'system',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actionUrl" TEXT,
    "expiresAt" TIMESTAMP(3),
    "metadata" JSONB,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "readAt" TIMESTAMP(3),
    "receiverId" TEXT NOT NULL,
    "receiverRole" TEXT NOT NULL DEFAULT 'STUDENT',
    "senderId" TEXT,
    "senderRole" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'system',
    "deepLinkParams" JSONB,
    "deepLinkRoute" TEXT,
    "image" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "campaignId" TEXT,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationCampaign" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'system',
    "audienceType" TEXT NOT NULL,
    "audienceDesc" TEXT NOT NULL,
    "channels" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SENT',
    "scheduledFor" TIMESTAMP(3),
    "sentBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "placement" BOOLEAN NOT NULL DEFAULT true,
    "interviews" BOOLEAN NOT NULL DEFAULT true,
    "meetings" BOOLEAN NOT NULL DEFAULT true,
    "messages" BOOLEAN NOT NULL DEFAULT true,
    "assignments" BOOLEAN NOT NULL DEFAULT true,
    "marketing" BOOLEAN NOT NULL DEFAULT true,
    "promotions" BOOLEAN NOT NULL DEFAULT true,
    "system" BOOLEAN NOT NULL DEFAULT true,
    "pushEnabled" BOOLEAN NOT NULL DEFAULT true,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "quietHoursEnabled" BOOLEAN NOT NULL DEFAULT false,
    "quietHoursStart" TEXT,
    "quietHoursEnd" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HrInvitationLink" (
    "id" TEXT NOT NULL,
    "driveId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "hrEmail" TEXT NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HrInvitationLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DriveAuditLog" (
    "id" TEXT NOT NULL,
    "driveId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "performedBy" TEXT NOT NULL,
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DriveAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileUpdateRequest" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "requestedChanges" JSONB NOT NULL,
    "previousValues" JSONB,
    "changedFields" JSONB,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "adminComment" TEXT,

    CONSTRAINT "ProfileUpdateRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileAuditLog" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "performedBy" TEXT NOT NULL,
    "previousValue" JSONB,
    "newValue" JSONB,
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProfileAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "full_name" TEXT,
    "email" TEXT,
    "department" TEXT NOT NULL,
    "academic_year" TEXT NOT NULL,
    "student_status" TEXT NOT NULL,
    "gender" TEXT,
    "cgpa" DOUBLE PRECISION,
    "active_backlogs" INTEGER,
    "profile_complete" TEXT,
    "skills" TEXT,
    "drive_id" TEXT,
    "placement_season" TEXT,
    "application_status" TEXT,
    "company_id" TEXT,
    "company_name" TEXT,
    "industry" TEXT,
    "fixed_salary_lpa" DOUBLE PRECISION,
    "placement_status" TEXT,
    "source_file" TEXT NOT NULL,
    "source_folder" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomCalendarEvent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'Event',
    "color" TEXT NOT NULL DEFAULT '#4f46e5',
    "description" TEXT,
    "isAllDay" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomCalendarEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademicYear" (
    "id" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicYear_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Semester" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "academicYearId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Semester_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "filters" JSONB,
    "columns" JSONB,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReportTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportExportHistory" (
    "id" TEXT NOT NULL,
    "reportName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PROCESSING',
    "fileUrl" TEXT,
    "format" TEXT NOT NULL DEFAULT 'EXCEL',
    "recordCount" INTEGER NOT NULL DEFAULT 0,
    "generatedBy" TEXT,
    "filters" JSONB,
    "errorDetails" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReportExportHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduledReport" (
    "id" TEXT NOT NULL,
    "reportName" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "filters" JSONB,
    "format" TEXT NOT NULL DEFAULT 'EXCEL',
    "recipients" JSONB NOT NULL,
    "nextRunAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduledReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SettingAuditLog" (
    "id" TEXT NOT NULL,
    "settingKey" TEXT NOT NULL,
    "oldValue" JSONB,
    "newValue" JSONB,
    "changedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SettingAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentDocument" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL DEFAULT 'ACADEMIC_DOCUMENTS',
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileUrl" TEXT,
    "mimeType" TEXT NOT NULL DEFAULT 'application/pdf',
    "fileSize" INTEGER NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentPreference" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "jobCategories" JSONB,
    "industries" JSONB,
    "locations" JSONB,
    "workMode" JSONB,
    "salaryRange" TEXT,
    "profileVisibility" TEXT NOT NULL DEFAULT 'PUBLIC',
    "resumeVisibility" TEXT NOT NULL DEFAULT 'RECRUITER_ONLY',
    "defaultCalendarView" TEXT NOT NULL DEFAULT 'month',
    "interviewReminders" JSONB,
    "deadlineReminders" JSONB,
    "confirmBeforeApply" BOOLEAN NOT NULL DEFAULT true,
    "theme" TEXT NOT NULL DEFAULT 'system',
    "compactMode" BOOLEAN NOT NULL DEFAULT false,
    "language" TEXT NOT NULL DEFAULT 'en',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "timeFormat" TEXT NOT NULL DEFAULT '12-hour',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentPreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_firebaseUid_key" ON "User"("firebaseUid");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "DeviceToken_token_key" ON "DeviceToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_userId_key" ON "StudentProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CoordinatorProfile_userId_key" ON "CoordinatorProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminProfile_userId_key" ON "AdminProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DriveApplication_driveId_studentId_key" ON "DriveApplication"("driveId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "OfferLetter_applicationId_key" ON "OfferLetter"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationRoundResult_applicationId_roundId_key" ON "ApplicationRoundResult"("applicationId", "roundId");

-- CreateIndex
CREATE INDEX "Notification_receiverId_isDeleted_createdAt_idx" ON "Notification"("receiverId", "isDeleted", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_receiverId_isRead_isDeleted_idx" ON "Notification"("receiverId", "isRead", "isDeleted");

-- CreateIndex
CREATE INDEX "Notification_receiverId_category_isDeleted_idx" ON "Notification"("receiverId", "category", "isDeleted");

-- CreateIndex
CREATE INDEX "Notification_receiverId_type_isDeleted_idx" ON "Notification"("receiverId", "type", "isDeleted");

-- CreateIndex
CREATE INDEX "Notification_campaignId_idx" ON "Notification"("campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreference_userId_key" ON "NotificationPreference"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "HrInvitationLink_token_key" ON "HrInvitationLink"("token");

-- CreateIndex
CREATE INDEX "students_academic_year_idx" ON "students"("academic_year");

-- CreateIndex
CREATE INDEX "students_department_idx" ON "students"("department");

-- CreateIndex
CREATE INDEX "students_student_status_idx" ON "students"("student_status");

-- CreateIndex
CREATE INDEX "students_academic_year_department_idx" ON "students"("academic_year", "department");

-- CreateIndex
CREATE INDEX "students_academic_year_student_status_idx" ON "students"("academic_year", "student_status");

-- CreateIndex
CREATE INDEX "students_placement_status_idx" ON "students"("placement_status");

-- CreateIndex
CREATE INDEX "students_academic_year_placement_status_idx" ON "students"("academic_year", "placement_status");

-- CreateIndex
CREATE UNIQUE INDEX "students_student_id_academic_year_key" ON "students"("student_id", "academic_year");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicYear_year_key" ON "AcademicYear"("year");

-- CreateIndex
CREATE UNIQUE INDEX "Semester_academicYearId_name_key" ON "Semester"("academicYearId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "SystemSetting_key_key" ON "SystemSetting"("key");

-- CreateIndex
CREATE UNIQUE INDEX "StudentDocument_studentId_documentType_key" ON "StudentDocument"("studentId", "documentType");

-- CreateIndex
CREATE UNIQUE INDEX "StudentPreference_studentId_key" ON "StudentPreference"("studentId");

-- AddForeignKey
ALTER TABLE "DeviceToken" ADD CONSTRAINT "DeviceToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoordinatorProfile" ADD CONSTRAINT "CoordinatorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminProfile" ADD CONSTRAINT "AdminProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlacementDrive" ADD CONSTRAINT "PlacementDrive_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SelectionRound" ADD CONSTRAINT "SelectionRound_driveId_fkey" FOREIGN KEY ("driveId") REFERENCES "PlacementDrive"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriveApplication" ADD CONSTRAINT "DriveApplication_driveId_fkey" FOREIGN KEY ("driveId") REFERENCES "PlacementDrive"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriveApplication" ADD CONSTRAINT "DriveApplication_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferLetter" ADD CONSTRAINT "OfferLetter_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "DriveApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationRoundResult" ADD CONSTRAINT "ApplicationRoundResult_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "DriveApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationRoundResult" ADD CONSTRAINT "ApplicationRoundResult_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "SelectionRound"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "NotificationCampaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HrInvitationLink" ADD CONSTRAINT "HrInvitationLink_driveId_fkey" FOREIGN KEY ("driveId") REFERENCES "PlacementDrive"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriveAuditLog" ADD CONSTRAINT "DriveAuditLog_driveId_fkey" FOREIGN KEY ("driveId") REFERENCES "PlacementDrive"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileUpdateRequest" ADD CONSTRAINT "ProfileUpdateRequest_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileAuditLog" ADD CONSTRAINT "ProfileAuditLog_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Semester" ADD CONSTRAINT "Semester_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SettingAuditLog" ADD CONSTRAINT "SettingAuditLog_settingKey_fkey" FOREIGN KEY ("settingKey") REFERENCES "SystemSetting"("key") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentDocument" ADD CONSTRAINT "StudentDocument_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentPreference" ADD CONSTRAINT "StudentPreference_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

┌─────────────────────────────────────────────────────────┐
│  Update available 5.22.0 -> 8.0.0-rc.15                 │
│                                                         │
│  This is a major update - please follow the guide at    │
│  https://pris.ly/d/major-version-upgrade                │
│                                                         │
│  Run the following to update                            │
│    npm i --save-dev prisma@latest                       │
│    npm i @prisma/client@latest                          │
└─────────────────────────────────────────────────────────┘
