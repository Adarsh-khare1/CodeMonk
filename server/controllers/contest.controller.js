import Contest from '../models/Contest.model.js';
import Problem from '../models/Problem.model.js';

export const getContests = async (req, res) => {
  try {
    const contests = await Contest.find().sort({ startTime: -1 });
    res.json(contests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contests' });
  }
};

export const getContestById = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id).populate('problems', 'title difficulty topics');
    if (!contest) return res.status(404).json({ error: 'Contest not found' });
    res.json(contest);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contest' });
  }
};

export const createDemoContest = async (req, res) => {
  try {
    // Pick 4 random problems for a demo contest
    const problems = await Problem.aggregate([{ $sample: { size: 4 } }]);
    if (problems.length === 0) {
      return res.status(400).json({ error: 'No problems exist to create a contest' });
    }

    const contest = await Contest.create({
      title: `CodeMonk Weekly Contest #${Math.floor(Math.random() * 1000)}`,
      description: "Join the weekly contest to test your algorithm skills against the best! Solve 4 problems in 2 hours.",
      startTime: new Date(),
      endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      problems: problems.map(p => p._id),
      participants: []
    });

    res.status(201).json(contest);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create contest' });
  }
};

export const createContest = async (req, res) => {
  try {
    const { title, description, startTime, endTime, problems } = req.body;
    
    if (!title || !description || !startTime || !endTime || !problems || problems.length === 0) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const contest = await Contest.create({
      title,
      description,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      problems,
      participants: []
    });

    res.status(201).json(contest);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create contest' });
  }
};
