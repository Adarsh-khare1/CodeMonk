'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import Loader from '@/components/Loader';
import { useParams, useRouter } from 'next/navigation';
import { CalendarDays, Clock, Users, ChevronRight, Trophy, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

interface Problem {
  _id: string;
  title: string;
  difficulty: string;
  topics: string[];
}

interface Contest {
  _id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  problems: Problem[];
  participants: string[];
}

export default function ContestDetailsPage() {
  const { id } = useParams();
  const [contest, setContest] = useState<Contest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContest = async () => {
      try {
        const res = await api.get(`/contests/${id}`);
        setContest(res.data);
      } catch (err) {
        console.error('Failed to fetch contest', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchContest();
  }, [id]);

  if (loading) return <Loader />;

  if (!contest) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="app-shell py-24 text-center">
          <AlertTriangle className="mx-auto h-16 w-16 text-red-500 mb-6" />
          <h1 className="text-3xl font-bold mb-4">Contest Not Found</h1>
          <Link href="/contests" className="text-primary hover:underline">Return to Contests</Link>
        </div>
      </div>
    );
  }

  const now = new Date();
  const start = new Date(contest.startTime);
  const end = new Date(contest.endTime);
  const isPast = end < now;
  const isActive = start <= now && end >= now;
  const isUpcoming = start > now;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Header */}
      <div className="border-b border-border/70 bg-card/30">
        <div className="app-shell py-12 max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            {isActive && <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-500 border border-green-500/20">LIVE NOW</span>}
            {isUpcoming && <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-500 border border-blue-500/20">UPCOMING</span>}
            {isPast && <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground border border-border">ENDED</span>}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">{contest.title}</h1>
          <p className="text-muted-foreground text-lg max-w-3xl mb-8">{contest.description}</p>
          
          <div className="flex flex-wrap items-center gap-8 text-sm font-medium">
            <div className="flex items-center gap-3 text-foreground bg-accent/50 px-4 py-2 rounded-xl">
              <CalendarDays className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p>{format(start, 'MMM d, yyyy')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-foreground bg-accent/50 px-4 py-2 rounded-xl">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Time</p>
                <p>{format(start, 'h:mm a')} - {format(end, 'h:mm a')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-foreground bg-accent/50 px-4 py-2 rounded-xl">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Participants</p>
                <p>{contest.participants.length} Registered</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="app-shell py-12 max-w-5xl mx-auto space-y-8">
        {isPast && (
          <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">Contest Ended</p>
                <p className="text-xs text-muted-foreground">This contest has concluded. All problems are unlocked below for practice and upsolving!</p>
              </div>
            </div>
            <Link href="/leaderboard" className="text-xs font-semibold text-primary hover:underline">
              View Leaderboard &rarr;
            </Link>
          </div>
        )}

        <div>
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="h-6 w-6 text-yellow-500" />
            <h2 className="text-2xl font-bold">Contest Problems</h2>
          </div>
          
          {isUpcoming ? (
            <div className="text-center py-16 surface-primary border border-border/70 rounded-3xl">
              <Clock className="h-12 w-12 text-primary mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">Problems will be revealed when contest starts</h3>
              <p className="text-muted-foreground">Register now and wait for the countdown.</p>
            </div>
          ) : !contest.problems || contest.problems.length === 0 ? (
            <div className="text-center py-12 surface-primary border border-border/70 rounded-3xl">
              <p className="text-muted-foreground">No problems assigned to this contest yet.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {contest.problems.map((problem, index) => (
                <Link 
                  href={`/problems/${problem._id}`} 
                  key={problem._id}
                  className="surface-primary flex items-center justify-between p-6 rounded-2xl border border-border/70 hover:border-primary/50 transition-colors group"
                >
                  <div className="flex items-center gap-6">
                    <div className="text-2xl font-bold text-muted-foreground/50 w-8 text-center group-hover:text-primary transition-colors">
                      {String.fromCharCode(65 + index)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold group-hover:text-primary transition-colors mb-1">{problem.title}</h3>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-semibold ${
                          problem.difficulty === 'Easy' ? 'text-green-500' :
                          problem.difficulty === 'Medium' ? 'text-yellow-500' : 'text-red-500'
                        }`}>
                          {problem.difficulty}
                        </span>
                        {problem.topics && problem.topics.slice(0, 3).map(topic => (
                          <span key={topic} className="text-xs text-muted-foreground bg-accent px-2 py-0.5 rounded-md">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <ChevronRight className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-1" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
