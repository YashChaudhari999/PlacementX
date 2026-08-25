// ─── Notification Routes (Production) ───────────────────
// Full REST API for the notification system.

import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import {
  getMyNotifications,
  getMyUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  archiveMyNotification,
  deleteMyNotification,
  getPreferences,
  updatePreferences,
  registerDevice,
  removeDevice,
  broadcastNotification,
  scheduleNotificationController,
} from '../controllers/notification.controller';
import {
  getAdminNotificationStats,
  getAdminNotificationHistory,
  getAdminScheduledNotifications,
  getAdminNotificationTemplates,
  getAdminRecommendations,
} from '../controllers/admin.notification.controller';

const router = Router();

// ─── User Endpoints ─────────────────────────────────────

router.get('/', authenticate, getMyNotifications);                    // GET /notifications?limit=20&cursor=abc&category=placement&isRead=false&search=drive
router.get('/unread-count', authenticate, getMyUnreadCount);          // GET /notifications/unread-count

router.patch('/:id/read', authenticate, markNotificationRead);        // PATCH /notifications/:id/read
router.patch('/read-all', authenticate, markAllNotificationsRead);     // PATCH /notifications/read-all
router.patch('/:id/archive', authenticate, archiveMyNotification);    // PATCH /notifications/:id/archive

router.delete('/:id', authenticate, deleteMyNotification);            // DELETE /notifications/:id

// ─── Preferences ────────────────────────────────────────

router.get('/preferences', authenticate, getPreferences);             // GET /notifications/preferences
router.put('/preferences', authenticate, updatePreferences);          // PUT /notifications/preferences

// ─── Device Management ──────────────────────────────────

router.post('/register-device', authenticate, registerDevice);        // POST /notifications/register-device
router.delete('/remove-device', authenticate, removeDevice);          // DELETE /notifications/remove-device

// ─── Admin Endpoints ────────────────────────────────────

const adminOnly = authorize('SUPER_ADMIN', 'COORDINATOR');

router.post('/broadcast', authenticate, adminOnly, broadcastNotification);       // POST /notifications/broadcast
router.post('/schedule', authenticate, adminOnly, scheduleNotificationController); // POST /notifications/schedule

router.get('/admin/stats', authenticate, adminOnly, getAdminNotificationStats);
router.get('/admin/history', authenticate, adminOnly, getAdminNotificationHistory);
router.get('/admin/scheduled', authenticate, adminOnly, getAdminScheduledNotifications);
router.get('/admin/templates', authenticate, adminOnly, getAdminNotificationTemplates);
router.get('/admin/recommendations', authenticate, adminOnly, getAdminRecommendations);

export default router;
