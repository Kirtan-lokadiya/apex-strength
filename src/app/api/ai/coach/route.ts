import { NextRequest, NextResponse } from 'next/server';
import { AI_STRENGTH_COACH_SYSTEM_PROMPT } from '@/lib/ai/systemPrompts';
import { ScheduledWorkout, WorkoutSession, PersonalRecord } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      messages, 
      userContext 
    } = body as {
      messages: Array<{ role: 'user' | 'assistant'; content: string }>;
      userContext?: {
        todayWorkout?: ScheduledWorkout | null;
        weekWorkouts?: ScheduledWorkout[];
        recentSessions?: WorkoutSession[];
        personalRecords?: PersonalRecord[];
      };
    };

    const latestUserMessage = messages[messages.length - 1]?.content || '';
    const apiKey = process.env.OPENAI_API_KEY;

    // Deterministic rule-based assistant fallback if OpenAI key is not provided
    if (!apiKey || apiKey === 'your-openai-api-key') {
      const lower = latestUserMessage.toLowerCase();
      let responseText = '';

      if (lower.includes('today') || lower.includes('train today') || lower.includes('what should i do')) {
        if (userContext?.todayWorkout) {
          const exNames = userContext.todayWorkout.plannedExercises.map(e => `${e.exerciseName} (${e.sets}×${e.repMin}-${e.repMax} @ ${e.recommendedWeight}kg)`).join(', ');
          responseText = `Today is **${userContext.todayWorkout.programDayName}** (${userContext.todayWorkout.scheduledTime || 'Flexible'}).\n\nTarget Exercises:\n${exNames}\n\nEstimated time: ${userContext.todayWorkout.estimatedDurationMinutes} mins. Ready to get after it?`;
        } else {
          responseText = "You don't have a scheduled workout today! It's a planned rest/recovery day. If you want to train, check your Calendar tab to pull an upcoming session forward or add an ad-hoc workout.";
        }
      } else if (lower.includes('bench') || lower.includes('recommendation') || lower.includes('increase') || lower.includes('why did')) {
        responseText = "Weight recommendations follow progressive overload rules: when you hit the top of your target rep range across all working sets with >= 2 Reps In Reserve (RIR), the engine increments the weight by 2.5 kg (barbell) or 2.0 kg (dumbbell). If you missed reps in previous sessions, weight is maintained or deloaded by 10% after 2 consecutive failures.";
      } else if (lower.includes('30 min') || lower.includes('short') || lower.includes('time')) {
        responseText = "If you only have 30 minutes, I recommend switching to an Express session: prioritize your first 2 compound exercises for 3 working sets each, drop the isolation accessories, and keep rest intervals strictly at 90 seconds. You can select 'Do Shortened Workout' directly on your Today card!";
      } else if (lower.includes('missed') || lower.includes('skip') || lower.includes('yesterday')) {
        responseText = "Never worry about an occasional missed session! You have 4 clean options:\n1. **Move to today** if today is an open rest day.\n2. **Do a shortened 35-min session** today.\n3. **Skip it** and stay on rhythm with your weekly split.\n4. **Let me reorganize the week** to avoid back-to-back fatigue on the same muscle groups.";
      } else {
        responseText = `I'm your ApexStrength AI Coach! I'm monitoring your progressive overload, weekly recovery intervals, and volume.\n\nYou asked: "${latestUserMessage}".\n\n*(Note: Add your free OPENAI_API_KEY in Settings to unlock deep conversational GPT-4o analysis and custom program design!)*`;
      }

      return NextResponse.json({
        success: true,
        reply: responseText,
        fromAI: false,
      });
    }

    // Call OpenAI with strict system prompt and user context
    const systemMessageWithContext = `${AI_STRENGTH_COACH_SYSTEM_PROMPT}

USER TRAINING CONTEXT:
- Today's Date: ${new Date().toISOString().split('T')[0]}
- Today's Scheduled Workout: ${JSON.stringify(userContext?.todayWorkout || null)}
- Week Workouts: ${JSON.stringify(userContext?.weekWorkouts || [])}
- Recent Completed Sessions (last 3): ${JSON.stringify(userContext?.recentSessions?.slice(0, 3) || [])}
- Personal Records: ${JSON.stringify(userContext?.personalRecords?.slice(0, 5) || [])}
`;

    const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemMessageWithContext },
          ...messages.slice(-6), // Keep history compact
        ],
        temperature: 0.3,
      }),
    });

    if (!chatResponse.ok) {
      throw new Error(`OpenAI API status ${chatResponse.status}`);
    }

    const chatJson = await chatResponse.json();
    const reply = chatJson.choices[0].message.content;

    return NextResponse.json({
      success: true,
      reply,
      fromAI: true,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Coach failed to reply';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
