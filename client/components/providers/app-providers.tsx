"use client";

import * as React from "react";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            duration: 3500,
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}
