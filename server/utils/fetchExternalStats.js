import fetch from 'node-fetch';

export const fetchLeetCodeStats = async (username) => {
  try {
    const response = await fetch(`https://leetcode-stats-api.herokuapp.com/${username}`);
    const data = await response.json();
    
    if (data.status === 'success') {
      return {
        solved: data.totalSolved || 0,
        rating: data.ranking || 0, // Using ranking since rating isn't always available via this API
      };
    }
    return { solved: 0, rating: 0 };
  } catch (error) {
    console.error('Error fetching LeetCode stats:', error);
    return { solved: 0, rating: 0 };
  }
};

export const fetchCodeforcesStats = async (username) => {
  try {
    const response = await fetch(`https://codeforces.com/api/user.info?handles=${username}`);
    const data = await response.json();
    
    if (data.status === 'OK' && data.result.length > 0) {
      const user = data.result[0];
      return {
        rating: user.rating || 0,
        maxRating: user.maxRating || 0,
      };
    }
    return { rating: 0, maxRating: 0 };
  } catch (error) {
    console.error('Error fetching Codeforces stats:', error);
    return { rating: 0, maxRating: 0 };
  }
};

export const fetchCodeChefStats = async (username) => {
  // CodeChef doesn't have a simple open API. We'll return 0 for now unless we do web scraping.
  return { rating: 0 };
};
