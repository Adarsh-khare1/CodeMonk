import express from 'express';
import { getProblems, getProblemById, getDailyProblem } from '../controllers/problem.controller.js';

const router = express.Router();

router.get('/', getProblems);
router.get('/daily', getDailyProblem);
router.get('/:id', getProblemById);

export default router;
