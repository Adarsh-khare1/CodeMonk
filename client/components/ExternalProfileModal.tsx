'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface ExternalProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform: 'leetcode' | 'codeforces' | 'codechef' | null;
  existingProfile: any;
  onSave: (platform: string, profile: any) => Promise<void>;
}

export default function ExternalProfileModal({
  isOpen,
  onClose,
  platform,
  existingProfile,
  onSave,
}: ExternalProfileModalProps) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && existingProfile) {
      setUsername(existingProfile.username || '');
    } else if (isOpen) {
      setUsername('');
    }
  }, [isOpen, existingProfile]);

  if (!isOpen || !platform) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onSave(platform, { username });
      onClose();
    } catch (error) {
      console.error('Save failed:', error);
      setError('Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const platformNames = {
    leetcode: 'LeetCode',
    codeforces: 'Codeforces',
    codechef: 'CodeChef',
  };

  return (
    <div className="overlay-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="surface-primary relative w-full max-w-md shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground transition hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6">
          <h2 className="mb-2 text-2xl font-bold tracking-tight">
            {existingProfile?.username ? 'Edit' : 'Connect'} {platformNames[platform]}
          </h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Enter your {platformNames[platform]} profile information
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-surface w-full px-4 py-2"
                required
              />
            </div>

            {platform === 'leetcode' && (
              <p className="text-sm text-muted-foreground mt-2">
                We will automatically fetch your solved count and rating from LeetCode.
              </p>
            )}

            {platform === 'codeforces' && (
              <p className="text-sm text-muted-foreground mt-2">
                We will automatically fetch your current and max rating from Codeforces.
              </p>
            )}

            {platform === 'codechef' && (
              <p className="text-sm text-muted-foreground mt-2">
                We will automatically fetch your rating from CodeChef.
              </p>
            )}

            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl bg-secondary/80 px-4 py-2.5 text-sm font-medium transition hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !username.trim()}
                className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
