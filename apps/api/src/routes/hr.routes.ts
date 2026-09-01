import express from 'express';
import { 
  generateHrLink, 
  validateHrLink, 
  autoSaveDraft, 
  submitHrDrive,
  getWorkspaceDetails,
  getWorkspaceCandidates,
  getCandidateDetails,
  updateCandidateStatus,
  scheduleInterview,
  processResultUpload,
  confirmResultUpload
} from '../controllers/hr.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = express.Router();

// Public routes (secured via HR link token in body or params)
router.post('/validate', validateHrLink);
router.put('/draft', autoSaveDraft);
router.post('/submit', submitHrDrive);

// Workspace routes (Active/Closed drives) - Secured via HR token
router.get('/workspace/:token/details', getWorkspaceDetails);
router.get('/workspace/:token/candidates', getWorkspaceCandidates);
router.get('/workspace/:token/candidates/:applicationId', getCandidateDetails);
router.post('/workspace/:token/status', updateCandidateStatus);
router.post('/workspace/:token/interview', scheduleInterview);
router.post('/workspace/:token/results/process', processResultUpload);
router.post('/workspace/:token/results/confirm', confirmResultUpload);

// Admin route
router.post('/generate', authenticate, authorize('SUPER_ADMIN', 'COORDINATOR'), generateHrLink);

export default router;
