import User from '../models/User.model.js';

export const getLeaderboard = async (req, res) => {
  try {
    const users = await User.aggregate([
      {
        $project: {
          username: 1,
          solvedCount: { $size: { $ifNull: ["$solvedProblems", []] } },
          currentStreak: "$streak.current",
          longestStreak: "$streak.longest"
        }
      },
      {
        $sort: { solvedCount: -1, longestStreak: -1 }
      },
      {
        $limit: 100
      }
    ]);
    
    res.json(users);
  } catch (error) {
    console.error("Leaderboard error:", error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
};
