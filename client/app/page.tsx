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

  // Redirect logged-in users to the Dashboard
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
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [loading]);

  if (loading || (user && showLoader)) {
    return <Loader />;
  }

  // Normal guest landing page
  return (
    <div className="relative min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Because Hero is now 'relative', anything you put below it will show up! */}
        <Hero />
        
        {/* EXAMPLE: If you want to add marketing content below the video, put it here. 
            Do NOT put Dashboard user stats here, as guests don't have stats yet! */}
        <div className="relative z-10 bg-background pt-20 pb-32 flex flex-col items-center justify-center text-center">
           {/* <h2 className="text-3xl font-bold mb-4">Start your coding journey today</h2>
           <p className="text-muted-foreground mb-8">Sign up to track your LeetCode and Codeforces progress.</p> */}
        </div>
      </main>
      
    </div>
  );
}