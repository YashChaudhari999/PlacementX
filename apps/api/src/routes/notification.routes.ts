// ─── Notification Routes (Production) ───────────────────
// Full REST API for the notification system.

import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
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

router.post('/broadcast', authenticate, broadcastNotification);       // POST /notifications/broadcast
router.post('/schedule', authenticate, scheduleNotificationController); // POST /notifications/schedule

export default router;
