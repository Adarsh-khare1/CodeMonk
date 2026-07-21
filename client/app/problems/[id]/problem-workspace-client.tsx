'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useParams, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { Play } from 'lucide-react';
import { Panel, Group, Separator } from "react-resizable-panels";
import LoginModal from '@/components/LoginModal';
import CommentsSection from '@/components/CommentsSection';
import CodeEditor from '@/components/CodeEditor';
import SubmissionResult from '@/components/SubmissionResult';
import PastSubmissions from '@/components/PastSubmissions';
import AICoachModal from '@/components/AICoachModal';
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
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar />

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />

      <div className="flex-1 w-full p-4 h-[calc(100vh-64px)]">
        <Group direction="horizontal" className="h-full rounded-2xl border border-border/80 overflow-hidden shadow-[0_18px_45px_-24px_rgba(0,0,0,0.6)]">
          {/* LEFT PANEL: Problem Details */}
          <Panel defaultSize={45} minSize={25}>
            <div className="h-full overflow-y-auto bg-card p-6 space-y-6">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{problem.title}</h1>
              <div className="flex gap-4 items-center">
                 <span className="text-muted-foreground font-medium">{problem.difficulty}</span>
                 <div className="flex flex-wrap gap-2">
                    {problem.topics.map((topic) => (
                      <span key={topic} className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
                        {topic}
                      </span>
                    ))}
                 </div>
              </div>
              <p className="mt-4 whitespace-pre-wrap text-foreground/90 text-[15px] leading-relaxed font-sans">
                {problem.description}
              </p>
              
              <div className="mt-6">
                <h2 className="font-semibold mb-3 text-foreground">Constraints</h2>
                <ul className="list-disc ml-5 space-y-1 text-sm text-muted-foreground font-code">
                  {problem.constraints.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>

              <div className="mt-6">
                <h2 className="font-semibold mb-3 text-foreground">Sample Test Cases</h2>
                {problem.sampleTestCases.map((tc, i) => (
                  <div key={i} className="mb-4 rounded-xl border border-border/70 bg-secondary/20 p-4 text-sm font-code shadow-sm">
                    <p className="mb-1"><span className="text-muted-foreground font-sans text-xs uppercase tracking-wider">Input</span><br/>{tc.input}</p>
                    <p className="mb-1 mt-3"><span className="text-muted-foreground font-sans text-xs uppercase tracking-wider">Output</span><br/>{tc.output}</p>
                    {tc.explanation && (
                      <p className="mt-3 text-muted-foreground border-t border-border/50 pt-3"><span className="font-sans text-xs uppercase tracking-wider">Explanation</span><br/>{tc.explanation}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-8 border-t border-border/50 pt-6 pb-20">
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
            </div>
          </Panel>

          <Separator className="w-[6px] bg-border/40 hover:bg-primary/50 transition-colors cursor-col-resize flex flex-col justify-center items-center">
            <div className="w-1 h-8 bg-muted-foreground/30 rounded-full" />
          </Separator>

          {/* RIGHT PANEL: Editor & Console */}
          <Panel defaultSize={55} minSize={30}>
            <Group direction="vertical">
              <Panel defaultSize={65} minSize={20}>
                <div className="h-full flex flex-col bg-[#1e1e1e]">
                  <div className="flex-1 relative overflow-hidden">
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
                  </div>
                  <div className="p-3 border-t border-border/30 flex justify-between items-center bg-[#1e1e1e]">
                    <AICoachModal
                      problemId={problemId}
                      code={code}
                      language={language}
                      onApplyOptimizedCode={setCode}
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={handleRunCode}
                        disabled={running || !code.trim()}
                        className="flex items-center gap-2 rounded-lg bg-secondary/80 px-5 py-2 text-sm font-medium text-foreground transition hover:bg-secondary disabled:opacity-50"
                      >
                        <Play size={14} />
                        {running ? 'Running...' : 'Run'}
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={submitting || !code.trim()}
                        className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition hover:brightness-110 disabled:opacity-50"
                      >
                        {submitting ? 'Submitting...' : 'Submit'}
                      </button>
                    </div>
                  </div>
                </div>
              </Panel>

              <Separator className="h-[6px] bg-border/40 hover:bg-primary/50 transition-colors cursor-row-resize flex justify-center items-center">
                <div className="h-1 w-8 bg-muted-foreground/30 rounded-full" />
              </Separator>

              <Panel defaultSize={35} minSize={15}>
                <div className="h-full overflow-y-auto bg-card p-4">
                   <div className="max-w-5xl mx-auto space-y-6">
                      <SubmissionResult result={result || runResult} />
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
              </Panel>
            </Group>
          </Panel>
        </Group>
      </div>
    </div>
  );
}
