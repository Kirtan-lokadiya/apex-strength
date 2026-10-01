import type { WeightUnit } from '../types/index.ts';

export interface PlateBreakdown {
  targetWeight: number;
  barWeight: number;
  weightPerSide: number;
  platesPerSide: Array<{ weight: number; count: number }>;
  remainder: number;
  exactMatch: boolean;
}

export const DEFAULT_PLATES_KG = [25, 20, 15, 10, 5, 2.5, 1.25];
export const DEFAULT_PLATES_LB = [45, 35, 25, 10, 5, 2.5];

export function calculatePlates(
  targetWeight: number,
  unit: WeightUnit = 'kg',
  customBarWeight?: number,
  customAvailablePlates?: number[]
): PlateBreakdown {
  const barWeight = customBarWeight ?? (unit === 'kg' ? 20 : 45);
  const availablePlates = (customAvailablePlates && customAvailablePlates.length > 0)
    ? [...customAvailablePlates].sort((a, b) => b - a)
    : (unit === 'kg' ? DEFAULT_PLATES_KG : DEFAULT_PLATES_LB);

  if (targetWeight <= barWeight) {
    return {
      targetWeight,
      barWeight,
      weightPerSide: 0,
      platesPerSide: [],
      remainder: 0,
      exactMatch: targetWeight === barWeight,
    };
  }

  let weightPerSide = (targetWeight - barWeight) / 2;
  const initialPerSide = weightPerSide;
  const platesPerSide: Array<{ weight: number; count: number }> = [];

  for (const plate of availablePlates) {
    if (weightPerSide >= plate) {
      const count = Math.floor(weightPerSide / plate);
      platesPerSide.push({ weight: plate, count });
      weightPerSide = Math.round((weightPerSide - count * plate) * 100) / 100;
    }
  }

  return {
    targetWeight,
    barWeight,
    weightPerSide: initialPerSide,
    platesPerSide,
    remainder: Math.round(weightPerSide * 2 * 100) / 100,
    exactMatch: weightPerSide === 0,
  };
}
