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
      name: 'start_workout',
      description: 'Starts an active live workout session right now and navigates the user to the active workout screen.',
      parameters: {
        type: 'object',
        properties: {
          workoutId: { type: 'string', description: 'The ID of the scheduled workout to start. If omitted, starts today scheduled workout or freestyle.' },
          workoutName: { type: 'string', description: 'Name of the workout to start' },
        },
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'update_preferences',
      description: 'Updates user settings such as weight units (kg or lb), default rest interval timer seconds, hydration interval, or week start day.',
      parameters: {
        type: 'object',
        properties: {
          unit: { type: 'string', enum: ['kg', 'lb'], description: 'Weight unit: kg or lb' },
          defaultRestDurationSeconds: { type: 'number', description: 'Default rest duration in seconds (e.g. 90, 120)' },
          hydrationIntervalMinutes: { type: 'number', description: 'Hydration reminder interval in minutes (e.g. 15, 20, 30)' },
          weekStartsOn: { type: 'string', enum: ['monday', 'sunday'], description: 'First day of the calendar week' },
        },
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'add_custom_exercise',
      description: 'Creates and registers a brand new custom exercise into the user exercise library.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Name of the exercise (e.g. Incline Cable Fly)' },
          primaryMuscle: { type: 'string', description: 'Primary muscle group (Chest, Back, Shoulders, Quads, Hamstrings, Biceps, Triceps, Abs)' },
          equipment: { type: 'string', enum: ['Barbell', 'Dumbbell', 'Cable', 'Machine', 'Bodyweight'], description: 'Equipment type' },
          instructions: { type: 'string', description: 'Setup and execution tips' },
        },
        required: ['name', 'primaryMuscle', 'equipment'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'reorganize_entire_week',
      description: 'Analyzes the entire week and shifts remaining workouts forward or reorganizes them to resolve missed sessions and avoid consecutive fatigue.',
      parameters: {
        type: 'object',
        properties: {
          reason: { type: 'string', description: 'Reason for reorganizing the week' },
        },
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

      if (lower.includes('start workout') || lower.includes('begin workout') || lower.includes('start today') || lower.includes('train now')) {
        const target = userContext?.todayWorkout || userContext?.weekWorkouts?.[0];
        toolCall = {
          name: 'start_workout',
          args: {
            workoutId: target?.id,
            workoutName: target?.programDayName || 'Freestyle Workout',
          },
        };
        responseText = `Starting **${target?.programDayName || "today's workout"}** now! Let's get after it.`;
      } else if (lower.includes('switch to lb') || lower.includes('switch to pounds') || lower.includes('use lb')) {
        toolCall = {
          name: 'update_preferences',
          args: { unit: 'lb' },
        };
        responseText = "I've switched your weight units to **pounds (lb)** across the app!";
      } else if (lower.includes('switch to kg') || lower.includes('switch to kilograms') || lower.includes('use kg')) {
        toolCall = {
          name: 'update_preferences',
          args: { unit: 'kg' },
        };
        responseText = "I've switched your weight units to **kilograms (kg)** across the app!";
      } else if (lower.includes('reorganize') || lower.includes('rebalance')) {
        toolCall = {
          name: 'reorganize_entire_week',
          args: { reason: 'Weekly rebalance requested via AI Coach' },
        };
        responseText = "I've reorganized your weekly training schedule to ensure proper recovery between splits!";
      } else if (lower.includes('reschedule') || lower.includes('move to tomorrow') || lower.includes('postpone')) {
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
          responseText = "You don't have a scheduled workout today! It's a planned rest/recovery day. If you want to train, ask me to schedule a workout or start a freestyle session!";
        }
      } else {
        responseText = `I'm your ApexStrength AI Coach! You can ask me to move workouts (*"Move my next workout to tomorrow"*), start workouts (*"Start workout now"*), switch units (*"Switch to lbs"*), or add custom exercises.\n\nYou said: "${latestUserMessage}".`;
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
You have complete control tools to manage the entire application:
- reschedule_workout: move workouts to new date/time
- create_workout: add new scheduled sessions with planned exercises
- start_workout: launch live workout screen right now
- update_preferences: update weight unit (kg/lb), rest timers, or hydration intervals
- add_custom_exercise: add new exercises to the library
- reorganize_entire_week: rebalance week schedule
- delete_workout: remove sessions
- skip_workout: mark as skipped

When the user asks to perform ANY of these actions, YOU MUST CALL the appropriate tool.

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
          } else if (toolCall.name === 'start_workout') {
            reply = `Starting **${toolCall.args.workoutName || "today's session"}** now! Redirecting you to the workout floor...`;
          } else if (toolCall.name === 'update_preferences') {
            const updates = [];
            if (toolCall.args.unit) updates.push(`unit to **${toolCall.args.unit}**`);
            if (toolCall.args.defaultRestDurationSeconds) updates.push(`rest timer to **${toolCall.args.defaultRestDurationSeconds}s**`);
            if (toolCall.args.hydrationIntervalMinutes) updates.push(`hydration alert to **${toolCall.args.hydrationIntervalMinutes}m**`);
            reply = `Updated your preferences: ${updates.join(', ')}!`;
          } else if (toolCall.name === 'add_custom_exercise') {
            reply = `Added **${toolCall.args.name}** (${toolCall.args.primaryMuscle}, ${toolCall.args.equipment}) to your exercise library!`;
          } else if (toolCall.name === 'reorganize_entire_week') {
            reply = "Reorganized your weekly training schedule to optimize recovery intervals and resolve missed sessions!";
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
