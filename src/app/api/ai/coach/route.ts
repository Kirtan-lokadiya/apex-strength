import { NextRequest, NextResponse } from 'next/server';
import { AI_STRENGTH_COACH_SYSTEM_PROMPT } from '@/lib/ai/systemPrompts';
import { ScheduledWorkout, WorkoutSession, PersonalRecord } from '@/lib/types';

const COACH_MCP_TOOLS = [
  {
    type: 'function' as const,
    function: {
      name: 'reschedule_workout',
      description: 'Moves or reschedules an existing scheduled workout to a new date and/or time on the user calendar.',
      parameters: {
        type: 'object',
        properties: {
          workoutId: { type: 'string', description: 'The ID of the scheduled workout to move' },
          workoutName: { type: 'string', description: 'Name of the workout being moved' },
          newDate: { type: 'string', description: 'Target date in YYYY-MM-DD format' },
          newTime: { type: 'string', description: 'Target time in HH:MM format (e.g. 18:30)' },
          reason: { type: 'string', description: 'Reason for moving the workout' },
        },
        required: ['workoutId', 'newDate'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'create_workout',
      description: 'Schedules a brand new workout on the calendar with planned exercises.',
      parameters: {
        type: 'object',
        properties: {
          programDayName: { type: 'string', description: 'Name of the workout (e.g. Push Day A, Leg Hypertrophy)' },
          scheduledDate: { type: 'string', description: 'Date in YYYY-MM-DD format' },
          scheduledTime: { type: 'string', description: 'Time in HH:MM format (default: 18:30)' },
          estimatedDurationMinutes: { type: 'number', description: 'Duration in minutes (e.g. 45)' },
          muscleGroups: { type: 'array', items: { type: 'string' }, description: 'Muscle groups trained' },
          plannedExercises: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                exerciseName: { type: 'string' },
                sets: { type: 'number' },
                repMin: { type: 'number' },
                repMax: { type: 'number' },
                targetRir: { type: 'number' },
                recommendedWeight: { type: 'number' },
              },
              required: ['exerciseName', 'sets', 'repMin', 'repMax'],
            },
          },
        },
        required: ['programDayName', 'scheduledDate', 'plannedExercises'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'delete_workout',
      description: 'Deletes or removes a scheduled workout from the calendar.',
      parameters: {
        type: 'object',
        properties: {
          workoutId: { type: 'string', description: 'The ID of the scheduled workout to delete' },
          workoutName: { type: 'string', description: 'Name of the workout' },
        },
        required: ['workoutId'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'skip_workout',
      description: 'Marks a scheduled workout as skipped.',
      parameters: {
        type: 'object',
        properties: {
          workoutId: { type: 'string', description: 'The ID of the scheduled workout to skip' },
          reason: { type: 'string', description: 'Reason for skipping' },
        },
        required: ['workoutId'],
      },
    },
  },
];

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
      let toolCall: { name: string; args: any } | null = null;

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      if (lower.includes('reschedule') || lower.includes('move to tomorrow') || lower.includes('postpone')) {
        const targetWorkout = userContext?.todayWorkout || userContext?.weekWorkouts?.[0];
        if (targetWorkout) {
          toolCall = {
            name: 'reschedule_workout',
            args: {
              workoutId: targetWorkout.id,
              workoutName: targetWorkout.programDayName,
              newDate: tomorrowStr,
              newTime: targetWorkout.scheduledTime || '18:30',
              reason: 'Requested via AI Coach chat',
            },
          };
          responseText = `I've rescheduled **${targetWorkout.programDayName}** to tomorrow (${tomorrowStr}) at ${targetWorkout.scheduledTime || '18:30'}.`;
        } else {
          responseText = "I couldn't find a scheduled workout to move. Check your calendar to verify dates!";
        }
      } else if (lower.includes('today') || lower.includes('train today') || lower.includes('what should i do')) {
        if (userContext?.todayWorkout) {
          const exNames = userContext.todayWorkout.plannedExercises.map(e => `${e.exerciseName} (${e.sets}×${e.repMin}-${e.repMax} @ ${e.recommendedWeight}kg)`).join(', ');
          responseText = `Today is **${userContext.todayWorkout.programDayName}** (${userContext.todayWorkout.scheduledTime || 'Flexible'}).\n\nTarget Exercises:\n${exNames}\n\nEstimated time: ${userContext.todayWorkout.estimatedDurationMinutes} mins. Ready to get after it?`;
        } else {
          responseText = "You don't have a scheduled workout today! It's a planned rest/recovery day. If you want to train, ask me to schedule a workout or check your Calendar!";
        }
      } else if (lower.includes('bench') || lower.includes('recommendation') || lower.includes('increase') || lower.includes('why did')) {
        responseText = "Weight recommendations follow progressive overload rules: when you hit the top of your target rep range across all working sets with >= 2 Reps In Reserve (RIR), the engine increments the weight by 2.5 kg (barbell) or 2.0 kg (dumbbell).";
      } else if (lower.includes('30 min') || lower.includes('short') || lower.includes('time')) {
        responseText = "If you only have 30 minutes, I recommend switching to an Express session: prioritize your first 2 compound exercises for 3 working sets each, drop the isolation accessories, and keep rest intervals strictly at 90 seconds.";
      } else {
        responseText = `I'm your ApexStrength AI Coach! You can ask me to move workouts (*"Move my next workout to tomorrow"*), schedule new sessions, or analyze your recovery.\n\nYou said: "${latestUserMessage}".`;
      }

      return NextResponse.json({
        success: true,
        reply: responseText,
        toolCall,
        fromAI: false,
      });
    }

    // Call OpenAI with MCP Tool definitions and training context
    const systemMessageWithContext = `${AI_STRENGTH_COACH_SYSTEM_PROMPT}

AVAILABLE MCP TOOLS:
You have tools to directly query, create, reschedule, or remove workouts from the calendar.
When the user asks you to reschedule, move, cancel, delete, or create a workout, YOU MUST CALL the appropriate tool.

USER TRAINING CONTEXT:
- Today's Date: ${new Date().toISOString().split('T')[0]}
- Today's Scheduled Workout: ${JSON.stringify(userContext?.todayWorkout || null)}
- Week Workouts (IDs and dates): ${JSON.stringify(userContext?.weekWorkouts?.map(w => ({ id: w.id, name: w.programDayName, date: w.scheduledDate, time: w.scheduledTime, muscles: w.muscleGroups })) || [])}
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
        tools: COACH_MCP_TOOLS,
        tool_choice: 'auto',
        temperature: 0.3,
      }),
    });

    if (!chatResponse.ok) {
      throw new Error(`OpenAI API status ${chatResponse.status}`);
    }

    const chatJson = await chatResponse.json();
    const choice = chatJson.choices[0];
    const rawToolCall = choice.message?.tool_calls?.[0];

    let toolCall: { name: string; args: any } | null = null;
    let reply = choice.message?.content || '';

    if (rawToolCall && rawToolCall.function) {
      try {
        const parsedArgs = JSON.parse(rawToolCall.function.arguments);
        toolCall = {
          name: rawToolCall.function.name,
          args: parsedArgs,
        };

        if (!reply) {
          if (toolCall.name === 'reschedule_workout') {
            reply = `I have updated your schedule! Moved **${toolCall.args.workoutName || 'your workout'}** to **${toolCall.args.newDate}** at **${toolCall.args.newTime || '18:30'}**.`;
          } else if (toolCall.name === 'create_workout') {
            reply = `Scheduled **${toolCall.args.programDayName}** on **${toolCall.args.scheduledDate}** at **${toolCall.args.scheduledTime || '18:30'}** with ${toolCall.args.plannedExercises?.length || 0} exercises!`;
          } else if (toolCall.name === 'delete_workout') {
            reply = `Removed **${toolCall.args.workoutName || 'the workout'}** from your calendar.`;
          } else if (toolCall.name === 'skip_workout') {
            reply = `Marked **${toolCall.args.workoutName || 'the workout'}** as skipped. Recovery is key for growth!`;
          }
        }
      } catch (err) {
        console.warn('Failed to parse tool call arguments:', err);
      }
    }

    return NextResponse.json({
      success: true,
      reply,
      toolCall,
      fromAI: true,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Coach failed to reply';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
