import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 1. Students Module
export const getStudents = async (req: any, res: any) => {
  try {
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      include: {
        studentProfile: true,
        applications: {
          select: { status: true }
        }
      }
    });

    // Compute basic status for frontend
    const formattedStudents = students.map((s: any) => {
      const isPlaced = s.applications.some((app: any) => app.status === 'SELECTED');
      return {
        id: s.id,
        name: `${s.firstName} ${s.lastName}`,
        email: s.email,
        branch: s.studentProfile?.branch || 'N/A',
        cgpa: s.studentProfile?.cgpa || 0,
        status: isPlaced ? 'Placed' : 'Unplaced',
        resumeUrl: s.studentProfile?.resumeUrl
      };
    });

    return res.status(200).json(formattedStudents);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching students', error: error.message });
  }
};

// 2. Coordinators Module
export const getCoordinators = async (req: any, res: any) => {
  try {
    const coordinators = await prisma.user.findMany({
      where: { role: 'PLACEMENT_COORDINATOR' }
    });
    return res.status(200).json(coordinators);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching coordinators', error: error.message });
  }
};

export const addCoordinator = async (req: any, res: any) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const coordinator = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password, // In a real app, hash this!
        role: 'PLACEMENT_COORDINATOR'
      }
    });

    return res.status(201).json(coordinator);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error adding coordinator', error: error.message });
  }
};

// 3. Reports Module
export const getReportsData = async (req: any, res: any) => {
  try {
    // Generate a structured JSON that the frontend can convert to CSV
    const applications = await prisma.driveApplication.findMany({
      include: {
        student: {
          include: { user: true }
        },
        drive: {
          include: { company: true }
        }
      }
    });

    const reportData = applications.map((app: any) => ({
      Student_Name: `${app.student.user.firstName} ${app.student.user.lastName}`,
      Email: app.student.user.email,
      Branch: app.student.branch,
      Company: app.drive.company?.name,
      Role: app.drive.jobRole,
      Package_LPA: app.drive.fixedSalary,
      Status: app.status,
      Applied_On: app.createdAt
    }));

    return res.status(200).json(reportData);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error generating report', error: error.message });
  }
};

// 4. Notifications Module (Broadcast)
export const broadcastNotification = async (req: any, res: any) => {
  try {
    const { title, message, link, type = 'INFO', targetBranch = 'ALL' } = req.body;
    
    // Build query to find target students
    let whereClause: any = { role: 'STUDENT' };
    
    if (targetBranch !== 'ALL') {
      whereClause = {
        role: 'STUDENT',
        studentProfile: {
          branch: targetBranch
        }
      };
    }

    // Get targeted students
    const students = await prisma.user.findMany({ 
      where: whereClause,
      select: { id: true }
    });
    
    if (students.length === 0) {
      return res.status(404).json({ message: 'No students found matching the selected audience.' });
    }

    // Create notifications in bulk
    const notifications = students.map((student: any) => ({
      userId: student.id,
      title,
      message,
      link,
      type,
      isRead: false
    }));

    await prisma.notification.createMany({
      data: notifications
    });

    return res.status(201).json({ message: `Broadcasted to ${students.length} students` });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error broadcasting notification', error: error.message });
  }
};

// 5. Calendar Module
export const getCalendarEvents = async (req: any, res: any) => {
  try {
    const rounds = await prisma.selectionRound.findMany({
      include: {
        drive: {
          include: { company: true }
        }
      }
    });

    const events = rounds.map((r: any) => ({
      id: r.id,
      title: `${r.drive.company?.name} - ${r.title}`,
      date: r.date,
      time: r.time,
      venue: r.venue,
      type: 'ROUND'
    }));

    const deadlines = await prisma.placementDrive.findMany({
      where: { applicationDeadline: { not: null } },
      include: { company: true }
    });

    const deadlineEvents = deadlines.map((d: any) => ({
      id: `deadline-${d.id}`,
      title: `${d.company?.name} - Application Deadline`,
      date: d.applicationDeadline,
      type: 'DEADLINE'
    }));

    return res.status(200).json([...events, ...deadlineEvents]);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching calendar events', error: error.message });
  }
};
