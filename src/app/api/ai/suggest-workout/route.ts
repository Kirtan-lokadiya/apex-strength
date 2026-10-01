import { NextRequest, NextResponse } from 'next/server';
import { MuscleGroup, PlannedExercise, WeightUnit } from '@/lib/types';

interface SuggestWorkoutRequestBody {
  focus?: string;
  date?: string;
  availableExercises?: Array<{ id: string; name: string; primaryMuscle: MuscleGroup; equipment: string }>;
  unit?: WeightUnit;
  durationMinutes?: number;
}

export async function POST(req: NextRequest) {
  try {
    const body: SuggestWorkoutRequestBody = await req.json();
    const {
      focus = 'auto',
      date = new Date().toISOString().split('T')[0],
      availableExercises = [],
      unit = 'kg',
      durationMinutes = 50,
    } = body;

    const apiKey = process.env.OPENAI_API_KEY;

    // Deterministic fallback templates
    const fallbackTemplates: Record<string, { name: string; muscles: MuscleGroup[]; exercises: string[] }> = {
      push: {
        name: 'Push Power & Hypertrophy',
        muscles: ['Chest', 'Shoulders', 'Triceps'],
        exercises: ['Barbell Bench Press', 'Overhead Press', 'Incline Dumbbell Press', 'Triceps Rope Pushdown', 'Lateral Raise'],
      },
      pull: {
        name: 'Pull Width & Thickness',
        muscles: ['Back', 'Biceps'],
        exercises: ['Barbell Deadlift', 'Barbell Row', 'Lat Pulldown', 'Dumbbell Bicep Curl', 'Face Pull'],
      },
      legs: {
        name: 'Leg Quad & Hamstring Focus',
        muscles: ['Quads', 'Hamstrings', 'Glutes', 'Calves'],
        exercises: ['Barbell Back Squat', 'Romanian Deadlift', 'Leg Press', 'Lying Leg Curl', 'Standing Calf Raise'],
      },
      upper: {
        name: 'Upper Body Hypertrophy',
        muscles: ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps'],
        exercises: ['Barbell Bench Press', 'Barbell Row', 'Overhead Press', 'Dumbbell Bicep Curl', 'Triceps Rope Pushdown'],
      },
      full: {
        name: 'Full Body Express',
        muscles: ['Chest', 'Back', 'Quads', 'Hamstrings', 'Shoulders'],
        exercises: ['Barbell Back Squat', 'Barbell Bench Press', 'Barbell Row', 'Overhead Press'],
      },
      auto: {
        name: 'Targeted Strength Split',
        muscles: ['Chest', 'Shoulders', 'Triceps'],
        exercises: ['Barbell Bench Press', 'Incline Dumbbell Press', 'Overhead Press', 'Triceps Rope Pushdown'],
      },
    };

    const normalizedFocus = focus.toLowerCase().includes('pull')
      ? 'pull'
      : focus.toLowerCase().includes('leg')
      ? 'legs'
      : focus.toLowerCase().includes('upper')
      ? 'upper'
      : focus.toLowerCase().includes('full')
      ? 'full'
      : focus.toLowerCase().includes('push')
      ? 'push'
      : 'auto';

    const selectedTemplate = fallbackTemplates[normalizedFocus] || fallbackTemplates.auto;

    // AI generation path
    if (apiKey && apiKey !== 'your-openai-api-key') {
      try {
        const exerciseLibraryNames = availableExercises.map(e => `${e.name} (${e.primaryMuscle}, ${e.equipment})`).join(', ');

        const systemPrompt = `You are an elite strength conditioning coach. Design a scientifically optimized workout session.
Format: strictly valid JSON matching this schema:
{
  "programDayName": string,
  "estimatedDurationMinutes": number,
  "muscleGroups": string[],
  "plannedExercises": [
    {
      "exerciseName": string,
      "sets": number,
      "repMin": number,
      "repMax": number,
      "targetRir": number,
      "recommendedWeight": number,
      "progressionReason": string
    }
  ]
}

Available Exercise Library:
${exerciseLibraryNames}

Requirements:
- Target 4 to 6 exercises.
- Focus: ${focus}
- Unit: ${unit}
- Progressive compound lifts first, isolation accessories last.
- Use realistic starting working weights (${unit}).
- Only return JSON.`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'system', content: systemPrompt }],
            response_format: { type: 'json_object' },
            temperature: 0.4,
          }),
        });

        if (response.ok) {
          const json = await response.json();
          const parsed = JSON.parse(json.choices[0].message.content);

          // Map exercise names to library IDs
          const planned: PlannedExercise[] = parsed.plannedExercises.map((pe: any) => {
            const matched = availableExercises.find(
              e => e.name.toLowerCase() === pe.exerciseName.toLowerCase() ||
                   e.name.toLowerCase().includes(pe.exerciseName.toLowerCase())
            );
            return {
              exerciseId: matched?.id || `custom-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              exerciseName: pe.exerciseName,
              sets: Number(pe.sets) || 3,
              repMin: Number(pe.repMin) || 8,
              repMax: Number(pe.repMax) || 10,
              targetRir: Number(pe.targetRir) || 2,
              recommendedWeight: Number(pe.recommendedWeight) || (unit === 'kg' ? 50 : 115),
              unit,
              progressionReason: pe.progressionReason || 'Recommended by AI Coach for optimal hypertrophy.',
            };
          });

          return NextResponse.json({
            success: true,
            data: {
              programDayName: parsed.programDayName || selectedTemplate.name,
              estimatedDurationMinutes: Number(parsed.estimatedDurationMinutes) || durationMinutes,
              muscleGroups: parsed.muscleGroups || selectedTemplate.muscles,
              plannedExercises: planned,
            },
            fromAI: true,
          });
        }
      } catch (aiErr) {
        console.warn('AI workout suggestion failed, falling back to deterministic template:', aiErr);
      }
    }

    // Deterministic fallback execution
    const fallbackPlanned: PlannedExercise[] = selectedTemplate.exercises.map((exName, idx) => {
      const matched = availableExercises.find(e => e.name.toLowerCase() === exName.toLowerCase());
      const isBarbell = matched?.equipment === 'Barbell' || exName.includes('Barbell') || exName.includes('Squat') || exName.includes('Deadlift');
      const isDumbbell = matched?.equipment === 'Dumbbell' || exName.includes('Dumbbell');

      return {
        exerciseId: matched?.id || `ex-${idx}`,
        exerciseName: matched?.name || exName,
        sets: idx === 0 ? 4 : 3,
        repMin: idx === 0 ? 6 : 8,
        repMax: idx === 0 ? 8 : 12,
        targetRir: 2,
        recommendedWeight: isBarbell ? (unit === 'kg' ? 60 : 135) : isDumbbell ? (unit === 'kg' ? 20 : 45) : (unit === 'kg' ? 30 : 65),
        unit,
        progressionReason: idx === 0 ? 'Primary compound lift for maximal mechanical tension' : 'Secondary accessory for metabolic stress and volume',
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        programDayName: selectedTemplate.name,
        estimatedDurationMinutes: durationMinutes,
        muscleGroups: selectedTemplate.muscles,
        plannedExercises: fallbackPlanned,
      },
      fromAI: false,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to suggest workout';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
