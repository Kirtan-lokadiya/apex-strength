import { NextRequest, NextResponse } from 'next/server';
import { calculateDeterministicRecommendation } from '@/lib/engine/progression';
import { getAIWeightRecommendation } from '@/lib/ai/openaiClient';
import { EquipmentType, WeightUnit } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      exerciseId,
      exerciseName,
      equipment = 'Barbell' as EquipmentType,
      unit = 'kg' as WeightUnit,
      targetSets = 3,
      repMin = 8,
      repMax = 10,
      targetRir = 2,
      currentWeight = 60,
      recentSessions = [],
      availableWeights = [],
    } = body;

    // 1. Layer 1: Deterministic Engine calculation
    const deterministicRec = calculateDeterministicRecommendation({
      exerciseId,
      exerciseName,
      equipment,
      unit,
      targetSets,
      repMin,
      repMax,
      targetRir,
      currentWeight,
      recentSessions,
    });

    // 2. Prepare payload for Layer 2 AI evaluation
    const defaultAvailableWeights = availableWeights.length > 0 
      ? availableWeights 
      : Array.from({ length: 40 }, (_, i) => 20 + i * (unit === 'kg' ? 2.5 : 5));

    const aiPayload = {
      exercise: exerciseName || exerciseId,
      unit,
      target: {
        sets: targetSets,
        rep_min: repMin,
        rep_max: repMax,
        target_rir: targetRir,
      },
      available_weights: defaultAvailableWeights,
      recent_sessions: recentSessions.slice(0, 5), // Keep tokens low
      deterministic_recommendation: deterministicRec,
    };

    // 3. Layer 2: OpenAI evaluation with server-side validation & cache
    const { recommendation, fromAI } = await getAIWeightRecommendation(aiPayload);

    return NextResponse.json({
      success: true,
      data: recommendation,
      fromAI,
      deterministicBaseline: deterministicRec,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to calculate recommendation';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
