'use client';

import { useMemo, useState } from 'react';
import api from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BrainCircuit, X } from 'lucide-react';

interface ReviewIssue {
  title: string;
  severity: 'low' | 'medium' | 'high';
  explanation: string;
  lineHint?: string;
}

interface ReviewResult {
  summary: string;
  correctness: string;
  timeComplexity: string;
  spaceComplexity: string;
  strengths: string[];
  issues: ReviewIssue[];
  edgeCases: string[];
  nextSteps: string[];
}

interface OptimizationResult {
  summary: string;
  optimizedCode: string;
  timeComplexity: string;
  spaceComplexity: string;
  changes: string[];
  tradeoffs: string[];
  warnings: string[];
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AICoachModalProps {
  problemId: string;
  code: string;
  language: string;
  onApplyOptimizedCode: (code: string) => void;
}

export default function AICoachModal({
  problemId,
  code,
  language,
  onApplyOptimizedCode,
}: AICoachModalProps) {
  const [open, setOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState<'review' | 'optimize' | 'chat' | null>(null);
  const [review, setReview] = useState<ReviewResult | null>(null);
  const [optimization, setOptimization] = useState<OptimizationResult | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState('');

  const isCodeEmpty = useMemo(() => !code?.trim(), [code]);

  const handleReview = async () => {
    if (isCodeEmpty) return;

    setLoadingAction('review');
    setError('');

    try {
      const { data } = await api.post('/ai/review', {
        problemId,
        code,
        language,
      });

      setReview(data);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to review code');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleOptimize = async () => {
    if (isCodeEmpty) return;

    setLoadingAction('optimize');
    setError('');

    try {
      const { data } = await api.post('/ai/optimize', {
        problemId,
        code,
        language,
      });

      setOptimization(data);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to optimize code');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleChat = async () => {
    if (isCodeEmpty || !chatInput.trim()) return;

    const nextHistory = [...chatMessages, { role: 'user' as const, content: chatInput.trim() }];
    setChatMessages(nextHistory);
    setChatInput('');
    setLoadingAction('chat');
    setError('');

    try {
      const { data } = await api.post('/ai/chat', {
        problemId,
        code,
        language,
        message: nextHistory[nextHistory.length - 1].content,
        history: nextHistory.slice(0, -1),
      });

      setChatMessages((current) => [...current, { role: 'assistant', content: data.reply }]);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to send chat message');
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button className="flex items-center gap-2 rounded-lg bg-purple-600/20 px-4 py-2 text-sm font-medium text-purple-400 transition hover:bg-purple-600/30">
            <BrainCircuit className="h-4 w-4" />
            Ask AI Coach
          </button>
        }
      />
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 overflow-hidden bg-background border-border">
        <DialogHeader className="px-6 py-4 border-b border-border bg-card">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <BrainCircuit className="h-5 w-5 text-purple-500" />
            AI Coach
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleReview}
              disabled={loadingAction !== null || isCodeEmpty}
              className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-700 disabled:opacity-50"
            >
              {loadingAction === 'review' ? 'Reviewing...' : 'Review Code'}
            </button>
            <button
              onClick={handleOptimize}
              disabled={loadingAction !== null || isCodeEmpty}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {loadingAction === 'optimize' ? 'Optimizing...' : 'Optimize Code'}
            </button>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          {review && (
            <div className="space-y-4 rounded-2xl border border-border/70 bg-secondary/40 p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-violet-300">Review Summary</h3>
                  <p className="mt-2 text-sm text-foreground">{review.summary}</p>
                </div>
                <button onClick={() => setReview(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="rounded-xl border border-border/60 bg-background/80 p-3">
                  <div className="text-muted-foreground">Correctness</div>
                  <div className="mt-1 font-medium capitalize">{review.correctness}</div>
                </div>
                <div className="rounded-xl border border-border/60 bg-background/80 p-3">
                  <div className="text-muted-foreground">Time</div>
                  <div className="mt-1 font-medium">{review.timeComplexity}</div>
                </div>
                <div className="rounded-xl border border-border/60 bg-background/80 p-3">
                  <div className="text-muted-foreground">Space</div>
                  <div className="mt-1 font-medium">{review.spaceComplexity}</div>
                </div>
              </div>

              {review.strengths?.length > 0 && (
                <div>
                  <h4 className="font-medium text-emerald-600 dark:text-emerald-300">Strengths</h4>
                  <ul className="mt-2 space-y-2 text-sm text-foreground">
                    {review.strengths.map((item, index) => (
                      <li key={index}>• {item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {review.issues?.length > 0 && (
                <div>
                  <h4 className="font-medium text-amber-300">Issues</h4>
                  <div className="mt-2 space-y-3">
                    {review.issues.map((issue, index) => (
                      <div key={index} className="rounded-xl border border-border/60 bg-background/80 p-3 text-sm">
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-medium">{issue.title}</span>
                          <span className="text-xs uppercase text-muted-foreground">{issue.severity}</span>
                        </div>
                        <p className="mt-2 text-foreground">{issue.explanation}</p>
                        {issue.lineHint && <p className="mt-2 text-xs text-muted-foreground">Hint: {issue.lineHint}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {optimization && (
            <div className="space-y-4 rounded-2xl border border-border/70 bg-secondary/40 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-emerald-300">Optimization Result</h3>
                  <p className="mt-2 text-sm text-foreground">{optimization.summary}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onApplyOptimizedCode(optimization.optimizedCode);
                      setOpen(false);
                    }}
                    className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
                  >
                    Apply Code
                  </button>
                  <button onClick={() => setOptimization(null)} className="text-muted-foreground hover:text-foreground ml-2">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border border-border/60 bg-background/80 p-3">
                  <div className="text-muted-foreground">Time</div>
                  <div className="mt-1 font-medium">{optimization.timeComplexity}</div>
                </div>
                <div className="rounded-xl border border-border/60 bg-background/80 p-3">
                  <div className="text-muted-foreground">Space</div>
                  <div className="mt-1 font-medium">{optimization.spaceComplexity}</div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-emerald-300">Optimized Code</h4>
                <pre className="font-code mt-2 overflow-x-auto rounded-2xl border border-border/70 bg-background/90 p-4 text-xs text-foreground">
                  <code>{optimization.optimizedCode}</code>
                </pre>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h3 className="font-semibold text-sky-300">Chat</h3>

            <div className="min-h-[200px] max-h-[400px] space-y-3 overflow-y-auto rounded-2xl border border-border/70 bg-secondary/40 p-4">
              {chatMessages.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Ask for hints, debugging help, or an explanation of the current approach.
                </p>
              ) : (
                chatMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`rounded-lg px-3 py-2 text-sm ${
                      message.role === 'user'
                        ? 'bg-sky-700/30 text-sky-100 ml-8'
                        : 'border border-border/60 bg-background/90 text-foreground mr-8'
                    }`}
                  >
                    <div className="mb-1 text-xs uppercase text-muted-foreground">{message.role}</div>
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  </div>
                ))
              )}
              {loadingAction === 'chat' && (
                <div className="mr-8 rounded-lg border border-border/60 bg-background/90 px-3 py-2 text-sm text-muted-foreground">
                  AI is typing...
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-border bg-card">
          <div className="flex gap-3">
            <textarea
              value={chatInput}
              onChange={(event) => setChatInput(event.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleChat();
                }
              }}
              className="input-surface min-h-[60px] max-h-[120px] flex-1 px-3 py-2 text-sm resize-y"
              placeholder="Ask Gemini about your code... (Press Enter to send)"
            />
            <button
              onClick={handleChat}
              disabled={loadingAction !== null || isCodeEmpty || !chatInput.trim()}
              className="self-end rounded-xl bg-sky-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-sky-700 disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
