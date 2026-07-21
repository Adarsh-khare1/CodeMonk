'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { CheckCircle, XCircle, AlertCircle, Clock, ChevronRight, ChevronDown } from 'lucide-react';
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
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'Time Limit Exceeded':
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      default:
        return <XCircle className="h-4 w-4 text-red-500" />;
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
      <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Login to view your submission history
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center rounded-xl border border-border bg-card p-12">
        <Loader />
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center text-sm text-muted-foreground flex flex-col items-center">
        <Clock className="mb-3 h-8 w-8 opacity-20" />
        No past submissions yet. Run your code to test it!
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
      <div className="bg-secondary/40 px-5 py-4 border-b border-border">
        <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Submissions History
        </h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/30 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-medium">Time Submitted</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Passed</th>
              <th className="px-5 py-3 font-medium">Language</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {submissions.map((sub) => {
              const isSelected = selectedId === sub._id;
              const isExpanded = expandedId === sub._id;
              
              return (
                <React.Fragment key={sub._id}>
                  <tr 
                    className={`group cursor-pointer transition-colors hover:bg-accent/40 ${isSelected ? 'bg-accent/20' : ''}`}
                    onClick={() => {
                      setSelectedId(sub._id);
                      setExpandedId(isExpanded ? null : sub._id);
                      onSelectSubmission(sub);
                    }}
                  >
                    <td className="px-5 py-4 whitespace-nowrap text-muted-foreground group-hover:text-foreground transition-colors">
                      {formatTime(sub.createdAt)}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 font-medium">
                        {getStatusIcon(sub.status)}
                        <span className={
                          sub.status === 'Accepted' ? 'text-emerald-500' : 'text-red-500'
                        }>
                          {sub.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-muted-foreground">
                      {sub.passed} / {sub.total}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                        {sub.language}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-right text-muted-foreground">
                      {isExpanded ? <ChevronDown className="h-4 w-4 inline-block" /> : <ChevronRight className="h-4 w-4 inline-block" />}
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="bg-accent/10">
                      <td colSpan={5} className="p-0 border-b border-border">
                        <div className="p-5 border-t-0 border-x-4 border-l-primary border-r-transparent border-y-transparent">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Submitted Code</span>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectSubmission(sub);
                              }}
                              className="text-xs text-primary hover:underline font-medium"
                            >
                              Restore Code
                            </button>
                          </div>
                          <div className="font-code overflow-x-auto rounded-lg border border-border/40 bg-[#1e1e1e] p-4 text-xs text-blue-300">
                            <pre className="whitespace-pre-wrap leading-relaxed">{sub.code}</pre>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
