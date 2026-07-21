'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import api from '@/lib/api';
import { Users, Trophy, Plus, ShieldCheck, Check, AlertCircle } from 'lucide-react';
import Loader from '@/components/Loader';

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'contests' | 'roles'>('contests');
  
  // Contest state
  const [problems, setProblems] = useState<any[]>([]);
  const [contestForm, setContestForm] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    selectedProblems: [] as string[]
  });
  const [contestLoading, setContestLoading] = useState(false);
  const [contestSuccess, setContestSuccess] = useState('');
  const [contestError, setContestError] = useState('');

  // Roles state
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
        router.push('/');
      } else {
        fetchProblems();
        if (user.role === 'superadmin') {
          fetchUsers();
        }
      }
    }
  }, [user, loading, router]);

  const fetchProblems = async () => {
    try {
      const res = await api.get('/problems?limit=1000');
      setProblems(res.data.problems || res.data); // Adjust based on your API response structure
    } catch (err) {
      console.error('Failed to fetch problems', err);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleCreateContest = async (e: React.FormEvent) => {
    e.preventDefault();
    setContestLoading(true);
    setContestError('');
    setContestSuccess('');

    try {
      await api.post('/contests', {
        title: contestForm.title,
        description: contestForm.description,
        startTime: contestForm.startTime,
        endTime: contestForm.endTime,
        problems: contestForm.selectedProblems
      });
      setContestSuccess('Contest created successfully!');
      setContestForm({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        selectedProblems: []
      });
    } catch (err: any) {
      setContestError(err.response?.data?.error || 'Failed to create contest');
    } finally {
      setContestLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await api.put(`/users/${userId}/role`, { role: newRole });
      fetchUsers(); // Refresh the list
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update role');
    }
  };

  const toggleProblemSelection = (problemId: string) => {
    setContestForm(prev => {
      const isSelected = prev.selectedProblems.includes(problemId);
      if (isSelected) {
        return { ...prev, selectedProblems: prev.selectedProblems.filter(id => id !== problemId) };
      } else {
        return { ...prev, selectedProblems: [...prev.selectedProblems, problemId] };
      }
    });
  };

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader /></div>;
  }

  const isSuperadmin = user.role === 'superadmin';

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-4 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Admin Dashboard</h1>

        <div className="flex gap-4 border-b border-border mb-8">
          <button
            onClick={() => setActiveTab('contests')}
            className={`pb-4 px-2 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'contests' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Contest Management
            </div>
          </button>
          
          {isSuperadmin && (
            <button
              onClick={() => setActiveTab('roles')}
              className={`pb-4 px-2 font-medium text-sm transition-colors border-b-2 ${
                activeTab === 'roles' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                Role Management
              </div>
            </button>
          )}
        </div>

        {activeTab === 'contests' && (
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold mb-6">Create New Contest</h2>
            
            {contestSuccess && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center gap-2 text-sm font-medium">
                <Check className="h-4 w-4" />
                {contestSuccess}
              </div>
            )}
            
            {contestError && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center gap-2 text-sm font-medium">
                <AlertCircle className="h-4 w-4" />
                {contestError}
              </div>
            )}

            <form onSubmit={handleCreateContest} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Contest Title</label>
                <input
                  type="text"
                  required
                  value={contestForm.title}
                  onChange={e => setContestForm({...contestForm, title: e.target.value})}
                  className="input-surface w-full px-4 py-2"
                  placeholder="e.g. Weekly Challenge #1"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Description</label>
                <textarea
                  required
                  value={contestForm.description}
                  onChange={e => setContestForm({...contestForm, description: e.target.value})}
                  className="input-surface w-full px-4 py-2 min-h-[100px]"
                  placeholder="Describe the rules and theme..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Start Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={contestForm.startTime}
                    onChange={e => setContestForm({...contestForm, startTime: e.target.value})}
                    className="input-surface w-full px-4 py-2"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">End Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={contestForm.endTime}
                    onChange={e => setContestForm({...contestForm, endTime: e.target.value})}
                    className="input-surface w-full px-4 py-2"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center justify-between">
                  <span>Select Problems</span>
                  <span className="text-xs text-muted-foreground">{contestForm.selectedProblems.length} selected</span>
                </label>
                <div className="border border-border rounded-xl bg-background max-h-64 overflow-y-auto p-2 space-y-1">
                  {problems.map(problem => (
                    <div 
                      key={problem._id}
                      onClick={() => toggleProblemSelection(problem._id)}
                      className={`p-3 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                        contestForm.selectedProblems.includes(problem._id) 
                          ? 'bg-primary/10 border border-primary/30' 
                          : 'hover:bg-accent border border-transparent'
                      }`}
                    >
                      <div>
                        <p className="font-medium text-sm text-foreground">{problem.title}</p>
                        <p className="text-xs text-muted-foreground capitalize">{problem.difficulty} • {problem.topics?.slice(0, 3).join(', ')}</p>
                      </div>
                      {contestForm.selectedProblems.includes(problem._id) && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  ))}
                  {problems.length === 0 && (
                    <p className="p-4 text-center text-sm text-muted-foreground">Loading problems...</p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={contestLoading || contestForm.selectedProblems.length === 0}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition hover:brightness-110 disabled:opacity-50"
              >
                {contestLoading ? <Loader size="sm" /> : <Plus className="h-4 w-4" />}
                Create Contest
              </button>
            </form>
          </div>
        )}

        {isSuperadmin && activeTab === 'roles' && (
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Users className="h-5 w-5" />
                Assign Roles
              </h2>
            </div>
            
            {usersLoading ? (
              <div className="p-12 flex justify-center"><Loader /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/30 text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="px-6 py-3 font-medium">Username</th>
                      <th className="px-6 py-3 font-medium">Email</th>
                      <th className="px-6 py-3 font-medium">Current Role</th>
                      <th className="px-6 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {users.map(u => (
                      <tr key={u._id} className="hover:bg-accent/40 transition-colors">
                        <td className="px-6 py-4 font-medium text-foreground">{u.username}</td>
                        <td className="px-6 py-4 text-muted-foreground">{u.email}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                            u.role === 'superadmin' ? 'bg-purple-500/10 text-purple-500' :
                            u.role === 'admin' ? 'bg-blue-500/10 text-blue-500' :
                            'bg-secondary text-secondary-foreground'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {u.role !== 'superadmin' && (
                            <div className="flex justify-end gap-2">
                              {u.role === 'user' ? (
                                <button 
                                  onClick={() => handleUpdateRole(u._id, 'admin')}
                                  className="text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium"
                                >
                                  Make Admin
                                </button>
                              ) : (
                                <button 
                                  onClick={() => handleUpdateRole(u._id, 'user')}
                                  className="text-xs px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors font-medium"
                                >
                                  Remove Admin
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
