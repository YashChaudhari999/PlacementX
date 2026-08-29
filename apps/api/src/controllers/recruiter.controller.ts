import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { createNotification as sendNotification } from '../services/notification.service';

const prisma = new PrismaClient();

// Utility function to get the drive by HR token
const getDriveByToken = async (token: string) => {
  const hrLink = await prisma.hrInvitationLink.findUnique({
    where: { token },
    include: {
      drive: {
        include: { company: true },
      },
    },
  });

  if (!hrLink) {
    throw new Error('Invalid token');
  }

  if (new Date() > hrLink.expiresAt) {
    throw new Error('Token expired');
  }

  return hrLink.drive;
};

// 1. Get Event Details
export const getEventDetails = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const drive = await getDriveByToken(token);

    const stats = {
      applications: await prisma.driveApplication.count({ where: { driveId: drive.id } }),
      shortlisted: await prisma.driveApplication.count({ where: { driveId: drive.id, status: 'SHORTLISTED' } }),
      interviewed: await prisma.driveApplication.count({ where: { driveId: drive.id, status: 'INTERVIEW_SCHEDULED' } }),
      selected: await prisma.driveApplication.count({ where: { driveId: drive.id, status: 'SELECTED' } }),
      rejected: await prisma.driveApplication.count({ where: { driveId: drive.id, status: 'REJECTED' } }),
    };

    res.status(200).json({ drive, stats });
  } catch (error: any) {
    if (error.message === 'Invalid token' || error.message === 'Token expired') {
      res.status(401).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Error fetching event details', error: error.message });
    }
  }
};

// 2. Get Candidates
export const getEventCandidates = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const drive = await getDriveByToken(token);

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
            resumeUrl: true,
            skills: true,
          }
        }
      },
      orderBy: { appliedAt: 'desc' }
    });

    res.status(200).json(applications);
  } catch (error: any) {
    if (error.message === 'Invalid token' || error.message === 'Token expired') {
      res.status(401).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Error fetching candidates', error: error.message });
    }
  }
};

// 3. Update Candidate Status (Shortlist, Reject, etc)
export const updateCandidateStatus = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { applicationId, status } = req.body;
    
    if (!['SHORTLISTED', 'REJECTED', 'SELECTED', 'WAITLISTED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const drive = await getDriveByToken(token);

    const application = await prisma.driveApplication.findFirst({
      where: { id: applicationId, driveId: drive.id },
      include: { student: { select: { userId: true } } }
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    await prisma.driveApplication.update({
      where: { id: applicationId },
      data: { status }
    });

    // Notify Student
    await sendNotification({
      receiverId: application.student.userId,
      title: `Application Status Updated`,
      message: `Your application for ${drive.company.name} has been marked as ${status}.`,
      type: 'placement',
      category: 'placement',
      priority: 'HIGH',
      actionUrl: `/student/applications`,
    });

    res.status(200).json({ message: `Status updated to ${status}` });
  } catch (error: any) {
    if (error.message === 'Invalid token' || error.message === 'Token expired') {
      res.status(401).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Error updating candidate status', error: error.message });
    }
  }
};

// 4. Schedule Interview
export const scheduleInterview = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { applicationId, date, time, venue } = req.body;

    const drive = await getDriveByToken(token);

    const application = await prisma.driveApplication.findFirst({
      where: { id: applicationId, driveId: drive.id },
      include: { student: { select: { userId: true } } }
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    await prisma.driveApplication.update({
      where: { id: applicationId },
      data: { 
        status: 'INTERVIEW_SCHEDULED',
        interviewSchedule: { date, time, venue }
      }
    });

    // Notify Student
    await sendNotification({
      receiverId: application.student.userId,
      title: `Interview Scheduled: ${drive.company.name}`,
      message: `Your interview is scheduled on ${new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })} at ${time}. Venue/Link: ${venue}`,
      type: 'interviews',
      category: 'interviews',
      priority: 'HIGH',
      actionUrl: `/student/interviews`,
    });

    res.status(200).json({ message: `Interview scheduled successfully` });
  } catch (error: any) {
    if (error.message === 'Invalid token' || error.message === 'Token expired') {
      res.status(401).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Error scheduling interview', error: error.message });
    }
  }
};

// 5. Bulk Update Results
export const bulkUpdateResults = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { selections } = req.body; // Array of { applicationId, status }

    const drive = await getDriveByToken(token);

    for (const selection of selections) {
      if (!['SHORTLISTED', 'REJECTED', 'SELECTED', 'WAITLISTED'].includes(selection.status)) continue;

      const application = await prisma.driveApplication.findFirst({
        where: { id: selection.applicationId, driveId: drive.id },
        include: { student: { select: { userId: true } } }
      });

      if (application) {
        await prisma.driveApplication.update({
          where: { id: application.id },
          data: { status: selection.status }
        });

        await sendNotification({
          receiverId: application.student.userId,
          title: `Placement Result: ${drive.company.name}`,
          message: `Your application has been updated to: ${selection.status}.`,
          type: 'placement',
          category: 'placement',
          priority: 'HIGH',
          actionUrl: `/student/applications`,
        });
      }
    }

    res.status(200).json({ message: `Bulk update successful` });
  } catch (error: any) {
    if (error.message === 'Invalid token' || error.message === 'Token expired') {
      res.status(401).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Error during bulk update', error: error.message });
    }
  }
};
