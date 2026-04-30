import { describe, it, expect } from 'vitest';
import { cereals } from './cereals';
import { proteins, frequencyTargets } from './proteins';
import { vegetables } from './vegetables';

describe('ingredient data integrity', () => {
  it('all cereals have unique ids', () => {
    const ids = cereals.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all proteins have unique ids', () => {
    const ids = proteins.map(p => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all vegetables have unique ids', () => {
    const ids = vegetables.map(v => v.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all proteins have a valid group', () => {
    const validGroups = ['white-meat', 'red-meat', 'fish', 'legumes', 'cheese', 'egg'];
    for (const p of proteins) {
      expect(validGroups).toContain(p.group);
    }
  });

  it('frequency targets cover all protein groups', () => {
    const groups = new Set(proteins.map(p => p.group));
    const targetGroups = new Set(frequencyTargets.map(t => t.group));
    for (const g of groups) {
      expect(targetGroups.has(g)).toBe(true);
    }
  });

  it('frequency targets sum to 14 (min feasible)', () => {
    const minSum = frequencyTargets.reduce((s, t) => s + t.min, 0);
    const maxSum = frequencyTargets.reduce((s, t) => s + t.max, 0);
    expect(minSum).toBeLessThanOrEqual(14);
    expect(maxSum).toBeGreaterThanOrEqual(14);
  });

  it('all ingredients have both Italian and English names', () => {
    for (const c of cereals) {
      expect(c.nameIt.length).toBeGreaterThan(0);
      expect(c.nameEn.length).toBeGreaterThan(0);
    }
    for (const p of proteins) {
      expect(p.nameIt.length).toBeGreaterThan(0);
      expect(p.nameEn.length).toBeGreaterThan(0);
    }
    for (const v of vegetables) {
      expect(v.nameIt.length).toBeGreaterThan(0);
      expect(v.nameEn.length).toBeGreaterThan(0);
    }
  });

  it('vegetables have valid season data', () => {
    const validSeasons = ['spring', 'summer', 'fall', 'winter'];
    for (const v of vegetables) {
      if (v.seasons !== 'all') {
        expect(Array.isArray(v.seasons)).toBe(true);
        for (const s of v.seasons) {
          expect(validSeasons).toContain(s);
        }
      }
    }
  });
});
