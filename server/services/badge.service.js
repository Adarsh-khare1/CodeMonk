export const BADGE_DEFINITIONS = [
  {
    id: 'first_blood',
    name: 'First Blood',
    icon: '🎯',
    description: 'Solved your very first problem on CodeMonk!'
  },
  {
    id: 'on_fire',
    name: 'On Fire',
    icon: '🔥',
    description: 'Maintained a 5-day problem solving streak.'
  },
  {
    id: 'streak_legend',
    name: 'Streak Legend',
    icon: '⚡',
    description: 'Reached an incredible 10-day streak!'
  },
  {
    id: 'array_expert',
    name: 'Array Expert',
    icon: '📊',
    description: 'Solved 3 or more Array algorithm problems.'
  },
  {
    id: 'tree_master',
    name: 'Tree Master',
    icon: '🌳',
    description: 'Mastered 3 or more Tree / Binary Search Tree problems.'
  },
  {
    id: 'daily_challenger',
    name: 'Daily Challenger',
    icon: '🌟',
    description: 'Successfully completed a Daily Coding Challenge!'
  },
  {
    id: 'century_club',
    name: 'Century Club',
    icon: '🏆',
    description: 'Solved 10 or more total problems on the platform.'
  }
];

export const evaluateUserBadges = async (user) => {
  if (!user) return { userBadges: [], newlyUnlocked: [] };

  const existingBadgeIds = new Set((user.badges || []).map(b => b.id));
  const newlyUnlocked = [];

  const totalSolved = user.solvedProblems?.length || 0;
  const currentStreak = user.streak?.current || 0;
  const longestStreak = user.streak?.longest || 0;
  const maxStreak = Math.max(currentStreak, longestStreak);

  // Collect solved problem topics
  const solvedTopics = [];
  if (user.solvedProblems) {
    for (const sp of user.solvedProblems) {
      if (sp.problemId && Array.isArray(sp.problemId.topics)) {
        solvedTopics.push(...sp.problemId.topics);
      }
    }
  }

  const arrayCount = solvedTopics.filter(t => t.toLowerCase().includes('array')).length;
  const treeCount = solvedTopics.filter(t => t.toLowerCase().includes('tree') || t.toLowerCase().includes('bst')).length;
  const dailyCount = user.dailyChallengeCompleted?.length || 0;

  // Rule 1: First Blood
  if (totalSolved >= 1 && !existingBadgeIds.has('first_blood')) {
    newlyUnlocked.push('first_blood');
  }

  // Rule 2: On Fire (5-day streak)
  if (maxStreak >= 5 && !existingBadgeIds.has('on_fire')) {
    newlyUnlocked.push('on_fire');
  }

  // Rule 3: Streak Legend (10-day streak)
  if (maxStreak >= 10 && !existingBadgeIds.has('streak_legend')) {
    newlyUnlocked.push('streak_legend');
  }

  // Rule 4: Array Expert (3+ Array problems)
  if (arrayCount >= 3 && !existingBadgeIds.has('array_expert')) {
    newlyUnlocked.push('array_expert');
  }

  // Rule 5: Tree Master (3+ Tree problems)
  if (treeCount >= 3 && !existingBadgeIds.has('tree_master')) {
    newlyUnlocked.push('tree_master');
  }

  // Rule 6: Daily Challenger
  if (dailyCount >= 1 && !existingBadgeIds.has('daily_challenger')) {
    newlyUnlocked.push('daily_challenger');
  }

  // Rule 7: Century Club (10+ problems)
  if (totalSolved >= 10 && !existingBadgeIds.has('century_club')) {
    newlyUnlocked.push('century_club');
  }

  if (newlyUnlocked.length > 0) {
    const now = new Date();
    for (const badgeId of newlyUnlocked) {
      const def = BADGE_DEFINITIONS.find(b => b.id === badgeId);
      if (def) {
        user.badges.push({
          id: def.id,
          name: def.name,
          icon: def.icon,
          description: def.description,
          unlockedAt: now
        });
      }
    }
    await user.save();
  }

  return {
    userBadges: user.badges,
    newlyUnlocked
  };
};
