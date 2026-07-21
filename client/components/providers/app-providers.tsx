"use client";

import * as React from "react";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { GoogleOAuthProvider } from '@react-oauth/google';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "1036383072036-3r7u251hgec6e0cprlpp2haq53o4ps45.apps.googleusercontent.com"}>
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
    </GoogleOAuthProvider>
  );
}
