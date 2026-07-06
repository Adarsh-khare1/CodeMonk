'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Clock, CheckCircle, XCircle, AlertCircle,} from 'lucide-react';
import Loader from '@/components/Loader';

interface PastSubmission {
  _id: string;
  code: string;
  language: string;
  status: string;
  passed: number;
  total: number;
  createdAt: string;
}

interface PastSubmissionsProps {
  problemId: string;
  user: any;
  onSelectSubmission: (submission: PastSubmission) => void;
}

export default function PastSubmissions({ problemId, user, onSelectSubmission }: PastSubmissionsProps) {
  const [submissions, setSubmissions] = useState<PastSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (user && problemId) {
      fetchSubmissions();
    }
  }, [user, problemId]);

  const fetchSubmissions = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.get(`/submissions/${problemId}`);
      setSubmissions(res.data);
    } catch (err) {
      console.error('Failed to fetch submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Accepted':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'Time Limit Exceeded':
        return <AlertCircle className="h-4 w-4 text-yellow-400" />;
      default:
        return <XCircle className="h-4 w-4 text-red-400" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (!user) {
    return (
      <div className="surface-primary p-4 text-sm text-muted-foreground">
        Login to view past submissions
      </div>
    );
  }

  if (loading) {
    return (
      <div className="surface-primary flex justify-center p-6">
        <Loader />
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="surface-primary p-4 text-sm text-muted-foreground">
        No past submissions
      </div>
    );
  }

  return (
    <div className="surface-primary overflow-hidden">
      <div className="hairline-divider px-4 py-3">
        <h3 className="font-semibold text-sm">Past Submissions</h3>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {submissions.map((sub) => (
          <div
            key={sub._id}
            className={`cursor-pointer border-b border-border/60 p-3 transition hover:bg-accent/60 ${
              selectedId === sub._id ? 'bg-accent/70' : ''
            }`}
            onClick={() => {
              setSelectedId(sub._id);
              setExpandedId(expandedId === sub._id ? null : sub._id);
              onSelectSubmission(sub);
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {getStatusIcon(sub.status)}
                <span className={`text-xs font-medium ${
                  sub.status === 'Accepted' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {sub.status}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatTime(sub.createdAt)}
              </div>
            </div>
            <div className="mb-1 text-xs text-muted-foreground">
              {sub.passed} / {sub.total} passed • {sub.language}
            </div>
            {expandedId === sub._id && (
              <div className="font-code mt-2 max-h-48 overflow-y-auto rounded-xl border border-border/60 bg-background/90 p-2 text-xs text-foreground">
                <pre className="whitespace-pre-wrap break-words">{sub.code}</pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
