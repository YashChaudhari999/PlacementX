import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// 1. Students Module
export const getStudents = async (req: any, res: any) => {
  try {
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      include: {
        studentProfile: {
          include: {
            applications: {
              select: { status: true }
            }
          }
        }
      }
    });

    // Compute basic status for frontend
    const formattedStudents = students.map((s: any) => {
      const isPlaced = s.studentProfile?.applications?.some((app: any) => app.status === 'SELECTED') || false;
      return {
        id: s.id,
        name: `${s.studentProfile?.firstName || ''} ${s.studentProfile?.lastName || ''}`.trim(),
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

export const importStudents = async (req: any, res: any) => {
  try {
    const students = req.body;
    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ message: 'Invalid or empty students array' });
    }

    const defaultPassword = await bcrypt.hash('student123', 10);
    
    let importedCount = 0;
    
    // Process each student sequentially to avoid overwhelming DB and to handle existing gracefully
    for (const student of students) {
      const { firstName, lastName, email, branch, cgpa, passingYear } = student;
      
      if (!email || !firstName) continue;

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) continue;

      await prisma.user.create({
        data: {
          email,
          password: defaultPassword,
          role: 'STUDENT',
          studentProfile: {
            create: {
              firstName,
              lastName,
              branch: branch || null,
              cgpa: cgpa ? parseFloat(cgpa) : null,
              passingYear: passingYear ? parseInt(passingYear, 10) : null
            }
          }
        }
      });
      importedCount++;
    }

    return res.status(200).json({ message: `Successfully imported ${importedCount} students.` });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error importing students', error: error.message });
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
        email,
        password, // In a real app, hash this!
        role: 'PLACEMENT_COORDINATOR',
        coordinatorProfile: {
          create: {
            firstName,
            lastName
          }
        }
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
      Student_Name: `${app.student.firstName || ''} ${app.student.lastName || ''}`.trim(),
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
    const now = new Date();
    
    // --- 1. Summary Statistics ---
    const upcomingDrivesCount = await prisma.placementDrive.count({
      where: { expectedDriveDate: { gt: now } }
    });
    const registrationOpenCount = await prisma.placementDrive.count({
      where: { registrationStart: { lte: now }, registrationEnd: { gt: now } }
    });
    
    const oneWeekFromNow = new Date(now);
    oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
    const closingThisWeekCount = await prisma.placementDrive.count({
      where: { registrationEnd: { gte: now, lte: oneWeekFromNow } }
    });
    
    const interviewsCount = await prisma.selectionRound.count({
      where: { date: { gte: now } }
    });
    
    const offersReleasedCount = await prisma.offerLetter.count();
    
    const completedCount = await prisma.placementDrive.count({
      where: { status: 'COMPLETED' }
    });

    const summary = {
      upcomingDrives: upcomingDrivesCount,
      registrationOpen: registrationOpenCount,
      closingThisWeek: closingThisWeekCount,
      interviews: interviewsCount,
      offersReleased: offersReleasedCount,
      completed: completedCount
    };

    // --- 2. Dynamic Semester Calculation ---
    // Hardcoded config as requested
    const sem7Start = new Date('2026-07-13');
    const sem7End = new Date('2026-12-05');
    
    const sem8Start = new Date('2027-01-02');
    const sem8End = new Date('2027-04-30');

    const generateWeeks = (start: Date, end: Date) => {
      const weeks = [];
      let currentStart = new Date(start);
      let weekNum = 1;

      while (currentStart <= end) {
        let currentEnd = new Date(currentStart);
        currentEnd.setDate(currentEnd.getDate() + 6);
        
        if (currentEnd > end) {
          currentEnd = new Date(end);
        }

        weeks.push({
          id: weekNum,
          start: currentStart.toISOString().split('T')[0],
          end: currentEnd.toISOString().split('T')[0]
        });

        currentStart.setDate(currentStart.getDate() + 7);
        weekNum++;
      }
      return weeks;
    };

    const semester = {
      semester7: {
        startDate: '2026-07-13',
        endDate: '2026-12-05',
        weeks: generateWeeks(sem7Start, sem7End)
      },
      semester8: {
        startDate: '2027-01-02',
        endDate: '2027-04-30',
        weeks: generateWeeks(sem8Start, sem8End)
      }
    };

    // --- 3. Events Mapping ---
    const allDrives = await prisma.placementDrive.findMany({
      include: { company: true }
    });

    let calendarEvents: any[] = [];

    allDrives.forEach((d: any) => {
      // 3.1 Registration Open Event
      if (d.registrationStart && d.registrationEnd) {
        calendarEvents.push({
          id: `reg-${d.id}`,
          title: `${d.company?.name} - Registration Open`,
          start: d.registrationStart.toISOString().split('T')[0],
          end: d.registrationEnd.toISOString().split('T')[0],
          allDay: true,
          color: '#10b981', // green
          extendedProps: {
            driveId: d.id,
            company: d.company?.name,
            status: 'Registration Open',
            type: 'Placement Drive',
            department: d.eligibleBranches ? JSON.parse(d.eligibleBranches) : [],
            package: d.fixedSalary ? `${d.fixedSalary} LPA` : 'N/A',
            location: d.location || d.workMode,
            description: 'Registration window is currently active.'
          }
        });
      }

      // 3.2 Main Drive Event (Spanning Expected Drive Date)
      if (d.expectedDriveDate) {
        const driveEnd = new Date(d.expectedDriveDate);
        driveEnd.setDate(driveEnd.getDate() + 2); // Assume 2 days duration for the visual span

        calendarEvents.push({
          id: `drive-${d.id}`,
          title: `${d.company?.name} - Campus Drive`,
          start: d.expectedDriveDate.toISOString().split('T')[0],
          end: driveEnd.toISOString().split('T')[0],
          allDay: true,
          color: '#3b82f6', // blue
          extendedProps: {
            driveId: d.id,
            company: d.company?.name,
            status: d.status,
            type: d.driveType || 'Placement Drive',
            department: d.eligibleBranches ? JSON.parse(d.eligibleBranches) : [],
            package: d.fixedSalary ? `${d.fixedSalary} LPA` : 'N/A',
            location: d.location || d.workMode,
            description: d.jobDescription || ''
          }
        });
      }
      
      // 3.3 Application Deadline
      if (d.applicationDeadline) {
         calendarEvents.push({
          id: `deadline-${d.id}`,
          title: `${d.company?.name} Deadline`,
          start: d.applicationDeadline.toISOString(),
          allDay: true,
          color: '#ef4444', // red
          extendedProps: {
             driveId: d.id,
             company: d.company?.name,
             type: 'Deadline',
             status: 'Registration Closed'
          }
         });
      }
    });

    // 3.4 Selection Rounds (Interviews)
    const rounds = await prisma.selectionRound.findMany({
      include: { drive: { include: { company: true } } }
    });

    rounds.forEach((r: any) => {
      if (r.date) {
        calendarEvents.push({
          id: `round-${r.id}`,
          title: `${r.drive.company?.name} - ${r.title}`,
          start: r.time ? `${r.date.toISOString().split('T')[0]}T${r.time}:00` : r.date.toISOString().split('T')[0],
          allDay: !r.time,
          color: '#8b5cf6', // purple
          extendedProps: {
            driveId: r.drive.id,
            company: r.drive.company?.name,
            status: 'Interview',
            type: 'Interview Schedule',
            venue: r.venue || r.platform,
            description: r.instructions || ''
          }
        });
      }
    });

    return res.status(200).json({
      summary,
      semester,
      events: calendarEvents
    });
  } catch (error: any) {
    console.error('Calendar Error:', error);
    return res.status(500).json({ message: 'Error fetching calendar events', error: error.message });
  }
};

// 6. Dashboard Module
export const getAdminDashboard = async (req: any, res: any) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const now = new Date();

    // Drives
    const todaysDrives = await prisma.placementDrive.count({
      where: {
        expectedDriveDate: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    const upcomingClosedDrives = await prisma.placementDrive.count({
      where: {
        registrationEnd: { lt: now },
        expectedDriveDate: { gt: now },
      },
    });

    const openDrives = await prisma.placementDrive.count({
      where: {
        registrationStart: { lte: now },
        registrationEnd: { gt: now },
      },
    });

    const eligibleStudents = await prisma.studentProfile.count({
      where: {
        isProfileComplete: true,
        activeBacklogs: 0,
      },
    });

    const activeDrives = await prisma.placementDrive.findMany({
      where: {
        registrationEnd: { gte: now }
      },
      include: { company: true }
    });

    const eligibleByCompanyMap: Record<string, number> = {};

    for (const drive of activeDrives) {
      const companyName = drive.company?.name || 'Unknown';
      
      const count = await prisma.studentProfile.count({
        where: {
          isProfileComplete: true,
          cgpa: { gte: drive.minimumCgpa || 0 },
          activeBacklogs: { lte: drive.activeBacklogsAllowed || 0 }
        }
      });

      eligibleByCompanyMap[companyName] = (eligibleByCompanyMap[companyName] || 0) + count;
    }

    const eligibleByCompany = Object.entries(eligibleByCompanyMap)
      .map(([company, count]) => ({ company, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const allApplications = await prisma.driveApplication.findMany({
      include: {
        drive: {
          include: { company: true },
        },
      },
    });

    const companyAppCounts: Record<string, number> = {};
    for (const app of allApplications) {
      const companyName = app.drive?.company?.name;
      if (companyName) {
        companyAppCounts[companyName] = (companyAppCounts[companyName] || 0) + 1;
      }
    }

    const applicationsByCompany = Object.entries(companyAppCounts)
      .map(([company, applications]) => ({ company, applications }))
      .sort((a, b) => b.applications - a.applications)
      .slice(0, 5);

    // Packages
    const placedStudentsObj = await prisma.driveApplication.groupBy({
      by: ['studentId'],
      where: { status: 'SELECTED' },
    });
    const placedStudents = placedStudentsObj.length;

    const placementPercentage = eligibleStudents > 0 
      ? Math.round((placedStudents / eligibleStudents) * 100) 
      : 0;

    const selectedApps = await prisma.driveApplication.findMany({
      where: { status: 'SELECTED' },
      include: {
        drive: { select: { fixedSalary: true } },
      },
    });

    const packages = selectedApps
      .map(app => app.drive?.fixedSalary)
      .filter((p): p is number => p !== null && p > 0)
      .sort((a, b) => a - b);

    let highest = 0;
    let average = 0;
    let median = 0;

    if (packages.length > 0) {
      highest = packages[packages.length - 1];
      average = packages.reduce((a, b) => a + b, 0) / packages.length;
      
      const mid = Math.floor(packages.length / 2);
      median = packages.length % 2 !== 0 
        ? packages[mid] 
        : (packages[mid - 1] + packages[mid]) / 2;
    }

    // Overall
    const companiesVisitedObj = await prisma.placementDrive.findMany({
      where: { status: { not: 'DRAFT' } },
      distinct: ['companyId'],
      select: { companyId: true }
    });

    const totalOffers = selectedApps.length;

    return res.status(200).json({
      drives: {
        today: todaysDrives,
        upcomingClosed: upcomingClosedDrives,
        open: openDrives,
      },
      students: {
        eligible: eligibleStudents,
        eligibleByCompany,
        applicationsByCompany,
      },
      packages: {
        placementPercentage,
        highest,
        average: Math.round(average * 100) / 100,
        median: Math.round(median * 100) / 100,
      },
      overall: {
        companiesVisited: companiesVisitedObj.length,
        totalOffers,
      },
    });
  } catch (error: any) {
    console.error('Get admin dashboard error:', error);
    return res.status(500).json({ message: 'Error fetching dashboard data', error: error.message });
  }
};
