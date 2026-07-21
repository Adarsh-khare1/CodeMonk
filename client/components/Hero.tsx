"use client";

import Link from "next/link";
import { ArrowRight, Code2, BrainCircuit, Zap } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function Hero() {
  const { user } = useAuth();

  return (
    <section className="relative min-h-[90vh] w-full overflow-hidden text-foreground flex items-center justify-center">
      {/* BACKGROUND ELEMENTS */}
      <div className="absolute inset-0 z-0 bg-background" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 blur-[120px] rounded-full pointer-events-none opacity-50 dark:opacity-20" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/20 blur-[100px] rounded-full pointer-events-none opacity-40 dark:opacity-10" />

      {/* CONTENT */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Zap className="w-4 h-4" />
          <span>The Ultimate Coding Practice Platform</span>
        </div>
        
        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
          Master Coding <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
            One Problem at a Time
          </span>
        </h1>

        <p className="text-xl text-muted-foreground max-w-2xl mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          Practice Data Structures, Algorithms, and real interview problems. Get AI-powered coaching, generate tailored roadmaps, and track your global competitive programming stats.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
          <Link
            href={user ? "/problems" : "/"}
            className="flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-[0_10px_40px_-10px_rgba(59,130,246,0.6)] transition-all hover:brightness-110 hover:-translate-y-1 w-full sm:w-auto justify-center"
          >
            {user ? "Start Practicing" : "Get Started Now"}
            <ArrowRight className="w-5 h-5" />
          </Link>
          {user && (
            <Link
              href="/leaderboard"
              className="flex items-center gap-2 rounded-2xl bg-card border border-border/70 px-8 py-4 text-base font-semibold text-foreground transition-all hover:bg-accent hover:-translate-y-1 w-full sm:w-auto justify-center"
            >
              View Leaderboard
            </Link>
          )}
        </div>

        {/* FEATURES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-500 text-left w-full">
          <div className="p-6 rounded-3xl surface-primary border border-border/50 shadow-sm transition hover:border-primary/30">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4">
              <Code2 className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-lg font-bold mb-2">Curated Problems</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Solve hand-picked problems with built-in judge execution supporting multiple languages.
            </p>
          </div>
          <div className="p-6 rounded-3xl surface-primary border border-border/50 shadow-sm transition hover:border-primary/30">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-4">
              <BrainCircuit className="w-6 h-6 text-purple-500" />
            </div>
            <h3 className="text-lg font-bold mb-2">AI Coding Coach</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Get intelligent feedback, hints, and code reviews from our advanced AI assistant.
            </p>
          </div>
          <div className="p-6 rounded-3xl surface-primary border border-border/50 shadow-sm transition hover:border-primary/30">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </div>
            <h3 className="text-lg font-bold mb-2">Global Stats Sync</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Connect your LeetCode and Codeforces profiles to track all your stats in one place.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}