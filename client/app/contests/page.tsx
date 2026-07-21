'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import Loader from '@/components/Loader';
import { CalendarDays, Clock, Users, ChevronRight, Zap } from 'lucide-react';
import Link from 'next/link';
import { format, formatDistanceToNow } from 'date-fns';

interface Contest {
  _id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  participants: string[];
}

export default function ContestsPage() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      const res = await api.get('/contests');
      setContests(res.data);
    } catch (err) {
      console.error('Failed to fetch contests', err);
    } finally {
      setLoading(false);
    }
  };

  const createDemoContest = async () => {
    try {
      setCreating(true);
      await api.post('/contests/demo');
      fetchContests();
    } catch (err) {
      console.error('Failed to create demo contest', err);
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="app-shell py-12 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">
              Coding Contests
            </h1>
            <p className="text-muted-foreground text-lg">
              Compete against others, solve challenging problems under pressure, and improve your ranking.
            </p>
          </div>
          <button
            onClick={createDemoContest}
            disabled={creating}
            className="flex items-center gap-2 rounded-xl bg-primary/10 px-5 py-3 text-sm font-semibold text-primary transition hover:bg-primary/20 disabled:opacity-50"
          >
            <Zap className="h-4 w-4" />
            {creating ? "Generating..." : "Generate Demo Contest"}
          </button>
        </div>

        {contests.length === 0 ? (
          <div className="text-center py-24 surface-primary border border-border/70 rounded-3xl">
            <CalendarDays className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-2xl font-semibold mb-2">No Contests Found</h3>
            <p className="text-muted-foreground mb-6">There are no upcoming or past contests at the moment.</p>
            <button
              onClick={createDemoContest}
              disabled={creating}
              className="rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:brightness-110"
            >
              Generate One Now
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {contests.map((contest) => {
              const now = new Date();
              const start = new Date(contest.startTime);
              const end = new Date(contest.endTime);
              const isPast = end < now;
              const isActive = start <= now && end >= now;
              const isUpcoming = start > now;

              return (
                <div key={contest._id} className={`surface-primary flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-6 rounded-2xl border transition-all ${isActive ? 'border-primary shadow-[0_0_20px_rgba(59,130,246,0.15)]' : 'border-border/70 hover:border-border'}`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {isActive && <span className="flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-semibold text-green-500 border border-green-500/20">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        LIVE NOW
                      </span>}
                      {isUpcoming && <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-500 border border-blue-500/20">UPCOMING</span>}
                      {isPast && <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground border border-border">ENDED</span>}
                    </div>
                    
                    <h2 className="text-2xl font-bold mb-2">{contest.title}</h2>
                    <p className="text-muted-foreground text-sm line-clamp-2 max-w-2xl mb-4">{contest.description}</p>
                    
                    <div className="flex flex-wrap items-center gap-6 text-sm font-medium">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CalendarDays className="h-4 w-4" />
                        {format(start, 'MMM d, yyyy')}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {format(start, 'h:mm a')} - {format(end, 'h:mm a')}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        {contest.participants.length} Registered
                      </div>
                    </div>
                  </div>

                  <div className="w-full md:w-auto">
                    {isActive ? (
                      <Link href={`/contests/${contest._id}`} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 font-bold text-primary-foreground transition hover:brightness-110 shadow-lg shadow-primary/20">
                        Enter Contest
                        <ChevronRight className="h-5 w-5" />
                      </Link>
                    ) : isPast ? (
                      <Link href={`/contests/${contest._id}`} className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-8 py-4 font-semibold text-foreground transition hover:bg-accent/80">
                        View Results
                      </Link>
                    ) : (
                      <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-card border border-border px-8 py-4 font-semibold text-foreground transition hover:bg-accent">
                        Register
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
