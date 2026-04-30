import { describe, it, expect } from 'vitest';
import { generateWeek, allocateGroupSlots, getWeekKey, getWeekStart } from './generate-week';
import { cereals } from '$lib/data/cereals';
import { proteins, frequencyTargets } from '$lib/data/proteins';
import { vegetables } from '$lib/data/vegetables';
import { createRng } from './random';
import type { WeekPlan, ProteinGroup } from '$lib/types';

describe('allocateGroupSlots', () => {
  it('allocates exactly 14 slots total', () => {
    const rng = createRng(42);
    const allocation = allocateGroupSlots(frequencyTargets, rng);
    const total = Object.values(allocation).reduce((s, n) => s + n, 0);
    expect(total).toBe(14);
  });

  it('respects min/max for each group', () => {
    const rng = createRng(42);
    const allocation = allocateGroupSlots(frequencyTargets, rng);
    for (const target of frequencyTargets) {
      expect(allocation[target.group]).toBeGreaterThanOrEqual(target.min);
      expect(allocation[target.group]).toBeLessThanOrEqual(target.max);
    }
  });

  it('is deterministic for same seed', () => {
    const a1 = allocateGroupSlots(frequencyTargets, createRng(42));
    const a2 = allocateGroupSlots(frequencyTargets, createRng(42));
    expect(a1).toEqual(a2);
  });
});

describe('getWeekKey', () => {
  it('returns ISO week key for a date', () => {
    expect(getWeekKey(new Date('2026-04-27'))).toBe('2026-W18');
  });

  it('handles year boundaries', () => {
    expect(getWeekKey(new Date('2026-01-01'))).toBe('2026-W01');
  });
});

describe('getWeekStart', () => {
  it('returns Monday for a date in the middle of the week', () => {
    const start = getWeekStart(new Date('2026-04-29')); // Wednesday
    expect(start.getDay()).toBe(1); // Monday
    expect(start.toISOString().slice(0, 10)).toBe('2026-04-27');
  });

  it('returns same Monday if date is already Monday', () => {
    const start = getWeekStart(new Date('2026-04-27')); // Monday
    expect(start.toISOString().slice(0, 10)).toBe('2026-04-27');
  });
});

describe('generateWeek', () => {
  const ctx = {
    cereals,
    proteins,
    vegetables,
    babyAgeMonths: 8,
    allergens: [] as any[],
    season: 'winter' as const,
    previousWeek: null,
    seed: 42,
  };

  it('generates 7 days', () => {
    const week = generateWeek(ctx);
    expect(week.meals).toHaveLength(7);
  });

  it('each day has lunch and dinner', () => {
    const week = generateWeek(ctx);
    for (const day of week.meals) {
      expect(day.lunch).toBeTruthy();
      expect(day.dinner).toBeTruthy();
      expect(day.lunch.cereal).toBeTruthy();
      expect(day.dinner.cereal).toBeTruthy();
    }
  });

  it('no same protein variant in lunch and dinner of same day', () => {
    const week = generateWeek(ctx);
    for (const day of week.meals) {
      expect(day.lunch.protein).not.toBe(day.dinner.protein);
    }
  });

  it('no same cereal in lunch and dinner of same day', () => {
    const week = generateWeek(ctx);
    for (const day of week.meals) {
      expect(day.lunch.cereal).not.toBe(day.dinner.cereal);
    }
  });

  it('respects protein group frequency targets', () => {
    const week = generateWeek(ctx);
    const groupCounts: Record<string, number> = {};
    for (const day of week.meals) {
      for (const meal of [day.lunch, day.dinner]) {
        const protein = proteins.find(p => p.id === meal.protein)!;
        groupCounts[protein.group] = (groupCounts[protein.group] || 0) + 1;
      }
    }
    for (const target of frequencyTargets) {
      const count = groupCounts[target.group] || 0;
      expect(count).toBeGreaterThanOrEqual(target.min);
      expect(count).toBeLessThanOrEqual(target.max);
    }
  });

  it('each meal has 2-4 vegetables', () => {
    const week = generateWeek(ctx);
    for (const day of week.meals) {
      for (const meal of [day.lunch, day.dinner]) {
        expect(meal.vegetables.length).toBeGreaterThanOrEqual(2);
        expect(meal.vegetables.length).toBeLessThanOrEqual(4);
      }
    }
  });

  it('is deterministic for same seed', () => {
    const w1 = generateWeek(ctx);
    const w2 = generateWeek(ctx);
    expect(w1.meals).toEqual(w2.meals);
  });

  it('generates different plans for different seeds', () => {
    const w1 = generateWeek({ ...ctx, seed: 1 });
    const w2 = generateWeek({ ...ctx, seed: 2 });
    const p1 = w1.meals.map(d => d.lunch.protein).join(',');
    const p2 = w2.meals.map(d => d.lunch.protein).join(',');
    expect(p1).not.toBe(p2);
  });

  it('excludes fish when fish allergen is set', () => {
    const week = generateWeek({ ...ctx, allergens: ['fish'] });
    for (const day of week.meals) {
      for (const meal of [day.lunch, day.dinner]) {
        const protein = proteins.find(p => p.id === meal.protein)!;
        expect(protein.group).not.toBe('fish');
      }
    }
  });
});
