import { describe, it, expect } from 'vitest';
import { getSeasonFromDate, getSeasonFromMonth } from './seasons';

describe('getSeasonFromMonth', () => {
  it('returns winter for December-February', () => {
    expect(getSeasonFromMonth(12)).toBe('winter');
    expect(getSeasonFromMonth(1)).toBe('winter');
    expect(getSeasonFromMonth(2)).toBe('winter');
  });

  it('returns spring for March-May', () => {
    expect(getSeasonFromMonth(3)).toBe('spring');
    expect(getSeasonFromMonth(4)).toBe('spring');
    expect(getSeasonFromMonth(5)).toBe('spring');
  });

  it('returns summer for June-August', () => {
    expect(getSeasonFromMonth(6)).toBe('summer');
    expect(getSeasonFromMonth(7)).toBe('summer');
    expect(getSeasonFromMonth(8)).toBe('summer');
  });

  it('returns fall for September-November', () => {
    expect(getSeasonFromMonth(9)).toBe('fall');
    expect(getSeasonFromMonth(10)).toBe('fall');
    expect(getSeasonFromMonth(11)).toBe('fall');
  });
});

describe('getSeasonFromDate', () => {
  it('detects season from a Date object', () => {
    expect(getSeasonFromDate(new Date('2026-04-15'))).toBe('spring');
    expect(getSeasonFromDate(new Date('2026-07-20'))).toBe('summer');
    expect(getSeasonFromDate(new Date('2026-10-05'))).toBe('fall');
    expect(getSeasonFromDate(new Date('2026-01-10'))).toBe('winter');
  });
});
