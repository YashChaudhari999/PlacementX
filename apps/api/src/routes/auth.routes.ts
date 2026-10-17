import { Router } from 'express';
import { login, firebaseLogin, register, getMe, changePassword } from '../controllers/auth.controller';
import { protect } from '../middlewares/auth.middleware';
import { authRateLimit } from '../middlewares/security.middleware';
import { confirmPasswordReset, requestPasswordReset, resendPasswordReset, verifyPasswordReset } from '../controllers/passwordReset.controller';

const router = Router();

router.post('/register', authRateLimit, register);
router.post('/login', authRateLimit, login);
router.post('/firebase-login', authRateLimit, firebaseLogin);
router.post('/forgot-password', authRateLimit, requestPasswordReset);
router.post('/password-reset/request', authRateLimit, requestPasswordReset);
router.post('/password-reset/verify', authRateLimit, verifyPasswordReset);
router.post('/password-reset/confirm', authRateLimit, confirmPasswordReset);
router.post('/password-reset/resend', authRateLimit, resendPasswordReset);
router.get('/me', protect, getMe);
router.put('/password', protect, changePassword);

export default router;
