import { Router } from 'express';
import { 
  getStudents,
  getStudentStats,
  importStudents,
  getCoordinators, 
  addCoordinator, 
  broadcastNotification, 
  getCalendarEvents,
  getAdminDashboard,
  getPendingProfiles,
  verifyProfile,
  getUpdateRequests,
  reviewUpdateRequest,
  provisionCurrentYearStudents,
  createCustomEvent,
  updateCustomEvent,
  deleteCustomEvent,
  rescheduleInterview,
  getStudentById,
  updateStudentAdminNotes
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
router.get('/students/:studentId', getStudentById);
router.put('/students/:studentId/notes', updateStudentAdminNotes);
router.get('/coordinators', getCoordinators);
router.post('/coordinators', addCoordinator);

router.post('/notifications/broadcast', broadcastNotification);
router.get('/calendar', getCalendarEvents);
router.post('/calendar/custom', createCustomEvent);
router.put('/calendar/custom/:id', updateCustomEvent);
router.delete('/calendar/custom/:id', deleteCustomEvent);
router.put('/calendar/interview/:id/reschedule', rescheduleInterview);

// Verification and Updates
router.get('/profile-verifications', getPendingProfiles);
router.post('/profile-verifications/:id/verify', verifyProfile);
router.get('/profile-update-requests', getUpdateRequests);
router.post('/profile-update-requests/:id/review', reviewUpdateRequest);

export default router;
