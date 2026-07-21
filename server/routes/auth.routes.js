import express from 'express';
import { signup, login, getCurrentUser, logout, googleLogin } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.post('/google', googleLogin);
router.get('/me', authenticate, getCurrentUser);

export default router;
