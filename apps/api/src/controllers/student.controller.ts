import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getProfile = async (req: any, res: any) => {
  try {
    const userId = req.user?.id;
    
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

export const updatePhoto = async (req: any, res: any) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { photoUrl } = req.body;
    
    if (!photoUrl) {
      return res.status(400).json({ message: 'Photo URL is required' });
    }

    const updatedProfile = await prisma.studentProfile.update({
      where: { userId },
      data: { photoUrl }
    });

    return res.status(200).json(updatedProfile);
  } catch (error: any) {
    console.error('Update photo error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const updateProfile = async (req: any, res: any) => {
  try {
    const userId = req.user?.id;
    
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

    const updateData = {
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
      photoUrl: data.photoUrl,
      portfolioUrl: data.portfolioUrl,
      githubUrl: data.githubUrl,
      linkedinUrl: data.linkedinUrl,
      skills: data.skills || null,
      programmingLanguages: data.programmingLanguages || null,
      projects: data.projects || null,
      codingProfiles: data.codingProfiles || null,
      educationDetails: data.educationDetails,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
      address: data.address,
      alternatePhone: data.alternatePhone,
      category: data.category,
      tenthBoard: data.tenthBoard,
      tenthYear: data.tenthYear ? parseInt(data.tenthYear) : null,
      tenthPercentage: data.tenthPercentage ? parseFloat(data.tenthPercentage) : null,
      twelfthBoard: data.twelfthBoard,
      twelfthYear: data.twelfthYear ? parseInt(data.twelfthYear) : null,
      twelfthPercentage: data.twelfthPercentage ? parseFloat(data.twelfthPercentage) : null,
      diplomaBoard: data.diplomaBoard,
      diplomaYear: data.diplomaYear ? parseInt(data.diplomaYear) : null,
      diplomaPercentage: data.diplomaPercentage ? parseFloat(data.diplomaPercentage) : null,
      currentSemester: data.currentSemester ? parseInt(data.currentSemester) : null,
      totalBacklogs: data.totalBacklogs ? parseInt(data.totalBacklogs) : 0,
      certifications: data.certifications || null,
      experience: data.experience || null,
      languages: data.languages || null,
      isProfileComplete
    };

    const existingProfile = await prisma.studentProfile.findUnique({
      where: { userId }
    });

    // Determine the next status
    let nextStatus = existingProfile?.profileStatus || 'NOT_COMPLETED';
    if (isProfileComplete && (nextStatus === 'NOT_COMPLETED' || nextStatus === 'UPDATE_REJECTED')) {
      nextStatus = 'PENDING_VERIFICATION';
    }

    if (existingProfile && existingProfile.profileStatus === 'PENDING_VERIFICATION') {
      return res.status(400).json({ message: 'Profile is currently under verification. Updates are not allowed.' });
    }

    if (existingProfile && existingProfile.profileStatus === 'VERIFIED') {
      return res.status(400).json({ message: 'Profile is already verified. Please submit an update request instead.' });
    }

    const updatedProfile = await prisma.studentProfile.upsert({
      where: { userId },
      update: {
        ...updateData,
        profileStatus: nextStatus
      },
      create: {
        userId,
        ...updateData,
        profileStatus: nextStatus
      }
    });

    if (nextStatus === 'PENDING_VERIFICATION' && (!existingProfile || existingProfile.profileStatus !== 'PENDING_VERIFICATION')) {
      // Create Audit Log
      await prisma.profileAuditLog.create({
        data: {
          studentId: updatedProfile.id,
          action: 'PROFILE_SUBMITTED',
          performedBy: userId,
          newValue: updateData as any
        }
      });
    }

    return res.status(200).json(updatedProfile);
  } catch (error: any) {
    console.error('Update profile error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const getProfileStatus = async (req: any, res: any) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        updateRequests: {
          where: { status: 'PENDING' },
          orderBy: { requestedAt: 'desc' },
          take: 1
        }
      }
    });

    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    return res.status(200).json({
      status: profile.profileStatus,
      isProfileComplete: profile.isProfileComplete,
      pendingUpdateRequest: profile.updateRequests[0] || null
    });
  } catch (error: any) {
    console.error('Get profile status error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const requestProfileUpdate = async (req: any, res: any) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const data = req.body;
    
    const profile = await prisma.studentProfile.findUnique({
      where: { userId }
    });

    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    if (profile.profileStatus !== 'VERIFIED') {
      return res.status(400).json({ message: 'Only verified profiles can request updates' });
    }

    // Check if there is already a pending request
    const pendingRequest = await prisma.profileUpdateRequest.findFirst({
      where: {
        studentId: profile.id,
        status: 'PENDING'
      }
    });

    if (pendingRequest) {
      return res.status(400).json({ message: 'You already have a pending update request' });
    }

    // Determine changed fields
    const changedFields: any = {};
    const previousValues: any = {};
    
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined) {
        const newValue = typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key];
        const oldValue = typeof (profile as any)[key] === 'object' ? JSON.stringify((profile as any)[key]) : (profile as any)[key];
        
        if (newValue !== oldValue) {
          changedFields[key] = data[key];
          previousValues[key] = (profile as any)[key];
        }
      }
    });

    if (Object.keys(changedFields).length === 0) {
      return res.status(400).json({ message: 'No changes detected' });
    }

    const request = await prisma.profileUpdateRequest.create({
      data: {
        studentId: profile.id,
        requestedChanges: changedFields,
        previousValues: previousValues,
        changedFields: Object.keys(changedFields),
        reason: data.reason || 'Student requested profile update',
        status: 'PENDING'
      }
    });

    await prisma.studentProfile.update({
      where: { id: profile.id },
      data: { profileStatus: 'UPDATE_REQUESTED' }
    });
    
    await prisma.profileAuditLog.create({
      data: {
        studentId: profile.id,
        action: 'PROFILE_CHANGE_REQUESTED',
        performedBy: userId,
        newValue: changedFields,
        previousValue: previousValues,
        comments: data.reason || 'Student requested profile update'
      }
    });

    return res.status(201).json(request);
  } catch (error: any) {
    console.error('Request profile update error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const applyForDrive = async (req: any, res: any) => {
  try {
    const userId = req.user?.id;
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
    const userId = req.user?.id;
    
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
    const userId = req.user?.id;
    
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
    const userId = req.user?.id;
    
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

// ML Prediction Proxy — calls Python ML microservice
export const mlPredictSuccess = async (req: any, res: any) => {
  const { studentId } = req.params;
  const userId = req.user?.id;
  const targetUserId = studentId || userId;

  try {
    const profile = await prisma.studentProfile.findFirst({
      where: { userId: targetUserId }
    });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found for ML prediction' });
    }

    const payload = {
      cgpa: profile.cgpa || 7.0,
      experience_years: 0,
      active_backlogs: profile.activeBacklogs || 0,
      education: 'B.Tech',
      occupation: 'Student'
    };

    let mlData: any = null;

    try {
      const mlResp = await fetch(`${process.env.ML_SERVICE_URL || 'http://localhost:8000'}/api/ai/students/success-prediction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (mlResp.ok) {
        mlData = await mlResp.json();
      } else {
        throw new Error(`ML service returned ${mlResp.status}`);
      }
    } catch (mlErr) {
      console.warn('ML service unavailable or failed, using fallback heuristic', mlErr);
      const cgpa = profile.cgpa || 7.0;
      const successRate = Math.min(95, Math.max(10, (cgpa / 10) * 80 + (profile.activeBacklogs === 0 ? 10 : -15)));
      const riskLevel = successRate >= 70 ? 'LOW' : successRate >= 50 ? 'MEDIUM' : 'HIGH';
      
      mlData = {
        predictedSuccessRate: successRate,
        riskLevel,
        riskFactors: [
          { feature: cgpa >= 8 ? 'High CGPA' : 'CGPA', impact: cgpa >= 7 ? 'positive' : 'negative' },
          ...(profile.activeBacklogs > 0 ? [{ feature: 'Active Backlogs', impact: 'negative' }] : [])
        ]
      };
    }

    // Save to database
    await prisma.studentProfile.update({
      where: { id: profile.id },
      data: {
        predictedSuccessRate: mlData.predictedSuccessRate,
        riskLevel: mlData.riskLevel,
        riskFactors: mlData.riskFactors || [],
        lastPredictionAt: new Date()
      }
    });

    return res.status(200).json({
      studentId: targetUserId,
      ...mlData,
      modelVersion: mlData.modelVersion || 'fallback-1.0.0'
    });

  } catch (error: any) {
    console.error('ML Predict error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

