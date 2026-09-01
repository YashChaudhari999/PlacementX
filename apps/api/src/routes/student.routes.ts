import { Router } from 'express';
import multer from 'multer';
import { getProfile, updateProfile, updatePhoto, applyForDrive, getApplications, getInterviews, getDocuments, mlPredictSuccess, getProfileStatus, requestProfileUpdate, uploadAcademicDoc } from '../controllers/student.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

// Require authentication for all student routes
router.use(authenticate);

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
router.post('/:studentId/ml-predict', authorize('SUPER_ADMIN', 'COORDINATOR'), mlPredictSuccess);

export default router;

