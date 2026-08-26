import { Router } from 'express';
import { getSettings, updateSettings, getAuditLogs, getSystemHealth } from '../controllers/settings.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Require authentication for all settings routes
router.use(authenticate);

// Everyone with SUPER_ADMIN or COORDINATOR can read settings and health
router.get('/', authorize('SUPER_ADMIN', 'COORDINATOR'), getSettings);
router.get('/health', authorize('SUPER_ADMIN', 'COORDINATOR'), getSystemHealth);

// Only SUPER_ADMIN can update settings and view audit logs (or depending on specific rules, we can restrict further)
router.patch('/', authorize('SUPER_ADMIN'), updateSettings);
router.get('/audit', authorize('SUPER_ADMIN'), getAuditLogs);

export default router;
