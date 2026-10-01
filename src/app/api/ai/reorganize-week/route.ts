import { NextRequest, NextResponse } from 'next/server';
import { generateAdaptiveWeekProposal } from '@/lib/engine/adaptiveScheduler';
import { AI_STRENGTH_COACH_SYSTEM_PROMPT } from '@/lib/ai/systemPrompts';
import { ScheduledWorkout } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { missedWorkout, currentWeekWorkouts, todayStr } = body as {
      missedWorkout: ScheduledWorkout;
      currentWeekWorkouts: ScheduledWorkout[];
      todayStr: string;
    };

    if (!missedWorkout || !currentWeekWorkouts) {
      return NextResponse.json({ success: false, error: 'Missing missedWorkout or currentWeekWorkouts' }, { status: 400 });
    }

    // 1. Layer 1: Run deterministic adaptive recovery schedule logic
    const deterministicProposal = generateAdaptiveWeekProposal(
      missedWorkout,
      currentWeekWorkouts,
      todayStr || new Date().toISOString().split('T')[0]
    );

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === 'your-openai-api-key') {
      return NextResponse.json({
        success: true,
        data: deterministicProposal,
        fromAI: false,
      });
    }

    // 2. Layer 2: Optional OpenAI explanation enrichment
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: AI_STRENGTH_COACH_SYSTEM_PROMPT },
            {
              role: 'user',
              content: `Review the following adaptive reschedule proposal for a missed workout and refine the summary and reasons to be encouraging, concise, and coach-like.
Current Proposal:
${JSON.stringify(deterministicProposal, null, 2)}

Respond ONLY in JSON matching:
{
  "summary": string,
  "changes": Array<{ "workout_id": string, "old_date": string, "new_date": string, "reason": string }>,
  "warnings": string[]
}`,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.2,
        }),
      });

      if (response.ok) {
        const json = await response.json();
        const aiOutput = JSON.parse(json.choices[0].message.content);
        return NextResponse.json({
          success: true,
          data: {
            ...deterministicProposal,
            summary: aiOutput.summary || deterministicProposal.summary,
            changes: aiOutput.changes || deterministicProposal.changes,
            warnings: aiOutput.warnings || deterministicProposal.warnings,
          },
          fromAI: true,
        });
      }
    } catch (e) {
      console.warn('AI call failed during reschedule proposal, returning deterministic:', e);
    }

    return NextResponse.json({
      success: true,
      data: deterministicProposal,
      fromAI: false,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to reorganize week';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
