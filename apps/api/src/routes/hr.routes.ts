import express from 'express';
import { generateHrLink, validateHrLink, autoSaveDraft, submitHrDrive } from '../controllers/hr.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = express.Router();

// Public routes (secured via JWT payload attached in HR links if any)
router.post('/validate', validateHrLink);
router.put('/draft', autoSaveDraft);
router.post('/submit', submitHrDrive);

// Admin route
router.post('/generate', authenticate, authorize('SUPER_ADMIN', 'COORDINATOR'), generateHrLink);

export default router;
