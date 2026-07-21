// components/Loader.tsx
"use client";

import { Loader2 } from "lucide-react";

interface LoaderProps {
  fadingOut?: boolean;
  size?: "sm" | "md" | "lg" | string;
  className?: string;
}

const Loader = ({ fadingOut = false, size = "md", className = "" }: LoaderProps) => {
  const iconSize = size === "sm" ? "w-4 h-4" : size === "lg" ? "w-12 h-12" : "w-8 h-8";
  const minHeight = size === "sm" ? "min-h-0" : "min-h-[200px]";

  return (
    <div className={`flex items-center justify-center ${minHeight} w-full ${fadingOut ? "animate-fadeOut" : ""} ${className}`}>
      <Loader2 className={`${iconSize} animate-spin text-primary`} />
    </div>
  );
};

export default Loader;
