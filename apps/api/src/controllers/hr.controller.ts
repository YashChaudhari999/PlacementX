import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();
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

    if (!invite || invite.isUsed || invite.expiresAt < new Date()) {
      return res.status(403).json({ success: false, message: 'Link is invalid, expired, or already used.' });
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
