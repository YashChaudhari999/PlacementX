import prisma from '../utils/prisma';
import { Request, Response } from 'express';
import crypto from 'crypto';
import { createNotification as sendNotification } from '../services/notification.service';

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
  // Once active, token expiry shouldn't lock out HR during an active drive, or we just trust expiresAt.
  // For safety, we'll respect expiresAt unless drive is PUBLISHED/ACTIVE/CLOSED.
  if (new Date() > hrLink.expiresAt && !['ACTIVE', 'CLOSED', 'PUBLISHED'].includes(hrLink.drive.status)) {
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
    const { roundId, results, updateStatus } = req.body;
    
    const drive = await getWorkspaceDrive(token);
    
    // Using transaction for safe bulk upsert
    await prisma.$transaction(async (tx) => {
      for (const res of results) {
        // Upsert ApplicationRoundResult
        await tx.applicationRoundResult.upsert({
          where: { applicationId_roundId: { applicationId: res.applicationId, roundId } },
          create: {
            applicationId: res.applicationId,
            roundId,
            score: res.score ? parseFloat(res.score) : null,
            result: res.result,
            remarks: res.remarks,
            uploadedBy: 'HR User'
          },
          update: {
            score: res.score ? parseFloat(res.score) : null,
            result: res.result,
            remarks: res.remarks,
            uploadedAt: new Date()
          }
        });
        
        // Optional: Update application status automatically based on "updateStatus" mapping
        // Example: If result is 'Pass' and updateStatus is 'SELECTED_FOR_INTERVIEW'
        if (updateStatus && updateStatus[res.result]) {
          await tx.driveApplication.update({
            where: { id: res.applicationId },
            data: { status: updateStatus[res.result] }
          });
        }
      }
    });

    res.status(200).json({ success: true, message: 'Results uploaded successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
