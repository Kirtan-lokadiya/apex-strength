'use client';

import React, { useState } from 'react';
import { 
  Download, 
  RotateCcw, 
  Key, 
  Check,
  Trash2
} from 'lucide-react';
import { useWorkoutStore } from '@/hooks/useWorkoutStore';

export function SettingsPage() {
  const { user, updateUserPreferences, resetToDemoSeed, clearAllData, exportUserData } = useWorkoutStore();
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleUnitChange = (unit: 'kg' | 'lb') => {
    updateUserPreferences({ unit });
    triggerSuccess();
  };

  const handleWeekStartChange = (weekStartsOn: 'monday' | 'sunday') => {
    updateUserPreferences({ weekStartsOn });
    triggerSuccess();
  };

  const handleToggle = (key: keyof typeof user.preferences, value: boolean) => {
    updateUserPreferences({ [key]: value } as any);
    triggerSuccess();
  };

  const triggerSuccess = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 pb-24 max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            Settings & Preferences
          </h2>
          <p className="text-xs text-zinc-500">
            Customize units, schedule automation, equipment increments, and exports
          </p>
        </div>

        {savedSuccess && (
          <span className="flex items-center gap-1 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
            <Check className="w-3.5 h-3.5" /> Saved
          </span>
        )}
      </div>

      {/* 1. General Preferences */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs transition-colors">
        <h3 className="font-extrabold text-zinc-900 dark:text-zinc-100 text-sm uppercase tracking-wider">
          Units & Display
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Unit Toggle */}
          <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">Weight Unit</span>
            <div className="flex items-center bg-zinc-200/80 dark:bg-zinc-800 rounded-xl p-1 border border-zinc-300 dark:border-zinc-700">
              <button
                onClick={() => handleUnitChange('kg')}
                className={`px-3.5 py-1 font-bold rounded-lg transition-colors ${
                  user.preferences.unit === 'kg'
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                kg
              </button>
              <button
                onClick={() => handleUnitChange('lb')}
                className={`px-3.5 py-1 font-bold rounded-lg transition-colors ${
                  user.preferences.unit === 'lb'
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                lb
              </button>
            </div>
          </div>

          {/* Week Start */}
          <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">Week Starts On</span>
            <div className="flex items-center bg-zinc-200/80 dark:bg-zinc-800 rounded-xl p-1 border border-zinc-300 dark:border-zinc-700">
              <button
                onClick={() => handleWeekStartChange('monday')}
                className={`px-3 py-1 font-bold rounded-lg transition-colors ${
                  user.preferences.weekStartsOn === 'monday'
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                Mon
              </button>
              <button
                onClick={() => handleWeekStartChange('sunday')}
                className={`px-3 py-1 font-bold rounded-lg transition-colors ${
                  user.preferences.weekStartsOn === 'sunday'
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                Sun
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Missed Workouts & Automation */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs transition-colors">
        <h3 className="font-extrabold text-zinc-900 dark:text-zinc-100 text-sm uppercase tracking-wider">
          Automation & Engine
        </h3>

        <div className="space-y-3 text-xs">
          <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-zinc-900 dark:text-zinc-100 block">Detect Missed Workouts</span>
              <span className="text-zinc-500 text-[11px]">Automatically flags workouts as missed once scheduled time has elapsed</span>
            </div>
            <input
              type="checkbox"
              checked={user.preferences.autoDetectMissedWorkouts}
              onChange={(e) => handleToggle('autoDetectMissedWorkouts', e.target.checked)}
              className="w-5 h-5 accent-zinc-900 dark:accent-zinc-100 rounded cursor-pointer"
            />
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-zinc-900 dark:text-zinc-100 block">AI Progression Recommendations</span>
              <span className="text-zinc-500 text-[11px]">Evaluates recent performance and provides contextual explanations</span>
            </div>
            <input
              type="checkbox"
              checked={user.preferences.aiRecommendationsEnabled}
              onChange={(e) => handleToggle('aiRecommendationsEnabled', e.target.checked)}
              className="w-5 h-5 accent-zinc-900 dark:accent-zinc-100 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 3. API Keys & Free Cloud Configuration */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 space-y-3 shadow-xs transition-colors">
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
          <h3 className="font-extrabold text-zinc-900 dark:text-zinc-100 text-sm uppercase tracking-wider">
            Cloud & API Integration
          </h3>
        </div>
        <p className="text-xs text-zinc-500 leading-relaxed">
          ApexStrength is designed to run 100% free for 2 users on Firebase Spark, ImgBB, and Vercel. 
          When you have an OpenAI API key, configure <code className="text-zinc-800 dark:text-zinc-200 font-mono font-bold">OPENAI_API_KEY</code> in your environment.
        </p>

        <div className="bg-zinc-50 dark:bg-zinc-950 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 space-y-1 font-mono">
          <div>FIREBASE_PERSISTENCE: <span className="text-emerald-600 dark:text-emerald-400 font-bold">ONLINE (IndexedDB Active)</span></div>
          <div>IMGBB_UPLOADS: <span className="text-emerald-600 dark:text-emerald-400 font-bold">READY (Free Tier Active)</span></div>
          <div>DETERMINISTIC_ENGINE: <span className="text-emerald-600 dark:text-emerald-400 font-bold">RUNNING (100% Free Forever)</span></div>
        </div>
      </div>

      {/* 4. Data Export */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs transition-colors">
        <h3 className="font-extrabold text-zinc-900 dark:text-zinc-100 text-sm uppercase tracking-wider">
          Data Export & Backup
        </h3>
        <p className="text-xs text-zinc-500">
          Download your complete workout history, exercises, sets, and PRs for full data ownership.
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={() => exportUserData('json')}
            className="flex-1 py-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-colors border border-zinc-200 dark:border-zinc-700"
          >
            <Download className="w-4 h-4" />
            Export JSON
          </button>
          <button
            onClick={() => exportUserData('csv')}
            className="flex-1 py-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-colors border border-zinc-200 dark:border-zinc-700"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* 5. Demo Reset */}
      <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-3xl p-5 sm:p-6 space-y-3">
        <h3 className="font-extrabold text-rose-800 dark:text-rose-400 text-sm uppercase tracking-wider">
          Demo & Reset Controls
        </h3>
        <p className="text-xs text-zinc-500">
          Reset local database to the curated demonstration state or wipe all data clean for testing from a blank slate.
        </p>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
          <button
            onClick={() => {
              if (confirm('Are you sure you want to reset all data to the initial demonstration seed?')) {
                resetToDemoSeed();
              }
            }}
            className="px-4 py-2.5 bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800/60 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Demo Seed Data
          </button>

          <button
            onClick={() => {
              if (confirm('Permanently wipe ALL workouts, history logs, and PRs to start fresh from a blank slate?')) {
                clearAllData();
              }
            }}
            className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <Trash2 className="w-4 h-4" />
            Clear All Workout Data
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
