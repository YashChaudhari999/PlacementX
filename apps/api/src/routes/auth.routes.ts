import { Router } from 'express';
import { login, firebaseLogin, register, getMe, changePassword } from '../controllers/auth.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/firebase-login', firebaseLogin);
router.get('/me', protect, getMe);
router.put('/password', protect, changePassword);

export default router;
