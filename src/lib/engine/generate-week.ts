import type { Cereal, Protein, Vegetable, FrequencyTarget, Meal, DayPlan, WeekPlan, ProteinGroup, AllergenTag, Season } from '$lib/types';
import { createRng, shuffle, pickRandom, pickN, type Rng } from './random';
import { filterCereals, filterProteins, filterVegetables } from './filter';
import { frequencyTargets } from '$lib/data/proteins';

export interface WeekGenerationContext {
  cereals: Cereal[];
  proteins: Protein[];
  vegetables: Vegetable[];
  babyAgeMonths: number;
  allergens: AllergenTag[];
  season: Season;
  previousWeek: WeekPlan | null;
  seed: number;
}

/**
 * Allocate exactly 14 protein-group slots, starting from each group's min
 * and randomly distributing remaining slots among expandable groups.
 */
export function allocateGroupSlots(
  targets: FrequencyTarget[],
  rng: Rng
): Record<ProteinGroup, number> {
  const allocation = {} as Record<ProteinGroup, number>;
  for (const t of targets) {
    allocation[t.group] = t.min;
  }

  let total = Object.values(allocation).reduce((s, n) => s + n, 0);
  const TARGET_TOTAL = 14;

  while (total < TARGET_TOTAL) {
    const expandable = targets.filter(t => allocation[t.group] < t.max);
    if (expandable.length === 0) break;
    const chosen = expandable[Math.floor(rng() * expandable.length)];
    allocation[chosen.group]++;
    total++;
  }

  return allocation;
}

/**
 * When allergens remove entire protein groups, redistribute their slots
 * to remaining groups so they still sum to 14.
 */
export function adjustTargetsForAvailability(
  targets: FrequencyTarget[],
  availableGroups: Set<ProteinGroup>,
  rng: Rng
): FrequencyTarget[] {
  const available = targets.filter(t => availableGroups.has(t.group));
  if (available.length === 0) return available;

  // Check if current maxes can reach 14
  const maxSum = available.reduce((s, t) => s + t.max, 0);
  if (maxSum >= 14) return available;

  // Need to expand maxes to allow reaching 14
  const deficit = 14 - maxSum;
  const adjusted = available.map(t => ({ ...t }));

  // Distribute extra capacity round-robin
  let remaining = deficit;
  let idx = 0;
  while (remaining > 0) {
    adjusted[idx % adjusted.length].max++;
    remaining--;
    idx++;
  }

  return adjusted;
}

/**
 * Calculate ISO week key (e.g., "2026-W18") for a given date.
 */
export function getWeekKey(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  // Set to nearest Thursday (ISO weeks start Monday, so Thursday is mid-week)
  const dayNum = d.getUTCDay() || 7; // Make Sunday = 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const isoYear = d.getUTCFullYear();
  const yearStart = new Date(Date.UTC(isoYear, 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${isoYear}-W${String(weekNo).padStart(2, '0')}`;
}

/**
 * Get the Monday (start) of the week containing the given date.
 */
export function getWeekStart(date: Date): Date {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay();
  // Sunday = 0, so go back 6 days; otherwise go back (day - 1) days
  const diff = day === 0 ? 6 : day - 1;
  d.setUTCDate(d.getUTCDate() - diff);
  return d;
}

/**
 * Core week generation algorithm.
 */
export function generateWeek(ctx: WeekGenerationContext): WeekPlan {
  const rng = createRng(ctx.seed);

  // 1. Filter available ingredients
  const availCereals = filterCereals(ctx.cereals, ctx.babyAgeMonths, ctx.allergens);
  const availProteins = filterProteins(ctx.proteins, ctx.babyAgeMonths, ctx.allergens);
  const availVegetables = filterVegetables(ctx.vegetables, ctx.babyAgeMonths, ctx.season);

  // 2. Determine which protein groups are available
  const availableGroups = new Set<ProteinGroup>(availProteins.map(p => p.group));

  // 3. Adjust frequency targets for available groups
  const adjustedTargets = adjustTargetsForAvailability(frequencyTargets, availableGroups, rng);

  // 4. Allocate group slots (exactly 14)
  const allocation = allocateGroupSlots(adjustedTargets, rng);

  // 5. Build protein pool with rotation within each group
  const proteinPool: Protein[] = [];
  for (const group of Object.keys(allocation) as ProteinGroup[]) {
    const count = allocation[group];
    if (count === 0) continue;
    const groupProteins = shuffle(
      availProteins.filter(p => p.group === group),
      rng
    );
    if (groupProteins.length === 0) continue;
    for (let i = 0; i < count; i++) {
      proteinPool.push(groupProteins[i % groupProteins.length]);
    }
  }

  // 6. Shuffle the full pool
  const shuffledProteins = shuffle(proteinPool, rng);

  // 7. Resolve same-day protein conflicts (lunch and dinner can't be same variant)
  for (let day = 0; day < 7; day++) {
    const lunchIdx = day * 2;
    const dinnerIdx = day * 2 + 1;
    if (shuffledProteins[lunchIdx].id === shuffledProteins[dinnerIdx].id) {
      // Try to swap dinner with a later slot
      let swapped = false;
      for (let j = dinnerIdx + 1; j < shuffledProteins.length; j++) {
        if (shuffledProteins[j].id !== shuffledProteins[lunchIdx].id) {
          // Also check that swapping won't create a conflict for that day
          const otherDay = Math.floor(j / 2);
          const otherPairIdx = j % 2 === 0 ? j + 1 : j - 1;
          if (otherPairIdx < shuffledProteins.length &&
              shuffledProteins[otherPairIdx].id !== shuffledProteins[dinnerIdx].id) {
            [shuffledProteins[dinnerIdx], shuffledProteins[j]] = [shuffledProteins[j], shuffledProteins[dinnerIdx]];
            swapped = true;
            break;
          }
        }
      }
      // Fallback: swap with any later different protein
      if (!swapped) {
        for (let j = dinnerIdx + 1; j < shuffledProteins.length; j++) {
          if (shuffledProteins[j].id !== shuffledProteins[lunchIdx].id) {
            [shuffledProteins[dinnerIdx], shuffledProteins[j]] = [shuffledProteins[j], shuffledProteins[dinnerIdx]];
            break;
          }
        }
      }
    }
  }

  // 8. Build the week plan
  const now = new Date();
  const weekStart = getWeekStart(now);
  const weekKey = getWeekKey(now);

  const meals: DayPlan[] = [];
  for (let day = 0; day < 7; day++) {
    const lunchProtein = shuffledProteins[day * 2];
    const dinnerProtein = shuffledProteins[day * 2 + 1];

    // Pick cereals ensuring lunch != dinner
    const lunchCereal = pickRandom(availCereals, rng);
    const dinnerCerealOptions = availCereals.filter(c => c.id !== lunchCereal.id);
    const dinnerCereal = dinnerCerealOptions.length > 0
      ? pickRandom(dinnerCerealOptions, rng)
      : pickRandom(availCereals, rng);

    // Pick vegetables (2-4 per meal)
    const lunchVegCount = 2 + Math.floor(rng() * 3); // 2, 3, or 4
    const dinnerVegCount = 2 + Math.floor(rng() * 3);
    const lunchVegs = pickN(availVegetables, lunchVegCount, rng);
    const dinnerVegs = pickN(availVegetables, dinnerVegCount, rng);

    meals.push({
      day,
      lunch: {
        cereal: lunchCereal.id,
        protein: lunchProtein.id,
        vegetables: lunchVegs.map(v => v.id),
      },
      dinner: {
        cereal: dinnerCereal.id,
        protein: dinnerProtein.id,
        vegetables: dinnerVegs.map(v => v.id),
      },
    });
  }

  return {
    weekKey,
    weekStart: weekStart.toISOString().slice(0, 10),
    meals,
  };
}
