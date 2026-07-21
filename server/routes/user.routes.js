import express from 'express';
import { getUserProfile, changePassword, getAnalytics, updateExternalProfile, removeExternalProfile, getDashboard, getUsers, updateUserRole, getSolvedSubmissions } from '../controllers/user.controller.js';
import { authenticate, requireSuperAdmin } from '../middleware/auth.middleware.js';
const router = express.Router();

router.get('/profile', authenticate, getUserProfile);
router.put('/password', authenticate, changePassword);
router.get('/analytics', authenticate, getAnalytics);
router.get('/dashboard', authenticate, getDashboard);
router.post('/external-profiles', authenticate, updateExternalProfile);
router.put('/external-profiles', authenticate, updateExternalProfile);
router.delete('/external-profiles', authenticate, removeExternalProfile);
router.get("/solved", authenticate, getSolvedSubmissions);

router.get('/', authenticate, requireSuperAdmin, getUsers);
router.put('/:id/role', authenticate, requireSuperAdmin, updateUserRole);

export default router;
