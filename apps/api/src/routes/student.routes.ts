import { Router } from 'express';
import { getProfile, updateProfile, applyForDrive, getApplications, getInterviews, getDocuments, mlPredictSuccess } from '../controllers/student.controller';

const router = Router();

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/applications', applyForDrive);
router.get('/applications', getApplications);
router.get('/interviews', getInterviews);
router.get('/documents', getDocuments);
router.post('/:studentId/ml-predict', mlPredictSuccess);

export default router;

