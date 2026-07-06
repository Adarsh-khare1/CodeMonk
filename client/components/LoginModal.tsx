'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { X } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultMode?: 'login' | 'signup';
}

export default function LoginModal({ isOpen, onClose, onSuccess, defaultMode = 'login' }: LoginModalProps) {
  const { login, signup } = useAuth();
  const [isLogin, setIsLogin] = useState(defaultMode === 'login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLogin(defaultMode === 'login');
      setError('');
      setEmail('');
      setPassword('');
      setUsername('');
    }
  }, [isOpen, defaultMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!username.trim()) {
          setError('Username is required');
          setSubmitting(false);
          return;
        }
        await signup(username, email, password);
      }
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setError('');
    setEmail('');
    setPassword('');
    setUsername('');
    setIsLogin(true);
    onClose();
  };

  return (
    <div className="overlay-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="surface-primary relative w-full max-w-md rounded-[28px]">
        <button onClick={handleClose} className="absolute right-4 top-4 text-muted-foreground transition hover:text-foreground">
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 sm:p-7">
          <h2 className="mb-2 text-2xl font-semibold tracking-tight">{isLogin ? 'Login' : 'Sign Up'}</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            {isLogin ? 'Login to submit solutions and comment' : 'Create an account to get started'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-xl border border-border bg-secondary/70 px-4 py-3 text-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                  placeholder="username"
                  required={!isLogin}
                  pattern="[a-zA-Z0-9_]+"
                  minLength={3}
                  maxLength={30}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-border bg-secondary/70 px-4 py-3 text-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-border bg-secondary/70 px-4 py-3 text-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>

            {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-300">{error}</div>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-50"
            >
              {submitting ? 'Loading...' : isLogin ? 'Login' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-primary transition hover:text-primary/80">
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
