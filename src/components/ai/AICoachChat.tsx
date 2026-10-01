'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Loader2,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Play,
  Settings,
  Dumbbell,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWorkoutStore } from '@/hooks/useWorkoutStore';
import { AICoachMessage, PlannedExercise, Exercise, ScheduleChangeItem, MuscleGroup, EquipmentType } from '@/lib/types';

export function AICoachChat() {
  const router = useRouter();
  const { 
    scheduledWorkouts, 
    completedSessions, 
    personalRecords,
    user,
    rescheduleWorkout,
    createScheduledWorkout,
    deleteScheduledWorkout,
    skipWorkout,
    startWorkout,
    updateUserPreferences,
    addCustomExercise,
    exercises
  } = useWorkoutStore();

  const [messages, setMessages] = useState<AICoachMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello ${user.displayName.split(' ')[0]}! I'm your ApexStrength AI Coach equipped with complete system-level MCP tools.\n\nYou can control the entire app conversationally:\n• **Workouts:** *"Start my workout now"*, *"Schedule a 45-min Leg Day on Saturday"*, or *"Move my next workout to tomorrow"*\n• **Preferences:** *"Switch my units to lbs"*, *"Change my rest timer to 90 seconds"*\n• **Exercise Library:** *"Add Incline Cable Fly to my exercises"*`,
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const quickPrompts = [
    'Start my workout now',
    'Move my next workout to tomorrow',
    'Schedule a 45-min Leg Day on Saturday',
    'Switch my units to lbs',
    'Reorganize my week for recovery',
  ];

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: AICoachMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const todayWorkout = scheduledWorkouts.find(w => w.scheduledDate === todayStr) || null;

      const res = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          userContext: {
            todayWorkout,
            weekWorkouts: scheduledWorkouts.slice(0, 10),
            recentSessions: completedSessions.slice(0, 3),
            personalRecords: personalRecords.slice(0, 5),
          },
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          let actionLabel: string | undefined = undefined;

          // Dispatch MCP tool calls to the actual client store & database
          if (json.toolCall && json.toolCall.name) {
            const { name, args } = json.toolCall;

            if (name === 'reschedule_workout') {
              const target = scheduledWorkouts.find(w => w.id === args.workoutId) ||
                             scheduledWorkouts.find(w => w.programDayName.toLowerCase().includes((args.workoutName || '').toLowerCase())) ||
                             scheduledWorkouts[0];
              if (target) {
                rescheduleWorkout(target.id, args.newDate, args.newTime || '18:30', args.reason || 'Rescheduled via AI Coach');
                actionLabel = `📅 Rescheduled "${target.programDayName}" to ${args.newDate} at ${args.newTime || '18:30'}`;
              }
            } else if (name === 'create_workout') {
              const mappedExercises: PlannedExercise[] = (args.plannedExercises || []).map((pe: any, idx: number) => {
                const match = exercises.find(e => 
                  e.name.toLowerCase() === pe.exerciseName.toLowerCase() || 
                  e.name.toLowerCase().includes(pe.exerciseName.toLowerCase())
                );
                return {
                  exerciseId: match?.id || `ai-${Date.now()}-${idx}`,
                  exerciseName: pe.exerciseName,
                  sets: Number(pe.sets) || 3,
                  repMin: Number(pe.repMin) || 8,
                  repMax: Number(pe.repMax) || 10,
                  targetRir: Number(pe.targetRir) || 2,
                  recommendedWeight: Number(pe.recommendedWeight) || (user.preferences.unit === 'kg' ? 50 : 115),
                  unit: user.preferences.unit,
                  progressionReason: 'Created via AI Coach tool',
                };
              });

              createScheduledWorkout({
                programDayName: args.programDayName || 'Custom Workout',
                scheduledDate: args.scheduledDate,
                scheduledTime: args.scheduledTime || '18:30',
                estimatedDurationMinutes: Number(args.estimatedDurationMinutes) || 45,
                muscleGroups: args.muscleGroups || ['Chest', 'Shoulders'],
                plannedExercises: mappedExercises,
                status: 'scheduled',
              });
              actionLabel = `🏋️ Scheduled "${args.programDayName}" on ${args.scheduledDate} at ${args.scheduledTime || '18:30'}`;
            } else if (name === 'start_workout') {
              const target = (args.workoutId ? scheduledWorkouts.find(w => w.id === args.workoutId) : null) ||
                             todayWorkout ||
                             scheduledWorkouts[0];
              startWorkout(target || undefined);
              actionLabel = `🚀 Started "${target?.programDayName || 'Freestyle Workout'}"! Redirecting to workout floor...`;
              setTimeout(() => {
                router.push('/workout');
              }, 1200);
            } else if (name === 'update_preferences') {
              updateUserPreferences(args);
              const changes = [];
              if (args.unit) changes.push(`unit: ${args.unit}`);
              if (args.defaultRestDurationSeconds) changes.push(`rest timer: ${args.defaultRestDurationSeconds}s`);
              if (args.hydrationIntervalMinutes) changes.push(`hydration interval: ${args.hydrationIntervalMinutes}m`);
              actionLabel = `⚙️ Settings updated (${changes.join(', ') || 'applied'})`;
            } else if (name === 'add_custom_exercise') {
              const newEx: Exercise = {
                id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                name: args.name,
                primaryMuscle: (args.primaryMuscle || 'Chest') as MuscleGroup,
                secondaryMuscles: [],
                equipment: (args.equipment || 'Barbell') as EquipmentType,
                movementPattern: 'Isolation',
                supportedProgression: 'double_progression',
                defaultRestSeconds: 90,
                instructions: args.instructions || 'Custom exercise registered via AI Coach.',
                isCustom: true,
                createdAt: Date.now(),
                updatedAt: Date.now(),
              };
              await addCustomExercise(newEx);
              actionLabel = `💪 Added "${args.name}" to Exercise Library`;
            } else if (name === 'reorganize_entire_week') {
              const todayStr = new Date().toISOString().split('T')[0];
              const uncompleted = scheduledWorkouts.filter(w => w.status !== 'completed' && w.scheduledDate >= todayStr);
              let offset = 0;
              uncompleted.forEach((w) => {
                const d = new Date();
                d.setDate(d.getDate() + offset);
                const nextDateStr = d.toISOString().split('T')[0];
                if (w.scheduledDate !== nextDateStr) {
                  rescheduleWorkout(w.id, nextDateStr, w.scheduledTime || '18:30', 'AI Coach weekly rebalance');
                }
                offset += 1;
              });
              actionLabel = `🔄 Reorganized ${uncompleted.length} sessions across the week`;
            } else if (name === 'delete_workout') {
              const target = scheduledWorkouts.find(w => w.id === args.workoutId) ||
                             scheduledWorkouts.find(w => w.programDayName.toLowerCase().includes((args.workoutName || '').toLowerCase()));
              if (target) {
                deleteScheduledWorkout(target.id);
                actionLabel = `🗑️ Deleted "${target.programDayName}" from calendar`;
              }
            } else if (name === 'skip_workout') {
              const target = scheduledWorkouts.find(w => w.id === args.workoutId) ||
                             scheduledWorkouts.find(w => w.programDayName.toLowerCase().includes((args.workoutName || '').toLowerCase()));
              if (target) {
                skipWorkout(target.id, args.reason || 'Skipped via AI Coach');
                actionLabel = `⏭️ Skipped "${target.programDayName}"`;
              }
            }
          }

          const assistantMsg: AICoachMessage = {
            id: `reply-${Date.now()}`,
            role: 'assistant',
            content: json.reply,
            toolCall: json.toolCall,
            actionExecuted: actionLabel,
            timestamp: Date.now(),
          };
          setMessages(prev => [...prev, assistantMsg]);
        }
      }
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'I had trouble connecting to the coaching service. Your deterministic progression engine is still operating normally in the background.',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] max-w-3xl mx-auto pb-4">
      {/* Header Info */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 mb-3 flex items-center justify-between shadow-xs transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-zinc-900 dark:text-zinc-100 text-sm">
              Adaptive Strength Assistant
            </h3>
            <span className="text-[11px] text-zinc-500">
              100% Full-App Control • MCP Function Calling Engine
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/calendar"
            className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 transition-colors border border-zinc-200 dark:border-zinc-700"
          >
            <Calendar className="w-3.5 h-3.5" />
            Calendar
          </Link>
          <Link
            href="/settings"
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-3 px-1 py-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`p-4 rounded-3xl text-xs sm:text-sm max-w-[85%] leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-medium rounded-tr-none shadow-xs'
                  : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-tl-none shadow-xs'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {/* Action Executed Interactive Confirmation Badge */}
              {msg.actionExecuted && (
                <div className="mt-3 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-between gap-2 text-xs text-emerald-900 dark:text-emerald-200">
                  <div className="flex items-center gap-2 font-bold min-w-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="truncate">{msg.actionExecuted}</span>
                  </div>
                  <Link
                    href={msg.actionExecuted.includes('Started') ? '/workout' : msg.actionExecuted.includes('Settings') ? '/settings' : msg.actionExecuted.includes('Library') ? '/exercises' : '/calendar'}
                    className="px-2 py-1 bg-emerald-600 text-white hover:bg-emerald-500 rounded-lg text-[10px] font-bold flex items-center gap-1 shrink-0 shadow-xs"
                  >
                    View
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-zinc-500 p-2">
            <Loader2 className="w-4 h-4 text-zinc-700 dark:text-zinc-300 animate-spin" />
            <span>AI Coach is executing actions and querying database...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="py-2 overflow-x-auto flex gap-2 no-scrollbar">
        {quickPrompts.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(chip)}
            className="text-[11px] whitespace-nowrap px-3.5 py-1.5 rounded-xl bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 font-medium transition-colors shadow-xs"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Field */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 pt-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tell coach to start workouts, change settings, schedule, or rebalance..."
          className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 transition-colors placeholder:text-zinc-400 shadow-xs"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="p-3.5 bg-zinc-950 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 disabled:opacity-40 font-black rounded-2xl transition-all shadow-xs active:scale-95"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
