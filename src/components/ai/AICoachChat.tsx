'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Loader2 
} from 'lucide-react';
import { useWorkoutStore } from '@/hooks/useWorkoutStore';
import { AICoachMessage } from '@/lib/types';

export function AICoachChat() {
  const { 
    scheduledWorkouts, 
    completedSessions, 
    personalRecords,
    user 
  } = useWorkoutStore();

  const [messages, setMessages] = useState<AICoachMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello ${user.displayName.split(' ')[0]}! I'm your ApexStrength AI Coach. I analyze your progressive overload, recovery intervals, and volume history.\n\nAsk me anything about today's workout, your progression, or recovery!`,
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
    'What should I train today?',
    'Why did my bench recommendation increase?',
    'I only have 30 minutes today.',
    'I missed yesterday\'s Pull workout. What should I do?',
    'How has my squat improved?',
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
            weekWorkouts: scheduledWorkouts.slice(0, 7),
            recentSessions: completedSessions.slice(0, 3),
            personalRecords: personalRecords.slice(0, 5),
          },
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          const assistantMsg: AICoachMessage = {
            id: `reply-${Date.now()}`,
            role: 'assistant',
            content: json.reply,
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
              Deterministic Progressive Overload + GPT-4o Coaching
            </span>
          </div>
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
            <span>AI Coach is analyzing your training data...</span>
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
          placeholder="Ask your coach anything about lifting, recovery, or targets..."
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
