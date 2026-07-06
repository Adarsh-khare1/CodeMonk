import { Flame, Trophy } from 'lucide-react';

interface StreakCardProps {
  current: number;
  longest: number;
}

export function StreakCards({ current, longest }: StreakCardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div className="surface-primary p-6">
        <div className="flex items-center gap-3 mb-4">
          <Flame className="h-6 w-6 text-orange-500" />
          <h2 className="text-xl font-bold">Current Streak</h2>
        </div>
        <p className="text-4xl font-bold text-orange-500">{current}</p>
        <p className="mt-2 text-muted-foreground">days</p>
      </div>

      <div className="surface-primary p-6">
        <div className="flex items-center gap-3 mb-4">
          <Trophy className="h-6 w-6 text-yellow-500" />
          <h2 className="text-xl font-bold">Longest Streak</h2>
        </div>
        <p className="text-4xl font-bold text-yellow-500">{longest}</p>
        <p className="mt-2 text-muted-foreground">days</p>
      </div>
    </div>
  );
}

interface StatsSummaryProps {
  totalSolved: number;
  totalSubmissions: number;
}

export function StatsSummary({ totalSolved, totalSubmissions }: StatsSummaryProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="surface-primary p-4">
        <p className="text-sm text-muted-foreground">Total Solved</p>
        <p className="text-2xl font-bold">{totalSolved}</p>
      </div>
      <div className="surface-primary p-4">
        <p className="text-sm text-muted-foreground">Total Submissions</p>
        <p className="text-2xl font-bold">{totalSubmissions}</p>
      </div>
    </div>
  );
}
