'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Loader from '@/components/Loader';
// Add your other components here!
import { StatsCards } from '@/components/StatsCards'; 
import { PlatformCard } from '@/components/PlatformCard';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

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

  // ✅ Add your components inside this div, below the Hero
  return (
    <div className="relative min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <Hero />
        
        {/* Everything below the Hero goes here */}
        <div className="relative z-10 bg-background pt-20 pb-32">
          <div className="container mx-auto px-4 space-y-20">
            {/* Example: Add your stats and platform cards here */}
            <StatsCards />
            
            {/* You can pass required props if PlatformCard needs them */}
            {/* <PlatformCard /> */}
          </div>
        </div>
      </main>
      
    </div>
  );
}