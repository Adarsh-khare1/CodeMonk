'use client';

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import api from "@/lib/api";
import Loader from "@/components/Loader";

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
  const [problems, setProblems] = useState<Problem[]>([]);
  const [filterDifficulty, setFilterDifficulty] = useState<string>("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<ProblemsResponse["pagination"] | null>(null);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const params: { difficulty?: string; search?: string; page: number; limit: number } = {
        page: currentPage,
        limit: 10,
      };
      if (filterDifficulty) params.difficulty = filterDifficulty;
      if (search) params.search = search;

      const response = await api.get<ProblemsResponse>("/problems", { params });
      setProblems(response.data.problems);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching problems:", error);
    } finally {
      setLoading(false);
    }
  };

  // Debounced fetching
  useEffect(() => {
    const handler = setTimeout(fetchProblems, 500);
    return () => clearTimeout(handler);
  }, [filterDifficulty, search, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterDifficulty, search]);

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
    <div className="min-h-screen">
      <Navbar />
      <div className="app-shell py-8">
        <div className="mb-6">
          <h1 className="mb-4 text-3xl font-bold tracking-tight">Problems</h1>
          <div className="flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="Search problems..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-surface min-w-[200px] flex-1 px-4 py-2"
            />
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="input-surface px-4 py-2"
            >
              <option value="">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>

     {loading && <Loader />}


        <div className="space-y-2">
          {problems.map((problem) => (
            <Link
              key={problem._id}
              href={`/problems/${problem.slug || problem._id}`}
              className="surface-primary block p-4 transition duration-200 hover:border-primary/30 hover:bg-accent/30"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="mb-1 text-lg font-semibold">{problem.title}</h3>
                  <div className="flex flex-wrap gap-2">
                    {(problem.topics || []).map((topic) => (
                      <span
                        key={topic}
                        className="rounded-full border border-border/60 bg-secondary/80 px-2.5 py-1 text-sm text-secondary-foreground"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium ${getDifficultyColor(
                    problem.difficulty
                  )}`}
                >
                  {problem.difficulty}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {!loading && problems.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            No problems found
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              Showing page {pagination.page} of {pagination.totalPages} · {pagination.total} total problems
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                disabled={!pagination.hasPrevPage || loading}
                className="rounded-xl border border-border/70 bg-card/80 px-4 py-2 text-sm shadow-sm transition hover:bg-accent disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((page) => page + 1)}
                disabled={!pagination.hasNextPage || loading}
                className="rounded-xl border border-border/70 bg-card/80 px-4 py-2 text-sm shadow-sm transition hover:bg-accent disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
