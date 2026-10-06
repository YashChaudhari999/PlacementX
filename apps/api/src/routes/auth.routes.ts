import { Router } from 'express';
import { login, firebaseLogin, register, getMe, changePassword, forgotPassword } from '../controllers/auth.controller';
import { protect } from '../middlewares/auth.middleware';
import { authRateLimit } from '../middlewares/security.middleware';

const router = Router();

router.post('/register', authRateLimit, register);
router.post('/login', authRateLimit, login);
router.post('/firebase-login', authRateLimit, firebaseLogin);
router.post('/forgot-password', authRateLimit, forgotPassword);
router.get('/me', protect, getMe);
router.put('/password', protect, changePassword);

export default router;
