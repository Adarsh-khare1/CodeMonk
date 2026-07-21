'use client';

import { Badge } from '@/types/user';
import { Award, Lock } from 'lucide-react';

export const ALL_BADGES = [
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
    description: 'Mastered 3 or more Tree / BST problems.'
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

interface BadgesSectionProps {
  userBadges?: Badge[];
}

export default function BadgesSection({ userBadges = [] }: BadgesSectionProps) {
  const unlockedMap = new Map<string, Badge>();
  userBadges.forEach((b) => unlockedMap.set(b.id, b));

  const totalUnlocked = unlockedMap.size;

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Achievements & Badges</h2>
        </div>
        <span className="rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-semibold text-primary">
          {totalUnlocked} / {ALL_BADGES.length} Unlocked
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {ALL_BADGES.map((b) => {
          const unlocked = unlockedMap.get(b.id);
          return (
            <div
              key={b.id}
              className={`relative overflow-hidden rounded-xl border p-4 transition-all duration-200 ${
                unlocked
                  ? 'border-primary/40 bg-gradient-to-br from-primary/10 via-card to-card shadow-md hover:scale-[1.02]'
                  : 'border-border/40 bg-secondary/10 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl shadow-inner ${
                    unlocked ? 'bg-primary/20 border border-primary/30' : 'bg-muted border border-border/40 grayscale'
                  }`}
                >
                  {unlocked ? b.icon : <Lock className="h-5 w-5 text-muted-foreground" />}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className={`text-sm font-bold ${unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {b.name}
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {b.description}
                  </p>
                  {unlocked && (
                    <p className="text-[10px] text-primary/80 pt-1 font-mono">
                      Unlocked {new Date(unlocked.unlockedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
