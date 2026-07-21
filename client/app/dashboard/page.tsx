'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import ExternalProfileModal from '@/components/ExternalProfileModal';
import ActivityHeatmap from '@/components/ActivityHeatmap';
import PlatformCard from '@/components/PlatformCard';

import { useDashboardData } from '@/lib/hooks/useDashboardData';
import Loader from '@/components/Loader';
import { Sparkles, BrainCircuit, Target, TrendingUp } from 'lucide-react';
import DailyChallengeBanner from '@/components/DailyChallengeBanner';
import BadgesSection from '@/components/BadgesSection';

const skillData = [
  { subject: 'Dynamic Prog', A: 80, fullMark: 100 },
  { subject: 'Graphs', A: 65, fullMark: 100 },
  { subject: 'Trees', A: 90, fullMark: 100 },
  { subject: 'Arrays', A: 99, fullMark: 100 },
  { subject: 'Math', A: 50, fullMark: 100 },
  { subject: 'Strings', A: 85, fullMark: 100 },
];

interface ExternalProfiles {
  leetcode: { username: string; solved: number; rating: number };
  codeforces: { username: string; rating: number; maxRating: number };
  codechef: { username: string; rating: number };
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Dashboard() {
  const { user: authUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<'leetcode' | 'codeforces' | 'codechef' | null>(null);

  const { analytics, userProfile, coachData, loading: dataLoading, updateProfile, removeProfile } = useDashboardData(authUser);

  useEffect(() => {
    if (!authLoading && !authUser) {
      localStorage.setItem('returnUrl', '/dashboard');
      router.push('/');
    }
  }, [authUser, authLoading, router]);

  const handleSaveProfile = async (platform: string, profile: any) => {
    try {
      await updateProfile(platform, profile);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to save profile');
    }
  };

  const handleRemoveProfile = async (platform: string) => {
    if (!confirm(`Remove ${platform} profile?`)) return;

    try {
      await removeProfile(platform);
    } catch (error) {
      console.error('Error removing profile:', error);
      alert('Failed to remove profile');
    }
  };

  const handleConnect = (platform: 'leetcode' | 'codeforces' | 'codechef') => {
    setSelectedPlatform(platform);
    setModalOpen(true);
  };

  const handleEdit = (platform: 'leetcode' | 'codeforces' | 'codechef') => {
    setSelectedPlatform(platform);
    setModalOpen(true);
  };

  const categoryData =
    analytics?.categoryDistribution
      ? Object.entries(analytics.categoryDistribution).map(([name, value]) => ({
          name,
          value,
        }))
      : [];

  if (authLoading || dataLoading) {
    return <Loader />;
  }

  if (!authUser || !analytics) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="app-shell py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <Link
            href="/dashboard/submissions"
            className="rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
          >
            View Submissions
          </Link>
        </div>

        {/* Daily Coding Challenge Banner */}
        <div className="mb-8">
          <DailyChallengeBanner completedDates={userProfile?.dailyChallengeCompleted} />
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          
          {/* Left Column: Stats and Heatmap */}
          <div className="lg:col-span-2 space-y-6">
             {/* Stats & Streak Row */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="surface-primary p-6 flex flex-col justify-center">
                   <h2 className="text-lg font-semibold mb-4 text-foreground/80">Problem Solving</h2>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Solved</p>
                        <p className="text-4xl font-bold text-primary mt-1">{analytics.totalSolved}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Submissions</p>
                        <p className="text-4xl font-bold text-foreground mt-1">{analytics.totalSubmissions}</p>
                      </div>
                   </div>
                </div>
                
                <div className="surface-primary p-6">
                   <h2 className="text-lg font-semibold mb-4 text-foreground/80">Activity Streak</h2>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">Current <span className="text-orange-500">🔥</span></p>
                        <p className="text-4xl font-bold text-orange-500 mt-1">{analytics.streak.current}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">Longest <span className="text-yellow-500">🏆</span></p>
                        <p className="text-4xl font-bold text-yellow-500 mt-1">{analytics.streak.longest}</p>
                      </div>
                   </div>
                </div>
             </div>

             {/* Heatmap Row */}
             <div className="surface-primary p-6">
                <h2 className="text-lg font-semibold mb-4 text-foreground/80">Activity Heatmap</h2>
                <div className="overflow-x-auto pb-2">
                  <ActivityHeatmap activityByDate={analytics.activityByDate} />
                </div>
             </div>
          </div>

          {/* Right Column: Skills Radar & Category Pie */}
          <div className="space-y-6">
             <div className="surface-primary p-6 h-[300px] flex flex-col">
                <h2 className="text-lg font-semibold mb-2 text-foreground/80">Skill Mastery</h2>
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={coachData?.radarData || skillData}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                      <Radar name="Skills" dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.4} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
             </div>

             {categoryData.length > 0 && (
               <div className="surface-primary p-6 h-[300px] flex flex-col">
                 <h2 className="text-lg font-semibold mb-2 text-foreground/80">Topic Distribution</h2>
                 <div className="flex-1 min-h-0">
                   <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                       <Pie
                         data={categoryData}
                         cx="50%"
                         cy="50%"
                         innerRadius={60}
                         outerRadius={80}
                         paddingAngle={5}
                         dataKey="value"
                         stroke="none"
                       >
                         {categoryData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                         ))}
                       </Pie>
                       <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
                       <Legend wrapperStyle={{ fontSize: '12px' }} />
                     </PieChart>
                   </ResponsiveContainer>
                 </div>
               </div>
             )}
          </div>
        </div>

        {/* AI Coach Section */}
        {coachData && (
          <div className="mt-8 mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-primary/10 p-2 rounded-xl">
                <BrainCircuit className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-xl font-bold">AI Coach Analysis</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="surface-primary p-6 border border-border/70 rounded-2xl md:col-span-2 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Sparkles className="w-24 h-24 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-400" />
                  Recommendation
                </h3>
                <p className="text-muted-foreground leading-relaxed relative z-10">
                  {coachData.recommendation}
                </p>
              </div>

              <div className="flex flex-col gap-6">
                <div className="surface-primary p-6 border border-border/70 rounded-2xl flex-1">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    Strengths
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {coachData.strengths.map((str: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-green-500/10 text-green-500 rounded-lg text-sm font-medium border border-green-500/20">
                        {str}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="surface-primary p-6 border border-border/70 rounded-2xl flex-1">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-orange-400">
                    <TrendingUp className="w-5 h-5 text-orange-400 rotate-180" />
                    Areas to Improve
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {coachData.weaknesses.map((wk: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-orange-500/10 text-orange-400 rounded-lg text-sm font-medium border border-orange-500/20">
                        {wk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* External Platforms */}
        <div className="surface-primary p-6">
          <h2 className="text-lg font-semibold mb-6 text-foreground/80">Linked Platforms</h2>

          {userProfile && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <PlatformCard
                platform="leetcode"
                profile={userProfile.externalProfiles?.leetcode}
                onConnect={handleConnect}
                onEdit={handleEdit}
                onRemove={handleRemoveProfile}
              />
              <PlatformCard
                platform="codeforces"
                profile={userProfile.externalProfiles?.codeforces}
                onConnect={handleConnect}
                onEdit={handleEdit}
                onRemove={handleRemoveProfile}
              />
              <PlatformCard
                platform="codechef"
                profile={userProfile.externalProfiles?.codechef}
                onConnect={handleConnect}
                onEdit={handleEdit}
                onRemove={handleRemoveProfile}
              />
            </div>
          )}

          {userProfile &&
           !userProfile.externalProfiles?.leetcode?.username &&
           !userProfile.externalProfiles?.codeforces?.username &&
           !userProfile.externalProfiles?.codechef?.username && (
            <div className="mt-6 py-8 text-center text-muted-foreground rounded-xl border border-dashed border-border/50 bg-secondary/20">
              <p>No external platforms connected yet.</p>
              <p className="text-sm mt-2">Connect your coding profiles to track your progress across platforms.</p>
            </div>
          )}
        </div>

        {/* Badges & Achievements Grid */}
        <div className="mt-8">
          <BadgesSection userBadges={userProfile?.badges} />
        </div>

        <ExternalProfileModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedPlatform(null);
          }}
          platform={selectedPlatform}
          existingProfile={selectedPlatform && userProfile?.externalProfiles?.[selectedPlatform]}
          onSave={handleSaveProfile}
        />
      </div>
    </div>
  );
}
