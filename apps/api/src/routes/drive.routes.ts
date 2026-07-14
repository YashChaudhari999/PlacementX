import { Router } from 'express';
import { 
  createDrive, 
  getDrives, 
  checkEligibilityStatus, 
  getDriveById,
  getDriveApplications,
  updateApplicationStatus,
  approveHrDrive,
  rejectHrDrive,
  requestChangesHrDrive
} from '../controllers/drive.controller';

const router = Router();

router.post('/', createDrive);
router.get('/', getDrives);
router.get('/:id/eligibility', checkEligibilityStatus);
router.get('/:id', getDriveById);
router.get('/:id/applications', getDriveApplications);
router.put('/applications/:id/status', updateApplicationStatus);

// HR Drive Review Routes
router.post('/:id/approve', approveHrDrive);
router.post('/:id/reject', rejectHrDrive);
router.post('/:id/request-changes', requestChangesHrDrive);

export default router;
