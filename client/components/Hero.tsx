"use client";
import { useEffect, useRef, useState } from "react";
import Loader from "@/components/Loader";

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [soundOn, setSoundOn] = useState(true);
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);

  // hydration safety
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const visited = localStorage.getItem("visitedBefore");

    const timer = setTimeout(() => {
      if (!videoRef.current) return;

      videoRef.current.muted = !!visited;
      setSoundOn(!visited);

      videoRef.current
        .play()
        .catch(() => {
          videoRef.current!.muted = true;
          setSoundOn(false);
        });

      localStorage.setItem("visitedBefore", "true");
    }, 50);

    return () => clearTimeout(timer);
  }, [mounted]);

  return (
    <section className="fixed min-h-screen w-full overflow-hidden text-foreground">
      
      {/* LOADER OVERLAY */}
      {!heroLoaded && (
        <div className="fixed inset-0 z-[9999]">
          <Loader />
        </div>
      )}

      {/* BASE */}
      <div className="absolute inset-0 z-0 bg-background" />

      {/* VIDEO */}
      <video
        ref={videoRef}
        loop
        autoPlay
        playsInline
        preload="auto"
        onCanPlayThrough={() => setHeroLoaded(true)}
        className="
          absolute inset-0
          w-[80%] h-[97%]
          object-contain
          translate-x-[36%]
          translate-y-[-10px]
          scale-90
          z-10
          pointer-events-none
        "
      >
        <source src="/Anvideo.mp4" type="video/mp4" />
        <source src="/Anvideo.webm" type="video/webm" />
      </video>

      {/* OVERLAY */}
      <div className="absolute inset-0 z-20 pointer-events-none bg-background/50 dark:bg-background/60" />

      {/* CONTENT */}
      <div className="relative z-30 flex min-h-screen max-w-xl flex-col justify-center px-8 pt-32">
        <h2 className="text-[4rem] font-semibold leading-[1.2]">
          Master Coding <br /> One Problem at a Time
        </h2>

        <p className="mt-6 max-w-md text-muted-foreground">
          Practice DSA, algorithms, and real interview problems.
        </p>

        <button
          onClick={() => {
            if (!videoRef.current) return;
            videoRef.current.muted = soundOn;
            setSoundOn(!soundOn);
          }}
          className="mt-6 w-fit rounded-xl border border-border/70 bg-card/70 px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-accent"
        >
          {soundOn ? "Mute Sound" : "Play Sound"}
        </button>
      </div>
    </section>
  );
}
