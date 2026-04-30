import type { Cereal } from '$lib/types';

export const cereals: Cereal[] = [
  { id: 'crema-riso', nameIt: 'Crema di riso', nameEn: 'Rice cream', ageMin: 6, allergenTags: [] },
  { id: 'crema-mais', nameIt: 'Crema di mais', nameEn: 'Corn cream', ageMin: 6, allergenTags: [] },
  { id: 'crema-avena', nameIt: 'Crema di avena', nameEn: 'Oat cream', ageMin: 6, allergenTags: ['gluten'] },
  { id: 'crema-multicereali', nameIt: 'Crema multicereali', nameEn: 'Mixed grain cream', ageMin: 6, allergenTags: ['gluten'] },
  { id: 'semolino', nameIt: 'Semolino', nameEn: 'Semolina', ageMin: 6, allergenTags: ['gluten'] },
];
