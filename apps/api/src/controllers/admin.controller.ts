import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { firebaseAdmin } from '../config/firebaseAdmin';
import prisma from '../utils/prisma';

// Prisma is deprecated; migrating endpoints to Firebase RTDB
import { PrismaClient } from '@prisma/client';
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

    const results = [];
    let summary = {
      total: students.length,
      firebaseAccountsCreated: 0,
      firebaseAccountsExisting: 0,
      rtdbRecordsProcessed: 0,
      supabaseRecordsCreated: 0,
      supabaseRecordsUpdated: 0,
      failedRecords: 0
    };

    const db = firebaseAdmin.database();
    
    // Process each student sequentially
    for (const student of students) {
      const email = student["Email"];
      const firstName = student["First Name"] || '';
      const lastName = student["Last Name"] || '';
      const branch = student["Branch"] || '';
      const phone = student["Phone"] || '';
      const providedPassword = student["Password"];
      const rollNumber = student["Roll Number"] || '';
      const gender = student["Gender"] || '';

      const plainPassword = providedPassword || phone || 'student123';

<<<<<<< HEAD
      let firebaseUid = null;
      let firebaseStatus = '';
      let rtdbStatus = '';
      let supabaseStatus = '';
      let overallStatus = 'Success';
      let errorReason = null;
      let isExistingSupabase = false;

      if (!email || !firstName) {
        results.push({
          "Roll Number": rollNumber,
          Name: `${firstName} ${lastName}`.trim(),
          Email: email,
          "Firebase Status": 'Failed',
          "RTDB Status": 'Failed',
          "Supabase Status": 'Failed',
          "Overall Status": 'Failed',
          "Error Reason": 'Missing required fields (Email or First Name)'
        });
        summary.failedRecords++;
        continue;
      }

      // Step 1: Firebase Authentication
      try {
        try {
          const userRecord = await firebaseAdmin.auth().getUserByEmail(email);
          firebaseUid = userRecord.uid;
          firebaseStatus = 'Existing';
          summary.firebaseAccountsExisting++;
        } catch (error: any) {
          if (error.code === 'auth/user-not-found') {
            const newUser = await firebaseAdmin.auth().createUser({
              email: email,
              password: plainPassword,
              displayName: `${firstName} ${lastName}`.trim()
            });
            firebaseUid = newUser.uid;
            firebaseStatus = 'Created';
            summary.firebaseAccountsCreated++;
          } else {
            throw error;
=======
      await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: 'STUDENT',
          studentProfile: {
            create: {
              firstName,
              lastName: lastName || '',
              branch: branch || null,
              cgpa: cgpa ? parseFloat(cgpa) : null,
              phone: phone || null
            }
>>>>>>> ecf8d5e6085864fa3365d1642b4dfcb03e291ced
          }
        }
      } catch (authError: any) {
        errorReason = `Firebase Auth Error: ${authError.message}`;
        overallStatus = 'Failed';
        firebaseStatus = 'Failed';
        rtdbStatus = 'Skipped';
        supabaseStatus = 'Skipped';
      }

      // Step 2: Firebase Realtime Database
      if (firebaseUid) {
        try {
          const studentRecord = {
            id: firebaseUid,
            role: "student",
            accountStatus: "active",
            studentRollNumber: rollNumber,
            emailVerified: false,
            personalInfo: {
              firstName: firstName,
              lastName: lastName,
              gender: gender,
              dob: ""
            },
            academicInfo: {
              departmentId: branch,
              branchId: branch,
              cgpa: 0,
              batch: new Date().getFullYear(),
              semester: 1
            },
            eligibility: {
              isEligible: true,
              activeBacklogs: 0,
              totalBacklogs: 0
            },
            contactDetails: {
              email: email,
              phone: phone,
              linkedin: "",
              github: ""
            },
            profileCompletion: 30,
            resumeVersion: "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastLogin: null
          };

          await db.ref(`students/${firebaseUid}`).update(studentRecord);
          rtdbStatus = 'Updated';
          summary.rtdbRecordsProcessed++;
        } catch (rtdbError: any) {
          errorReason = `RTDB Error: ${rtdbError.message}`;
          overallStatus = 'Partial Failure';
          rtdbStatus = 'Failed';
        }
      }

      // Step 3: Supabase PostgreSQL
      if (firebaseUid && overallStatus !== 'Partial Failure') {
        try {
          const existingUserByUid = await prisma.user.findUnique({ where: { firebaseUid } });
          const existingUserByEmail = existingUserByUid ? null : await prisma.user.findUnique({ where: { email } });
          
          let userIdToUpdate = null;
          if (existingUserByUid) {
            userIdToUpdate = existingUserByUid.id;
            isExistingSupabase = true;
          } else if (existingUserByEmail) {
            userIdToUpdate = existingUserByEmail.id;
            isExistingSupabase = true;
          }

          const dummyHashedPassword = await bcrypt.hash('dummy_pass_not_used', 10);

          if (userIdToUpdate) {
            await prisma.user.update({
              where: { id: userIdToUpdate },
              data: {
                firebaseUid: firebaseUid,
                studentProfile: {
                  upsert: {
                    create: {
                      firstName,
                      lastName: lastName,
                      branch: branch,
                      phone: phone,
                      gender: gender
                    },
                    update: {
                      firstName,
                      lastName: lastName,
                      branch: branch,
                      phone: phone,
                      gender: gender
                    }
                  }
                }
              }
            });
            supabaseStatus = 'Updated';
            summary.supabaseRecordsUpdated++;
          } else {
            await prisma.user.create({
              data: {
                email: email,
                password: dummyHashedPassword,
                firebaseUid: firebaseUid,
                role: 'STUDENT',
                studentProfile: {
                  create: {
                    firstName,
                    lastName: lastName,
                    branch: branch,
                    phone: phone,
                    gender: gender
                  }
                }
              }
            });
            supabaseStatus = 'Created';
            summary.supabaseRecordsCreated++;
          }
        } catch (supabaseError: any) {
          errorReason = `Supabase Error: ${supabaseError.message}`;
          overallStatus = 'Partial Failure';
          supabaseStatus = 'Failed';
        }
      }

      if (overallStatus === 'Partial Failure' || overallStatus === 'Failed') {
        summary.failedRecords++;
      }

      results.push({
        "Roll Number": rollNumber,
        Name: `${firstName} ${lastName}`.trim(),
        Email: email,
        "Firebase Status": firebaseStatus,
        "RTDB Status": rtdbStatus,
        "Supabase Status": supabaseStatus,
        "Overall Status": overallStatus,
        "Error Reason": errorReason || 'None'
      });
    }

    return res.status(200).json({
      message: 'Import processed.',
      summary,
      results
    });
  } catch (error: any) {
    console.error('Import students error:', error);
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
      receiverId: student.id,
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
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    // --- 1. Summary Statistics ---
    const [
      upcomingDrivesCount,
      registrationOpenCount,
      closingThisWeekCount,
      interviewsCount,
      offersReleasedCount,
      completedCount
    ] = await Promise.all([
      prisma.placementDrive.count({
        where: { expectedDriveDate: { gt: now } }
      }),
      prisma.placementDrive.count({
        where: { registrationStart: { lte: now }, registrationEnd: { gt: now } }
      }),
      prisma.placementDrive.count({
        where: { registrationEnd: { gte: now, lte: oneWeekFromNow } }
      }),
      prisma.selectionRound.count({
        where: { date: { gte: now } }
      }),
      prisma.offerLetter.count(),
      prisma.placementDrive.count({
        where: { status: 'COMPLETED' }
      })
    ]);

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
    const db = firebaseAdmin.database();
    
    // Fetch data directly from Firebase
    const [studentsSnap, drivesSnap, applicationsSnap] = await Promise.all([
      db.ref('students').once('value'),
      db.ref('drives').once('value'),
      db.ref('applications').once('value'),
    ]);

    const studentsData = studentsSnap.exists() ? studentsSnap.val() : {};
    const drivesData = drivesSnap.exists() ? drivesSnap.val() : {};
    const applicationsData = applicationsSnap.exists() ? applicationsSnap.val() : {};

    const totalStudents = Object.keys(studentsData).length;
    const totalDrives = Object.keys(drivesData).length;
    const totalApplications = Object.keys(applicationsData).length;

    // Compute drive stats
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    let todayDrives = 0, openDrives = 0, upcomingDrives = 0;
    
    Object.values(drivesData).forEach((drive: any) => {
      const driveDate = drive.date || drive.startDate || '';
      if (driveDate === today) todayDrives++;
      if (drive.status === 'open' || drive.status === 'OPEN') openDrives++;
      if (drive.status === 'upcoming' || drive.status === 'UPCOMING') upcomingDrives++;
    });

    // Student placement stats
    let placedCount = 0;
    Object.values(studentsData).forEach((s: any) => {
      if (s.placementStatus === 'placed' || s.placementStatus === 'PLACED') {
        placedCount++;
      }
    });

    const placementPercentage = totalStudents > 0 ? Math.round((placedCount / totalStudents) * 100) : 0;

    // Package stats
    let highestPackage = 0;
    let totalPackage = 0;
    let packageList: number[] = [];

    Object.values(drivesData).forEach((drive: any) => {
      const pkg = Number(drive.fixedSalary || drive.ctc || drive.package) || 0;
      if (pkg > 0) {
        if (pkg > highestPackage) highestPackage = pkg;
        totalPackage += pkg;
        packageList.push(pkg);
      }
    });

    const averagePackage = packageList.length > 0 ? Number((totalPackage / packageList.length).toFixed(1)) : 0;
    
    let medianPackage = 0;
    if (packageList.length > 0) {
      packageList.sort((a: number, b: number) => a - b);
      const mid = Math.floor(packageList.length / 2);
      if (packageList.length % 2 === 0) {
        medianPackage = Number(((packageList[mid - 1] + packageList[mid]) / 2).toFixed(1));
      } else {
        medianPackage = packageList[mid];
      }
    }

    return res.status(200).json({
      drives: { today: todayDrives, open: openDrives, upcomingClosed: upcomingDrives },
      students: { total: totalStudents, placed: placedCount, eligibleByCompany: [], applicationsByCompany: [] },
      packages: { placementPercentage, highest: highestPackage, average: averagePackage, median: medianPackage },
      overall: { companiesVisited: totalDrives, totalOffers: totalApplications }
    });
  } catch (error: any) {
    console.error('Get admin dashboard error:', error);
    return res.status(500).json({ message: 'Error fetching dashboard data', error: error.message });
  }
};
