// components/Loader.tsx
"use client";

import { Loader2 } from "lucide-react";

interface LoaderProps {
  fadingOut?: boolean;
}

const Loader = ({ fadingOut = false }: LoaderProps) => {
  return (
    <div className={`flex items-center justify-center min-h-[200px] w-full ${fadingOut ? "animate-fadeOut" : ""}`}>
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
};

export default Loader;
