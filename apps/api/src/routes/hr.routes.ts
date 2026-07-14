import express from 'express';
import { generateHrLink, validateHrLink, autoSaveDraft, submitHrDrive } from '../controllers/hr.controller';

const router = express.Router();

// Public routes (secured via JWT payload)
router.post('/validate', validateHrLink);
router.put('/draft', autoSaveDraft);
router.post('/submit', submitHrDrive);

// Admin route
router.post('/generate', generateHrLink);

export default router;
