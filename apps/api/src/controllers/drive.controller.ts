import prisma from '../utils/prisma';
import { Request, Response } from 'express';
import { signDocuments } from '../services/student-document.service';
import {
  canTransitionDriveStatus,
  isApplicationStatus,
  isDriveStatus,
} from '../domain/placement.rules';
import {
  dispatchDrivePublication,
  recordDrivePublication,
} from '../services/drive-publication.service';

const driveSelectFields = {
  id: true,
  companyId: true,
  status: true,
  jobRole: true,
  jobDescription: true,
  fixedSalary: true,
  variableSalary: true,
  internshipStipend: true,
  employmentType: true,
  ppoAvailable: true,
  bondDetails: true,
  vacancies: true,
  location: true,
  workMode: true,
  eligibleBranches: true,
  passingYear: true,
  minimumCgpa: true,
  activeBacklogsAllowed: true,
  yearGapAllowed: true,
  maximumLiveOffers: true,
  genderRestriction: true,
  registrationStart: true,
  registrationEnd: true,
  nominationLink: true,
  maximumApplicants: true,
  resumeMandatory: true,
  portfolioRequired: true,
  githubRequired: true,
  attachments: true,
  createdAt: true,
  updatedAt: true,
  academicYear: true,
  applicationDeadline: true,
  benefits: true,
  campus: true,
  consentGiven: true,
  department: true,
  driveTitle: true,
  driveType: true,
  expectedDriveDate: true,
  historyOfBacklogsAllowed: true,
  joiningBonus: true,
  linkedinRequired: true,
  maximumGapYears: true,
  minimumAttendance: true,
  placementSeason: true,
  preferredSkills: true,
  remarks: true,
  requiredSkills: true,
  semester: true,
  specialInstructions: true,
  technologyStack: true,
  trainingPeriod: true,
};

const validateDriveForPublication = (drive: any): string[] => {
  const errors: string[] = [];
  if (!drive.companyId) errors.push('Company is required');
  if (!drive.jobRole || drive.jobRole === 'TBD') errors.push('Job role is required');
  if (!drive.jobDescription || drive.jobDescription === 'TBD')
    errors.push('Job description is required');
  if (!drive.employmentType) errors.push('Employment type is required');
  if (!drive.eligibleBranches) errors.push('Eligible branches are required');
  const deadline = drive.applicationDeadline ?? drive.registrationEnd;
  if (!deadline) errors.push('Application deadline is required');
  else if (new Date(deadline).getTime() <= Date.now())
    errors.push('Application deadline must be in the future');
  return errors;
};

export const createDrive = async (req: any, res: any) => {
  try {
    const data = req.body;

    if (!data.isDraft) {
      const validationErrors = validateDriveForPublication({
        companyId: data.companyId || data.companyName,
        jobRole: data.jobRole,
        jobDescription: data.jobDescription,
        employmentType: data.employmentType || 'Full Time',
        eligibleBranches: JSON.stringify(data.branches || ['ALL']),
        applicationDeadline: data.applicationDeadline,
        registrationEnd: data.registrationEnd,
      });
      if (validationErrors.length) {
        return res.status(422).json({ message: 'Drive is incomplete', errors: validationErrors });
      }
    }

    // Check if company exists, or create a new one
    let company = await prisma.company.findFirst({
      where: { name: data.companyName },
    });

    if (!company) {
      company = await prisma.company.create({
        data: {
          name: data.companyName,
          industry: data.industry,
          profile: data.companyProfile,
          hrName: data.hrName,
          hrEmail: data.hrEmail,
        },
      });
    }

    const { getSetting } = await import('../services/settings.service');
    const currentAcademicYear = await getSetting('academicYear');

    const result = await prisma.$transaction(async (tx) => {
      const drive = await tx.placementDrive.create({
        select: { ...driveSelectFields },
        data: {
          academicYear: currentAcademicYear,
          companyId: company.id,
          status: data.isDraft ? 'DRAFT' : 'PUBLISHED',

          jobRole: data.jobRole,
          jobDescription: data.jobDescription,
          fixedSalary: parseFloat(data.ctc) || null,
          employmentType: data.employmentType || 'Full Time',
          workMode: data.workMode || 'On Campus',

          eligibleBranches: JSON.stringify(data.branches || ['ALL']),
          minimumCgpa: parseFloat(data.cgpa) || null,
          passingYear: parseInt(data.passingYear) || null,
          activeBacklogsAllowed: parseInt(data.backlogs) || 0,
          maximumLiveOffers: parseInt(data.maxOffers) || 1,

          registrationStart: data.registrationStart ? new Date(data.registrationStart) : null,
          registrationEnd: data.registrationEnd ? new Date(data.registrationEnd) : null,
          nominationLink: data.nominationLink,

          // Extended fields mapping
          ppoAvailable: data.ppoAvailable || false,
          vacancies: parseInt(data.vacancies) || null,
          bondDetails: data.bondDetails,
          yearGapAllowed: parseInt(data.yearGap) || 0,
          genderRestriction: data.genderRestriction || 'ANY',
          maximumApplicants: parseInt(data.maximumApplicants) || null,
          resumeMandatory: data.resumeMandatory !== false,

          selectionRounds:
            data.selectionRounds && data.selectionRounds.length > 0
              ? {
                  create: data.selectionRounds.map((round: any, index: number) => ({
                    roundNumber: index + 1,
                    title: round.title,
                    date: round.date ? new Date(round.date) : null,
                    time: round.time,
                    duration: round.duration,
                    venue: round.venue,
                  })),
                }
              : undefined,
        },
      });
      const publicationEvent = data.isDraft
        ? null
        : await recordDrivePublication(tx, drive.id, req.user?.id);
      return { drive, publicationEvent };
    });
    const { drive, publicationEvent } = result;
    if (publicationEvent)
      void dispatchDrivePublication(publicationEvent.id).catch((error) =>
        console.error('Unable to queue drive publication:', error)
      );

    return res.status(201).json({ message: 'Drive created successfully', drive });
  } catch (error: any) {
    console.error('Create drive error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const getDrives = async (req: any, res: any) => {
  try {
    // DELETE is implemented as an audited cancellation so recruitment history
    // is retained. Cancelled drives must therefore be excluded from normal
    // listings; otherwise a successfully deleted drive appears to remain.
    const isStudent = req.user?.role === 'STUDENT';
    const where: any = {
      status: isStudent ? 'PUBLISHED' : { not: 'CANCELLED' },
    };
    let targetAcademicYear = req.query.academic_year;

    if (!targetAcademicYear) {
      const { getSetting } = await import('../services/settings.service');
      targetAcademicYear = await getSetting('academicYear');
    }

    if (targetAcademicYear && targetAcademicYear !== 'All Years') {
      where.academicYear = targetAcademicYear;
    }

    let drives = await prisma.placementDrive.findMany({
      where,
      select: {
        ...driveSelectFields,
        company: true,
        applications: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (isStudent) {
      const student = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
      if (!student) return res.status(200).json([]);

      const { checkEligibility } = await import('../services/eligibility.service');
      const evaluated = await Promise.all(
        drives.map(async (drive) => ({ drive, result: await checkEligibility(student, drive) }))
      );
      drives = evaluated
        .filter(({ result }) => result.isEligible && !result.requiresReview)
        .map(({ drive }) => drive);
    }

    return res.status(200).json(drives);
  } catch (error: any) {
    console.error('Get drives error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const checkEligibilityStatus = async (req: any, res: any) => {
  try {
    const { id: driveId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const drive = await prisma.placementDrive.findUnique({
      where: { id: driveId },
      select: {
        ...driveSelectFields,
      },
    });

    if (!drive) {
      return res.status(404).json({ message: 'Drive not found' });
    }

    const student = await prisma.studentProfile.findUnique({
      where: { userId },
    });

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    // Call service
    const { checkEligibility } = await import('../services/eligibility.service');
    const result = await checkEligibility(student, drive);

    const existingApplication = await prisma.driveApplication.findUnique({
      where: {
        driveId_studentId: {
          driveId,
          studentId: student.id,
        },
      },
    });

    return res.status(200).json({ ...result, hasApplied: !!existingApplication });
  } catch (error: any) {
    console.error('Eligibility check error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const getDriveById = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const drive = await prisma.placementDrive.findUnique({
      where: { id },
      select: {
        ...driveSelectFields,
        company: true,
        selectionRounds: true,
        hrInvitations: {
          select: {
            id: true,
            hrEmail: true,
            isUsed: true,
            createdAt: true,
            submittedAt: true,
            revokedAt: true,
          },
        },
      },
    });

    if (!drive) {
      return res.status(404).json({ message: 'Drive not found' });
    }

    if (req.user?.role === 'STUDENT') {
      if (drive.status !== 'PUBLISHED') {
        return res.status(404).json({ message: 'Placement drive is unavailable' });
      }
      const student = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
      if (!student) return res.status(404).json({ message: 'Student profile not found' });
      const { checkEligibility } = await import('../services/eligibility.service');
      const eligibility = await checkEligibility(student, drive);
      if (!eligibility.isEligible || eligibility.requiresReview) {
        return res
          .status(403)
          .json({ message: 'You do not currently have access to this placement drive' });
      }
    }

    // Calculate eligible students count
    const where: any = {};
    if (drive.minimumCgpa) where.cgpa = { gte: drive.minimumCgpa };
    if (drive.passingYear) where.passingYear = drive.passingYear;
    if (drive.activeBacklogsAllowed !== null)
      where.activeBacklogs = { lte: drive.activeBacklogsAllowed };
    if (drive.yearGapAllowed !== null) where.yearGap = { lte: drive.yearGapAllowed };
    if (drive.genderRestriction && drive.genderRestriction !== 'ANY') {
      where.gender = { equals: drive.genderRestriction, mode: 'insensitive' };
    }

    if (drive.eligibleBranches) {
      try {
        const branches = JSON.parse(drive.eligibleBranches);
        if (Array.isArray(branches) && branches.length > 0 && !branches.includes('ALL')) {
          where.branch = { in: branches };
        }
      } catch (e) {
        if (drive.eligibleBranches !== 'ALL') {
          where.branch = { contains: drive.eligibleBranches };
        }
      }
    }

    const eligibleStudentsCount = await prisma.studentProfile.count({ where });

    return res.status(200).json({ ...drive, eligibleStudentsCount });
  } catch (error: any) {
    console.error('Get drive by id error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const getDrivePublicationStatus = async (req: any, res: any) => {
  const event = await prisma.drivePublicationEvent.findUnique({
    where: { driveId: req.params.id },
    include: { deliveries: { select: { channel: true, status: true } } },
  });
  if (!event) return res.status(404).json({ message: 'No publication notification event found' });

  const channels = event.deliveries.reduce<Record<string, Record<string, number>>>(
    (summary, delivery) => {
      summary[delivery.channel] ||= {};
      summary[delivery.channel][delivery.status] =
        (summary[delivery.channel][delivery.status] || 0) + 1;
      return summary;
    },
    {}
  );

  return res.status(200).json({
    id: event.id,
    status: event.status,
    eligibleRecipients: event.eligibleCount,
    processedRecipients: event.processedCount,
    startedAt: event.startedAt,
    completedAt: event.completedAt,
    lastError: event.lastError,
    channels,
  });
};

export const getDriveApplications = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const applications = await prisma.driveApplication.findMany({
      where: { driveId: id },
      include: {
        student: {
          include: {
            user: {
              select: { email: true },
            },
            documents: true,
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });

    // Inject signed URLs for Resume
    const appsWithResumes = await Promise.all(
      applications.map(async (app) => {
        if (app.student && app.student.documents && app.student.documents.length > 0) {
          const signedDocs = await signDocuments(app.student.documents);
          const resumeDoc = signedDocs.find((d) => d.documentType === 'RESUME');
          if (resumeDoc && resumeDoc.signedUrl) {
            return {
              ...app,
              student: { ...app.student, resumeUrl: resumeDoc.signedUrl, documents: signedDocs },
            };
          }
          return {
            ...app,
            student: { ...app.student, documents: signedDocs },
          };
        }
        return app;
      })
    );

    return res.status(200).json(appsWithResumes);
  } catch (error: any) {
    console.error('Get drive applications error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const updateApplicationStatus = async (req: any, res: any) => {
  try {
    const { id } = req.params; // applicationId
    const { status } = req.body;

    if (!isApplicationStatus(status)) {
      return res.status(400).json({ message: 'Invalid application status' });
    }

    const application = await prisma.driveApplication.update({
      where: { id },
      data: { status },
    });

    return res.status(200).json(application);
  } catch (error: any) {
    console.error('Update application status error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const approveHrDrive = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const pendingDrive = await prisma.placementDrive.findUnique({ where: { id } });
    if (!pendingDrive) return res.status(404).json({ message: 'Drive not found' });
    if (!['ADMIN_REVIEW', 'SUBMITTED', 'APPROVED'].includes(pendingDrive.status)) {
      return res
        .status(409)
        .json({ message: `Drive cannot be approved from ${pendingDrive.status}` });
    }
    const validationErrors = validateDriveForPublication(pendingDrive);
    if (validationErrors.length) {
      return res.status(422).json({ message: 'Drive is incomplete', errors: validationErrors });
    }
    const { drive, publicationEvent } = await prisma.$transaction(async (tx) => {
      const updated = await tx.placementDrive.update({
        where: { id },
        data: { status: 'PUBLISHED' },
        select: { ...driveSelectFields, company: true },
      });
      await tx.driveAuditLog.create({
        data: { driveId: id, action: 'APPROVED', performedBy: req.user?.id || 'Admin' },
      });
      const event = await recordDrivePublication(tx, id, req.user?.id);
      return { drive: updated, publicationEvent: event };
    });
    void dispatchDrivePublication(publicationEvent.id).catch((error) =>
      console.error('Unable to queue drive publication:', error)
    );

    return res.status(200).json({ message: 'Drive approved', drive });
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const rejectHrDrive = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const drive = await prisma.placementDrive.update({
      where: { id },
      data: { status: 'REJECTED' },
      select: { ...driveSelectFields },
    });

    await prisma.driveAuditLog.create({
      data: { driveId: id, action: 'REJECTED', performedBy: 'Admin' },
    });

    return res.status(200).json({ message: 'Drive rejected', drive });
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const requestChangesHrDrive = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;

    const drive = await prisma.placementDrive.update({
      where: { id },
      data: { status: 'CHANGES_REQUESTED' },
      select: { ...driveSelectFields },
    });

    await prisma.driveAuditLog.create({
      data: { driveId: id, action: 'CHANGES_REQUESTED', performedBy: 'Admin', comments },
    });
    await prisma.hrInvitationLink.updateMany({
      where: { driveId: id, revokedAt: null },
      data: { isUsed: false },
    });

    return res.status(200).json({ message: 'Changes requested', drive });
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const updateDrive = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const currentDrive = await prisma.placementDrive.findUnique({
      where: { id },
      select: { status: true },
    });
    if (!currentDrive) return res.status(404).json({ message: 'Drive not found' });

    if (!data.isDraft) {
      const validationErrors = validateDriveForPublication({
        companyId: data.companyId || data.companyName,
        jobRole: data.jobRole,
        jobDescription: data.jobDescription,
        employmentType: data.employmentType || 'Full Time',
        eligibleBranches: JSON.stringify(data.branches || ['ALL']),
        applicationDeadline: data.applicationDeadline,
        registrationEnd: data.registrationEnd,
      });
      if (validationErrors.length) {
        return res.status(422).json({ message: 'Drive is incomplete', errors: validationErrors });
      }
    }

    let company = await prisma.company.findFirst({
      where: { name: data.companyName },
    });

    if (!company) {
      company = await prisma.company.create({
        data: {
          name: data.companyName,
          industry: data.industry,
          profile: data.companyProfile,
          hrName: data.hrName,
          hrEmail: data.hrEmail,
        },
      });
    } else {
      await prisma.company.update({
        where: { id: company.id },
        data: {
          industry: data.industry,
          profile: data.companyProfile,
          hrName: data.hrName,
          hrEmail: data.hrEmail,
        },
      });
    }

    const nextStatus = data.isDraft ? 'DRAFT' : 'PUBLISHED';
    const { drive, publicationEvent } = await prisma.$transaction(async (tx) => {
      await tx.selectionRound.deleteMany({ where: { driveId: id } });
      const updated = await tx.placementDrive.update({
        where: { id },
        select: { ...driveSelectFields },
        data: {
          companyId: company.id,
          status: nextStatus,

          jobRole: data.jobRole,
          jobDescription: data.jobDescription,
          fixedSalary: parseFloat(data.ctc) || null,
          employmentType: data.employmentType || 'Full Time',
          workMode: data.workMode || 'On Campus',

          eligibleBranches: JSON.stringify(data.branches || ['ALL']),
          minimumCgpa: parseFloat(data.cgpa) || null,
          passingYear: parseInt(data.passingYear) || null,
          activeBacklogsAllowed: parseInt(data.backlogs) || 0,
          maximumLiveOffers: parseInt(data.maxOffers) || 1,

          registrationStart: data.registrationStart ? new Date(data.registrationStart) : null,
          registrationEnd: data.registrationEnd ? new Date(data.registrationEnd) : null,
          nominationLink: data.nominationLink,

          ppoAvailable: data.ppoAvailable || false,
          vacancies: parseInt(data.vacancies) || null,
          bondDetails: data.bondDetails,
          yearGapAllowed: parseInt(data.yearGap) || 0,
          genderRestriction: data.genderRestriction || 'ANY',
          maximumApplicants: parseInt(data.maximumApplicants) || null,
          resumeMandatory: data.resumeMandatory !== false,

          selectionRounds:
            data.selectionRounds && data.selectionRounds.length > 0
              ? {
                  create: data.selectionRounds.map((round: any, index: number) => ({
                    roundNumber: index + 1,
                    title: round.title,
                    date: round.date ? new Date(round.date) : null,
                    time: round.time,
                    duration: round.duration,
                    venue: round.venue,
                  })),
                }
              : undefined,
        },
      });
      const event =
        currentDrive.status !== 'PUBLISHED' && nextStatus === 'PUBLISHED'
          ? await recordDrivePublication(tx, id, req.user?.id)
          : null;
      return { drive: updated, publicationEvent: event };
    });

    if (publicationEvent)
      void dispatchDrivePublication(publicationEvent.id).catch((error) =>
        console.error('Unable to queue drive publication:', error)
      );

    return res.status(200).json({ message: 'Drive updated successfully', drive });
  } catch (error: any) {
    console.error('Update drive error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const deleteDrive = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const current = await prisma.placementDrive.findUnique({ where: { id } });
    if (!current) return res.status(404).json({ message: 'Drive not found' });
    if (['COMPLETED', 'CANCELLED'].includes(current.status)) {
      return res.status(409).json({ message: 'Finalized drives cannot be deleted or reopened' });
    }
    await prisma.$transaction([
      prisma.placementDrive.update({ where: { id }, data: { status: 'CANCELLED' } }),
      prisma.hrInvitationLink.updateMany({
        where: { driveId: id, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
      prisma.driveAuditLog.create({
        data: { driveId: id, action: 'DRIVE_CANCELLED', performedBy: req.user.id },
      }),
    ]);
    return res.status(200).json({ message: 'Drive cancelled; recruitment history was preserved' });
  } catch (error: any) {
    console.error('Delete drive error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const updateDriveStatus = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!isDriveStatus(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const currentDrive = await prisma.placementDrive.findUnique({
      where: { id },
      select: { status: true },
    });

    if (!currentDrive) {
      return res.status(404).json({ message: 'Drive not found' });
    }

    if (!canTransitionDriveStatus(currentDrive.status, status)) {
      return res.status(409).json({
        message: `Drive cannot transition from ${currentDrive.status} to ${status}`,
      });
    }
    if (status === 'PUBLISHED') {
      const fullDrive = await prisma.placementDrive.findUnique({ where: { id } });
      const validationErrors = validateDriveForPublication(fullDrive);
      if (validationErrors.length) {
        return res.status(422).json({ message: 'Drive is incomplete', errors: validationErrors });
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.placementDrive.update({
        where: { id },
        data: { status },
        select: { ...driveSelectFields },
      });
      if (['COMPLETED', 'CANCELLED'].includes(status)) {
        await tx.hrInvitationLink.updateMany({
          where: { driveId: id, revokedAt: null },
          data: { revokedAt: new Date() },
        });
      }
      await tx.driveAuditLog.create({
        data: {
          driveId: id,
          action: `STATUS_${status}`,
          performedBy: req.user.id,
          comments: `${currentDrive.status} -> ${status}`,
        },
      });
      const publicationEvent =
        status === 'PUBLISHED' ? await recordDrivePublication(tx, id, req.user?.id) : null;
      return { drive: updated, publicationEvent };
    });

    const { drive, publicationEvent } = result;
    if (publicationEvent)
      void dispatchDrivePublication(publicationEvent.id).catch((error) =>
        console.error('Unable to queue drive publication:', error)
      );

    return res.status(200).json({ message: 'Drive status updated', drive });
  } catch (error: any) {
    console.error('Update drive status error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
