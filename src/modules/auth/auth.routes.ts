import { Router } from 'express';
import { authController } from './auth.controller';
import { validateSignup, validateLogin } from '../../middleware/validation';

const router = Router();

router.post('/signup', validateSignup, authController.signup);
router.post('/login', validateLogin, authController.login);

export default router;