import { Router } from 'express';
import { getProfile, updateProfile, applyForDrive, getApplications, getInterviews, getDocuments, mlPredictSuccess } from '../controllers/student.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Require authentication for all student routes
router.use(authenticate);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/applications', applyForDrive);
router.get('/applications', getApplications);
router.get('/interviews', getInterviews);
router.get('/documents', getDocuments);
router.post('/:studentId/ml-predict', authorize('SUPER_ADMIN', 'COORDINATOR'), mlPredictSuccess);

export default router;

