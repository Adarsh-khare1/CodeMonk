import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface Analytics {
  streak: {
    current: number;
    longest: number;
  };
  activityByDate: Array<{ date: string; count: number }>;
  categoryDistribution: Record<string, number>;
  totalSolved: number;
  totalSubmissions: number;
}

interface ExternalProfiles {
  leetcode: { username: string; solved: number; rating: number };
  codeforces: { username: string; rating: number; maxRating: number };
  codechef: { username: string; rating: number };
}

interface User {
  externalProfiles: ExternalProfiles;
  badges?: Array<{
    id: string;
    name: string;
    icon: string;
    description: string;
    unlockedAt: string;
  }>;
  dailyChallengeCompleted?: Array<{ date: string }>;
}

export const useDashboardData = (authUser: any) => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [coachData, setCoachData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authUser) {
      fetchData();
    }
  }, [authUser]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, profileRes, coachRes] = await Promise.all([
        api.get('/users/analytics'),
        api.get('/users/profile'),
        api.get('/ai/coach').catch(() => ({ data: null }))
      ]);
      setAnalytics(analyticsRes.data);
      setUserProfile(profileRes.data);
      setCoachData(coachRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (platform: string, profile: any) => {
    await api.post('/users/external-profiles', { platform, profile });
    await fetchData();
  };

  const removeProfile = async (platform: string) => {
    await api.delete('/users/external-profiles', { data: { platform } });
    await fetchData();
  };

  return {
    analytics,
    userProfile,
    coachData,
    loading,
    updateProfile,
    removeProfile,
  };
};