/**
 * 1RM (One Rep Max) Mathematical Formulas
 */

// Brzycki formula: 1RM = Weight / (1.0278 - 0.0278 * Reps)
export function calculateBrzycki(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  if (reps >= 37) return weight; // Boundary safety
  return Math.round((weight * (36 / (37 - reps))) * 10) / 10;
}

// Epley formula: 1RM = Weight * (1 + Reps / 30)
export function calculateEpley(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  return Math.round((weight * (1 + reps / 30)) * 10) / 10;
}

// Composite / Standard estimated 1RM (average of Epley and Brzycki for rep ranges <= 12)
export function estimateOneRepMax(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  const epley = calculateEpley(weight, reps);
  const brzycki = calculateBrzycki(weight, reps);
  return Math.round(((epley + brzycki) / 2) * 10) / 10;
}

// Calculate percentages of 1RM
export function getPercentageTable(oneRepMax: number): Array<{ percentage: number; weight: number }> {
  const pcts = [95, 90, 85, 80, 75, 70, 65, 60, 55, 50];
  return pcts.map(pct => ({
    percentage: pct,
    weight: Math.round((oneRepMax * (pct / 100)) * 2) / 2, // rounded to nearest 0.5
  }));
}
