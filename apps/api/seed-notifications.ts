import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding notification templates and admin inbox...');

  // 1. Find Admin user
  const admin = await prisma.user.findFirst({
    where: { role: 'SUPER_ADMIN' }
  });

  if (!admin) {
    console.error('No admin user found!');
    return;
  }

  // 2. Add Placement Templates
  const templates = [
    {
      name: 'Upcoming Placement Drive',
      title: 'Upcoming Drive: {{companyName}}',
      message: 'Hello {{studentName}}, {{companyName}} is visiting for a placement drive on {{date}}. Please register before the deadline.',
      category: 'Placement'
    },
    {
      name: 'Interview Shortlist',
      title: 'Shortlisted for {{companyName}} Interview',
      message: 'Congratulations {{studentName}}! You have been shortlisted for the interview at {{companyName}} scheduled on {{date}}.',
      category: 'Placement'
    },
    {
      name: 'Offer Extended',
      title: 'Job Offer from {{companyName}}!',
      message: 'Great news {{studentName}}! {{companyName}} has extended a job offer to you. Please check your email for more details.',
      category: 'Placement'
    }
  ];

  for (const t of templates) {
    const existing = await prisma.notificationTemplate.findFirst({
      where: { name: t.name }
    });
    if (!existing) {
      await prisma.notificationTemplate.create({
        data: t
      });
    } else {
      await prisma.notificationTemplate.update({
        where: { id: existing.id },
        data: t
      });
    }
  }
  console.log('Added placement templates.');

  // 3. Add Notifications to Admin Inbox
  const adminNotifications = [
    {
      title: 'New Student Registration',
      message: 'Aarav Patil has just registered on the platform.',
      category: 'SYSTEM',
      type: 'SYSTEM',
      priority: 'MEDIUM',
      receiverId: admin.id,
      senderId: admin.id, // Assuming system
      senderRole: 'SYSTEM'
    },
    {
      title: 'Drive Approval Pending',
      message: 'TCS is requesting approval for a new placement drive.',
      category: 'PLACEMENT',
      type: 'PLACEMENT',
      priority: 'HIGH',
      receiverId: admin.id,
      senderId: admin.id,
      senderRole: 'SYSTEM'
    },
    {
      title: 'System Update',
      message: 'The platform will undergo scheduled maintenance this Sunday at 2 AM.',
      category: 'SYSTEM',
      type: 'SYSTEM',
      priority: 'LOW',
      receiverId: admin.id,
      senderId: admin.id,
      senderRole: 'SYSTEM'
    }
  ];

  for (const n of adminNotifications) {
    await prisma.notification.create({
      data: n
    });
  }
  console.log('Added received notifications for the admin.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
