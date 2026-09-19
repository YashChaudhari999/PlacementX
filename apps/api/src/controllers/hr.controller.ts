import prisma from '../utils/prisma';
import { Request, Response } from 'express';
import crypto from 'crypto';
import { createNotification as sendNotification } from '../services/notification.service';
import { z } from 'zod';
import { isApplicationStatus } from '../domain/placement.rules';

const HR_LINK_EXPIRY_DAYS = 7;

export const generateHrLink = async (req: Request, res: Response) => {
  try {
    const { companyName, hrEmail, hrName, companyEmail, driveTitle } = req.body;

    let company = await prisma.company.findFirst({
      where: { OR: [{ name: companyName }, { hrEmail: hrEmail }] }
    });

    if (!company) {
      company = await prisma.company.create({
        data: { name: companyName, hrEmail, hrName }
      });
    }

    const drive = await prisma.placementDrive.create({
      data: {
        companyId: company.id,
        driveTitle,
        status: 'WAITING_FOR_HR',
        jobRole: 'TBD',
        jobDescription: 'TBD',
        employmentType: 'Full Time',
        workMode: 'On Campus',
        eligibleBranches: '[]',
      }
    });

    // Generate a shorter, secure token (32 hex characters)
    const token = crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + HR_LINK_EXPIRY_DAYS);

    const invitation = await prisma.hrInvitationLink.create({
      data: {
        driveId: drive.id,
        token,
        hrEmail,
        expiresAt,
      }
    });

    await prisma.driveAuditLog.create({
      data: {
        driveId: drive.id,
        action: 'HR_LINK_GENERATED',
        performedBy: 'Admin',
        comments: `Link generated for ${hrEmail}`
      }
    });

    res.status(200).json({
      success: true,
      message: 'Secure HR link generated',
      data: { driveId: drive.id, secureToken: token, expiresAt }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const validateHrLink = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    
    const invite = await prisma.hrInvitationLink.findUnique({
      where: { token }
    });

    if (!invite) {
      return res.status(404).json({ success: false, message: 'Link not found.' });
    }

    if (invite.isUsed) {
      return res.status(403).json({ success: false, message: 'Link has already been used.' });
    }

    if (invite.expiresAt < new Date()) {
      return res.status(403).json({ success: false, message: 'Link has expired.' });
    }

    const drive = await prisma.placementDrive.findUnique({
      where: { id: invite.driveId },
      include: { company: true, selectionRounds: true }
    });

    res.status(200).json({
      success: true,
      data: { drive, hrEmail: invite.hrEmail }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const autoSaveDraft = async (req: Request, res: Response) => {
  try {
    const { token, driveData, companyData, selectionRounds } = req.body;

    const invite = await prisma.hrInvitationLink.findUnique({ where: { token } });
    if (!invite || invite.isUsed || invite.expiresAt < new Date()) {
      return res.status(403).json({ success: false, message: 'Link is invalid, expired, or already used.' });
    }

    const drive = await prisma.placementDrive.update({
      where: { id: invite.driveId },
      data: {
        ...driveData,
        status: 'DRAFT',
      }
    });

    if (companyData) {
      await prisma.company.update({
        where: { id: drive.companyId },
        data: companyData
      });
    }

    if (selectionRounds && Array.isArray(selectionRounds)) {
      await prisma.selectionRound.deleteMany({ where: { driveId: drive.id } });
      await prisma.selectionRound.createMany({
        data: selectionRounds.map((round: any) => ({
          ...round,
          driveId: drive.id,
        }))
      });
    }

    res.status(200).json({ success: true, message: 'Draft saved' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to save draft' });
  }
};

export const submitHrDrive = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    
    const invite = await prisma.hrInvitationLink.findUnique({ where: { token } });
    if (!invite || invite.isUsed || invite.expiresAt < new Date()) {
      return res.status(403).json({ success: false, message: 'Link is invalid, expired, or already used.' });
    }

    await prisma.placementDrive.update({
      where: { id: invite.driveId },
      data: { status: 'SUBMITTED' }
    });

    await prisma.hrInvitationLink.update({
      where: { token },
      data: { isUsed: true }
    });

    await prisma.driveAuditLog.create({
      data: {
        driveId: invite.driveId,
        action: 'SUBMITTED',
        performedBy: 'HR',
      }
    });

    res.status(200).json({ success: true, message: 'Drive submitted successfully for review.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to submit drive' });
  }
};

// --- WORKSPACE ENDPOINTS ---

const getWorkspaceDrive = async (token: string) => {
  const hrLink = await prisma.hrInvitationLink.findUnique({
    where: { token },
    include: { drive: { include: { company: true, selectionRounds: true } } },
  });

  if (!hrLink) throw new Error('Invalid token');
  if (new Date() > hrLink.expiresAt) {
    throw new Error('Token expired');
  }
  
  if (!['ACTIVE', 'CLOSED', 'COMPLETED', 'PUBLISHED'].includes(hrLink.drive.status)) {
    throw new Error('Workspace is not available for this drive state');
  }
  return hrLink.drive;
};

export const getWorkspaceDetails = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const drive = await getWorkspaceDrive(token);

    const stats = {
      applications: await prisma.driveApplication.count({ where: { driveId: drive.id } }),
      shortlisted: await prisma.driveApplication.count({ where: { driveId: drive.id, status: 'SHORTLISTED' } }),
      interviewed: await prisma.driveApplication.count({ where: { driveId: drive.id, status: 'INTERVIEW_SCHEDULED' } }),
      selected: await prisma.driveApplication.count({ where: { driveId: drive.id, status: 'FINAL_SELECTED' } }),
      rejected: await prisma.driveApplication.count({ where: { driveId: drive.id, status: 'REJECTED' } }),
    };

    res.status(200).json({ drive, stats });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getWorkspaceCandidates = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const drive = await getWorkspaceDrive(token);

    const applications = await prisma.driveApplication.findMany({
      where: { driveId: drive.id },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            branch: true,
            cgpa: true,
            skills: true,
            resumeUrl: true,
            photoUrl: true,
          }
        },
        roundResults: true,
      },
      orderBy: { appliedAt: 'desc' }
    });

    res.status(200).json(applications);
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getCandidateDetails = async (req: Request, res: Response) => {
  try {
    const { token, applicationId } = req.params;
    const drive = await getWorkspaceDrive(token);

    const application = await prisma.driveApplication.findFirst({
      where: { id: applicationId, driveId: drive.id },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            branch: true,
            cgpa: true,
            passingYear: true,
            activeBacklogs: true,
            yearGap: true,
            resumeUrl: true,
            photoUrl: true,
            portfolioUrl: true,
            githubUrl: true,
            linkedinUrl: true,
            skills: true,
            programmingLanguages: true,
            projects: true,
            certifications: true,
            experience: true,
            dateOfBirth: true,
            gender: true,
            tenthBoard: true,
            tenthPercentage: true,
            tenthYear: true,
            twelfthBoard: true,
            twelfthPercentage: true,
            twelfthYear: true,
            diplomaBoard: true,
            diplomaPercentage: true,
            diplomaYear: true,
            semesterMarks: true,
            documents: {
              select: {
                id: true,
                documentType: true,
                fileName: true,
                fileUrl: true,
              }
            }
          }
        },
        roundResults: {
          include: { round: true }
        }
      }
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    res.status(200).json({ success: true, application });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateCandidateStatus = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { applicationIds, status } = req.body;
    
    // Validate status string briefly
    const validStatuses = [
      'SHORTLISTED', 'TEST_PENDING', 'TEST_COMPLETED', 'SELECTED_FOR_INTERVIEW',
      'INTERVIEW_SCHEDULED', 'INTERVIEWED', 'FINAL_SELECTED', 'OFFERED', 'REJECTED', 'WAITLISTED'
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const drive = await getWorkspaceDrive(token);

    const ids = Array.isArray(applicationIds) ? applicationIds : [applicationIds];

    const updated = await prisma.driveApplication.updateMany({
      where: { id: { in: ids }, driveId: drive.id },
      data: { status }
    });

    // Notify students
    const applications = await prisma.driveApplication.findMany({
      where: { id: { in: ids }, driveId: drive.id },
      include: { student: { select: { userId: true } } }
    });

    for (const app of applications) {
      await sendNotification({
        receiverId: app.student.userId,
        title: `Status Update: ${drive.company.name}`,
        message: `Your application status has been updated to: ${status.replace(/_/g, ' ')}.`,
        type: 'placement',
        category: 'placement',
        priority: 'HIGH',
        actionUrl: `/student/applications`,
      });
    }

    res.status(200).json({ success: true, message: `Updated ${updated.count} candidates to ${status}` });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const scheduleInterview = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { applicationIds, date, time, venue } = req.body;

    const drive = await getWorkspaceDrive(token);
    const ids = Array.isArray(applicationIds) ? applicationIds : [applicationIds];

    await prisma.driveApplication.updateMany({
      where: { id: { in: ids }, driveId: drive.id },
      data: { 
        status: 'INTERVIEW_SCHEDULED',
        interviewSchedule: { date, time, venue }
      }
    });

    const applications = await prisma.driveApplication.findMany({
      where: { id: { in: ids }, driveId: drive.id },
      include: { student: { select: { userId: true } } }
    });

    for (const app of applications) {
      await sendNotification({
        receiverId: app.student.userId,
        title: `Interview Scheduled: ${drive.company.name}`,
        message: `Your interview is scheduled on ${new Date(date).toLocaleDateString()} at ${time}. Venue: ${venue}`,
        type: 'interviews',
        category: 'interviews',
        priority: 'HIGH',
        actionUrl: `/student/interviews`,
      });
    }

    res.status(200).json({ success: true, message: `Scheduled interviews for ${applications.length} candidates` });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const processResultUpload = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { roundId, parsedData } = req.body; // parsedData from frontend excel parser
    
    const drive = await getWorkspaceDrive(token);
    
    const round = await prisma.selectionRound.findFirst({
      where: { id: roundId, driveId: drive.id }
    });
    
    if (!round) {
      return res.status(404).json({ success: false, message: 'Selection round not found for this drive.' });
    }

    // Match by PRN / Email / Name (Assuming parsedData has student PRN or email, or we just rely on PRN)
    // For simplicity, assume the frontend parsed array includes 'StudentId' or 'PRN' or 'Email'.
    
    // We will return a preview map.
    const allDriveApps = await prisma.driveApplication.findMany({
      where: { driveId: drive.id },
      include: { student: { select: { id: true, firstName: true, lastName: true, user: { select: { email: true } } } } }
    });
    
    const matches: any[] = [];
    const missing: any[] = [];
    
    for (const row of parsedData) {
      const email = row['Email'] || row['email'];
      const score = row['Score'] || row['score'];
      const resultStr = row['Result'] || row['result'] || row['Status'] || row['status'];
      const remarks = row['Remarks'] || row['remarks'];
      
      const app = allDriveApps.find(a => a.student.user.email.toLowerCase() === email?.toLowerCase());
      
      if (app) {
        matches.push({
          applicationId: app.id,
          studentName: `${app.student.firstName} ${app.student.lastName}`,
          email,
          score,
          result: resultStr,
          remarks
        });
      } else {
        missing.push(row);
      }
    }

    res.status(200).json({ success: true, data: { matches, missing } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const confirmResultUpload = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const payload = z.object({
      roundId: z.string().uuid(),
      results: z.array(z.object({
        applicationId: z.string().uuid(),
        score: z.union([z.string(), z.number()]).nullable().optional().refine(
          (value) => value === null || value === undefined || Number.isFinite(Number(value)),
          'Score must be numeric',
        ),
        result: z.string().trim().min(1).max(100),
        remarks: z.string().max(2000).nullable().optional(),
      })).min(1).max(1000),
      updateStatus: z.record(z.string()).optional(),
    }).parse(req.body);
    const { roundId, results, updateStatus } = payload;
    
    const drive = await getWorkspaceDrive(token);

    const round = await prisma.selectionRound.findFirst({
      where: { id: roundId, driveId: drive.id },
      select: { id: true },
    });
    if (!round) {
      return res.status(404).json({ success: false, message: 'Selection round not found for this drive.' });
    }

    const applicationIds = [...new Set(results.map((result) => result.applicationId))];
    const ownedApplications = await prisma.driveApplication.findMany({
      where: { id: { in: applicationIds }, driveId: drive.id },
      select: { id: true },
    });
    if (ownedApplications.length !== applicationIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more applications do not belong to this drive.',
      });
    }

    if (updateStatus && Object.values(updateStatus).some((status) => !isApplicationStatus(status))) {
      return res.status(400).json({ success: false, message: 'Invalid application status mapping.' });
    }
    
    // Using transaction for safe bulk upsert
    await prisma.$transaction(async (tx) => {
      for (const resultEntry of results) {
        // Upsert ApplicationRoundResult
        await tx.applicationRoundResult.upsert({
          where: { applicationId_roundId: { applicationId: resultEntry.applicationId, roundId } },
          create: {
            applicationId: resultEntry.applicationId,
            roundId,
            score: resultEntry.score !== null && resultEntry.score !== undefined
              ? Number(resultEntry.score)
              : null,
            result: resultEntry.result,
            remarks: resultEntry.remarks,
            uploadedBy: 'HR User'
          },
          update: {
            score: resultEntry.score !== null && resultEntry.score !== undefined
              ? Number(resultEntry.score)
              : null,
            result: resultEntry.result,
            remarks: resultEntry.remarks,
            uploadedAt: new Date()
          }
        });
        
        // Optional: Update application status automatically based on "updateStatus" mapping
        // Example: If result is 'Pass' and updateStatus is 'SELECTED_FOR_INTERVIEW'
        if (updateStatus && updateStatus[resultEntry.result]) {
          await tx.driveApplication.update({
            where: { id: resultEntry.applicationId },
            data: { status: updateStatus[resultEntry.result] }
          });
        }
      }
    });

    res.status(200).json({ success: true, message: 'Results uploaded successfully.' });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Invalid result payload', errors: error.errors });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};
