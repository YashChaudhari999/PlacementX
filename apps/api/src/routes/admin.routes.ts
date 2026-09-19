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
  updateStudentAdminNotes,
  getStudentAcademicDoc
} from '../controllers/admin.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Secure all admin routes
router.use(authenticate, authorize('SUPER_ADMIN', 'COORDINATOR'));


router.get('/dashboard', authorize('SUPER_ADMIN'), getAdminDashboard);
router.get('/students', getStudents);
router.get('/students/stats', getStudentStats);
router.post('/students/import', authorize('SUPER_ADMIN'), importStudents);
router.post('/students/provision', authorize('SUPER_ADMIN'), provisionCurrentYearStudents);
router.get('/students/:studentId', getStudentById);
router.put('/students/:studentId/notes', updateStudentAdminNotes);
router.get('/students/:studentId/documents/academic', getStudentAcademicDoc);
router.get('/coordinators', authorize('SUPER_ADMIN'), getCoordinators);
router.post('/coordinators', authorize('SUPER_ADMIN'), addCoordinator);

router.post('/notifications/broadcast', authorize('SUPER_ADMIN'), broadcastNotification);
router.get('/calendar', authorize('SUPER_ADMIN'), getCalendarEvents);
router.post('/calendar/custom', authorize('SUPER_ADMIN'), createCustomEvent);
router.put('/calendar/custom/:id', authorize('SUPER_ADMIN'), updateCustomEvent);
router.delete('/calendar/custom/:id', authorize('SUPER_ADMIN'), deleteCustomEvent);
router.put('/calendar/interview/:id/reschedule', authorize('SUPER_ADMIN'), rescheduleInterview);

// Verification and Updates
router.get('/profile-verifications', getPendingProfiles);
router.post('/profile-verifications/:id/verify', verifyProfile);
router.get('/profile-update-requests', getUpdateRequests);
router.post('/profile-update-requests/:id/review', reviewUpdateRequest);

export default router;
