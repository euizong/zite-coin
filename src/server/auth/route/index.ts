import { Router } from 'express';
import * as authController from '../controller';

const router = Router();
router.post('/login', authController.login);
router.get('/signin', authController.signin);
export default router;
