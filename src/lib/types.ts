// === Ingredient Types ===

export type Season = 'spring' | 'summer' | 'fall' | 'winter';
export type AllergenTag = 'fish' | 'dairy' | 'egg' | 'legumes' | 'gluten';
export type AgeBracket = '6-7' | '8-9' | '10-12';
export type Texture = 'smooth' | 'slightly-textured' | 'soft-pieces';
export type MealType = 'lunch' | 'dinner';

export type ProteinGroup = 'white-meat' | 'red-meat' | 'fish' | 'legumes' | 'cheese' | 'egg';

export interface Cereal {
  id: string;
  nameIt: string;
  nameEn: string;
  ageMin: number;
  allergenTags: AllergenTag[];
}

export interface Protein {
  id: string;
  nameIt: string;
  nameEn: string;
  group: ProteinGroup;
  ageMin: number;
  allergenTags: AllergenTag[];
}

export interface Vegetable {
  id: string;
  nameIt: string;
  nameEn: string;
  ageMin: number;
  seasons: Season[] | 'all';
}

// === Portion Types ===

export interface PortionSizes {
  cereal: number;       // grams
  proteinMin: number;   // grams
  proteinMax: number;   // grams
  vegetables: number;   // grams
  broth: number;        // ml
  oil: number;          // grams
}

// === Frequency Targets ===

export interface FrequencyTarget {
  group: ProteinGroup;
  min: number;
  max: number;
}

// === Meal & Plan Types ===

export interface Meal {
  cereal: string;           // cereal id
  protein: string;          // protein id
  vegetables: string[];     // vegetable ids (2-4)
}

export interface DayPlan {
  day: number;              // 0 = Monday, 6 = Sunday
  lunch: Meal;
  dinner: Meal;
}

export interface WeekPlan {
  weekKey: string;          // e.g., "2026-W18"
  weekStart: string;        // ISO date string, e.g., "2026-04-27"
  meals: DayPlan[];         // 7 days
}

// === User Profile ===

export interface UserProfile {
  ageBracket: AgeBracket;
  texture: Texture;
  allergens: AllergenTag[];
  language: 'it' | 'en';
  seasonOverride: Season | null;
}

// === Engine Config ===

export interface GenerationContext {
  cereals: Cereal[];
  proteins: Protein[];
  vegetables: Vegetable[];
  portions: PortionSizes;
  targets: FrequencyTarget[];
  previousWeek: WeekPlan | null;
  seed: number;
}
