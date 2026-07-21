import express from 'express';
import mongoose from 'mongoose';
import Problem from '../models/Problem.model.js';
import {
  reviewCodeWithGemini,
  optimizeCodeWithGemini,
  chatWithGemini,
  coachWithGemini,
  generateRoadmapWithGemini,
} from '../services/gemini.service.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

const loadProblem = async (problemId) => {
  if (!problemId) return null;
  return Problem.findOne({
    isDeleted: { $ne: true },
    $or: [
      { slug: problemId },
      ...(mongoose.Types.ObjectId.isValid(problemId) ? [{ _id: problemId }] : []),
    ],
  }).select('title description constraints sampleTestCases');
};

const validatePayload = (req, res) => {
  const { code, language } = req.body;

  if (!code || !language) {
    res.status(400).json({ error: 'Code and language are required' });
    return null;
  }

  return { code, language };
};

router.post('/review', async (req, res) => {
  try {
    const payload = validatePayload(req, res);
    if (!payload) return;

    const problem = await loadProblem(req.body.problemId);
    const review = await reviewCodeWithGemini({
      ...payload,
      problem,
    });

    res.json(review);
  } catch (error) {
    const statusCode = error.message === 'GEMINI_API_KEY is not configured' ? 503 : 500;
    res.status(statusCode).json({
      error: error.message || 'Failed to review code',
    });
  }
});

router.post('/optimize', async (req, res) => {
  try {
    const payload = validatePayload(req, res);
    if (!payload) return;

    const problem = await loadProblem(req.body.problemId);
    const optimization = await optimizeCodeWithGemini({
      ...payload,
      problem,
    });

    res.json(optimization);
  } catch (error) {
    const statusCode = error.message === 'GEMINI_API_KEY is not configured' ? 503 : 500;
    res.status(statusCode).json({
      error: error.message || 'Failed to optimize code',
    });
  }
});

router.post('/chat', async (req, res) => {
  try {
    const { code, language, problemId, message, history } = req.body;

    if (!code || !language || !message) {
      return res.status(400).json({ error: 'Code, language, and message are required' });
    }

    const problem = await loadProblem(problemId);
    const response = await chatWithGemini({
      code,
      language,
      problem,
      message,
      history: Array.isArray(history) ? history : [],
    });

    res.json(response);
  } catch (error) {
    const statusCode = error.message === 'GEMINI_API_KEY is not configured' ? 503 : 500;
    res.status(statusCode).json({
      error: error.message || 'Failed to send chat message',
    });
  }
});

router.get('/coach', authenticate, async (req, res) => {
  try {
    const user = await mongoose.model('User').findById(req.user._id).populate('solvedProblems.problemId');
    let solvedTopics = [];
    
    if (user && user.solvedProblems) {
      const allTopics = user.solvedProblems.flatMap(sp => sp.problemId?.topics || []);
      if (allTopics.length > 0) {
        solvedTopics = [...new Set(allTopics)];
      }
    }

    const coaching = await coachWithGemini({ 
      solvedTopics, 
      externalProfiles: user.externalProfiles || {},
      totalSolved: user.solvedProblems?.length || 0
    });
    res.json(coaching);
  } catch (error) {
    const statusCode = error.message === 'GEMINI_API_KEY is not configured' ? 503 : 500;
    res.status(statusCode).json({
      error: error.message || 'Failed to get coaching',
    });
  }
});

router.post('/roadmap', async (req, res) => {
  try {
    const { company } = req.body;
    if (!company) {
      return res.status(400).json({ error: 'Company name is required' });
    }
    const roadmap = await generateRoadmapWithGemini({ company });
    res.json(roadmap);
  } catch (error) {
    const statusCode = error.message === 'GEMINI_API_KEY is not configured' ? 503 : 500;
    res.status(statusCode).json({
      error: error.message || 'Failed to generate roadmap',
    });
  }
});

export default router;
