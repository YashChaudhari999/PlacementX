import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import {
  getSettings,
  updateProfilePreferences,
  updatePrivacy,
  updateCalendar,
  updateRegional,
  updateNotifications,
  submitSupportRequest,
  requestDeactivation,
  getDevices,
  deleteDevice,
  exportData
} from '../controllers/student.settings.controller';

const router = Router();

// All settings routes must be authenticated and restricted to STUDENT role
router.use(authenticate);
router.use(authorize('STUDENT'));

// GET all settings
router.get('/', getSettings);

// PUT update individual preference groups
router.put('/profile-preferences', updateProfilePreferences);
router.put('/privacy', updatePrivacy);
router.put('/calendar', updateCalendar);
router.put('/regional', updateRegional);
router.put('/notifications', updateNotifications);

// Devices
router.get('/devices', getDevices);
router.delete('/devices/:id', deleteDevice);

// Help & Support
router.post('/support', submitSupportRequest);

// Danger Zone
router.post('/deactivation-request', requestDeactivation);
router.post('/data-export', exportData);

export default router;
