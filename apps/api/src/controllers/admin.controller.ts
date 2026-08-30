import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { firebaseAdmin } from '../config/firebase-admin';
import prisma from '../utils/prisma';

// 1. Students Module
export const getStudents = async (req: any, res: any) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (req.query.academic_year && req.query.academic_year !== 'All Years') {
      where.academicYear = req.query.academic_year;
    }
    if (req.query.department && req.query.department !== 'All Departments') {
      where.department = req.query.department;
    }
    if (req.query.student_status && req.query.student_status !== 'All') {
      where.studentStatus = req.query.student_status;
    }
    if (req.query.placement_status && req.query.placement_status !== 'All') {
      where.placementStatus = req.query.placement_status;
    }
    if (req.query.min_cgpa) {
      where.cgpa = { ...(where.cgpa || {}), gte: parseFloat(req.query.min_cgpa) };
    }
    if (req.query.max_cgpa) {
      where.cgpa = { ...(where.cgpa || {}), lte: parseFloat(req.query.max_cgpa) };
    }
    if (req.query.search) {
      where.OR = [
        { fullName: { contains: req.query.search, mode: 'insensitive' } },
        { studentId: { contains: req.query.search, mode: 'insensitive' } },
        { email: { contains: req.query.search, mode: 'insensitive' } },
      ];
    }

    // Server-side sorting
    const sortableFields: Record<string, string> = {
      name: 'fullName',
      cgpa: 'cgpa',
      backlogs: 'activeBacklogs',
      department: 'department',
      package: 'fixedSalaryLpa',
      updated: 'updatedAt',
      studentId: 'studentId',
    };
    const sortBy = sortableFields[req.query.sortBy] || 'fullName';
    const sortOrder = req.query.sortOrder === 'desc' ? 'desc' : 'asc';

    const [total, students] = await Promise.all([
      prisma.importedStudent.count({ where }),
      prisma.importedStudent.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
    ]);

    const formattedStudents = students.map((s: any) => ({
      id: s.id,
      studentId: s.studentId,
      name: s.fullName,
      email: s.email,
      branch: s.department,
      cgpa: s.cgpa ?? null,
      status: s.placementStatus || 'Unplaced',
      academicYear: s.academicYear,
      gender: s.gender,
      activeBacklogs: s.activeBacklogs ?? 0,
      profileComplete: s.profileComplete,
      skills: s.skills,
      companyName: s.companyName,
      fixedSalaryLpa: s.fixedSalaryLpa,
      applicationStatus: s.applicationStatus,
      studentStatus: s.studentStatus,
      updatedAt: s.updatedAt,
    }));

    return res.status(200).json({
      data: formattedStudents,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching students', error: error.message });
  }
};

// Student Stats / KPI endpoint
export const getStudentStats = async (req: any, res: any) => {
  try {
    const where: any = {};
    if (req.query.academic_year && req.query.academic_year !== 'All Years') {
      where.academicYear = req.query.academic_year;
    }

    const [total, placed, profileCompleteCount, departments, avgCgpa] = await Promise.all([
      prisma.importedStudent.count({ where }),
      prisma.importedStudent.count({ where: { ...where, placementStatus: 'Placed' } }),
      prisma.importedStudent.count({ where: { ...where, profileComplete: 'Yes' } }),
      prisma.importedStudent.groupBy({
        by: ['department'],
        where,
        _count: { department: true },
        orderBy: { department: 'asc' },
      }),
      prisma.importedStudent.aggregate({
        where,
        _avg: { cgpa: true },
      }),
    ]);

    const unplaced = total - placed;
    const profileIncomplete = total - profileCompleteCount;

    return res.status(200).json({
      total,
      placed,
      unplaced,
      profileComplete: profileCompleteCount,
      profileIncomplete,
      avgCgpa: avgCgpa._avg.cgpa ? Number(avgCgpa._avg.cgpa.toFixed(2)) : 0,
      departments: departments.map((d: any) => ({
        name: d.department,
        count: d._count.department,
      })),
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching student stats', error: error.message });
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
      failedRecords: 0,
    };

    const db = firebaseAdmin.database();

    // Process each student sequentially
    for (const student of students) {
      const email = student['Email'];
      const firstName = student['First Name'] || '';
      const lastName = student['Last Name'] || '';
      const branch = student['Branch'] || '';
      const phone = student['Phone'] || '';
      const providedPassword = student['Password'];
      const rollNumber = student['Roll Number'] || '';
      const gender = student['Gender'] || '';

      const plainPassword = providedPassword || phone || 'student123';

      let firebaseUid = null;
      let firebaseStatus = '';
      let rtdbStatus = '';
      let supabaseStatus = '';
      let overallStatus = 'Success';
      let errorReason = null;
      let isExistingSupabase = false;

      if (!email || !firstName) {
        results.push({
          'Roll Number': rollNumber,
          Name: `${firstName} ${lastName}`.trim(),
          Email: email,
          'Firebase Status': 'Failed',
          'RTDB Status': 'Failed',
          'Supabase Status': 'Failed',
          'Overall Status': 'Failed',
          'Error Reason': 'Missing required fields (Email or First Name)',
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
              displayName: `${firstName} ${lastName}`.trim(),
            });
            firebaseUid = newUser.uid;
            firebaseStatus = 'Created';
            summary.firebaseAccountsCreated++;
          } else {
            throw error;
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
            role: 'student',
            accountStatus: 'active',
            studentRollNumber: rollNumber,
            emailVerified: false,
            personalInfo: {
              firstName: firstName,
              lastName: lastName,
              gender: gender,
              dob: '',
            },
            academicInfo: {
              departmentId: branch,
              branchId: branch,
              cgpa: 0,
              batch: new Date().getFullYear(),
              semester: 1,
            },
            eligibility: {
              isEligible: true,
              activeBacklogs: 0,
              totalBacklogs: 0,
            },
            contactDetails: {
              email: email,
              phone: phone,
              linkedin: '',
              github: '',
            },
            profileCompletion: 30,
            resumeVersion: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastLogin: null,
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
          const existingUserByEmail = existingUserByUid
            ? null
            : await prisma.user.findUnique({ where: { email } });

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
                      gender: gender,
                    },
                    update: {
                      firstName,
                      lastName: lastName,
                      branch: branch,
                      phone: phone,
                      gender: gender,
                    },
                  },
                },
              },
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
                    gender: gender,
                  },
                },
              },
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
        'Roll Number': rollNumber,
        Name: `${firstName} ${lastName}`.trim(),
        Email: email,
        'Firebase Status': firebaseStatus,
        'RTDB Status': rtdbStatus,
        'Supabase Status': supabaseStatus,
        'Overall Status': overallStatus,
        'Error Reason': errorReason || 'None',
      });
    }

    return res.status(200).json({
      message: 'Import processed.',
      summary,
      results,
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
      where: { role: 'PLACEMENT_COORDINATOR' },
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
            lastName,
          },
        },
      },
    });

    return res.status(201).json(coordinator);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error adding coordinator', error: error.message });
  }
};

// 3. Reports Module

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
          branch: targetBranch,
        },
      };
    }

    // Get targeted students
    const students = await prisma.user.findMany({
      where: whereClause,
      select: { id: true },
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
      isRead: false,
    }));

    await prisma.notification.createMany({
      data: notifications,
    });

    return res.status(201).json({ message: `Broadcasted to ${students.length} students` });
  } catch (error: any) {
    return res
      .status(500)
      .json({ message: 'Error broadcasting notification', error: error.message });
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
      completedCount,
    ] = await Promise.all([
      prisma.placementDrive.count({
        where: { expectedDriveDate: { gt: now } },
      }),
      prisma.placementDrive.count({
        where: { registrationStart: { lte: now }, registrationEnd: { gt: now } },
      }),
      prisma.placementDrive.count({
        where: { registrationEnd: { gte: now, lte: oneWeekFromNow } },
      }),
      prisma.selectionRound.count({
        where: { date: { gte: now } },
      }),
      prisma.offerLetter.count(),
      prisma.placementDrive.count({
        where: { status: 'COMPLETED' },
      }),
    ]);

    const summary = {
      upcomingDrives: upcomingDrivesCount,
      registrationOpen: registrationOpenCount,
      closingThisWeek: closingThisWeekCount,
      interviews: interviewsCount,
      offersReleased: offersReleasedCount,
      completed: completedCount,
    };

    // --- 2. Dynamic Semester Calculation ---
    let academicYearsData = await prisma.academicYear.findMany({
      include: { semesters: { orderBy: { startDate: 'asc' } } },
      orderBy: { startDate: 'desc' },
    });

    if (academicYearsData.length === 0) {
      // Seed default configs if none exist
      const newYear = await prisma.academicYear.create({
        data: {
          year: '2026-2027',
          startDate: new Date('2026-07-13'),
          endDate: new Date('2027-04-30'),
          isActive: true,
          semesters: {
            create: [
              {
                name: 'Semester 7',
                startDate: new Date('2026-07-13'),
                endDate: new Date('2026-12-05'),
                isActive: true,
              },
              {
                name: 'Semester 8',
                startDate: new Date('2027-01-02'),
                endDate: new Date('2027-04-30'),
                isActive: false,
              },
            ],
          },
        },
        include: { semesters: { orderBy: { startDate: 'asc' } } },
      });
      academicYearsData = [newYear];
    }

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
          weekNumber: weekNum,
          start: currentStart.toISOString().split('T')[0],
          end: currentEnd.toISOString().split('T')[0],
        });

        currentStart.setDate(currentStart.getDate() + 7);
        weekNum++;
      }
      return weeks;
    };

    // We build the `semester` dictionary so we don't break existing frontend logic completely
    // while additionally sending the full configuration block
    const semester: any = {};
    const config = academicYearsData.map((ay) => ({
      id: ay.id,
      year: ay.year,
      isActive: ay.isActive,
      semesters: ay.semesters.map((sem) => {
        const weeks = generateWeeks(sem.startDate, sem.endDate);

        // Populate the legacy object format
        const legacyKey = sem.name.toLowerCase().replace(' ', ''); // e.g. "semester7"
        semester[legacyKey] = {
          id: sem.id,
          name: sem.name,
          startDate: sem.startDate.toISOString().split('T')[0],
          endDate: sem.endDate.toISOString().split('T')[0],
          weeks: weeks,
        };
        // Also map to ID for newer component logic
        semester[sem.id] = semester[legacyKey];

        return {
          id: sem.id,
          name: sem.name,
          isActive: sem.isActive,
          startDate: sem.startDate.toISOString().split('T')[0],
          endDate: sem.endDate.toISOString().split('T')[0],
          weeks,
        };
      }),
    }));

    // --- 3. Events Mapping ---
    const allDrives = await prisma.placementDrive.findMany({
      include: { company: true },
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
          backgroundColor: '#ecfdf5', // emerald-50
          borderColor: '#34d399', // emerald-400
          textColor: '#047857', // emerald-700
          extendedProps: {
            driveId: d.id,
            company: d.company?.name,
            status: 'Registration Open',
            type: 'Placement Drive',
            department: d.eligibleBranches ? JSON.parse(d.eligibleBranches) : [],
            package: d.fixedSalary ? `${d.fixedSalary} LPA` : 'N/A',
            location: d.location || d.workMode,
            description: 'Registration window is currently active.',
          },
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
          backgroundColor: '#eff6ff', // blue-50
          borderColor: '#60a5fa', // blue-400
          textColor: '#1d4ed8', // blue-700
          extendedProps: {
            driveId: d.id,
            company: d.company?.name,
            status: d.status,
            type: d.driveType || 'Placement Drive',
            department: d.eligibleBranches ? JSON.parse(d.eligibleBranches) : [],
            package: d.fixedSalary ? `${d.fixedSalary} LPA` : 'N/A',
            location: d.location || d.workMode,
            description: d.jobDescription || '',
          },
        });
      }

      // 3.3 Application Deadline
      if (d.applicationDeadline) {
        calendarEvents.push({
          id: `deadline-${d.id}`,
          title: `${d.company?.name} Deadline`,
          start: d.applicationDeadline.toISOString(),
          allDay: true,
          backgroundColor: '#fef2f2', // red-50
          borderColor: '#f87171', // red-400
          textColor: '#b91c1c', // red-700
          extendedProps: {
            driveId: d.id,
            company: d.company?.name,
            type: 'Deadline',
            status: 'Registration Closed',
          },
        });
      }
    });

    // 3.4 Selection Rounds (Interviews)
    const rounds = await prisma.selectionRound.findMany({
      include: { drive: { include: { company: true } } },
    });

    rounds.forEach((r: any) => {
      if (r.date) {
        calendarEvents.push({
          id: `round-${r.id}`,
          title: `${r.drive.company?.name} - ${r.title}`,
          start: r.time
            ? `${r.date.toISOString().split('T')[0]}T${r.time}:00`
            : r.date.toISOString().split('T')[0],
          allDay: !r.time,
          backgroundColor: '#f3e8ff', // purple-50
          borderColor: '#c084fc', // purple-400
          textColor: '#7e22ce', // purple-700
          extendedProps: {
            driveId: r.drive.id,
            company: r.drive.company?.name,
            status: 'Interview',
            type: 'Interview Schedule',
            venue: r.venue || r.platform,
            description: r.instructions || '',
          },
        });
      }
    });

    // 3.5 Custom Events
    const customEvents = await prisma.customCalendarEvent.findMany();
    customEvents.forEach((c: any) => {
      calendarEvents.push({
        id: `custom-${c.id}`,
        title: c.title,
        start: c.start.toISOString(),
        end: c.end ? c.end.toISOString() : undefined,
        allDay: c.isAllDay,
        color: c.color || '#4f46e5',
        extendedProps: {
          eventId: c.id,
          type: c.type,
          status: 'Scheduled',
          description: c.description || '',
          isCustom: true,
        },
      });
    });

    return res.status(200).json({
      summary,
      semester,
      config,
      events: calendarEvents,
    });
  } catch (error: any) {
    // For DB connectivity errors, return an empty-state response instead of a 500
    if (error?.code === 'P1001' || error?.code === 'P1017') {
      return res.status(200).json({
        summary: { upcomingDrives: 0, registrationOpen: 0, closingThisWeek: 0, interviews: 0, offersReleased: 0, completed: 0 },
        semester: {},
        config: [],
        events: [],
      });
    }
    console.error('Calendar Error:', error);
    return res
      .status(500)
      .json({ message: 'Error fetching calendar events', error: error.message });
  }
};

// --- 5.1 Calendar Actions ---

export const createCustomEvent = async (req: any, res: any) => {
  try {
    const { title, start, end, type, color, description, isAllDay } = req.body;
    const event = await prisma.customCalendarEvent.create({
      data: {
        title,
        start: new Date(start),
        end: new Date(end),
        type,
        color,
        description,
        isAllDay,
      },
    });
    res.status(201).json(event);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating event', error: error.message });
  }
};

export const updateCustomEvent = async (req: any, res: any) => {
  try {
    const { title, start, end, type, color, description, isAllDay } = req.body;
    const event = await prisma.customCalendarEvent.update({
      where: { id: req.params.id },
      data: {
        title,
        start: start ? new Date(start) : undefined,
        end: end ? new Date(end) : undefined,
        type,
        color,
        description,
        isAllDay,
      },
    });
    res.status(200).json(event);
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating event', error: error.message });
  }
};

export const deleteCustomEvent = async (req: any, res: any) => {
  try {
    await prisma.customCalendarEvent.delete({ where: { id: req.params.id } });
    res.status(200).json({ message: 'Deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting event', error: error.message });
  }
};

export const rescheduleInterview = async (req: any, res: any) => {
  try {
    const { date, time } = req.body;
    const round = await prisma.selectionRound.update({
      where: { id: req.params.id },
      data: {
        date: date ? new Date(date) : undefined,
        time,
      },
    });
    res.status(200).json(round);
  } catch (error: any) {
    res.status(500).json({ message: 'Error rescheduling interview', error: error.message });
  }
};

// 6. Dashboard Module
export const getAdminDashboard = async (req: any, res: any) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalStudents, placedStudents, salaries, totalDrives, allDrivesData, totalApplications] =
      await Promise.all([
        prisma.importedStudent.count(),
        prisma.importedStudent.count({ where: { placementStatus: 'Placed' } }),
        prisma.importedStudent.aggregate({
          where: { placementStatus: 'Placed', fixedSalaryLpa: { not: null } },
          _max: { fixedSalaryLpa: true },
          _avg: { fixedSalaryLpa: true },
        }),
        prisma.placementDrive.count(),
        prisma.placementDrive.findMany({
          where: { status: { in: ['PUBLISHED', 'COMPLETED'] } },
          select: { registrationStart: true, registrationEnd: true, status: true }
        }),
        prisma.driveApplication.count(),
      ]);

    let openDrives = 0;
    let upcomingDrives = 0;
    let closedDrives = 0;

    allDrivesData.forEach((d: any) => {
      const start = d.registrationStart ? new Date(d.registrationStart) : null;
      const end = d.registrationEnd ? new Date(d.registrationEnd) : null;
      const isUpcoming = start ? start > today : false;
      const isClosed = (end ? end < today : false) || d.status === 'COMPLETED';
      const isOpen = d.status === 'PUBLISHED' && !isUpcoming && !isClosed;

      if (isOpen) openDrives++;
      else if (isUpcoming && d.status === 'PUBLISHED') upcomingDrives++;
      else if (isClosed) closedDrives++;
    });

    const placementPercentage =
      totalStudents > 0 ? Math.round((placedStudents / totalStudents) * 100) : 0;

    // Median logic
    const allSalaries = await prisma.importedStudent.findMany({
      where: { placementStatus: 'Placed', fixedSalaryLpa: { not: null } },
      select: { fixedSalaryLpa: true },
      orderBy: { fixedSalaryLpa: 'asc' },
    });

    let medianPackage = 0;
    if (allSalaries.length > 0) {
      const mid = Math.floor(allSalaries.length / 2);
      if (allSalaries.length % 2 === 0) {
        medianPackage = Number(
          (
            ((allSalaries[mid - 1].fixedSalaryLpa as number) +
              (allSalaries[mid].fixedSalaryLpa as number)) /
            2
          ).toFixed(1)
        );
      } else {
        medianPackage = Number((allSalaries[mid].fixedSalaryLpa as number).toFixed(1));
      }
    }

    // Calculate eligible students for active and upcoming drives
    const activeAndUpcomingDrives = await prisma.placementDrive.findMany({
      where: {
        status: 'PUBLISHED',
        OR: [
          { registrationEnd: { gte: today } },
          { registrationStart: { gte: today } },
          { registrationEnd: null },
        ]
      },
      include: {
        company: true
      }
    });

    const { filterEligibleStudents } = await import('../services/eligibility.service');
    
    const eligiblePromises = activeAndUpcomingDrives.map(async (drive) => {
      const studentIds = await filterEligibleStudents(drive as any);
      return {
        company: drive.company.name,
        count: studentIds.length
      };
    });
    
    const eligibleList = await Promise.all(eligiblePromises);
    
    const eligibleMap = new Map<string, number>();
    eligibleList.forEach(item => {
      eligibleMap.set(item.company, (eligibleMap.get(item.company) || 0) + item.count);
    });
    const eligibleByCompany = Array.from(eligibleMap, ([company, count]) => ({ company, count }))
      .filter(item => item.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate applications by company
    const applicationsCount = await prisma.driveApplication.groupBy({
      by: ['driveId'],
      _count: { id: true },
    });
    
    const drivesForApps = await prisma.placementDrive.findMany({
      where: { id: { in: applicationsCount.map(a => a.driveId) } },
      include: { company: true },
    });
    const driveCompanyMap = new Map(drivesForApps.map(d => [d.id, d.company.name]));
    
    const appsMap = new Map<string, number>();
    applicationsCount.forEach(app => {
      const companyName = driveCompanyMap.get(app.driveId);
      if (companyName) {
        appsMap.set(companyName, (appsMap.get(companyName) || 0) + app._count.id);
      }
    });
    
    const applicationsByCompany = Array.from(appsMap, ([company, applications]) => ({ company, applications }))
      .filter(item => item.applications > 0)
      .sort((a, b) => b.applications - a.applications)
      .slice(0, 5);

    return res.status(200).json({
      drives: { open: openDrives, upcoming: upcomingDrives, closed: closedDrives },
      students: {
        total: totalStudents,
        placed: placedStudents,
        eligibleByCompany,
        applicationsByCompany,
      },
      packages: {
        placementPercentage,
        highest: salaries._max.fixedSalaryLpa || 0,
        average: salaries._avg.fixedSalaryLpa ? Number(salaries._avg.fixedSalaryLpa.toFixed(1)) : 0,
        median: medianPackage,
      },
      overall: { companiesVisited: totalDrives, totalOffers: totalApplications },
    });
  } catch (error: any) {
    console.error('Get admin dashboard error:', error);
    return res.status(500).json({ message: 'Error fetching dashboard data', error: error.message });
  }
};

// 7. Profile Verification & Update Requests Module

export const getPendingProfiles = async (req: any, res: any) => {
  try {
    const profiles = await prisma.studentProfile.findMany({
      where: {
        OR: [
          // Normal path: student submitted profile for verification
          { profileStatus: 'PENDING_VERIFICATION' },
          // Fallback: provisioned students whose profile is complete but stuck in 'PENDING'
          { profileStatus: 'PENDING', isProfileComplete: true },
        ]
      },
      include: {
        user: { select: { email: true } },
      },
      orderBy: { updatedAt: 'asc' },
    });
    return res.status(200).json(profiles);
  } catch (error: any) {
    // Silently return empty array for DB connectivity errors
    if (error?.code === 'P1001' || error?.code === 'P1017') {
      return res.status(200).json([]);
    }
    console.error('Get pending profiles error:', error);
    return res
      .status(500)
      .json({ message: 'Error fetching pending profiles', error: error.message });
  }
};

export const verifyProfile = async (req: any, res: any) => {
  try {
    const adminId = req.user?.id;
    const { id } = req.params;
    const { action, reason } = req.body; // action: 'APPROVE' or 'REJECT'

    if (!adminId) return res.status(401).json({ message: 'Unauthorized' });
    if (action !== 'APPROVE' && action !== 'REJECT') {
      return res.status(400).json({ message: 'Invalid action. Use APPROVE or REJECT' });
    }

    const profile = await prisma.studentProfile.findUnique({ where: { id } });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    if (profile.profileStatus !== 'PENDING_VERIFICATION' && profile.profileStatus !== 'PENDING') {
      return res.status(400).json({ message: 'Profile is not pending verification' });
    }

    const newStatus = action === 'APPROVE' ? 'VERIFIED' : 'UPDATE_REJECTED';

    const updatedProfile = await prisma.studentProfile.update({
      where: { id },
      data: {
        profileStatus: newStatus,
        verifiedAt: action === 'APPROVE' ? new Date() : null,
        verifiedBy: action === 'APPROVE' ? adminId : null,
      },
    });

    await prisma.profileAuditLog.create({
      data: {
        studentId: profile.id,
        action: action === 'APPROVE' ? 'PROFILE_VERIFIED' : 'PROFILE_REJECTED',
        performedBy: adminId,
        comments: reason || '',
      },
    });

    // Notify Student
    await prisma.notification.create({
      data: {
        title: action === 'APPROVE' ? 'Profile Verified' : 'Profile Changes Requested',
        message:
          action === 'APPROVE'
            ? 'Your profile has been verified successfully.'
            : `Your profile requires changes: ${reason}`,
        type: 'system',
        receiverId: profile.userId,
        priority: 'HIGH',
      },
    });

    return res
      .status(200)
      .json({ message: `Profile ${action.toLowerCase()}d successfully`, profile: updatedProfile });
  } catch (error: any) {
    console.error('Verify profile error:', error);
    return res.status(500).json({ message: 'Error verifying profile', error: error.message });
  }
};

export const getUpdateRequests = async (req: any, res: any) => {
  try {
    const requests = await prisma.profileUpdateRequest.findMany({
      where: { status: 'PENDING' },
      include: {
        student: {
          include: { user: { select: { email: true } } },
        },
      },
      orderBy: { requestedAt: 'asc' },
    });
    return res.status(200).json(requests);
  } catch (error: any) {
    console.error('Get update requests error:', error);
    return res
      .status(500)
      .json({ message: 'Error fetching update requests', error: error.message });
  }
};

export const reviewUpdateRequest = async (req: any, res: any) => {
  try {
    const adminId = req.user?.id;
    const { id } = req.params;
    const { action, reason } = req.body; // action: 'APPROVE' or 'REJECT'

    if (!adminId) return res.status(401).json({ message: 'Unauthorized' });
    if (action !== 'APPROVE' && action !== 'REJECT') {
      return res.status(400).json({ message: 'Invalid action' });
    }

    const request = await prisma.profileUpdateRequest.findUnique({
      where: { id },
      include: { student: true },
    });

    if (!request) return res.status(404).json({ message: 'Update request not found' });
    if (request.status !== 'PENDING')
      return res.status(400).json({ message: 'Request is already processed' });

    let updatedProfile = request.student;

    if (action === 'APPROVE') {
      // Apply the requested changes safely
      const rawChanges = request.requestedChanges as any;
      const safeData: any = { profileStatus: 'VERIFIED' };
      
      const allowedFields = [
        'firstName', 'lastName', 'phone', 'branch', 'cgpa', 'passingYear', 
        'activeBacklogs', 'yearGap', 'nationality', 'gender', 'resumeUrl', 
        'photoUrl', 'portfolioUrl', 'githubUrl', 'linkedinUrl', 'skills', 
        'programmingLanguages', 'projects', 'codingProfiles', 'educationDetails', 
        'dateOfBirth', 'address', 'alternatePhone', 'category', 'tenthBoard', 
        'tenthYear', 'tenthPercentage', 'twelfthBoard', 'twelfthYear', 
        'twelfthPercentage', 'diplomaBoard', 'diplomaYear', 'diplomaPercentage', 
        'currentSemester', 'totalBacklogs', 'certifications', 'experience', 'languages'
      ];
      
      const floatFields = ['cgpa', 'tenthPercentage', 'twelfthPercentage', 'diplomaPercentage'];
      const intFields = ['passingYear', 'activeBacklogs', 'yearGap', 'tenthYear', 'twelfthYear', 'diplomaYear', 'currentSemester', 'totalBacklogs'];
      const dateFields = ['dateOfBirth'];
      
      for (const key of Object.keys(rawChanges)) {
        if (allowedFields.includes(key)) {
          let val = rawChanges[key];
          if (val !== null && val !== undefined) {
             if (floatFields.includes(key)) val = parseFloat(val);
             else if (intFields.includes(key)) val = parseInt(val);
             else if (dateFields.includes(key)) val = new Date(val);
          }
          safeData[key] = val;
        }
      }

      updatedProfile = await prisma.studentProfile.update({
        where: { id: request.studentId },
        data: safeData,
      });
    } else {
      // Revert status back to VERIFIED without applying changes
      updatedProfile = await prisma.studentProfile.update({
        where: { id: request.studentId },
        data: { profileStatus: 'VERIFIED' },
      });
    }

    // Update the request status
    const updatedRequest = await prisma.profileUpdateRequest.update({
      where: { id },
      data: {
        status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
        reviewedAt: new Date(),
        reviewedBy: adminId,
        adminComment: reason || '',
      },
    });

    await prisma.profileAuditLog.create({
      data: {
        studentId: request.studentId,
        action: action === 'APPROVE' ? 'PROFILE_UPDATE_APPROVED' : 'PROFILE_UPDATE_REJECTED',
        performedBy: adminId,
        comments: reason || '',
      },
    });

    // Notify Student
    await prisma.notification.create({
      data: {
        title: action === 'APPROVE' ? 'Profile Update Approved' : 'Profile Update Rejected',
        message:
          action === 'APPROVE'
            ? 'Your requested profile changes have been approved.'
            : `Your requested profile changes were rejected: ${reason}`,
        type: 'system',
        receiverId: request.student.userId,
        priority: 'HIGH',
      },
    });

    return res
      .status(200)
      .json({ message: `Update request ${action.toLowerCase()}d`, request: updatedRequest });
  } catch (error: any) {
    console.error('Review update request error:', error);
    return res
      .status(500)
      .json({ message: 'Error reviewing update request', error: error.message });
  }
};

import { createClient } from '@supabase/supabase-js';

export const provisionCurrentYearStudents = async (req: Request, res: Response) => {
  try {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return res
        .status(500)
        .json({ message: 'Server configuration error: Missing Supabase keys.' });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const ACADEMIC_YEAR = '2026/2027';
    const DEFAULT_PASSWORD = 'student@123';

    let stats = {
      totalStudents: 0,
      accountsCreated: 0,
      profilesCreated: 0,
      alreadyExisting: 0,
      missingEmail: 0,
      failed: 0,
    };

    const importedStudents = await prisma.importedStudent.findMany({
      where: { academicYear: ACADEMIC_YEAR },
    });

    stats.totalStudents = importedStudents.length;

    if (stats.totalStudents === 0) {
      return res.status(200).json({ message: 'No students found to provision.', stats });
    }

    // Pre-fetch all existing users from Supabase to avoid pagination limits and slow loops
    const allSupabaseUsers = new Map<string, any>();
    try {
      let page = 1;
      let hasMore = true;
      while (hasMore) {
        const { data, error: fetchError } = await supabaseAdmin.auth.admin.listUsers({
          page,
          perPage: 1000,
        });
        if (fetchError) throw new Error(fetchError.message);
        
        data.users.forEach((u) => {
          if (u.email) allSupabaseUsers.set(u.email.toLowerCase(), u);
        });
        
        if (data.users.length < 1000) {
          hasMore = false;
        } else {
          page++;
        }
      }
    } catch (err: any) {
      console.warn('Warning: Could not pre-fetch Supabase users:', err.message);
    }

    for (const student of importedStudents) {
      if (!student.email || student.email.trim() === '') {
        stats.missingEmail++;
        continue;
      }

      const email = student.email.trim().toLowerCase();
      let authUserId: string | null = null;
      let isNewAccount = false;

      try {
        let authUser = allSupabaseUsers.get(email);

        if (!authUser) {
          const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password: DEFAULT_PASSWORD,
            email_confirm: true,
            user_metadata: {
              full_name: student.fullName,
              student_id: student.studentId,
            },
          });
          if (createError) throw new Error(createError.message);
          authUser = newUser.user;
          isNewAccount = true;
          stats.accountsCreated++;
        } else {
          stats.alreadyExisting++;
        }

        authUserId = authUser?.id || null;
        if (!authUserId) throw new Error('Failed to resolve Auth User ID');

        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              password: '',
              firebaseUid: authUserId,
              role: 'STUDENT',
              mustChangePassword: isNewAccount,
            },
          });
        } else {
          await prisma.user.update({
            where: { email },
            data: { role: 'STUDENT', firebaseUid: authUserId },
          });
        }

        let profile = await prisma.studentProfile.findUnique({ where: { userId: user.id } });

        const firstName = student.fullName?.split(' ')[0] || '';
        const lastName = student.fullName?.split(' ').slice(1).join(' ') || '';
        const branch = student.department;
        const cgpa = student.cgpa;
        const gender = student.gender;
        const activeBacklogs = student.activeBacklogs || 0;

        let skillsObj = null;
        if (student.skills) {
          skillsObj = student.skills.split(',').map((s: string) => s.trim());
        }

        if (!profile) {
          profile = await prisma.studentProfile.create({
            data: {
              userId: user.id,
              firstName,
              lastName,
              branch,
              cgpa,
              gender,
              activeBacklogs,
              skills: skillsObj || [],
              profileStatus: 'PENDING',
              isProfileComplete: false,
            },
          });
          stats.profilesCreated++;
        } else {
          await prisma.studentProfile.update({
            where: { id: profile.id },
            data: {
              branch: profile.branch || branch,
              cgpa: profile.cgpa || cgpa,
              activeBacklogs: activeBacklogs,
              skills: profile.skills ? profile.skills : skillsObj || [],
            },
          });
        }
      } catch (err: any) {
        console.error(`Provisioning error for ${email}:`, err.message);
        stats.failed++;
      }
    }

    return res.status(200).json({ message: 'Provisioning completed successfully.', stats });
  } catch (error: any) {
    console.error('Provisioning route error:', error);
    return res.status(500).json({ message: 'Error running provisioning', error: error.message });
  }
};

export const getStudentById = async (req: any, res: any) => {
  try {
    const { studentId } = req.params;
    
    const importedStudent = await prisma.importedStudent.findFirst({
      where: { studentId: studentId },
      orderBy: { createdAt: 'desc' }
    });

    if (!importedStudent) {
      return res.status(404).json({ message: 'Student not found in imported records.' });
    }

    let userProfile = null;
    if (importedStudent.email) {
      const user = await prisma.user.findUnique({
        where: { email: importedStudent.email },
        include: {
          studentProfile: {
            include: {
              applications: {
                include: {
                  drive: {
                    include: { company: true }
                  },
                  offerLetter: true
                }
              },
              auditLogs: {
                orderBy: { createdAt: 'desc' }
              }
            }
          }
        }
      });
      if (user) {
        userProfile = {
          userId: user.id,
          role: user.role,
          createdAt: user.createdAt,
          ...user.studentProfile
        };
      }
    }

    return res.status(200).json({
      importedData: importedStudent,
      profileData: userProfile
    });

  } catch (error: any) {
    console.error('Error fetching student by ID:', error);
    return res.status(500).json({ message: 'Error fetching student details', error: error.message });
  }
};

export const updateStudentAdminNotes = async (req: any, res: any) => {
  try {
    const { studentId } = req.params;
    const { adminNotes } = req.body;

    const importedStudent = await prisma.importedStudent.findFirst({
      where: { studentId: studentId }
    });

    if (!importedStudent || !importedStudent.email) {
      return res.status(404).json({ message: 'Student email not found for notes update.' });
    }

    const user = await prisma.user.findUnique({
      where: { email: importedStudent.email },
      include: { studentProfile: true }
    });

    if (!user || !user.studentProfile) {
      return res.status(404).json({ message: 'Student profile not found.' });
    }

    const updatedProfile = await prisma.studentProfile.update({
      where: { id: user.studentProfile.id },
      // @ts-ignore - Prisma client needs regeneration to recognize adminNotes
      data: { adminNotes }
    });

    return res.status(200).json({ message: 'Notes updated', adminNotes: (updatedProfile as any).adminNotes });
  } catch (error: any) {
    console.error('Error updating admin notes:', error);
    return res.status(500).json({ message: 'Error updating notes', error: error.message });
  }
};
