import { describe, it, expect } from 'vitest';
import { createRng, shuffle, pickN } from './random';

describe('createRng', () => {
  it('produces deterministic sequence for same seed', () => {
    const rng1 = createRng(42);
    const rng2 = createRng(42);
    const seq1 = Array.from({ length: 10 }, () => rng1());
    const seq2 = Array.from({ length: 10 }, () => rng2());
    expect(seq1).toEqual(seq2);
  });

  it('produces different sequences for different seeds', () => {
    const rng1 = createRng(1);
    const rng2 = createRng(2);
    const seq1 = Array.from({ length: 10 }, () => rng1());
    const seq2 = Array.from({ length: 10 }, () => rng2());
    expect(seq1).not.toEqual(seq2);
  });

  it('returns values between 0 and 1', () => {
    const rng = createRng(123);
    for (let i = 0; i < 100; i++) {
      const val = rng();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    }
  });
});

describe('shuffle', () => {
  it('returns array of same length', () => {
    const rng = createRng(42);
    const result = shuffle([1, 2, 3, 4, 5], rng);
    expect(result).toHaveLength(5);
  });

  it('contains same elements', () => {
    const rng = createRng(42);
    const result = shuffle([1, 2, 3, 4, 5], rng);
    expect(result.sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it('is deterministic with same seed', () => {
    const r1 = shuffle([1, 2, 3, 4, 5], createRng(42));
    const r2 = shuffle([1, 2, 3, 4, 5], createRng(42));
    expect(r1).toEqual(r2);
  });
});

describe('pickN', () => {
  it('picks n items from array', () => {
    const rng = createRng(42);
    const result = pickN([1, 2, 3, 4, 5], 3, rng);
    expect(result).toHaveLength(3);
  });

  it('picks at most array length', () => {
    const rng = createRng(42);
    const result = pickN([1, 2], 5, rng);
    expect(result).toHaveLength(2);
  });
});
