import type { AgeBracket, Cereal, Protein, Vegetable, AllergenTag, Season } from '$lib/types';

export function ageBracketToMinMonth(bracket: AgeBracket): number {
  switch (bracket) {
    case '6-7': return 6;
    case '8-9': return 8;
    case '10-12': return 10;
  }
}

export function filterCereals(
  cereals: Cereal[],
  babyAgeMonths: number,
  allergens: AllergenTag[]
): Cereal[] {
  return cereals.filter(c =>
    c.ageMin <= babyAgeMonths &&
    !c.allergenTags.some(tag => allergens.includes(tag))
  );
}

export function filterProteins(
  proteins: Protein[],
  babyAgeMonths: number,
  allergens: AllergenTag[]
): Protein[] {
  return proteins.filter(p =>
    p.ageMin <= babyAgeMonths &&
    !p.allergenTags.some(tag => allergens.includes(tag))
  );
}

export function filterVegetables(
  vegetables: Vegetable[],
  babyAgeMonths: number,
  season: Season
): Vegetable[] {
  return vegetables.filter(v => {
    if (v.ageMin > babyAgeMonths) return false;
    if (v.seasons === 'all') return true;
    return v.seasons.includes(season);
  });
}
