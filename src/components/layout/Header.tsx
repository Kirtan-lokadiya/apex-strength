'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Wifi, 
  WifiOff, 
  Settings as SettingsIcon, 
  RotateCcw,
  Sun,
  Moon
} from 'lucide-react';
import { useWorkoutStore } from '@/hooks/useWorkoutStore';

export function Header() {
  const { user, resetToDemoSeed } = useWorkoutStore();
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial theme detection
    const savedTheme = localStorage.getItem('apex_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme ? savedTheme === 'dark' : false; // default to clean white theme as requested

    setIsDarkMode(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('apex_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('apex_theme', 'light');
    }
  };

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800/80 px-4 py-3 transition-colors">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Brand & Date */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-950 font-black text-sm shadow-md transition-transform group-hover:scale-105">
              ▲
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight text-base leading-none">
                  Apex<span className="font-medium text-zinc-500 dark:text-zinc-400">Strength</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold border border-zinc-200 dark:border-zinc-700">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium leading-tight mt-0.5">
                {todayFormatted}
              </p>
            </div>
          </Link>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Theme Switcher Toggle (White / Dark) */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            title={isDarkMode ? 'Switch to Clean White Theme' : 'Switch to Dark Theme'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-700" />}
          </button>

          {/* Online/Offline indicator */}
          <div
            title={isOnline ? 'Online (Real-time Sync)' : 'Offline (Local IndexedDB Active)'}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors border ${
              isOnline 
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40' 
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/40'
            }`}
          >
            {isOnline ? <Wifi className="w-3 h-3 text-emerald-600" /> : <WifiOff className="w-3 h-3 text-amber-600" />}
            <span className="hidden sm:inline">{isOnline ? 'Online' : 'Offline'}</span>
          </div>

          {/* Quick Demo Reset */}
          <button
            onClick={() => {
              if (confirm('Reset to rich demo data with 6 weeks of history, PRs, and missed workout?')) {
                resetToDemoSeed();
              }
            }}
            title="Reset to Demo Seed Data"
            className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Settings link */}
          <Link
            href="/settings"
            className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            title="Settings"
          >
            <SettingsIcon className="w-4 h-4" />
          </Link>

          {/* User Avatar */}
          <Link href="/settings" className="relative ml-0.5">
            {user.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="w-7 h-7 rounded-full object-cover ring-2 ring-zinc-200 dark:ring-zinc-700"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-xs font-bold text-white dark:text-zinc-950 ring-2 ring-zinc-300 dark:ring-zinc-700">
                {user.displayName.charAt(0)}
              </div>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
