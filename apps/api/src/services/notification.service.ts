import { PrismaClient } from '@prisma/client';
import admin from 'firebase-admin';

const prisma = new PrismaClient();

export const sendNotification = async (
  userId: string,
  title: string,
  message: string,
  type: string = 'INFO',
  link?: string
) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        link
      }
    });
    
    // Fetch device tokens for the user
    const tokens = await prisma.deviceToken.findMany({
      where: { userId }
    });

    if (tokens.length > 0 && admin.apps.length > 0) {
      const fcmTokens = tokens.map(t => t.token);
      const payload = {
        notification: {
          title,
          body: message,
        },
        data: {
          url: link || '/',
          type
        },
        tokens: fcmTokens
      };

      try {
        const response = await admin.messaging().sendEachForMulticast(payload);
        console.log(`[FCM] Sent to ${userId}, Success: ${response.successCount}, Failure: ${response.failureCount}`);
        
        // Clean up invalid tokens
        if (response.failureCount > 0) {
          const failedTokens = [];
          response.responses.forEach((resp, idx) => {
            if (!resp.success) {
              failedTokens.push(fcmTokens[idx]);
            }
          });
          if (failedTokens.length > 0) {
            await prisma.deviceToken.deleteMany({
              where: { token: { in: failedTokens } }
            });
          }
        }
      } catch (fcmError) {
        console.error('[FCM] Error sending push notification:', fcmError);
      }
    }
    
    return notification;
  } catch (error) {
    console.error('Failed to send notification:', error);
    throw error;
  }
};

export const broadcastToEligibleStudents = async (
  driveId: string,
  title: string,
  message: string,
  link?: string
) => {
  try {
    // For now, simple broadcast to all students
    // A robust version would fetch all students and run checkEligibility on them
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      include: { deviceTokens: true }
    });
    
    // Create DB notifications for all students
    const notifications = await Promise.all(
      students.map(student => 
        prisma.notification.create({
          data: {
            userId: student.id,
            title,
            message,
            type: 'DRIVE_ALERT',
            link
          }
        })
      )
    );
    
    // Batch FCM push notifications for students who have tokens
    const allTokens: string[] = [];
    students.forEach(student => {
      student.deviceTokens.forEach(dt => allTokens.push(dt.token));
    });

    if (allTokens.length > 0 && admin.apps.length > 0) {
      // Chunk tokens into groups of 500 (FCM limit for sendEachForMulticast)
      const chunkSize = 500;
      for (let i = 0; i < allTokens.length; i += chunkSize) {
        const chunk = allTokens.slice(i, i + chunkSize);
        
        const payload = {
          notification: {
            title,
            body: message,
          },
          data: {
            url: link || '/',
            type: 'DRIVE_ALERT'
          },
          tokens: chunk
        };
        
        admin.messaging().sendEachForMulticast(payload).then(response => {
           console.log(`[FCM Broadcast] Success: ${response.successCount}, Failure: ${response.failureCount}`);
        }).catch(err => console.error('[FCM Broadcast] Error:', err));
      }
    }
    
    console.log(`[Broadcast] Created ${notifications.length} notifications for Drive ${driveId}`);
  } catch (error) {
    console.error('Failed to broadcast notifications:', error);
  }
};
