'use client';

import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Download, 
  RotateCcw, 
  Key, 
  Sparkles, 
  Check, 
  Layers, 
  Calendar, 
  Bell,
  Trash2
} from 'lucide-react';
import { useWorkoutStore } from '@/hooks/useWorkoutStore';

export function SettingsPage() {
  const { user, updateUserPreferences, resetToDemoSeed, exportUserData } = useWorkoutStore();
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
          <h2 className="text-2xl font-black text-slate-100 tracking-tight">
            Settings & Preferences
          </h2>
          <p className="text-xs text-slate-400">
            Customize units, schedule automation, equipment increments, and exports
          </p>
        </div>

        {savedSuccess && (
          <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800">
            <Check className="w-3.5 h-3.5" /> Saved
          </span>
        )}
      </div>

      {/* 1. General Preferences */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-lg">
        <h3 className="font-extrabold text-slate-200 text-sm uppercase tracking-wider">
          Units & Display
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Unit Toggle */}
          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
            <span className="font-semibold text-slate-300">Weight Unit</span>
            <div className="flex items-center bg-slate-900 rounded-xl p-1 border border-slate-800">
              <button
                onClick={() => handleUnitChange('kg')}
                className={`px-3 py-1 font-bold rounded-lg transition-colors ${
                  user.preferences.unit === 'kg'
                    ? 'bg-sky-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                kg
              </button>
              <button
                onClick={() => handleUnitChange('lb')}
                className={`px-3 py-1 font-bold rounded-lg transition-colors ${
                  user.preferences.unit === 'lb'
                    ? 'bg-sky-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                lb
              </button>
            </div>
          </div>

          {/* Week Start */}
          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
            <span className="font-semibold text-slate-300">Week Starts On</span>
            <div className="flex items-center bg-slate-900 rounded-xl p-1 border border-slate-800">
              <button
                onClick={() => handleWeekStartChange('monday')}
                className={`px-2.5 py-1 font-bold rounded-lg transition-colors ${
                  user.preferences.weekStartsOn === 'monday'
                    ? 'bg-sky-500 text-slate-950'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Mon
              </button>
              <button
                onClick={() => handleWeekStartChange('sunday')}
                className={`px-2.5 py-1 font-bold rounded-lg transition-colors ${
                  user.preferences.weekStartsOn === 'sunday'
                    ? 'bg-sky-500 text-slate-950'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sun
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Missed Workouts & AI Automation */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-lg">
        <h3 className="font-extrabold text-slate-200 text-sm uppercase tracking-wider">
          Automation & Engine
        </h3>

        <div className="space-y-2.5 text-xs">
          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-200 block">Detect Missed Workouts</span>
              <span className="text-slate-400 text-[11px]">Automatically flags workouts as missed once scheduled time has elapsed</span>
            </div>
            <input
              type="checkbox"
              checked={user.preferences.autoDetectMissedWorkouts}
              onChange={(e) => handleToggle('autoDetectMissedWorkouts', e.target.checked)}
              className="w-5 h-5 accent-sky-500 rounded cursor-pointer"
            />
          </div>

          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-200 block">AI Progression Recommendations</span>
              <span className="text-slate-400 text-[11px]">Evaluates recent performance and provides contextual explanations</span>
            </div>
            <input
              type="checkbox"
              checked={user.preferences.aiRecommendationsEnabled}
              onChange={(e) => handleToggle('aiRecommendationsEnabled', e.target.checked)}
              className="w-5 h-5 accent-sky-500 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 3. API Keys & Free Cloud Configuration */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-lg">
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-sky-400" />
          <h3 className="font-extrabold text-slate-200 text-sm uppercase tracking-wider">
            Cloud & API Integration
          </h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          ApexStrength runs on 100% free tiers: Firebase Spark (free 50k daily reads), ImgBB (free 32MB image hosting), and Vercel. 
          When you have an OpenAI API key, configure <code className="text-sky-300">OPENAI_API_KEY</code> in your environment or Vercel dashboard.
        </p>

        <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-1 font-mono">
          <div>FIREBASE_STATUS: <span className="text-emerald-400 font-bold">READY (Offline IndexedDB Enabled)</span></div>
          <div>IMGBB_STATUS: <span className="text-emerald-400 font-bold">READY (Free Tier Uploads Active)</span></div>
          <div>DETERMINISTIC_ENGINE: <span className="text-emerald-400 font-bold">ACTIVE (100% Free Forever)</span></div>
        </div>
      </div>

      {/* 4. Data Export (Section 31) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-lg">
        <h3 className="font-extrabold text-slate-200 text-sm uppercase tracking-wider">
          Data Export & Backup
        </h3>
        <p className="text-xs text-slate-400">
          Download your complete training history, exercises, sets, and personal records for total data ownership.
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={() => exportUserData('json')}
            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors border border-slate-700"
          >
            <Download className="w-4 h-4" />
            Export JSON
          </button>
          <button
            onClick={() => exportUserData('csv')}
            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors border border-slate-700"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* 5. Danger Zone / Reset Seed */}
      <div className="bg-rose-950/20 border border-rose-900/40 rounded-3xl p-5 space-y-3">
        <h3 className="font-extrabold text-rose-400 text-sm uppercase tracking-wider">
          Demo & Reset Controls
        </h3>
        <p className="text-xs text-slate-400">
          Reset database to the curated 6-week demonstration state featuring bench/squat PR progressions and the missed Pull session banner.
        </p>
        <button
          onClick={() => {
            if (confirm('Are you sure you want to reset all data to the initial demonstration seed?')) {
              resetToDemoSeed();
            }
          }}
          className="px-4 py-2.5 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset to Demo Seed Data
        </button>
      </div>
    </div>
  );
}

export default SettingsPage;
