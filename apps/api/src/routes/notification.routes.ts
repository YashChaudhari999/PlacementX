import { Router } from 'express';
import { getNotifications, markAsRead, registerDeviceToken } from '../controllers/notification.controller';

const router = Router();

router.get('/', getNotifications);
router.put('/:id/read', markAsRead);
router.post('/register-token', registerDeviceToken);

export default router;
