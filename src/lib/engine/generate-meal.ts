import type { Cereal, Protein, Vegetable, Meal } from '$lib/types';
import { pickRandom, pickN, type Rng } from './random';

export interface MealConstraints {
  excludeProtein?: string;
  excludeCereal?: string;
}

export function generateMeal(
  cereals: Cereal[],
  proteins: Protein[],
  vegetables: Vegetable[],
  rng: Rng,
  constraints: MealConstraints = {}
): Meal {
  const availCereals = constraints.excludeCereal
    ? cereals.filter(c => c.id !== constraints.excludeCereal)
    : cereals;

  const availProteins = constraints.excludeProtein
    ? proteins.filter(p => p.id !== constraints.excludeProtein)
    : proteins;

  const cereal = pickRandom(availCereals, rng);
  const protein = pickRandom(availProteins, rng);
  const vegCount = 2 + Math.floor(rng() * 3); // 2, 3, or 4
  const selectedVegs = pickN(vegetables, vegCount, rng);

  return {
    cereal: cereal.id,
    protein: protein.id,
    vegetables: selectedVegs.map(v => v.id),
  };
}
