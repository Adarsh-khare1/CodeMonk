import User from '../models/User.model.js';
import Submission from '../models/Submission.model.js';
import SubmissionHistory from '../models/SubmissionHistory.model.js';
import Problem from '../models/Problem.model.js';
import { validatePlatform, getDefaultProfile, validateProfileData } from '../utils/profileUtils.js';

/* ---------------- PROFILE ---------------- */

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('solvedProblems.problemId', 'title difficulty topics');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/* ---------------- ANALYTICS ---------------- */

export const getAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const totalSubmissions = await SubmissionHistory.countDocuments({ userId });

    const solvedIds = await SubmissionHistory.distinct('problemId', {
      userId,
      status: 'Accepted',
    });

    const topicDistributionRows = solvedIds.length > 0
      ? await Problem.aggregate([
          {
            $match: {
              _id: { $in: solvedIds },
              isDeleted: { $ne: true },
            },
          },
          {
            $unwind: {
              path: '$topics',
              preserveNullAndEmptyArrays: false,
            },
          },
          {
            $group: {
              _id: '$topics',
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1, _id: 1 } },
        ])
      : [];

    const topicCount = topicDistributionRows.reduce((acc, row) => {
      acc[row._id] = row.count;
      return acc;
    }, {});

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 365);

    const activityByDate = (user.activityByDate || [])
      .filter((entry) => entry?.date && new Date(entry.date) >= cutoffDate)
      .sort((a, b) => a.date.localeCompare(b.date));

    res.json({
      streak: {
        current: user.streak?.current || 0,
        longest: user.streak?.longest || 0,
      },
      activityByDate,
      topicDistribution: topicCount,
      categoryDistribution: topicCount,
      totalSolved: solvedIds.length,
      totalSubmissions,
    });
  } catch (error) {
    console.error('ANALYTICS ERROR:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/* ---------------- EXTERNAL PROFILES ---------------- */
export const updateExternalProfile = async (req, res) => {
  try {
    const { platform, profile } = req.body;
    const userId = req.user._id;

    if (!platform || !profile) {
      return res.status(400).json({ message: 'Platform and profile data are required' });
    }

    if (!validatePlatform(platform)) {
      return res.status(400).json({ message: 'Invalid platform' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const validatedProfile = validateProfileData(platform, profile);

    // Safe update for nested schema
    if (!user.externalProfiles) {
      user.externalProfiles = {};
    }

    user.externalProfiles[platform] = {
      ...getDefaultProfile(platform),
      ...validatedProfile,
      updatedAt: new Date()
    };

    await user.save();

    res.json({ 
      success: true,
      externalProfiles: user.externalProfiles 
    });
  } catch (error) {
    console.error('UPDATE EXTERNAL PROFILE ERROR:', error);
    res.status(500).json({ 
      message: 'Failed to update external profile', 
      error: error.message 
    });
  }
};

/* ---------------- DASHBOARD ---------------- */

export const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all submissions for this user
    const allSubmissions = await SubmissionHistory.find({ userId });
    
    // Count solved problems (status === "Accepted")
    const solvedSubmissions = await SubmissionHistory.find({
      userId,
      status: 'Accepted'
    }).distinct('problemId');

    const solvedCount = solvedSubmissions.length;
    const attemptedCount = await SubmissionHistory.distinct('problemId', { userId }).then(ids => ids.length);
    const submissionsCount = allSubmissions.length;

    // Get solved problems with details
    const solvedProblems = await Problem.find({
      _id: { $in: solvedSubmissions }
    }).select('_id title');

    // Get last solved date for each problem
    const solvedProblemsWithDates = await Promise.all(
      solvedProblems.map(async (problem) => {
        const lastSubmission = await SubmissionHistory.findOne({
          userId,
          problemId: problem._id,
          status: 'Accepted'
        }).sort({ createdAt: -1 });

        return {
          problemId: problem._id,
          title: problem.title,
          lastSolvedAt: lastSubmission?.createdAt || null
        };
      })
    );

    res.json({
      solvedCount,
      attemptedCount,
      submissionsCount,
      solvedProblems: solvedProblemsWithDates
    });
  } catch (error) {
    console.error('DASHBOARD ERROR:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



export const getSolvedSubmissions = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1️⃣ Find all accepted submissions grouped by problem
    const solved = await SubmissionHistory.aggregate([
      { $match: { userId, status: "Accepted" } },

      // Sort so latest accepted comes first
      { $sort: { createdAt: -1 } },

      // Keep only latest per problem
      {
        $group: {
          _id: "$problemId",
          lastAcceptedAt: { $first: "$createdAt" },
          language: { $first: "$language" }
        }
      }
    ]);

    const problemIds = solved.map(s => s._id);

    // 2️⃣ Load problem titles + slug
   const problems = await Problem.find({
  _id: { $in: problemIds },
  isDeleted: { $ne: true }
})
.select("_id title slug");


    // 3️⃣ Merge problem info
   const result = solved
  .map(s => {
    const p = problems.find(pr => pr._id.toString() === s._id.toString());
    if (!p) return null;   // 👈 hide deleted problems
    return {
      problemId: s._id,
      title: p.title,
      slug: p.slug,
      language: s.language,
      lastAcceptedAt: s.lastAcceptedAt
    };
  })
  .filter(Boolean);   // 👈 removes nulls


    // Sort by latest solved
    result.sort((a, b) => new Date(b.lastAcceptedAt) - new Date(a.lastAcceptedAt));

    res.json(result);
  } catch (err) {
    console.error("getSolvedSubmissions", err);
    res.status(500).json({ error: err.message });
  }
};
