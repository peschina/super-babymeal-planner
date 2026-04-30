import type { Protein, FrequencyTarget } from '$lib/types';

export const proteins: Protein[] = [
  // White Meat (3x/week)
  { id: 'pollo', nameIt: 'Pollo', nameEn: 'Chicken', group: 'white-meat', ageMin: 6, allergenTags: [] },
  { id: 'tacchino', nameIt: 'Tacchino', nameEn: 'Turkey', group: 'white-meat', ageMin: 6, allergenTags: [] },
  { id: 'coniglio', nameIt: 'Coniglio', nameEn: 'Rabbit', group: 'white-meat', ageMin: 6, allergenTags: [] },
  // Red Meat (1x/week)
  { id: 'agnello', nameIt: 'Agnello', nameEn: 'Lamb', group: 'red-meat', ageMin: 6, allergenTags: [] },
  { id: 'manzo', nameIt: 'Manzo', nameEn: 'Beef', group: 'red-meat', ageMin: 6, allergenTags: [] },
  { id: 'vitello', nameIt: 'Vitello', nameEn: 'Veal', group: 'red-meat', ageMin: 6, allergenTags: [] },
  // Fish (4x/week)
  { id: 'branzino', nameIt: 'Branzino', nameEn: 'Sea bass', group: 'fish', ageMin: 6, allergenTags: ['fish'] },
  { id: 'orata', nameIt: 'Orata', nameEn: 'Sea bream', group: 'fish', ageMin: 6, allergenTags: ['fish'] },
  { id: 'merluzzo', nameIt: 'Merluzzo', nameEn: 'Cod', group: 'fish', ageMin: 6, allergenTags: ['fish'] },
  { id: 'nasello', nameIt: 'Nasello', nameEn: 'Hake', group: 'fish', ageMin: 6, allergenTags: ['fish'] },
  { id: 'sogliola', nameIt: 'Sogliola', nameEn: 'Sole', group: 'fish', ageMin: 6, allergenTags: ['fish'] },
  { id: 'cefalo', nameIt: 'Cefalo', nameEn: 'Grey mullet', group: 'fish', ageMin: 6, allergenTags: ['fish'] },
  { id: 'coda-di-rospo', nameIt: 'Coda di rospo', nameEn: 'Monkfish', group: 'fish', ageMin: 6, allergenTags: ['fish'] },
  { id: 'trota', nameIt: 'Trota', nameEn: 'Trout', group: 'fish', ageMin: 6, allergenTags: ['fish'] },
  { id: 'pesce-persico', nameIt: 'Pesce persico', nameEn: 'Perch', group: 'fish', ageMin: 6, allergenTags: ['fish'] },
  // Legumes (2-3x/week)
  { id: 'lenticchie-rosse', nameIt: 'Lenticchie rosse', nameEn: 'Red lentils', group: 'legumes', ageMin: 7, allergenTags: ['legumes'] },
  { id: 'lenticchie-verdi', nameIt: 'Lenticchie verdi', nameEn: 'Green lentils', group: 'legumes', ageMin: 7, allergenTags: ['legumes'] },
  { id: 'ceci', nameIt: 'Ceci', nameEn: 'Chickpeas', group: 'legumes', ageMin: 7, allergenTags: ['legumes'] },
  { id: 'piselli', nameIt: 'Piselli', nameEn: 'Peas', group: 'legumes', ageMin: 7, allergenTags: ['legumes'] },
  { id: 'fagiolini', nameIt: 'Fagiolini', nameEn: 'Green beans', group: 'legumes', ageMin: 7, allergenTags: ['legumes'] },
  { id: 'fagioli-neri', nameIt: 'Fagioli neri', nameEn: 'Black beans', group: 'legumes', ageMin: 7, allergenTags: ['legumes'] },
  { id: 'fagioli-borlotti', nameIt: 'Fagioli borlotti', nameEn: 'Borlotti beans', group: 'legumes', ageMin: 7, allergenTags: ['legumes'] },
  { id: 'fagioli-cannellini', nameIt: 'Fagioli cannellini', nameEn: 'Cannellini beans', group: 'legumes', ageMin: 7, allergenTags: ['legumes'] },
  // Cheese (2-3x/week)
  { id: 'parmigiano', nameIt: 'Parmigiano', nameEn: 'Parmesan', group: 'cheese', ageMin: 6, allergenTags: ['dairy'] },
  { id: 'mozzarella', nameIt: 'Mozzarella', nameEn: 'Mozzarella', group: 'cheese', ageMin: 6, allergenTags: ['dairy'] },
  { id: 'ricotta', nameIt: 'Ricotta', nameEn: 'Ricotta', group: 'cheese', ageMin: 6, allergenTags: ['dairy'] },
  { id: 'crescenza', nameIt: 'Crescenza', nameEn: 'Crescenza', group: 'cheese', ageMin: 6, allergenTags: ['dairy'] },
  { id: 'stracchino', nameIt: 'Stracchino', nameEn: 'Stracchino', group: 'cheese', ageMin: 6, allergenTags: ['dairy'] },
  { id: 'robiola', nameIt: 'Robiola', nameEn: 'Robiola', group: 'cheese', ageMin: 6, allergenTags: ['dairy'] },
  { id: 'groviera', nameIt: 'Groviera', nameEn: 'Gruyère', group: 'cheese', ageMin: 6, allergenTags: ['dairy'] },
  { id: 'casera', nameIt: 'Casera', nameEn: 'Casera', group: 'cheese', ageMin: 6, allergenTags: ['dairy'] },
  { id: 'provola', nameIt: 'Provola', nameEn: 'Provola', group: 'cheese', ageMin: 6, allergenTags: ['dairy'] },
  { id: 'primosale', nameIt: 'Primosale', nameEn: 'Primosale', group: 'cheese', ageMin: 6, allergenTags: ['dairy'] },
  // Egg (1x/week max)
  { id: 'tuorlo', nameIt: "Tuorlo d'uovo", nameEn: 'Egg yolk', group: 'egg', ageMin: 6, allergenTags: ['egg'] },
  { id: 'uovo-intero', nameIt: 'Uovo intero', nameEn: 'Whole egg', group: 'egg', ageMin: 7, allergenTags: ['egg'] },
];

export const frequencyTargets: FrequencyTarget[] = [
  { group: 'white-meat', min: 3, max: 3 },
  { group: 'red-meat', min: 1, max: 1 },
  { group: 'fish', min: 4, max: 4 },
  { group: 'legumes', min: 2, max: 3 },
  { group: 'cheese', min: 2, max: 3 },
  { group: 'egg', min: 0, max: 1 },
];
