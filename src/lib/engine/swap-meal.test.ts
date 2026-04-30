import { describe, it, expect } from 'vitest';
import { swapMeal } from './swap-meal';
import { generateWeek } from './generate-week';
import { cereals } from '$lib/data/cereals';
import { proteins } from '$lib/data/proteins';
import { vegetables } from '$lib/data/vegetables';
import type { MealType } from '$lib/types';

const baseCtx = {
  cereals,
  proteins,
  vegetables,
  babyAgeMonths: 8,
  allergens: [] as any[],
  season: 'winter' as const,
  previousWeek: null,
  seed: 42,
};

describe('swapMeal', () => {
  it('returns a week with a different meal in the swapped slot', () => {
    const original = generateWeek(baseCtx);
    const swapped = swapMeal(original, 0, 'lunch', baseCtx);
    expect(swapped.meals[0].lunch.protein).not.toBe(original.meals[0].lunch.protein);
  });

  it('does not change other days', () => {
    const original = generateWeek(baseCtx);
    const swapped = swapMeal(original, 0, 'lunch', baseCtx);
    for (let i = 1; i < 7; i++) {
      expect(swapped.meals[i]).toEqual(original.meals[i]);
    }
  });

  it('does not change the other meal of the same day', () => {
    const original = generateWeek(baseCtx);
    const swapped = swapMeal(original, 0, 'lunch', baseCtx);
    expect(swapped.meals[0].dinner).toEqual(original.meals[0].dinner);
  });

  it('new meal has different protein from same-day other meal', () => {
    const original = generateWeek(baseCtx);
    const swapped = swapMeal(original, 0, 'lunch', baseCtx);
    expect(swapped.meals[0].lunch.protein).not.toBe(swapped.meals[0].dinner.protein);
  });

  it('new meal has different cereal from same-day other meal', () => {
    const original = generateWeek(baseCtx);
    const swapped = swapMeal(original, 0, 'lunch', baseCtx);
    expect(swapped.meals[0].lunch.cereal).not.toBe(swapped.meals[0].dinner.cereal);
  });

  it('new meal has 2-4 vegetables', () => {
    const original = generateWeek(baseCtx);
    const swapped = swapMeal(original, 3, 'dinner', baseCtx);
    expect(swapped.meals[3].dinner.vegetables.length).toBeGreaterThanOrEqual(2);
    expect(swapped.meals[3].dinner.vegetables.length).toBeLessThanOrEqual(4);
  });
});
