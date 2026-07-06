'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Loader from '@/components/Loader';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showLoader, setShowLoader] = useState(true);

  // Redirect logged-in users
  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  // Hide loader after initial auth check
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        setShowLoader(false);
      }, 800); // Small delay for smooth feel

      return () => clearTimeout(timer);
    }
  }, [loading]);

  // Show loader during initial load OR when redirecting
  if (loading || (user && showLoader)) {
    return <Loader />;
  }

  // Normal guest landing page
  return (
    <div className="relative min-h-screen">
      <Navbar />
      <Hero />
    </div>
  );
}