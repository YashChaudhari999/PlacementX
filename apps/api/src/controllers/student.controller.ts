import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getProfile = async (req: any, res: any) => {
  try {
    const userId = req.user?.id || req.headers['x-user-id'];
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: { email: true }
        }
      }
    });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    return res.status(200).json(profile);
  } catch (error: any) {
    console.error('Get profile error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const updateProfile = async (req: any, res: any) => {
  try {
    const userId = req.user?.id || req.headers['x-user-id'];
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const data = req.body;
    
    // Check if profile is complete (basic validation)
    const isProfileComplete = !!(
      data.firstName && 
      data.lastName && 
      data.phone && 
      data.branch && 
      data.cgpa && 
      data.passingYear &&
      data.resumeUrl
    );

    const updatedProfile = await prisma.studentProfile.update({
      where: { userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        branch: data.branch,
        cgpa: data.cgpa ? parseFloat(data.cgpa) : null,
        passingYear: data.passingYear ? parseInt(data.passingYear) : null,
        activeBacklogs: data.activeBacklogs ? parseInt(data.activeBacklogs) : 0,
        yearGap: data.yearGap ? parseInt(data.yearGap) : 0,
        nationality: data.nationality,
        gender: data.gender,
        resumeUrl: data.resumeUrl,
        portfolioUrl: data.portfolioUrl,
        githubUrl: data.githubUrl,
        skills: data.skills, // Should be passed as JSON string
        projects: data.projects, // Should be passed as JSON string
        educationDetails: data.educationDetails, // Should be passed as JSON string
        isProfileComplete
      }
    });

    return res.status(200).json(updatedProfile);
  } catch (error: any) {
    console.error('Update profile error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const applyForDrive = async (req: any, res: any) => {
  try {
    const userId = req.user?.id || req.headers['x-user-id'];
    const { driveId } = req.body;

    if (!userId || !driveId) {
      return res.status(400).json({ message: 'Missing userId or driveId' });
    }

    const student = await prisma.studentProfile.findUnique({
      where: { userId }
    });

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    if (!student.isProfileComplete) {
      return res.status(400).json({ message: 'Please complete your profile before applying' });
    }

    // Check if already applied
    const existingApp = await prisma.driveApplication.findUnique({
      where: {
        driveId_studentId: {
          driveId,
          studentId: student.id
        }
      }
    });

    if (existingApp) {
      return res.status(400).json({ message: 'You have already applied to this drive' });
    }

    // Double check eligibility
    const drive = await prisma.placementDrive.findUnique({ where: { id: driveId } });
    if (!drive) return res.status(404).json({ message: 'Drive not found' });

    const { checkEligibility } = await import('../services/eligibility.service');
    const eligibility = checkEligibility(student, drive);

    if (!eligibility.isEligible) {
      return res.status(400).json({ message: 'You are not eligible for this drive', reasons: eligibility.reasons });
    }

    const application = await prisma.driveApplication.create({
      data: {
        driveId,
        studentId: student.id,
        status: 'APPLIED'
      }
    });

    return res.status(201).json(application);
  } catch (error: any) {
    console.error('Apply for drive error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const getApplications = async (req: any, res: any) => {
  try {
    const userId = req.user?.id || req.headers['x-user-id'];
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const student = await prisma.studentProfile.findUnique({
      where: { userId }
    });

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const applications = await prisma.driveApplication.findMany({
      where: { studentId: student.id },
      include: {
        drive: {
          include: {
            company: true
          }
        },
        offerLetter: true
      },
      orderBy: {
        appliedAt: 'desc'
      }
    });

    return res.status(200).json(applications);
  } catch (error: any) {
    console.error('Get applications error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const getInterviews = async (req: any, res: any) => {
  try {
    const userId = req.user?.id || req.headers['x-user-id'];
    
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const student = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    // Find applications that are in an interview state
    const applications = await prisma.driveApplication.findMany({
      where: { 
        studentId: student.id,
        status: {
          in: ['ASSESSMENT_SCHEDULED', 'TECHNICAL_INTERVIEW', 'HR_INTERVIEW']
        }
      },
      include: {
        drive: {
          include: {
            company: true,
            selectionRounds: true
          }
        }
      }
    });

    // Extract rounds
    const upcomingInterviews = applications.map((app: any) => {
      return {
        applicationId: app.id,
        status: app.status,
        company: app.drive.company?.name,
        role: app.drive.jobRole,
        rounds: app.drive.selectionRounds
      };
    });

    return res.status(200).json(upcomingInterviews);
  } catch (error: any) {
    console.error('Get interviews error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const getDocuments = async (req: any, res: any) => {
  try {
    const userId = req.user?.id || req.headers['x-user-id'];
    
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const student = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    // Find applications with offer letters
    const applications = await prisma.driveApplication.findMany({
      where: { 
        studentId: student.id,
        offerLetter: { isNot: null }
      },
      include: {
        drive: { include: { company: true } },
        offerLetter: true
      }
    });

    const documents = applications.map((app: any) => ({
      id: app.offerLetter?.id,
      company: app.drive.company?.name,
      role: app.drive.jobRole,
      offerLetterUrl: app.offerLetter?.offerLetterUrl,
      uploadedAt: app.offerLetter?.uploadedAt
    }));

    return res.status(200).json({
      resumeUrl: student.resumeUrl,
      offers: documents
    });
  } catch (error: any) {
    console.error('Get documents error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
