import { Router } from 'express';
import { register, login, getMe, logout, verifyAccount, resetPassword } from '../controllers/authController.js';
import { registerValidation, loginValidation } from '../validators/authValidator.js';
import { validateRequest } from '../middlewares/validatorMiddleware.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/register', registerValidation, validateRequest, register);
router.post('/login', loginValidation, validateRequest, login);
router.get('/me', protect, getMe);
router.post('/logout', logout);
router.post('/verify-account', verifyAccount);
router.post('/reset-password', resetPassword);

export default router;
