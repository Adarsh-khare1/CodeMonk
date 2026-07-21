'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import api from '@/lib/api';
import { User, Lock, Mail, ShieldCheck, Check, AlertCircle } from 'lucide-react';
import Loader from '@/components/Loader';
import Avatar from '@/components/Avatar';
import BadgesSection from '@/components/BadgesSection';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader /></div>;
  }

  if (!user) {
    router.push('/');
    return null;
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    setPasswordLoading(true);

    try {
      await api.put('/users/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      
      setPasswordSuccess('Password successfully updated!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const isGoogleOnly = user.avatar && user.avatar.includes('googleusercontent.com'); // basic heuristic if google user

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-4 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-8">
        <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Account Details Panel */}
          <div className="md:col-span-1 space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col items-center text-center">
              <div className="mb-4">
                <Avatar username={user.username} size="lg" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-1">{user.username}</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Mail className="h-4 w-4" />
                {user.email}
              </div>
              
              <div className="w-full flex justify-center">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                  user.role === 'superadmin' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' :
                  user.role === 'admin' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                  'bg-secondary text-secondary-foreground border border-border'
                }`}>
                  {user.role === 'superadmin' || user.role === 'admin' ? <ShieldCheck className="h-3 w-3 mr-1.5" /> : <User className="h-3 w-3 mr-1.5" />}
                  {user.role}
                </span>
              </div>
            </div>
          </div>

          {/* Settings Panel */}
          <div className="md:col-span-2">
            <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Change Password</h2>
                  <p className="text-sm text-muted-foreground">Update the password used to access your account.</p>
                </div>
              </div>

              {isGoogleOnly ? (
                <div className="p-4 rounded-xl bg-secondary border border-border text-sm text-muted-foreground flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground mb-1">Google Authentication</p>
                    <p>It looks like you signed in using Google. Accounts authenticated via Google do not have a traditional password on CodeMonk, so you cannot change it here.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handlePasswordChange} className="space-y-5">
                  {passwordSuccess && (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center gap-2 text-sm font-medium">
                      <Check className="h-4 w-4" />
                      {passwordSuccess}
                    </div>
                  )}
                  
                  {passwordError && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center gap-2 text-sm font-medium">
                      <AlertCircle className="h-4 w-4" />
                      {passwordError}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Current Password</label>
                    <input
                      type="password"
                      required
                      value={passwordForm.currentPassword}
                      onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                      className="input-surface w-full px-4 py-2"
                      placeholder="Enter your current password"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">New Password</label>
                    <input
                      type="password"
                      required
                      value={passwordForm.newPassword}
                      onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                      className="input-surface w-full px-4 py-2"
                      placeholder="At least 6 characters"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      value={passwordForm.confirmPassword}
                      onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                      className="input-surface w-full px-4 py-2"
                      placeholder="Type your new password again"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={passwordLoading}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition hover:brightness-110 disabled:opacity-50"
                    >
                      {passwordLoading ? <Loader size="sm" /> : 'Update Password'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Achievements & Badges Section */}
        <BadgesSection userBadges={user.badges} />

      </div>
    </div>
  );
}
