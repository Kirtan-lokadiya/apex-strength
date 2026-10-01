import { AIWeightRecommendation, DeterministicRecommendation } from '../types';
import { AI_STRENGTH_COACH_SYSTEM_PROMPT } from './systemPrompts';

// Simple in-memory response cache for server lifetime
const responseCache = new Map<string, { data: AIWeightRecommendation; timestamp: number }>();
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour

export function generateInputHash(input: unknown): string {
  return Buffer.from(JSON.stringify(input)).toString('base64').slice(0, 32);
}

export async function getAIWeightRecommendation(
  payload: {
    exercise: string;
    unit: string;
    target: { sets: number; rep_min: number; rep_max: number; target_rir: number };
    available_weights: number[];
    recent_sessions: Array<{ date: string; sets: Array<{ weight: number; reps: number; rir?: number }> }>;
    deterministic_recommendation: DeterministicRecommendation;
  }
): Promise<{ recommendation: AIWeightRecommendation; fromAI: boolean }> {
  const apiKey = process.env.OPENAI_API_KEY;
  const hash = generateInputHash(payload);

  // Check cache
  const cached = responseCache.get(hash);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    return { recommendation: cached.data, fromAI: true };
  }

  // Graceful fallback if no OpenAI API key is configured
  if (!apiKey || apiKey === 'your-openai-api-key') {
    const det = payload.deterministic_recommendation;
    const fallback: AIWeightRecommendation = {
      recommended_weight: det.recommendedWeight,
      target_sets: det.targetSets,
      target_reps: det.targetReps,
      target_rir: det.targetRir,
      confidence: det.confidence,
      action: det.action === 'initial' ? 'maintain' : det.action,
      reason: `${det.reason} (Standard deterministic progression engine applied; add OPENAI_API_KEY in settings to enable live AI coaching commentary).`,
      warnings: [],
    };
    return { recommendation: fallback, fromAI: false };
  }

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
            content: `Evaluate the following training progression payload and respond in valid JSON matching this schema:
{
  "recommended_weight": number,
  "target_sets": number,
  "target_reps": number[],
  "target_rir": number,
  "confidence": "high" | "medium" | "low",
  "action": "increase" | "maintain" | "decrease",
  "reason": string,
  "warnings": string[]
}

Payload:
${JSON.stringify(payload, null, 2)}`,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API responded with status ${response.status}`);
    }

    const json = await response.json();
    const parsed = JSON.parse(json.choices[0].message.content) as AIWeightRecommendation;

    // Server-side validation: Ensure recommended weight is in available weights or valid increment
    if (!payload.available_weights.includes(parsed.recommended_weight) && payload.available_weights.length > 0) {
      // Snap to closest available weight
      let closest = payload.available_weights[0];
      let minDiff = Math.abs(parsed.recommended_weight - closest);
      for (const w of payload.available_weights) {
        const diff = Math.abs(parsed.recommended_weight - w);
        if (diff < minDiff) {
          minDiff = diff;
          closest = w;
        }
      }
      parsed.recommended_weight = closest;
    }

    responseCache.set(hash, { data: parsed, timestamp: Date.now() });
    return { recommendation: parsed, fromAI: true };
  } catch (error) {
    console.warn('OpenAI call failed, falling back to deterministic progression:', error);
    const det = payload.deterministic_recommendation;
    return {
      recommendation: {
        recommended_weight: det.recommendedWeight,
        target_sets: det.targetSets,
        target_reps: det.targetReps,
        target_rir: det.targetRir,
        confidence: 'high',
        action: det.action === 'initial' ? 'maintain' : det.action,
        reason: `${det.reason} (Deterministic fallback: live AI commentary currently unavailable).`,
        warnings: [],
      },
      fromAI: false,
    };
  }
}
