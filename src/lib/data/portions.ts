import type { AgeBracket, PortionSizes, Texture } from '$lib/types';

export const portions: Record<AgeBracket, PortionSizes> = {
  '6-7': { cereal: 20, proteinMin: 20, proteinMax: 25, vegetables: 40, broth: 150, oil: 5 },
  '8-9': { cereal: 25, proteinMin: 30, proteinMax: 30, vegetables: 50, broth: 160, oil: 5 },
  '10-12': { cereal: 30, proteinMin: 35, proteinMax: 40, vegetables: 60, broth: 170, oil: 7 },
};

export const defaultTexture: Record<AgeBracket, Texture> = {
  '6-7': 'smooth',
  '8-9': 'slightly-textured',
  '10-12': 'soft-pieces',
};

export const textureDescriptions: Record<Texture, { it: string; en: string }> = {
  'smooth': { it: 'Liscia (crema/purè)', en: 'Smooth (purée/cream)' },
  'slightly-textured': { it: 'Leggermente granulosa', en: 'Slightly textured (mashed)' },
  'soft-pieces': { it: 'Pezzettini morbidi', en: 'Soft pieces (diced)' },
};
