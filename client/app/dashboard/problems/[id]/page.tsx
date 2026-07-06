'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import CommentsSection from '@/components/CommentsSection';
import CodeEditor from '@/components/CodeEditor';
import SubmissionResult from '@/components/SubmissionResult';
import { getStarterCode } from '@/lib/languageTemplates';
import Loader from '@/components/Loader';

interface Problem {
  _id: string;
  title: string;
  description: string;
  difficulty: string;
  topics: string[];
  starterCode: string;
  testCases: Array<{ input: string; expectedOutput: string; isPublic: boolean }>;
  constraints: string[];
}

interface Comment {
  _id: string;
  userId: { username: string; email: string };
  content: string;
  replies?: Comment[];
  createdAt: string;
}

export default function ProblemDetail() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [codeSaved, setCodeSaved] = useState(false);
  const [language, setLanguage] = useState('javascript');

  const problemId = params.id as string;
  const codeStorageKey = `code_${problemId}`;

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && params.id) {
      fetchProblem();
      fetchComments();
      // Load saved code from localStorage for current language
      const languageKey = `${codeStorageKey}_${language}`;
      const savedCode = localStorage.getItem(languageKey);
      if (savedCode) {
        setCode(savedCode);
      } else if (problem) {
        setCode(getStarterCode(language));
      }
    }
  }, [user, params.id, language]);

  // Auto-save code to localStorage
  useEffect(() => {
    if (code && problemId) {
      const languageKey = `${codeStorageKey}_${language}`;
      localStorage.setItem(languageKey, code);
      setCodeSaved(true);
      const timer = setTimeout(() => setCodeSaved(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [code, problemId, language]);

  const fetchProblem = async () => {
    try {
      const response = await api.get(`/problems/${params.id}`);
      setProblem(response.data);
      setCode(getStarterCode(language) || response.data.starterCode || '');
    } catch (error) {
      console.error('Error fetching problem:', error);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await api.get('/comments', {
        params: { problemId: params.id },
      });
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) return;

    setSubmitting(true);
    setResult(null);

    try {
      const response = await api.post('/submissions', {
        problemId: params.id,
        code,
        language,
      });

      setResult(response.data);
      // Refresh problem to get updated stats
      fetchProblem();
    } catch (error: any) {
      setResult({
        error: error.response?.data?.message || 'Submission failed',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetCode = () => {
    if (confirm('Are you sure you want to reset the code? This will clear your current work.')) {
      setCode(problem?.starterCode || '');
      localStorage.removeItem(codeStorageKey);
    }
  };

  const handleLoginRequired = (action: 'comment') => {
    // For dashboard, redirect to login
    router.push('/');
  };

  if (loading || !problem) {
    return (
     <Loader />
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="app-shell py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Problem Description */}
          <div className="space-y-6">
            <div className="surface-primary p-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold tracking-tight">{problem.title}</h1>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    problem.difficulty === 'Easy'
                      ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                      : problem.difficulty === 'Medium'
                      ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
                      : 'bg-red-500/20 text-red-600 dark:text-red-400'
                  }`}
                >
                  {problem.difficulty}
                </span>
              </div>
              <div className="max-w-none">
                <p className="mb-4 whitespace-pre-wrap text-foreground/90">
                  {problem.description}
                </p>
                {problem.constraints && (
                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">Constraints:</h3>
                    <ul className="ml-6 list-disc space-y-1 text-sm text-muted-foreground">
                      {problem.constraints.map((constraint, index) => (
                        <li key={index}>{constraint}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {problem.topics?.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">Topics:</h3>
                    <div className="flex flex-wrap gap-2">
                      {problem.topics.map((topic) => (
                        <span key={topic} className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Comments Section */}
            <CommentsSection
              problemId={problemId}
              comments={comments}
              onCommentsUpdate={setComments}
              user={user}
              onLoginRequired={handleLoginRequired}
            />
          </div>

          {/* Right Column - Code Editor & Results */}
          <div className="space-y-6">
            <CodeEditor
              code={code}
              onCodeChange={setCode}
              onSubmit={handleSubmit}
              onReset={handleResetCode}
              submitting={submitting}
              codeSaved={codeSaved}
              user={user}
              language={language}
              onLanguageChange={setLanguage}
            />

            <SubmissionResult result={result} />
          </div>
        </div>
      </div>
    </div>
  );
}
