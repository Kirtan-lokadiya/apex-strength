'use client';

import React, { useEffect } from 'react';
import { WorkoutStoreProvider } from '@/hooks/useWorkoutStore';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { DesktopSidebar } from './DesktopSidebar';

export function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Register Service Worker for PWA
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('ApexStrength ServiceWorker registered:', reg.scope);
          })
          .catch((err) => {
            console.warn('ApexStrength ServiceWorker registration failed:', err);
          });
      });
    }
  }, []);

  return (
    <WorkoutStoreProvider>
      <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-sky-500 selection:text-slate-950">
        {/* Desktop Left Sidebar */}
        <DesktopSidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 px-4 py-5 max-w-4xl w-full mx-auto">
            {children}
          </main>
          {/* Mobile Bottom Navigation */}
          <BottomNav />
        </div>
      </div>
    </WorkoutStoreProvider>
  );
}
