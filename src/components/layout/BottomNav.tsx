'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  CalendarDays, 
  Dumbbell, 
  TrendingUp, 
  Sparkles, 
  PlayCircle 
} from 'lucide-react';
import { useWorkoutStore } from '@/hooks/useWorkoutStore';

export function BottomNav() {
  const pathname = usePathname();
  const { activeSession } = useWorkoutStore();

  const navItems = [
    { label: 'Today', href: '/', icon: Dumbbell },
    { label: 'Calendar', href: '/calendar', icon: CalendarDays },
    { 
      label: activeSession ? 'Active' : 'Workout', 
      href: '/workout', 
      icon: PlayCircle,
      isActiveWorkout: !!activeSession,
    },
    { label: 'Progress', href: '/progress', icon: TrendingUp },
    { label: 'AI Coach', href: '/coach', icon: Sparkles },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 md:hidden pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 relative ${
                isActive 
                  ? 'text-sky-400 font-medium' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-6 h-6 ${isActive ? 'scale-110' : ''}`} />
                {item.isActiveWorkout && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
                )}
                {item.isActiveWorkout && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                )}
              </div>
              <span className="text-[11px] tracking-tight mt-1">{item.label}</span>
              {isActive && (
                <span className="absolute bottom-0 w-8 h-0.5 bg-sky-400 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
