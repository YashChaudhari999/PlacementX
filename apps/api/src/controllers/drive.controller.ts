import prisma from '../utils/prisma';
import { Request, Response } from 'express';

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
  semanticTags: true,
};


export const createDrive = async (req: any, res: any) => {
  try {
    const data = req.body;
    
    // Check if company exists, or create a new one
    let company = await prisma.company.findFirst({
      where: { name: data.companyName }
    });

    if (!company) {
      company = await prisma.company.create({
        data: {
          name: data.companyName,
          industry: data.industry,
          profile: data.companyProfile,
          hrName: data.hrName,
          hrEmail: data.hrEmail
        }
      });
    }

    const drive = await prisma.placementDrive.create({
      select: {
        ...driveSelectFields
      },
      data: {
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
        
        selectionRounds: data.selectionRounds && data.selectionRounds.length > 0 ? {
          create: data.selectionRounds.map((round: any, index: number) => ({
            roundNumber: index + 1,
            title: round.title,
            date: round.date ? new Date(round.date) : null,
            time: round.time,
            duration: round.duration,
            venue: round.venue
          }))
        } : undefined
      }
    });

    if (!data.isDraft) {
      try {
        const { filterEligibleStudents } = await import('../services/eligibility.service');
        const { createBulkNotifications, scheduleBulkNotifications } = await import('../services/notification.service');
        const { PrismaClient } = await import('@prisma/client');
        
        const eligibleStudentIds = await filterEligibleStudents(drive);
        
        if (eligibleStudentIds.length > 0) {
          const isFuture = drive.registrationStart && new Date(drive.registrationStart) > new Date();

          if (isFuture) {
            await createBulkNotifications({
              title: 'Upcoming Placement Drive',
              message: `${company.name} will be hiring for ${drive.jobRole}. Registration starts on ${new Date(drive.registrationStart!).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}.`,
              type: 'placement_drive',
              priority: 'MEDIUM',
              actionUrl: `/student/drives/${drive.id}`,
              receiverIds: eligibleStudentIds,
              senderId: req.user?.id,
              senderRole: req.user?.role,
              metadata: { driveId: drive.id, companyName: company.name }
            });

            if (scheduleBulkNotifications) {
                            const campaign = await prisma.notificationCampaign.create({
                data: {
                  title: 'Drive Now Open for Applications',
                  message: `${company.name} is now accepting applications for ${drive.jobRole}.`,
                  type: 'placement_drive',
                  audienceType: 'ELIGIBLE_STUDENTS',
                  audienceDesc: `Drive ${drive.id}`,
                  channels: { push: true, inApp: true },
                  sentBy: req.user?.id || 'system',
                  status: 'SCHEDULED',
                  scheduledFor: new Date(drive.registrationStart!)
                }
              });

              await scheduleBulkNotifications({
                title: campaign.title,
                message: campaign.message,
                type: 'placement_drive',
                priority: 'HIGH',
                actionUrl: `/student/drives/${drive.id}`,
                receiverIds: eligibleStudentIds,
                senderId: req.user?.id,
                senderRole: req.user?.role,
                campaignId: campaign.id,
                metadata: { driveId: drive.id, companyName: company.name }
              }, new Date(drive.registrationStart!));
            }
          } else {
            await createBulkNotifications({
              title: 'New Placement Drive Available',
              message: `${company.name} is hiring for ${drive.jobRole}. Apply before ${drive.registrationEnd ? new Date(drive.registrationEnd).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'the deadline'}.`,
              type: 'placement_drive',
              priority: 'HIGH',
              actionUrl: `/student/drives/${drive.id}`,
              receiverIds: eligibleStudentIds,
              senderId: req.user?.id,
              senderRole: req.user?.role,
              metadata: {
                driveId: drive.id,
                companyName: company.name,
                package: drive.fixedSalary,
                deadline: drive.registrationEnd
              }
            });
          }
        }
      } catch (err) {
        console.error('Error triggering notifications on create:', err);
      }
    }

    return res.status(201).json({ message: 'Drive created successfully', drive });
  } catch (error: any) {
    console.error('Create drive error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const getDrives = async (req: any, res: any) => {
  try {
    const drives = await prisma.placementDrive.findMany({
      select: {
        ...driveSelectFields,
        company: true,
        applications: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
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
        ...driveSelectFields
      }
    });

    if (!drive) {
      return res.status(404).json({ message: 'Drive not found' });
    }

    const student = await prisma.studentProfile.findUnique({
      where: { userId }
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
        hrInvitations: true,
      }
    });
    
    if (!drive) {
      return res.status(404).json({ message: 'Drive not found' });
    }

    // Calculate eligible students count
    const where: any = {};
    if (drive.minimumCgpa) where.cgpa = { gte: drive.minimumCgpa };
    if (drive.passingYear) where.passingYear = drive.passingYear;
    if (drive.activeBacklogsAllowed !== null) where.activeBacklogs = { lte: drive.activeBacklogsAllowed };
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

export const getDriveApplications = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    
    const applications = await prisma.driveApplication.findMany({
      where: { driveId: id },
      include: {
        student: {
          include: {
            user: {
              select: { email: true }
            }
          }
        }
      },
      orderBy: { appliedAt: 'desc' }
    });

    return res.status(200).json(applications);
  } catch (error: any) {
    console.error('Get drive applications error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const updateApplicationStatus = async (req: any, res: any) => {
  try {
    const { id } = req.params; // applicationId
    const { status } = req.body;

    const application = await prisma.driveApplication.update({
      where: { id },
      data: { status }
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
    const drive = await prisma.placementDrive.update({
      where: { id },
      data: { status: 'PUBLISHED' },
      select: { ...driveSelectFields, company: true }
    });
    
    await prisma.driveAuditLog.create({
      data: { driveId: id, action: 'APPROVED', performedBy: 'Admin' }
    });

    try {
      const { filterEligibleStudents } = await import('../services/eligibility.service');
      const { createBulkNotifications, scheduleBulkNotifications } = await import('../services/notification.service');
      const { PrismaClient } = await import('@prisma/client');
      
      const eligibleStudentIds = await filterEligibleStudents(drive);
      
      if (eligibleStudentIds.length > 0) {
        const isFuture = drive.registrationStart && new Date(drive.registrationStart) > new Date();

        if (isFuture) {
          await createBulkNotifications({
            title: 'Upcoming Placement Drive Approved',
            message: `${drive.company.name} will be hiring for ${drive.jobRole}. Registration starts on ${new Date(drive.registrationStart!).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}.`,
            type: 'placement_drive',
            priority: 'MEDIUM',
            actionUrl: `/student/drives/${drive.id}`,
            receiverIds: eligibleStudentIds,
            senderId: req.user?.id,
            senderRole: req.user?.role,
            metadata: { driveId: drive.id, companyName: drive.company.name }
          });

          if (scheduleBulkNotifications) {
                        const campaign = await prisma.notificationCampaign.create({
              data: {
                title: 'Drive Now Open for Applications',
                message: `${drive.company.name} is now accepting applications for ${drive.jobRole}.`,
                type: 'placement_drive',
                audienceType: 'ELIGIBLE_STUDENTS',
                audienceDesc: `Drive ${drive.id}`,
                channels: { push: true, inApp: true },
                sentBy: req.user?.id || 'system',
                status: 'SCHEDULED',
                scheduledFor: new Date(drive.registrationStart!)
              }
            });

            await scheduleBulkNotifications({
              title: campaign.title,
              message: campaign.message,
              type: 'placement_drive',
              priority: 'HIGH',
              actionUrl: `/student/drives/${drive.id}`,
              receiverIds: eligibleStudentIds,
              senderId: req.user?.id,
              senderRole: req.user?.role,
              campaignId: campaign.id,
              metadata: { driveId: drive.id, companyName: drive.company.name }
            }, new Date(drive.registrationStart!));
          }
        } else {
          await createBulkNotifications({
            title: 'New Placement Drive Approved',
            message: `${drive.company.name} is hiring for ${drive.jobRole}.`,
            type: 'placement_drive',
            priority: 'HIGH',
            actionUrl: `/student/drives/${drive.id}`,
            receiverIds: eligibleStudentIds,
            senderId: req.user?.id,
            senderRole: req.user?.role,
            metadata: {
              driveId: drive.id,
              companyName: drive.company.name,
            }
          });
        }
      }
    } catch (err) {
      console.error('Error triggering notifications on approve:', err);
    }

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
      select: { ...driveSelectFields }
    });
    
    await prisma.driveAuditLog.create({
      data: { driveId: id, action: 'REJECTED', performedBy: 'Admin' }
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
      select: { ...driveSelectFields }
    });
    
    await prisma.driveAuditLog.create({
      data: { driveId: id, action: 'CHANGES_REQUESTED', performedBy: 'Admin', comments }
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
    
    let company = await prisma.company.findFirst({
      where: { name: data.companyName }
    });

    if (!company) {
      company = await prisma.company.create({
        data: {
          name: data.companyName,
          industry: data.industry,
          profile: data.companyProfile,
          hrName: data.hrName,
          hrEmail: data.hrEmail
        }
      });
    } else {
       await prisma.company.update({
         where: { id: company.id },
         data: {
           industry: data.industry,
           profile: data.companyProfile,
           hrName: data.hrName,
           hrEmail: data.hrEmail
         }
       });
    }

    // First delete existing selection rounds to replace them
    await prisma.selectionRound.deleteMany({
      where: { driveId: id }
    });

    const drive = await prisma.placementDrive.update({
      where: { id },
      select: { ...driveSelectFields },
      data: {
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
        
        ppoAvailable: data.ppoAvailable || false,
        vacancies: parseInt(data.vacancies) || null,
        bondDetails: data.bondDetails,
        yearGapAllowed: parseInt(data.yearGap) || 0,
        genderRestriction: data.genderRestriction || 'ANY',
        maximumApplicants: parseInt(data.maximumApplicants) || null,
        resumeMandatory: data.resumeMandatory !== false,
        
        selectionRounds: data.selectionRounds && data.selectionRounds.length > 0 ? {
          create: data.selectionRounds.map((round: any, index: number) => ({
            roundNumber: index + 1,
            title: round.title,
            date: round.date ? new Date(round.date) : null,
            time: round.time,
            duration: round.duration,
            venue: round.venue
          }))
        } : undefined
      }
    });

    return res.status(200).json({ message: 'Drive updated successfully', drive });
  } catch (error: any) {
    console.error('Update drive error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const deleteDrive = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    await prisma.placementDrive.delete({
      where: { id }
    });
    return res.status(200).json({ message: 'Drive deleted successfully' });
  } catch (error: any) {
    console.error('Delete drive error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const updateDriveStatus = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['DRAFT', 'PUBLISHED', 'COMPLETED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const drive = await prisma.placementDrive.update({
      where: { id },
      data: { status },
      select: { ...driveSelectFields }
    });

    return res.status(200).json({ message: 'Drive status updated', drive });
  } catch (error: any) {
    console.error('Update drive status error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
