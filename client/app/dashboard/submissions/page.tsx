'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import Loader from '@/components/Loader';

interface MySubmission {
  problemId: string;
  title: string;
  slug: string;
  language: string;
  lastAcceptedAt: string;
}


const STATUS_DISPLAY: Record<string, string> = {
  'Accepted': 'Accepted',
  'Wrong Answer': 'Wrong Answer',
  'Compilation Error': 'Compilation Error',
  'Runtime Error': 'Runtime Error',
  'Time Limit Exceeded': 'Time Limit Exceeded',
};

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

export default function DashboardSubmissionsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<MySubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      localStorage.setItem('returnUrl', '/dashboard/submissions');
      router.push('/');
      return;
    }
    if (!user) return;

    const fetchSubmissions = async () => {
      try {
        const res = await api.get('/users/solved');
        setSubmissions(res.data);
      } catch (err) {
        console.error('Failed to fetch submissions:', err);
        setSubmissions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [user, authLoading, router]);

  const handleRowClick = (sub: MySubmission) => {
    router.push(`/problems/${sub.slug}`);

  };

  if (authLoading || loading) {
    return (
      <Loader />
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="app-shell py-8">
        <div className="mb-6 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Dashboard
          </Link>
        </div>
        <h1 className="mb-8 text-3xl font-bold tracking-tight">Submissions</h1>

        <div className="surface-primary overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border/70">
                  <th className="px-6 py-4 font-semibold text-foreground">Problem Title</th>
                  <th className="px-6 py-4 font-semibold text-foreground">Language</th>
                  <th className="px-6 py-4 font-semibold text-foreground">Status</th>
                  <th className="px-6 py-4 font-semibold text-foreground">Submitted At</th>
                </tr>
              </thead>
              <tbody>
                {submissions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                      No submissions yet.
                    </td>
                  </tr>
                ) : (
                  submissions.map((sub) => (
                    <tr
                      key={sub.problemId}  
                      onClick={() => handleRowClick(sub)}
                      className="cursor-pointer border-b border-border/60 transition-colors hover:bg-accent/50"
                    >
                      <td className="px-6 py-4 text-foreground">{sub.title}</td>
                      <td className="px-6 py-4 capitalize text-muted-foreground">{sub.language}</td>
                      <td className="px-6 py-4 text-emerald-600 dark:text-emerald-400">Accepted</td>
                      <td className="px-6 py-4 text-muted-foreground">{formatDateTime(sub.lastAcceptedAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
