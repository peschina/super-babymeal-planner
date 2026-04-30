import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import type { UserProfile } from '$lib/types';

const STORAGE_KEY = 'babymeal_profile';

function loadProfile(): UserProfile | null {
  if (!browser) return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as UserProfile;
  } catch {
    return null;
  }
}

function createProfileStore() {
  const stored = loadProfile();
  const { subscribe, set, update } = writable<UserProfile | null>(stored);

  return {
    subscribe,
    initialize(profile: UserProfile) {
      set(profile);
      if (browser) localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    },
    update(partial: Partial<UserProfile>) {
      update(current => {
        if (!current) return current;
        const updated = { ...current, ...partial };
        if (browser) localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    },
    get(): UserProfile | null {
      return get({ subscribe });
    },
    isOnboarded(): boolean {
      return loadProfile() !== null;
    },
  };
}

export const profileStore = createProfileStore();
