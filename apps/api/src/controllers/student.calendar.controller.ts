import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { checkEligibility } from '../services/eligibility.service';

export const getCalendarEvents = async (req: any, res: any) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const student = await prisma.studentProfile.findUnique({
      where: { userId },
    });

    if (!student) {
      return res.status(200).json({ events: [] });
    }

    // 1. Fetch Drives the student has applied to, including Selection Rounds
    const applications = await prisma.driveApplication.findMany({
      where: { studentId: student.id },
      include: {
        drive: {
          include: {
            company: true,
            selectionRounds: true,
          }
        },
        roundResults: true,
      }
    });

    // 2. Fetch all upcoming/active Drives to find those eligible but not applied to
    const now = new Date();
    const activeDrives = await prisma.placementDrive.findMany({
      where: {
        registrationEnd: { gt: now },
      },
      include: { company: true }
    });

    // 3. Fetch Custom Events (Global calendar events)
    const customEvents = await prisma.customCalendarEvent.findMany();

    const calendarEvents: any[] = [];
    const appliedDriveIds = new Set(applications.map((app: any) => app.driveId));

    // Process Active Drives for Eligibility
    for (const drive of activeDrives) {
      if (!appliedDriveIds.has(drive.id)) {
        const eligibility = await checkEligibility(student, drive);
        if (eligibility.isEligible) {
          // Add Drive Application Deadline
          if (drive.applicationDeadline || drive.registrationEnd) {
            const deadline = drive.applicationDeadline || drive.registrationEnd;
            calendarEvents.push({
              id: `deadline-${drive.id}`,
              title: `${drive.company?.name} Deadline`,
              start: deadline?.toISOString(),
              allDay: true,
              backgroundColor: '#fffbeb', // amber-50
              borderColor: '#fbbf24', // amber-400
              textColor: '#b45309', // amber-700
              extendedProps: {
                driveId: drive.id,
                company: drive.company?.name,
                jobRole: drive.jobRole,
                type: 'Application Deadline',
                status: 'Open',
                isEligible: true,
                hasApplied: false,
              }
            });
          }
          
          // Add Drive Date if it exists
          if (drive.expectedDriveDate) {
             const driveEnd = new Date(drive.expectedDriveDate);
             driveEnd.setDate(driveEnd.getDate() + 2); // Assume 2 days duration for the visual span
             calendarEvents.push({
               id: `drive-${drive.id}`,
               title: `${drive.company?.name} - Campus Drive`,
               start: drive.expectedDriveDate.toISOString().split('T')[0],
               end: driveEnd.toISOString().split('T')[0],
               allDay: true,
               backgroundColor: '#eff6ff',
               borderColor: '#60a5fa',
               textColor: '#1d4ed8',
               extendedProps: {
                 driveId: drive.id,
                 company: drive.company?.name,
                 jobRole: drive.jobRole,
                 type: 'Placement Drive',
                 status: 'Upcoming',
                 isEligible: true,
                 hasApplied: false,
               }
             });
          }
        }
      }
    }

    // Process Applied Drives and their Rounds
    for (const app of applications) {
      const drive = app.drive;
      
      // The Drive Event itself
      if (drive.expectedDriveDate) {
        const driveEnd = new Date(drive.expectedDriveDate);
        driveEnd.setDate(driveEnd.getDate() + 2); // Assume 2 days duration for the visual span
        calendarEvents.push({
          id: `drive-${drive.id}`,
          title: `${drive.company?.name} - Campus Drive`,
          start: drive.expectedDriveDate.toISOString().split('T')[0],
          end: driveEnd.toISOString().split('T')[0],
          allDay: true,
          backgroundColor: '#eff6ff',
          borderColor: '#60a5fa',
          textColor: '#1d4ed8',
          extendedProps: {
             driveId: drive.id,
             company: drive.company?.name,
             jobRole: drive.jobRole,
             applicationId: app.id,
             applicationStatus: app.status,
             type: 'Placement Drive',
             status: 'Applied',
             isEligible: true,
             hasApplied: true,
          }
        });
      }

      // Selection Rounds / Interviews
      for (const round of drive.selectionRounds) {
        // If it's a specific interview, the app status or interview schedules might be used.
        // For simplicity, we show all selection rounds for drives the student applied to.
        if (round.date) {
           const startStr = round.time 
             ? `${round.date.toISOString().split('T')[0]}T${round.time}:00` 
             : round.date.toISOString().split('T')[0];

           calendarEvents.push({
              id: `round-${round.id}`,
              title: `${drive.company?.name} - ${round.title}`,
              start: startStr,
              allDay: !round.time,
              backgroundColor: '#f3e8ff', // purple-50
              borderColor: '#c084fc', // purple-400
              textColor: '#7e22ce', // purple-700
              extendedProps: {
                 driveId: drive.id,
                 applicationId: app.id,
                 roundId: round.id,
                 company: drive.company?.name,
                 jobRole: drive.jobRole,
                 venue: round.venue || round.platform,
                 instructions: round.instructions,
                 description: round.evaluationCriteria,
                 type: round.roundType || 'Interview',
                 status: 'Scheduled',
              }
           });
        }
      }
    }

    // Add Custom Events
    for (const c of customEvents) {
      calendarEvents.push({
         id: `custom-${c.id}`,
         title: c.title,
         start: c.start.toISOString(),
         end: c.end ? c.end.toISOString() : undefined,
         allDay: c.isAllDay,
         color: c.color || '#4f46e5',
         extendedProps: {
            eventId: c.id,
            description: c.description,
            isCustom: true,
            type: c.type || 'Event',
            status: 'Scheduled',
         }
      });
    }

    return res.status(200).json({
      events: calendarEvents
    });

  } catch (error: any) {
    console.error('Student Calendar Error:', error);
    return res.status(500).json({ message: 'Error fetching calendar events', error: error.message });
  }
};
