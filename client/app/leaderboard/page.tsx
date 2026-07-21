'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import Loader from '@/components/Loader';
import { Trophy, Medal, Star } from 'lucide-react';
import Avatar from '@/components/Avatar';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

interface LeaderboardUser {
  _id: string;
  username: string;
  solvedCount: number;
  longestStreak: number;
}

export default function LeaderboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
      return;
    }

    if (user) {
      const fetchLeaderboard = async () => {
        try {
          const res = await api.get('/leaderboard');
          setUsers(res.data);
        } catch (err) {
          console.error('Failed to fetch leaderboard:', err);
          setError('Could not load leaderboard data.');
        } finally {
          setLoading(false);
        }
      };
      fetchLeaderboard();
    }
  }, [user, authLoading, router]);

  if (authLoading || (loading && user)) {
    return <Loader />;
  }

  if (!user) {
    return null; // Will redirect
  }



  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="app-shell py-12 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 flex items-center justify-center gap-3">
            <Trophy className="h-10 w-10 text-yellow-500" />
            Global Leaderboard
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Rankings are based on total problems solved. Keep practicing to climb the ranks and earn your spot at the top!
          </p>
        </div>

        {error ? (
          <div className="text-center text-red-500 p-4 surface-primary">{error}</div>
        ) : (
          <div className="surface-primary overflow-hidden border border-border/70 rounded-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/70 bg-card/50">
                    <th className="px-6 py-4 font-semibold text-muted-foreground w-20 text-center">Rank</th>
                    <th className="px-6 py-4 font-semibold text-muted-foreground">Monk</th>
                    <th className="px-6 py-4 font-semibold text-muted-foreground text-center">Problems Solved</th>
                    <th className="px-6 py-4 font-semibold text-muted-foreground text-center">Max Streak</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {users.map((user, index) => (
                    <tr key={user._id} className="transition-colors hover:bg-accent/40 group">
                      <td className="px-6 py-4 text-center">
                        {index === 0 ? (
                          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-500 font-bold">1</div>
                        ) : index === 1 ? (
                          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-300/20 text-slate-300 font-bold">2</div>
                        ) : index === 2 ? (
                          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-600/20 text-amber-600 font-bold">3</div>
                        ) : (
                          <span className="text-muted-foreground font-medium">{index + 1}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar username={user.username} size="md" />
                          <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {user.username}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-mono text-lg font-bold text-primary">{user.solvedCount}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 font-medium text-sm border border-orange-500/20">
                          <Star className="w-3.5 h-3.5" />
                          {user.longestStreak}
                        </div>
                      </td>
                    </tr>
                  ))}

                  {users.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                        No coders have solved any problems yet. Be the first!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
