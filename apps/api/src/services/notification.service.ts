import { PrismaClient } from '@prisma/client';

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
    
    // Here we could integrate SendGrid for Email or Twilio for WhatsApp
    console.log(`[Notification] Sent to ${userId}: ${title}`);
    
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
      where: { role: 'STUDENT' }
    });
    
    const notifications = await Promise.all(
      students.map(student => 
        sendNotification(student.id, title, message, 'DRIVE_ALERT', link)
      )
    );
    
    console.log(`[Broadcast] Sent ${notifications.length} notifications for Drive ${driveId}`);
  } catch (error) {
    console.error('Failed to broadcast notifications:', error);
  }
};
