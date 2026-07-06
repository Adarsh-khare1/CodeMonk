import mongoose from 'mongoose';
import Problem from '../models/Problem.model.js';

export const getProblems = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database not connected' });
    }

    const {
      difficulty,
      topic,
      search,
      page = 1,
      limit = 10,
    } = req.query;
    const filter = { isDeleted: { $ne: true } };
    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);

    if (difficulty) filter.difficulty = difficulty;

    // FIX: use topics instead of category
    if (topic) filter.topics = { $in: [topic] };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const [total, problems] = await Promise.all([
      Problem.countDocuments(filter),
      Problem.find(filter)
        .select('_id slug title difficulty topics attemptsCount acceptedCount createdAt')
        .sort({ createdAt: -1, _id: -1 })
        .skip((parsedPage - 1) * parsedLimit)
        .limit(parsedLimit),
    ]);

    const totalPages = Math.max(Math.ceil(total / parsedLimit), 1);

    res.json({
      problems,
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        total,
        totalPages,
        hasNextPage: parsedPage < totalPages,
        hasPrevPage: parsedPage > 1,
      },
    });
  } catch (error) {
    console.error('GET PROBLEMS ERROR:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getProblemById = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: "Database unavailable" });
    }

    const identifier = req.params.id;

    const query = {
      isDeleted: { $ne: true },
      $or: [
        { slug: identifier },
        ...(mongoose.Types.ObjectId.isValid(identifier)
          ? [{ _id: identifier }]
          : [])
      ]
    };

    const problem = await Problem.findOne(query).lean();

    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    problem.testCases = Array.isArray(problem.testCases)
      ? problem.testCases.filter((testCase) => testCase.isPublic)
      : [];

    res.json(problem);
  } catch (error) {
    console.error("GET PROBLEM ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};
