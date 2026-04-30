import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import type { WeekPlan } from '$lib/types';

const STORAGE_KEY = 'babymeal_weeks';
const MAX_STORED_WEEKS = 4;

function loadWeeks(): Record<string, WeekPlan> {
  if (!browser) return {};
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return {};
  try {
    return JSON.parse(stored) as Record<string, WeekPlan>;
  } catch {
    return {};
  }
}

function saveWeeks(weeks: Record<string, WeekPlan>) {
  if (!browser) return;
  const entries = Object.entries(weeks).sort(([a], [b]) => b.localeCompare(a));
  const pruned = Object.fromEntries(entries.slice(0, MAX_STORED_WEEKS));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pruned));
}

function createMealsStore() {
  const initial = loadWeeks();
  const { subscribe, set, update } = writable<Record<string, WeekPlan>>(initial);

  return {
    subscribe,
    getWeek(weekKey: string): WeekPlan | undefined {
      return get({ subscribe })[weekKey];
    },
    setWeek(weekKey: string, plan: WeekPlan) {
      update(weeks => {
        const updated = { ...weeks, [weekKey]: plan };
        saveWeeks(updated);
        return updated;
      });
    },
    getPreviousWeek(currentWeekKey: string): WeekPlan | null {
      const weeks = get({ subscribe });
      const keys = Object.keys(weeks).sort();
      const currentIdx = keys.indexOf(currentWeekKey);
      if (currentIdx > 0) return weeks[keys[currentIdx - 1]];
      return null;
    },
    clear() {
      set({});
      if (browser) localStorage.removeItem(STORAGE_KEY);
    },
  };
}

export const mealsStore = createMealsStore();
