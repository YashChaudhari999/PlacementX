import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { firebaseAdmin } from '../config/firebase-admin';
import prisma from '../utils/prisma';


// 1. Students Module
export const getStudents = async (req: any, res: any) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
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
    if (req.query.search) {
      where.OR = [
        { fullName: { contains: req.query.search, mode: 'insensitive' } },
        { studentId: { contains: req.query.search, mode: 'insensitive' } },
        { email: { contains: req.query.search, mode: 'insensitive' } }
      ];
    }

    const [total, students] = await Promise.all([
      prisma.importedStudent.count({ where }),
      prisma.importedStudent.findMany({
        where,
        skip,
        take: limit,
        orderBy: { fullName: 'asc' }
      })
    ]);

    const formattedStudents = students.map((s: any) => ({
      id: s.id,
      studentId: s.studentId,
      name: s.fullName,
      email: s.email,
      branch: s.department,
      cgpa: s.cgpa || 0,
      status: s.placementStatus || 'Unplaced',
      academicYear: s.academicYear
    }));

    return res.status(200).json({
      data: formattedStudents,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
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
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalStudents,
      placedStudents,
      salaries,
      totalDrives,
      openDrives,
      totalApplications
    ] = await Promise.all([
      prisma.importedStudent.count(),
      prisma.importedStudent.count({ where: { placementStatus: 'Placed' } }),
      prisma.importedStudent.aggregate({
        where: { placementStatus: 'Placed', fixedSalaryLpa: { not: null } },
        _max: { fixedSalaryLpa: true },
        _avg: { fixedSalaryLpa: true }
      }),
      prisma.placementDrive.count(),
      prisma.placementDrive.count({ where: { status: 'OPEN' } }),
      prisma.driveApplication.count()
    ]);

    const placementPercentage = totalStudents > 0 ? Math.round((placedStudents / totalStudents) * 100) : 0;
    
    // Median logic
    const allSalaries = await prisma.importedStudent.findMany({
      where: { placementStatus: 'Placed', fixedSalaryLpa: { not: null } },
      select: { fixedSalaryLpa: true },
      orderBy: { fixedSalaryLpa: 'asc' }
    });
    
    let medianPackage = 0;
    if (allSalaries.length > 0) {
      const mid = Math.floor(allSalaries.length / 2);
      if (allSalaries.length % 2 === 0) {
        medianPackage = Number((((allSalaries[mid - 1].fixedSalaryLpa as number) + (allSalaries[mid].fixedSalaryLpa as number)) / 2).toFixed(1));
      } else {
        medianPackage = Number((allSalaries[mid].fixedSalaryLpa as number).toFixed(1));
      }
    }

    return res.status(200).json({
      drives: { today: 0, open: openDrives, upcomingClosed: 0 },
      students: { total: totalStudents, placed: placedStudents, eligibleByCompany: [], applicationsByCompany: [] },
      packages: { 
        placementPercentage, 
        highest: salaries._max.fixedSalaryLpa || 0, 
        average: salaries._avg.fixedSalaryLpa ? Number((salaries._avg.fixedSalaryLpa).toFixed(1)) : 0, 
        median: medianPackage 
      },
      overall: { companiesVisited: totalDrives, totalOffers: totalApplications }
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
      where: { profileStatus: 'PENDING_VERIFICATION' },
      include: {
        user: { select: { email: true } }
      },
      orderBy: { updatedAt: 'asc' }
    });
    return res.status(200).json(profiles);
  } catch (error: any) {
    console.error('Get pending profiles error:', error);
    return res.status(500).json({ message: 'Error fetching pending profiles', error: error.message });
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
    if (profile.profileStatus !== 'PENDING_VERIFICATION') {
      return res.status(400).json({ message: 'Profile is not pending verification' });
    }

    const newStatus = action === 'APPROVE' ? 'VERIFIED' : 'UPDATE_REJECTED';

    const updatedProfile = await prisma.studentProfile.update({
      where: { id },
      data: {
        profileStatus: newStatus,
        verifiedAt: action === 'APPROVE' ? new Date() : null,
        verifiedBy: action === 'APPROVE' ? adminId : null
      }
    });

    await prisma.profileAuditLog.create({
      data: {
        studentId: profile.id,
        action: action === 'APPROVE' ? 'PROFILE_VERIFIED' : 'PROFILE_REJECTED',
        performedBy: adminId,
        comments: reason || ''
      }
    });

    // Notify Student
    await prisma.notification.create({
      data: {
        title: action === 'APPROVE' ? 'Profile Verified' : 'Profile Changes Requested',
        message: action === 'APPROVE' ? 'Your profile has been verified successfully.' : `Your profile requires changes: ${reason}`,
        type: 'system',
        receiverId: profile.userId,
        priority: 'HIGH'
      }
    });

    return res.status(200).json({ message: `Profile ${action.toLowerCase()}d successfully`, profile: updatedProfile });
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
          include: { user: { select: { email: true } } }
        }
      },
      orderBy: { requestedAt: 'asc' }
    });
    return res.status(200).json(requests);
  } catch (error: any) {
    console.error('Get update requests error:', error);
    return res.status(500).json({ message: 'Error fetching update requests', error: error.message });
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
      include: { student: true }
    });

    if (!request) return res.status(404).json({ message: 'Update request not found' });
    if (request.status !== 'PENDING') return res.status(400).json({ message: 'Request is already processed' });

    let updatedProfile = request.student;

    if (action === 'APPROVE') {
      // Apply the requested changes
      const changesToApply = request.requestedChanges as any;
      
      // Filter out any restricted fields if necessary, assuming requestedChanges is safe for now
      updatedProfile = await prisma.studentProfile.update({
        where: { id: request.studentId },
        data: {
          ...changesToApply,
          profileStatus: 'VERIFIED'
        }
      });
    } else {
      // Revert status back to VERIFIED without applying changes
      updatedProfile = await prisma.studentProfile.update({
        where: { id: request.studentId },
        data: { profileStatus: 'VERIFIED' }
      });
    }

    // Update the request status
    const updatedRequest = await prisma.profileUpdateRequest.update({
      where: { id },
      data: {
        status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
        reviewedAt: new Date(),
        reviewedBy: adminId,
        adminComment: reason || ''
      }
    });

    await prisma.profileAuditLog.create({
      data: {
        studentId: request.studentId,
        action: action === 'APPROVE' ? 'PROFILE_UPDATE_APPROVED' : 'PROFILE_UPDATE_REJECTED',
        performedBy: adminId,
        comments: reason || ''
      }
    });

    // Notify Student
    await prisma.notification.create({
      data: {
        title: action === 'APPROVE' ? 'Profile Update Approved' : 'Profile Update Rejected',
        message: action === 'APPROVE' ? 'Your requested profile changes have been approved.' : `Your requested profile changes were rejected: ${reason}`,
        type: 'system',
        receiverId: request.student.userId,
        priority: 'HIGH'
      }
    });

    return res.status(200).json({ message: `Update request ${action.toLowerCase()}d`, request: updatedRequest });
  } catch (error: any) {
    console.error('Review update request error:', error);
    return res.status(500).json({ message: 'Error reviewing update request', error: error.message });
  }
};

import { createClient } from '@supabase/supabase-js';

export const provisionCurrentYearStudents = async (req: Request, res: Response) => {
  try {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return res.status(500).json({ message: 'Server configuration error: Missing Supabase keys.' });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const ACADEMIC_YEAR = '2026/2027';
    const DEFAULT_PASSWORD = 'student@123';

    let stats = {
      totalStudents: 0,
      accountsCreated: 0,
      profilesCreated: 0,
      alreadyExisting: 0,
      missingEmail: 0,
      failed: 0
    };

    const importedStudents = await prisma.importedStudent.findMany({
      where: { academicYear: ACADEMIC_YEAR }
    });

    stats.totalStudents = importedStudents.length;

    if (stats.totalStudents === 0) {
      return res.status(200).json({ message: 'No students found to provision.', stats });
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
        const { data: { users }, error: fetchError } = await supabaseAdmin.auth.admin.listUsers();
        if (fetchError) throw new Error(fetchError.message);
        
        let authUser = users.find(u => u.email === email);
        
        if (!authUser) {
          const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password: DEFAULT_PASSWORD,
            email_confirm: true,
            user_metadata: {
              full_name: student.fullName,
              student_id: student.studentId
            }
          });
          if (createError) throw new Error(createError.message);
          authUser = newUser.user;
          isNewAccount = true;
          stats.accountsCreated++;
        } else {
          stats.alreadyExisting++;
        }

        authUserId = authUser?.id || null;
        if (!authUserId) throw new Error("Failed to resolve Auth User ID");

        let user = await prisma.user.findUnique({ where: { email } });
        
        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              password: '',
              firebaseUid: authUserId,
              role: 'STUDENT',
              mustChangePassword: isNewAccount
            }
          });
        } else {
          await prisma.user.update({
            where: { email },
            data: { role: 'STUDENT', firebaseUid: authUserId }
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
              isProfileComplete: false
            }
          });
          stats.profilesCreated++;
        } else {
          await prisma.studentProfile.update({
            where: { id: profile.id },
            data: {
              branch: profile.branch || branch,
              cgpa: profile.cgpa || cgpa,
              activeBacklogs: activeBacklogs,
              skills: profile.skills ? profile.skills : (skillsObj || [])
            }
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

export const getStudentDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const importedStudent = await prisma.importedStudent.findUnique({
      where: { id }
    });

    if (!importedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }

    let user = null;
    let profile = null;
    let applications: any[] = [];
    let updateRequests: any[] = [];

    if (importedStudent.email) {
      user = await prisma.user.findUnique({
        where: { email: importedStudent.email }
      });

      if (user) {
        profile = await prisma.studentProfile.findUnique({
          where: { userId: user.id }
        });

        if (profile) {
          applications = await prisma.driveApplication.findMany({
            where: { studentId: profile.id },
            include: { drive: { select: { company: { select: { name: true } }, jobRole: true, status: true, fixedSalary: true } } },
            orderBy: { appliedAt: 'desc' }
          });
          
          updateRequests = await prisma.profileUpdateRequest.findMany({
            where: { studentId: profile.id },
            orderBy: { requestedAt: 'desc' }
          });
        }
      }
    }

    return res.status(200).json({
      importedData: importedStudent,
      isProvisioned: !!user,
      user: user ? { id: user.id, email: user.email, role: user.role } : null,
      profile: profile || null,
      applications: applications,
      updateRequests: updateRequests
    });
  } catch (error: any) {
    console.error('getStudentDetails error:', error);
    return res.status(500).json({ message: 'Error fetching student details', error: error.message });
  }
};

