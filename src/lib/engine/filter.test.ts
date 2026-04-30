import { describe, it, expect } from 'vitest';
import { filterCereals, filterProteins, filterVegetables } from './filter';
import { cereals } from '$lib/data/cereals';
import { proteins } from '$lib/data/proteins';
import { vegetables } from '$lib/data/vegetables';
import type { AllergenTag, Season } from '$lib/types';

describe('filterCereals', () => {
  it('returns all cereals for 6mo with no allergens', () => {
    const result = filterCereals(cereals, 6, []);
    expect(result).toHaveLength(5);
  });

  it('excludes gluten-tagged cereals when gluten allergen is set', () => {
    const result = filterCereals(cereals, 6, ['gluten']);
    expect(result).toHaveLength(2);
    expect(result.every(c => !c.allergenTags.includes('gluten'))).toBe(true);
  });
});

describe('filterProteins', () => {
  it('excludes legumes for 6mo baby (legumes require 7mo)', () => {
    const result = filterProteins(proteins, 6, []);
    expect(result.some(p => p.group === 'legumes')).toBe(false);
  });

  it('includes legumes for 7mo baby', () => {
    const result = filterProteins(proteins, 7, []);
    expect(result.some(p => p.group === 'legumes')).toBe(true);
  });

  it('excludes fish when fish allergen is set', () => {
    const result = filterProteins(proteins, 8, ['fish']);
    expect(result.some(p => p.group === 'fish')).toBe(false);
  });

  it('excludes dairy when dairy allergen is set', () => {
    const result = filterProteins(proteins, 8, ['dairy']);
    expect(result.some(p => p.group === 'cheese')).toBe(false);
  });

  it('excludes whole egg for 6mo but includes yolk', () => {
    const result = filterProteins(proteins, 6, []);
    expect(result.some(p => p.id === 'tuorlo')).toBe(true);
    expect(result.some(p => p.id === 'uovo-intero')).toBe(false);
  });
});

describe('filterVegetables', () => {
  it('returns year-round vegetables for any season', () => {
    const result = filterVegetables(vegetables, 6, 'summer');
    expect(result.some(v => v.id === 'carota')).toBe(true);
    expect(result.some(v => v.id === 'patata')).toBe(true);
  });

  it('includes summer vegetables in summer', () => {
    const result = filterVegetables(vegetables, 8, 'summer');
    expect(result.some(v => v.id === 'pomodoro')).toBe(true);
  });

  it('excludes summer vegetables in winter', () => {
    const result = filterVegetables(vegetables, 8, 'winter');
    expect(result.some(v => v.id === 'pomodoro')).toBe(false);
  });

  it('includes fall/winter vegetables in winter', () => {
    const result = filterVegetables(vegetables, 6, 'winter');
    expect(result.some(v => v.id === 'zucca')).toBe(true);
    expect(result.some(v => v.id === 'broccolo')).toBe(true);
  });

  it('excludes spinach and beetroot for babies under 12mo', () => {
    const result = filterVegetables(vegetables, 8, 'winter');
    expect(result.some(v => v.id === 'spinaci')).toBe(false);
    expect(result.some(v => v.id === 'barbabietola')).toBe(false);
  });

  it('includes spinach for 12mo baby in winter', () => {
    const result = filterVegetables(vegetables, 12, 'winter');
    expect(result.some(v => v.id === 'spinaci')).toBe(true);
  });

  it('excludes tomato for 6mo baby even in summer', () => {
    const result = filterVegetables(vegetables, 6, 'summer');
    expect(result.some(v => v.id === 'pomodoro')).toBe(false);
  });
});
