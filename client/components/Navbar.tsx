'use client';

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { usePathname } from "next/navigation";
import { ChevronDown, LogOut, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Avatar from "./Avatar";
import LoginModal from "./LoginModal";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginModalMode, setLoginModalMode] = useState<"login" | "signup">("login");

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <div className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <header className="app-shell flex min-h-[76px] items-center justify-between gap-4">
          <Link href="/problems" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 shadow-[0_0_0_1px_rgba(96,165,250,0.08)]">
              <span className="font-code text-sm font-semibold text-primary">CM</span>
            </div>
            <div className="leading-tight">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem]">
                Code<span className="text-primary">Monk</span>
              </h1>
              <p className="hidden text-xs text-muted-foreground sm:block">
                Practice, iterate, and ship cleaner solutions.
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 rounded-2xl border border-border/70 bg-card/70 p-1.5 md:flex">
            <Link
              href="/problems"
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                pathname.startsWith("/problems")
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              Problems
            </Link>

            {!loading && user && (
              <Link
                href="/dashboard"
                className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                  pathname.startsWith("/dashboard")
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                Dashboard
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            {!loading && user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card/80 px-3 py-2 text-sm font-medium text-foreground transition hover:border-primary/30 hover:bg-accent"
                >
                  <Avatar username={user.username} size="sm" />
                  <span className="hidden sm:block">{user.username}</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>

                {dropdownOpen && (
                  <div className="surface-primary absolute right-0 mt-3 w-56 overflow-hidden p-2">
                    <Link
                      href="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-foreground transition hover:bg-accent"
                    >
                      <User className="h-4 w-4 text-muted-foreground" />
                      Dashboard
                    </Link>
                    <button
                      onClick={logout}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-foreground transition hover:bg-accent"
                    >
                      <LogOut className="h-4 w-4 text-muted-foreground" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => {
                  setLoginModalMode("login");
                  setLoginModalOpen(true);
                }}
                className="rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_-10px_rgba(59,130,246,0.5)] transition hover:brightness-110"
              >
                Sign In
              </button>
            )}
          </div>
        </header>
      </div>

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        defaultMode={loginModalMode}
      />
    </>
  );
}
