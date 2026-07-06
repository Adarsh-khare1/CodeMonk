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
  const [solved, setSolved] = useState(0);
  const [rating, setRating] = useState(0);
  const [maxRating, setMaxRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && existingProfile) {
      setUsername(existingProfile.username || '');
      setSolved(existingProfile.solved || 0);
      setRating(existingProfile.rating || 0);
      setMaxRating(existingProfile.maxRating || 0);
    } else if (isOpen) {
      setUsername('');
      setSolved(0);
      setRating(0);
      setMaxRating(0);
    }
  }, [isOpen, existingProfile]);

  if (!isOpen || !platform) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const profile: any = { username: username.trim() };
      
      if (platform === 'leetcode') {
        profile.solved = parseInt(String(solved)) || 0;
        profile.rating = parseInt(String(rating)) || 0;
      } else if (platform === 'codeforces') {
        profile.rating = parseInt(String(rating)) || 0;
        profile.maxRating = parseInt(String(maxRating)) || 0;
      } else if (platform === 'codechef') {
        profile.rating = parseInt(String(rating)) || 0;
      }

      await onSave(platform, profile);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
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
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Problems Solved</label>
                  <input
                    type="number"
                    value={solved}
                    onChange={(e) => setSolved(parseInt(e.target.value) || 0)}
                    min="0"
                    className="input-surface w-full px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Rating (Optional)</label>
                  <input
                    type="number"
                    value={rating}
                    onChange={(e) => setRating(parseInt(e.target.value) || 0)}
                    min="0"
                    className="input-surface w-full px-4 py-2"
                  />
                </div>
              </>
            )}

            {platform === 'codeforces' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Current Rating</label>
                  <input
                    type="number"
                    value={rating}
                    onChange={(e) => setRating(parseInt(e.target.value) || 0)}
                    min="0"
                    className="input-surface w-full px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Max Rating</label>
                  <input
                    type="number"
                    value={maxRating}
                    onChange={(e) => setMaxRating(parseInt(e.target.value) || 0)}
                    min="0"
                    className="input-surface w-full px-4 py-2"
                  />
                </div>
              </>
            )}

            {platform === 'codechef' && (
              <div>
                <label className="block text-sm font-medium mb-2">Rating</label>
                <input
                  type="number"
                  value={rating}
                  onChange={(e) => setRating(parseInt(e.target.value) || 0)}
                  min="0"
                  className="input-surface w-full px-4 py-2"
                />
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-xl bg-primary px-4 py-2 font-semibold text-primary-foreground transition duration-200 hover:brightness-110 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-border/70 bg-secondary/70 px-4 py-2 text-foreground transition hover:bg-accent"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
