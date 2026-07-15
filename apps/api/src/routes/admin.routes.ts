import { Router } from 'express';
import { 
  getStudents, 
  importStudents,
  getCoordinators, 
  addCoordinator, 
  getReportsData, 
  broadcastNotification, 
  getCalendarEvents 
} from '../controllers/admin.controller';

const router = Router();

router.get('/students', getStudents);
router.post('/students/import', importStudents);
router.get('/coordinators', getCoordinators);
router.post('/coordinators', addCoordinator);
router.get('/reports/data', getReportsData);
router.post('/notifications/broadcast', broadcastNotification);
router.get('/calendar', getCalendarEvents);

export default router;
