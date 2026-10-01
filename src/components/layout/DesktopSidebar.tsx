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
    <aside className="hidden md:flex flex-col w-64 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/70 p-4 shrink-0 min-h-screen transition-colors">
      <div className="flex items-center gap-2.5 px-3 py-2 mb-6">
        <div className="w-9 h-9 rounded-xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-950 font-black text-base shadow-sm">
          ▲
        </div>
        <div>
          <span className="font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight text-lg">
            Apex<span className="font-medium text-zinc-500 dark:text-zinc-400">Strength</span>
          </span>
          <span className="block text-[10px] text-zinc-400 dark:text-zinc-500 font-bold tracking-wider uppercase">
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
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </div>
              {link.badge && (
                <span className="px-1.5 py-0.5 text-[10px] font-extrabold rounded-md bg-emerald-500 text-white animate-pulse">
                  {link.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <div className="px-3.5 py-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs shadow-sm">
          <p className="font-bold text-zinc-800 dark:text-zinc-200 mb-0.5">Offline-Ready PWA</p>
          <p className="text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
            Works 100% inside dead gym basements. IndexedDB local sync active.
          </p>
        </div>
      </div>
    </aside>
  );
}
