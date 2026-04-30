import type { Season } from '$lib/types';

export function getSeasonFromMonth(month: number): Season {
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'fall';
  return 'winter';
}

export function getSeasonFromDate(date: Date): Season {
  return getSeasonFromMonth(date.getMonth() + 1);
}

export function getCurrentSeason(override: Season | null): Season {
  if (override) return override;
  return getSeasonFromDate(new Date());
}
