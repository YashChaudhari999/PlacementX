import { Router } from 'express';
import multer from 'multer';
import { getProfile, updateProfile, updatePhoto, applyForDrive, getApplications, getInterviews, getDocuments, getProfileStatus, requestProfileUpdate, uploadAcademicDoc } from '../controllers/student.controller';
import { getCalendarEvents } from '../controllers/student.calendar.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import studentSettingsRoutes from './student.settings.routes';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

// Require authentication for all student routes
router.use(authenticate);

// Admin specific routes on student profile

// Only students can access the following routes
router.use(authorize('STUDENT'));

router.get('/profile', getProfile);
router.get('/profile/status', getProfileStatus);
router.put('/profile', updateProfile);
router.put('/profile/photo', updatePhoto);
router.put('/profile/update-request', requestProfileUpdate);
router.post('/applications', applyForDrive);
router.get('/applications', getApplications);
router.get('/interviews', getInterviews);
router.get('/documents', getDocuments);
router.post('/documents/academic', upload.single('file'), uploadAcademicDoc);
router.get('/calendar', getCalendarEvents);

router.use('/settings', studentSettingsRoutes);

export default router;

