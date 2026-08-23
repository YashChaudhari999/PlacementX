import express from 'express';
import { 
  getEventDetails, 
  getEventCandidates, 
  updateCandidateStatus, 
  scheduleInterview, 
  bulkUpdateResults 
} from '../controllers/recruiter.controller';

const router = express.Router();

// Public routes (secured via HR token)
router.get('/event/:token', getEventDetails);
router.get('/event/:token/candidates', getEventCandidates);
router.post('/event/:token/shortlist', updateCandidateStatus);
router.post('/event/:token/interview', scheduleInterview);
router.post('/event/:token/results', bulkUpdateResults);

export default router;
