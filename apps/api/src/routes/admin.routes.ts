import { Router } from 'express';
import { 
  getStudents,
  getStudentStats,
  importStudents,
  getCoordinators, 
  addCoordinator, 
  getReportsData, 
  broadcastNotification, 
  getCalendarEvents,
  getAdminDashboard,
  getPendingProfiles,
  verifyProfile,
  getUpdateRequests,
  reviewUpdateRequest,
  provisionCurrentYearStudents
} from '../controllers/admin.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Secure all admin routes
router.use(authenticate, authorize('SUPER_ADMIN', 'COORDINATOR'));


router.get('/dashboard', getAdminDashboard);
router.get('/students', getStudents);
router.get('/students/stats', getStudentStats);
router.post('/students/import', importStudents);
router.post('/students/provision', provisionCurrentYearStudents);
router.get('/coordinators', getCoordinators);
router.post('/coordinators', addCoordinator);
router.get('/reports/data', getReportsData);
router.post('/notifications/broadcast', broadcastNotification);
router.get('/calendar', getCalendarEvents);

// Verification and Updates
router.get('/profile-verifications', getPendingProfiles);
router.post('/profile-verifications/:id/verify', verifyProfile);
router.get('/profile-update-requests', getUpdateRequests);
router.post('/profile-update-requests/:id/review', reviewUpdateRequest);

export default router;
