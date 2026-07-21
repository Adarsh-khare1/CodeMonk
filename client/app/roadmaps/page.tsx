'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { Sparkles, BrainCircuit, Search, Building2, Calendar, Target, Lightbulb, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Loader from '@/components/Loader';

export default function RoadmapsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [company, setCompany] = useState('');
  const [roadmap, setRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  if (authLoading) return <Loader />;
  if (!user) return null;

  const generateRoadmap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim()) return;

    setLoading(true);
    setError('');
    
    try {
      const res = await api.post('/ai/roadmap', { company: company.trim() });
      if (res.data.isValidCompany === false) {
        setError(res.data.errorMessage || `Sorry, we couldn't generate a roadmap for "${company}".`);
        setRoadmap(null);
      } else {
        setRoadmap(res.data);
      }
    } catch (err: any) {
      console.error('Failed to generate roadmap', err);
      setError(err.response?.data?.error || 'Failed to generate roadmap. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="app-shell py-12 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4 border border-primary/20">
            <BrainCircuit className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 flex items-center justify-center gap-2">
            AI <span className="text-primary">Company Roadmaps</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            Targeting a specific tech giant? Tell us the company, and our AI will generate a tailored 4-week study plan based on their interview patterns.
          </p>
        </div>

        <form onSubmit={generateRoadmap} className="max-w-xl mx-auto mb-16 relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full bg-card/50 border border-border/70 rounded-2xl py-4 pl-12 pr-32 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all text-lg shadow-sm"
            placeholder="e.g. Google, Meta, Amazon..."
            required
          />
          <button
            type="submit"
            disabled={loading || !company.trim()}
            className="absolute right-2 top-2 bottom-2 rounded-xl bg-primary px-6 font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full border-2 border-primary-foreground border-r-transparent animate-spin"></div>
                Generating
              </span>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-center mb-8">
            {error}
          </div>
        )}

        {roadmap && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="surface-primary p-8 rounded-3xl border border-border/70 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                <Building2 className="w-32 h-32 text-primary" />
              </div>
              
              <h2 className="text-3xl font-bold mb-4 relative z-10 flex items-center gap-3">
                {roadmap.company} Roadmap
              </h2>
              <p className="text-muted-foreground text-lg mb-8 relative z-10">
                {roadmap.overview}
              </p>

              <div className="mb-8 relative z-10">
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Key Focus Areas
                </h3>
                <div className="flex flex-wrap gap-2">
                  {roadmap.focusTopics?.map((topic: string, i: number) => (
                    <span key={i} className="px-4 py-2 bg-accent text-foreground rounded-xl text-sm font-medium border border-border/50">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <h3 className="text-2xl font-bold mb-6 mt-12 px-2 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-primary" />
              4-Week Study Plan
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {roadmap.weeks?.map((week: any, i: number) => (
                <div key={i} className="surface-primary p-6 rounded-2xl border border-border/70 hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary font-bold text-lg">
                      {week.week}
                    </div>
                    <h4 className="text-xl font-semibold">{week.focus}</h4>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {week.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 surface-primary p-6 rounded-2xl border border-blue-500/20 bg-blue-500/5">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-blue-400">
                <Lightbulb className="w-5 h-5" />
                Pro Tips for {roadmap.company}
              </h3>
              <ul className="space-y-3">
                {roadmap.tips?.map((tip: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-muted-foreground">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
