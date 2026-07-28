import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { 
  getMyNotifications, 
  getMyUnreadCount, 
  markNotificationRead, 
  markAllNotificationsRead, 
  deleteMyNotification,
  broadcastNotification
} from '../controllers/notification.controller';

const router = Router();

// Student/General endpoints
router.get('/', authenticate, getMyNotifications);
router.get('/unread-count', authenticate, getMyUnreadCount);
router.patch('/read/:id', authenticate, markNotificationRead);
router.patch('/read-all', authenticate, markAllNotificationsRead);
router.delete('/:id', authenticate, deleteMyNotification);

// Admin endpoints
router.post('/broadcast', authenticate, broadcastNotification);

export default router;
