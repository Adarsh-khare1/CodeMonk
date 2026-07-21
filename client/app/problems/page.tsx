'use client';

import { useEffect, useState, useRef, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import api from "@/lib/api";
import Loader from "@/components/Loader";
import DailyChallengeBanner from "@/components/DailyChallengeBanner";
import { useAuth } from "@/lib/auth-context";

interface Problem {
  _id: string;
  slug: string;
  title: string;
  difficulty: string;
  topics: string[];
  attemptsCount: number;
  acceptedCount: number;
}

interface ProblemsResponse {
  problems: Problem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export default function ProblemsPage() {
  const { user } = useAuth();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [filterDifficulty, setFilterDifficulty] = useState<string>("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<ProblemsResponse["pagination"] | null>(null);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastProblemElementRef = useCallback(
    (node: HTMLAnchorElement | null) => {
      if (loadingMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && pagination?.hasNextPage) {
          setCurrentPage((prev) => prev + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loadingMore, pagination?.hasNextPage]
  );

  const fetchProblems = async (isNewSearch = false) => {
    try {
      if (isNewSearch) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      const pageToFetch = isNewSearch ? 1 : currentPage;
      const params: { difficulty?: string; search?: string; page: number; limit: number } = {
        page: pageToFetch,
        limit: 15,
      };
      if (filterDifficulty) params.difficulty = filterDifficulty;
      if (search) params.search = search;

      const response = await api.get<ProblemsResponse>("/problems", { params });
      
      if (isNewSearch) {
        setProblems(response.data.problems);
      } else {
        setProblems((prev) => {
          // Avoid duplicates in case of React StrictMode running effects twice
          const newProblems = response.data.problems.filter(
            (p) => !prev.some((existing) => existing._id === p._id)
          );
          return [...prev, ...newProblems];
        });
      }
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching problems:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // When filters change, reset and fetch from page 1
  useEffect(() => {
    setCurrentPage(1);
    const handler = setTimeout(() => {
      fetchProblems(true);
    }, 500);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterDifficulty, search]);

  // When page changes (via scroll), fetch more
  useEffect(() => {
    if (currentPage > 1) {
      fetchProblems(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-500/20 text-green-600 dark:text-green-400";
      case "Medium":
        return "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400";
      case "Hard":
        return "bg-red-500/20 text-red-600 dark:text-red-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="app-shell py-8 max-w-5xl mx-auto">
        <div className="mb-8 space-y-6">
          <h1 className="text-4xl font-extrabold tracking-tight">Practice Problems</h1>
          
          {/* Problem of the Day Banner */}
          <DailyChallengeBanner completedDates={user?.dailyChallengeCompleted} />

          <div className="flex flex-wrap gap-4 pt-2">
            <div className="relative flex-1 min-w-[200px]">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search problems by title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-card/50 border border-border/70 rounded-2xl py-3 pl-12 pr-4 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
              />
            </div>
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="bg-card/50 border border-border/70 rounded-2xl py-3 px-4 text-foreground focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
            >
              <option value="">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>

        {loading ? (
          <Loader />
        ) : (
          <div className="space-y-3">
            {problems.map((problem, index) => {
              const isLast = index === problems.length - 1;
              return (
                <Link
                  key={problem._id}
                  ref={isLast ? lastProblemElementRef : null}
                  href={`/problems/${problem.slug || problem._id}`}
                  className="surface-primary block p-5 rounded-2xl border border-border/60 hover:border-primary/40 hover:bg-accent/20 transition-all shadow-sm group"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="mb-2 text-xl font-semibold group-hover:text-primary transition-colors">
                        {problem.title}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {(problem.topics || []).map((topic) => (
                          <span
                            key={topic}
                            className="rounded-lg border border-border/60 bg-secondary/60 px-3 py-1 text-xs font-medium text-secondary-foreground"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span
                      className={`rounded-xl px-4 py-1.5 text-sm font-bold ${getDifficultyColor(
                        problem.difficulty
                      )}`}
                    >
                      {problem.difficulty}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {!loading && problems.length === 0 && (
          <div className="py-20 text-center text-muted-foreground">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-medium text-foreground mb-2">No problems found</h3>
            <p>Try adjusting your search or filters.</p>
          </div>
        )}

        {loadingMore && (
          <div className="py-8 flex justify-center">
            <div className="h-6 w-6 rounded-full border-2 border-primary border-r-transparent animate-spin"></div>
          </div>
        )}

        {!loadingMore && pagination?.hasNextPage && (
          <div className="py-8 text-center text-muted-foreground text-sm">
            Scroll down to load more
          </div>
        )}
      </div>
    </div>
  );
}
