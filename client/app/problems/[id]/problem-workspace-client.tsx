'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useParams, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { Play } from 'lucide-react';
import LoginModal from '@/components/LoginModal';
import CommentsSection from '@/components/CommentsSection';
import CodeEditor from '@/components/CodeEditor';
import SubmissionResult from '@/components/SubmissionResult';
import PastSubmissions from '@/components/PastSubmissions';
import AIAssistantPanel from '@/components/AIAssistantPanel';
import { getStarterCode } from '@/lib/languageTemplates';
import Loader from '@/components/Loader';

interface SampleTestCase {
  input: string;
  output: string;
  explanation?: string;
}

interface TestCase {
  input: string;
  expectedOutput: string;
  isPublic: boolean;
}

interface Problem {
  _id: string;
  title: string;
  description: string;
  difficulty: string;
  topics: string[];
  starterCode: string;
  sampleTestCases: SampleTestCase[];
  testCases: TestCase[];
  constraints: string[];
  attemptsCount: number;
  acceptedCount: number;
}

interface Comment {
  _id: string;
  userId: { username: string; email: string };
  content: string;
  replies?: Comment[];
  createdAt: string;
}

interface SubmissionResultType {
  stdout?: string;
  stderr?: string;
  compile_output?: string;
  error?: string;
}

export default function ProblemWorkspaceClient() {
  const { user, loading: authLoading } = useAuth();
  const params = useParams();
  const searchParams = useSearchParams();
  const problemId = params.id as string;
  const submissionIdFromUrl = searchParams.get('submissionId');

  const [problem, setProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmissionResultType | null>(null);
  const [runResult, setRunResult] = useState<SubmissionResultType | null>(null);
  const [running, setRunning] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginAction, setLoginAction] = useState<'submit' | 'comment' | null>(null);
  const [codeSaved, setCodeSaved] = useState(false);
  const [language, setLanguage] = useState('javascript');

  const codeStorageKey = `code_${problemId}_${language}`;

  useEffect(() => {
    if (!problemId) return;
    fetchProblem();
    fetchComments();
  }, [problemId, language]);

  useEffect(() => {
    if (submissionIdFromUrl && user) {
      api
        .get(`/submissions/by-id/${submissionIdFromUrl}`)
        .then((res) => {
          if (res.data?.code != null) setCode(res.data.code);
          if (res.data?.language) setLanguage(res.data.language);
        })
        .catch(() => {});
    }
  }, [submissionIdFromUrl, user]);

  useEffect(() => {
    if (submissionIdFromUrl) return;
    setCode(getStarterCode(language));
  }, [language, submissionIdFromUrl]);

  const fetchProblem = async () => {
    try {
      const res = await api.get(`/problems/${problemId}`);
      setProblem(res.data);

      if (submissionIdFromUrl) return;
      const savedCode = localStorage.getItem(codeStorageKey);
      if (savedCode) {
        setCode(savedCode);
      } else {
        setCode(getStarterCode(language) || res.data.starterCode);
      }
    } catch (err) {
      console.error('Failed to fetch problem:', err);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await api.get('/comments', { params: { problemId } });
      setComments(res.data);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    }
  };

  useEffect(() => {
    if (!problemId) return;
    const handler = setTimeout(() => {
      localStorage.setItem(codeStorageKey, code);
      setCodeSaved(true);
      setTimeout(() => setCodeSaved(false), 1200);
    }, 500);

    return () => clearTimeout(handler);
  }, [code, codeStorageKey, problemId]);

  const handleRunCode = async () => {
    if (!code.trim()) return;
    setRunning(true);
    setRunResult(null);
    setResult(null);

    try {
      const res = await api.post('/submissions/run', { problemId, code, language });
      setRunResult(res.data);
    } catch (err: any) {
      setRunResult({ error: err.response?.data?.error || err.message || 'Run failed' });
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) return;

    if (!user) {
      localStorage.setItem('returnUrl', window.location.pathname);
      setLoginAction('submit');
      setLoginModalOpen(true);
      return;
    }

    setSubmitting(true);
    setResult(null);
    setRunResult(null);

    try {
      const res = await api.post('/submissions', { problemId, code, language });
      setResult(res.data);
      fetchProblem();
    } catch (err: any) {
      setResult({ error: err.response?.data?.error || err.message || 'Submission failed' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetCode = () => {
    if (confirm('Reset code?')) {
      const fresh = problem?.starterCode || getStarterCode(language);
      setCode(fresh);
      localStorage.removeItem(codeStorageKey);
    }
  };

  const handleLoginSuccess = () => {
    if (loginAction === 'submit') handleSubmit();
    setLoginAction(null);
  };

  if (authLoading || !problem) {
    return (
      <div className="animate-fadeOut">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />

      <div className="app-shell grid grid-cols-1 gap-6 py-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="surface-primary p-6">
            <h1 className="text-2xl font-bold tracking-tight">{problem.title}</h1>
            <p className="mt-4 whitespace-pre-wrap text-foreground/90">
              {problem.description}
            </p>
          </div>

          <div className="surface-primary p-6">
            <h2 className="font-semibold">Difficulty</h2>
            <p className="mt-2 text-muted-foreground">{problem.difficulty}</p>
          </div>

          <div className="surface-primary p-6">
            <h2 className="font-semibold">Topics</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {problem.topics.map((topic) => (
                <span key={topic} className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm text-primary">
                  {topic}
                </span>
              ))}
            </div>
          </div>

          <div className="surface-primary p-6">
            <h2 className="font-semibold">Constraints</h2>
            <ul className="mt-2 ml-6 list-disc space-y-1 text-muted-foreground">
              {problem.constraints.map((constraint, index) => (
                <li key={index}>{constraint}</li>
              ))}
            </ul>
          </div>

          <div className="surface-primary p-6">
            <h2 className="font-semibold">Sample Test Cases</h2>
            {problem.sampleTestCases.map((testCase, index) => (
              <div key={index} className="mt-4 rounded-xl border border-border/70 bg-secondary/40 p-3">
                <p><b>Input:</b> {testCase.input}</p>
                <p><b>Output:</b> {testCase.output}</p>
                {testCase.explanation && (
                  <p className="text-muted-foreground"><b>Explanation:</b> {testCase.explanation}</p>
                )}
              </div>
            ))}
          </div>

          <CommentsSection
            problemId={problemId}
            comments={comments}
            onCommentsUpdate={setComments}
            user={user}
            onLoginRequired={() => {
              setLoginAction('comment');
              setLoginModalOpen(true);
            }}
          />
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
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

              <SubmissionResult result={result || runResult} />

              <AIAssistantPanel
                problemId={problemId}
                code={code}
                language={language}
                onApplyOptimizedCode={setCode}
              />

              <div className="flex justify-center">
                <button
                  onClick={handleRunCode}
                  disabled={running || !code.trim()}
                  className="flex gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground shadow-sm transition hover:brightness-110 disabled:opacity-50"
                >
                  <Play size={16} />
                  {running ? 'Running...' : 'Run Code'}
                </button>
              </div>
            </div>

            <div className="lg:col-span-1">
              <PastSubmissions
                problemId={problemId}
                user={user}
                onSelectSubmission={(submission) => {
                  setCode(submission.code);
                  setLanguage(submission.language);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
