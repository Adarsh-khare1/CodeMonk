'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Calendar, CheckCircle2, ArrowRight, Flame } from 'lucide-react';

interface DailyProblem {
  date: string;
  problem: {
    _id: string;
    slug?: string;
    title: string;
    difficulty: string;
    topics: string[];
    description: string;
  };
}

interface DailyChallengeBannerProps {
  completedDates?: { date: string }[];
}

export default function DailyChallengeBanner({ completedDates = [] }: DailyChallengeBannerProps) {
  const [dailyData, setDailyData] = useState<DailyProblem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDailyProblem();
  }, []);

  const fetchDailyProblem = async () => {
    try {
      const res = await api.get('/problems/daily');
      setDailyData(res.data);
    } catch (err) {
      console.error('Failed to fetch daily problem:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !dailyData) {
    return (
      <div className="animate-pulse rounded-2xl border border-border/50 bg-card/50 p-6 h-36 flex items-center justify-center">
        <div className="h-6 w-1/3 bg-muted rounded-md"></div>
      </div>
    );
  }

  const { date, problem } = dailyData;
  const isCompleted = completedDates.some((d) => d.date === date);

  const getDifficultyColor = (diff: string) => {
    switch (diff.toLowerCase()) {
      case 'easy': return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
      case 'medium': return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
      case 'hard': return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
      default: return 'text-primary border-primary/30 bg-primary/10';
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/15 via-purple-900/20 to-background p-6 shadow-xl backdrop-blur-sm">
      {/* Background Glow */}
      <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-primary/20 blur-3xl pointer-events-none"></div>

      <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-300">
              <Flame className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> Problem of the Day
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" /> {date}
            </span>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground hover:text-primary transition">
              {problem.title}
            </h2>
            <p className="line-clamp-1 text-sm text-muted-foreground mt-1">
              {problem.description}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className={`rounded-md border px-2.5 py-0.5 text-xs font-medium ${getDifficultyColor(problem.difficulty)}`}>
              {problem.difficulty}
            </span>
            {problem.topics.slice(0, 3).map((topic) => (
              <span key={topic} className="rounded-md border border-border/80 bg-secondary/40 px-2 py-0.5 text-xs text-muted-foreground">
                {topic}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto justify-end">
          {isCompleted ? (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/15 px-5 py-3 text-sm font-semibold text-emerald-400">
              <CheckCircle2 className="h-5 w-5" /> Completed (+100 XP)
            </div>
          ) : (
            <Link
              href={`/problems/${problem.slug || problem._id}`}
              className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:scale-[1.02] active:scale-[0.98] w-full md:w-auto"
            >
              Solve Challenge <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
