'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Wifi, 
  WifiOff, 
  Settings as SettingsIcon, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { useWorkoutStore } from '@/hooks/useWorkoutStore';

export function Header() {
  const { user, resetToDemoSeed } = useWorkoutStore();
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [showSeedConfirm, setShowSeedConfirm] = useState<boolean>(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Brand & Date */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-600 to-sky-400 flex items-center justify-center text-white font-black text-sm shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
              ▲
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-100 tracking-tight text-base leading-none">
                  Apex<span className="text-sky-400">Strength</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 font-semibold border border-sky-800/50">
                  PWA
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium leading-tight mt-0.5">
                {todayFormatted}
              </p>
            </div>
          </Link>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2.5">
          {/* Online/Offline indicator */}
          <div
            title={isOnline ? 'Online (Real-time Sync)' : 'Offline (Local IndexedDB Active)'}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium transition-colors border ${
              isOnline 
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40' 
                : 'bg-amber-950/60 text-amber-300 border-amber-800/40'
            }`}
          >
            {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
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
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Settings link */}
          <Link
            href="/settings"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Settings"
          >
            <SettingsIcon className="w-4 h-4" />
          </Link>

          {/* User Avatar */}
          <Link href="/settings" className="relative">
            {user.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="w-7 h-7 rounded-full object-cover ring-2 ring-slate-700"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-sky-400 ring-2 ring-slate-700">
                {user.displayName.charAt(0)}
              </div>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
