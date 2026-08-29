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
  requestChangesHrDrive,
  updateDrive,
  deleteDrive,
  updateDriveStatus
} from '../controllers/drive.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Require authentication for all drive routes
router.use(authenticate);

const adminOnly = authorize('SUPER_ADMIN', 'COORDINATOR');

router.post('/', adminOnly, createDrive);
router.get('/', getDrives);
router.get('/:id/eligibility', checkEligibilityStatus);
router.get('/:id', getDriveById);
router.put('/:id', adminOnly, updateDrive);
router.delete('/:id', adminOnly, deleteDrive);
router.put('/:id/status', adminOnly, updateDriveStatus);
router.get('/:id/applications', adminOnly, getDriveApplications);
router.put('/applications/:id/status', adminOnly, updateApplicationStatus);

// HR Drive Review Routes
router.post('/:id/approve', adminOnly, approveHrDrive);
router.post('/:id/reject', adminOnly, rejectHrDrive);
router.post('/:id/request-changes', adminOnly, requestChangesHrDrive);

export default router;
