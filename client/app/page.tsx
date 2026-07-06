'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Loader from '@/components/Loader';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect logged-in users to dashboard
  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard'); // replace instead of push
    }
  }, [user, loading, router]);

  // Show loading while auth state initializes
  if (loading) {
    return (
      <Loader />
    );
  }

  // If user is logged in, Home will rarely render
  if (user) return null;

  return (
    <div className="relative min-h-screen">
      <Navbar />
      <Hero />
    </div>
  );
}
