import { describe, it, expect } from 'vitest';
import { generateMeal } from './generate-meal';
import { createRng } from './random';
import { filterCereals, filterProteins, filterVegetables } from './filter';
import { cereals } from '$lib/data/cereals';
import { proteins } from '$lib/data/proteins';
import { vegetables } from '$lib/data/vegetables';
import type { Meal } from '$lib/types';

const availCereals = filterCereals(cereals, 8, []);
const availProteins = filterProteins(proteins, 8, []);
const availVegetables = filterVegetables(vegetables, 8, 'winter');

describe('generateMeal', () => {
  it('returns a meal with cereal, protein, and 2-4 vegetables', () => {
    const meal = generateMeal(availCereals, availProteins, availVegetables, createRng(42));
    expect(meal.cereal).toBeTruthy();
    expect(meal.protein).toBeTruthy();
    expect(meal.vegetables.length).toBeGreaterThanOrEqual(2);
    expect(meal.vegetables.length).toBeLessThanOrEqual(4);
  });

  it('returns valid ingredient ids', () => {
    const meal = generateMeal(availCereals, availProteins, availVegetables, createRng(42));
    expect(availCereals.some(c => c.id === meal.cereal)).toBe(true);
    expect(availProteins.some(p => p.id === meal.protein)).toBe(true);
    for (const vid of meal.vegetables) {
      expect(availVegetables.some(v => v.id === vid)).toBe(true);
    }
  });

  it('returns unique vegetables (no duplicates in one meal)', () => {
    const meal = generateMeal(availCereals, availProteins, availVegetables, createRng(42));
    expect(new Set(meal.vegetables).size).toBe(meal.vegetables.length);
  });

  it('respects excludeProtein constraint', () => {
    const meal = generateMeal(
      availCereals, availProteins, availVegetables, createRng(42),
      { excludeProtein: 'pollo' }
    );
    expect(meal.protein).not.toBe('pollo');
  });

  it('respects excludeCereal constraint', () => {
    const meal = generateMeal(
      availCereals, availProteins, availVegetables, createRng(42),
      { excludeCereal: 'crema-riso' }
    );
    expect(meal.cereal).not.toBe('crema-riso');
  });

  it('respects preferProteinGroup constraint', () => {
    const fishOnly = availProteins.filter(p => p.group === 'fish');
    const meal = generateMeal(
      availCereals, fishOnly, availVegetables, createRng(42)
    );
    expect(availProteins.find(p => p.id === meal.protein)?.group).toBe('fish');
  });

  it('is deterministic for same seed', () => {
    const m1 = generateMeal(availCereals, availProteins, availVegetables, createRng(99));
    const m2 = generateMeal(availCereals, availProteins, availVegetables, createRng(99));
    expect(m1).toEqual(m2);
  });
});
