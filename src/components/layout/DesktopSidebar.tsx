'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  CalendarDays, 
  Dumbbell, 
  TrendingUp, 
  Sparkles, 
  PlayCircle,
  BookOpen,
  ListTodo,
  Settings as SettingsIcon,
  Bug
} from 'lucide-react';
import { useWorkoutStore } from '@/hooks/useWorkoutStore';

export function DesktopSidebar() {
  const pathname = usePathname();
  const { activeSession } = useWorkoutStore();

  const links = [
    { label: 'Today', href: '/', icon: Dumbbell },
    { label: 'Weekly Calendar', href: '/calendar', icon: CalendarDays },
    { 
      label: activeSession ? 'Active Workout' : 'Start Workout', 
      href: '/workout', 
      icon: PlayCircle,
      badge: activeSession ? 'LIVE' : undefined,
    },
    { label: 'Progress & PRs', href: '/progress', icon: TrendingUp },
    { label: 'AI Coach', href: '/coach', icon: Sparkles },
    { label: 'Exercise Library', href: '/exercises', icon: BookOpen },
    { label: 'Workout History', href: '/history', icon: ListTodo },
    { label: 'Settings', href: '/settings', icon: SettingsIcon },
    { label: 'Dev Debug', href: '/dev-debug', icon: Bug },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-slate-800 bg-slate-950/70 p-4 shrink-0 min-h-screen">
      <div className="flex items-center gap-2.5 px-3 py-2 mb-6">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-sky-400 flex items-center justify-center text-white font-black text-base shadow-lg shadow-sky-500/20">
          ▲
        </div>
        <div>
          <span className="font-extrabold text-slate-100 tracking-tight text-lg">
            Apex<span className="text-sky-400">Strength</span>
          </span>
          <span className="block text-[10px] text-slate-500 font-semibold tracking-wider uppercase">
            Adaptive Training
          </span>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                <span>{link.label}</span>
              </div>
              {link.badge && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800/60 animate-pulse">
                  {link.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-slate-800/80">
        <div className="px-3 py-2 rounded-xl bg-slate-900/50 border border-slate-800/60 text-xs text-slate-400">
          <p className="font-semibold text-slate-300 mb-0.5">Offline-Ready PWA</p>
          <p className="text-[11px] leading-relaxed text-slate-500">
            Works 100% inside dead gym basements. IndexedDB local sync active.
          </p>
        </div>
      </div>
    </aside>
  );
}
