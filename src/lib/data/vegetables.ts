import type { Vegetable } from '$lib/types';

export const vegetables: Vegetable[] = [
  { id: 'carota', nameIt: 'Carota', nameEn: 'Carrot', ageMin: 6, seasons: 'all' },
  { id: 'patata', nameIt: 'Patata', nameEn: 'Potato', ageMin: 6, seasons: 'all' },
  { id: 'zucchina', nameIt: 'Zucchina', nameEn: 'Zucchini', ageMin: 6, seasons: 'all' },
  { id: 'sedano', nameIt: 'Sedano', nameEn: 'Celery', ageMin: 6, seasons: 'all' },
  { id: 'scalogno', nameIt: 'Scalogno', nameEn: 'Shallot', ageMin: 6, seasons: 'all' },
  { id: 'porro', nameIt: 'Porro', nameEn: 'Leek', ageMin: 6, seasons: 'all' },
  { id: 'cipolla', nameIt: 'Cipolla', nameEn: 'Onion', ageMin: 6, seasons: 'all' },
  { id: 'pomodoro', nameIt: 'Pomodoro', nameEn: 'Tomato', ageMin: 8, seasons: ['spring', 'summer'] },
  { id: 'zucca', nameIt: 'Zucca', nameEn: 'Pumpkin', ageMin: 6, seasons: ['fall', 'winter'] },
  { id: 'broccolo', nameIt: 'Broccolo', nameEn: 'Broccoli', ageMin: 6, seasons: ['fall', 'winter'] },
  { id: 'cavolfiore', nameIt: 'Cavolfiore', nameEn: 'Cauliflower', ageMin: 6, seasons: ['fall', 'winter'] },
  { id: 'finocchio', nameIt: 'Finocchio', nameEn: 'Fennel', ageMin: 6, seasons: ['fall', 'winter'] },
  { id: 'verza', nameIt: 'Verza', nameEn: 'Savoy cabbage', ageMin: 6, seasons: ['fall', 'winter'] },
  { id: 'spinaci', nameIt: 'Spinaci', nameEn: 'Spinach', ageMin: 12, seasons: ['fall', 'winter'] },
  { id: 'barbabietola', nameIt: 'Barbabietola', nameEn: 'Beetroot', ageMin: 12, seasons: 'all' },
];
