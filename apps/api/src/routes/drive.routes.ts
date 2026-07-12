import { Router } from 'express';
import { 
  createDrive, 
  getDrives, 
  checkEligibilityStatus, 
  getDriveById,
  getDriveApplications,
  updateApplicationStatus
} from '../controllers/drive.controller';

const router = Router();

router.post('/', createDrive);
router.get('/', getDrives);
router.get('/:id/eligibility', checkEligibilityStatus);
router.get('/:id', getDriveById);
router.get('/:id/applications', getDriveApplications);
router.put('/applications/:id/status', updateApplicationStatus);

export default router;
