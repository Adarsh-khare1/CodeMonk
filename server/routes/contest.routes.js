import express from 'express';
import { getContests, getContestById, createDemoContest, createContest } from '../controllers/contest.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', getContests);
router.post('/', authenticate, requireAdmin, createContest);
router.post('/demo', authenticate, requireAdmin, createDemoContest); 
router.get('/:id', getContestById);

export default router;
