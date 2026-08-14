import { Router } from 'express';
import { 
  getStudents, 
  importStudents,
  getCoordinators, 
  addCoordinator, 
  getReportsData, 
  broadcastNotification, 
  getCalendarEvents,
  getAdminDashboard
} from '../controllers/admin.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Secure all admin routes
router.use(authenticate, authorize('SUPER_ADMIN', 'COORDINATOR'));


router.get('/dashboard', getAdminDashboard);
router.get('/students', getStudents);
router.post('/students/import', importStudents);
router.get('/coordinators', getCoordinators);
router.post('/coordinators', addCoordinator);
router.get('/reports/data', getReportsData);
router.post('/notifications/broadcast', broadcastNotification);
router.get('/calendar', getCalendarEvents);

export default router;
